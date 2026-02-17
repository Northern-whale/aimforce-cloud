import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Validate webhook secret
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Invalid webhook secret" },
      { status: 401 }
    );
  }

  const body = await req.json();
  const { type, data } = body;

  switch (type) {
    case "call_completed": {
      await prisma.callLog.create({
        data: {
          externalId: data.externalId,
          phoneNumber: data.phoneNumber,
          direction: data.direction || "inbound",
          status: data.status || "completed",
          duration: data.duration,
          summary: data.summary,
          transcript: data.transcript,
          sentiment: data.sentiment,
          transferredTo: data.transferredTo,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        },
      });
      break;
    }

    case "metric_update": {
      await prisma.metric.upsert({
        where: {
          name_period_date: {
            name: data.name,
            period: data.period || "daily",
            date: new Date(data.date || new Date()),
          },
        },
        update: { value: data.value },
        create: {
          name: data.name,
          value: data.value,
          period: data.period || "daily",
          date: new Date(data.date || new Date()),
        },
      });
      break;
    }

    default: {
      // Store as generic event
      await prisma.event.create({
        data: {
          type: type || "unknown",
          payload: JSON.stringify(data),
        },
      });
    }
  }

  return NextResponse.json({ success: true });
}
