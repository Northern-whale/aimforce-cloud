import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-webhook-secret");
    if (process.env.N8N_WEBHOOK_SECRET && secret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId, elevenlabsAgentId, twilioNumber, status } = await req.json();

    if (!businessId) {
      return NextResponse.json({ error: "businessId is required" }, { status: 400 });
    }

    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        ...(elevenlabsAgentId && { elevenlabsAgentId }),
        ...(twilioNumber && { twilioNumber }),
        ...(status && { status }),
      },
    });

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
        status: business.status,
        elevenlabsAgentId: business.elevenlabsAgentId,
      },
    });
  } catch (error) {
    console.error("[Onboarding/Activate] Error:", error);
    return NextResponse.json(
      { error: "Failed to activate business" },
      { status: 500 }
    );
  }
}
