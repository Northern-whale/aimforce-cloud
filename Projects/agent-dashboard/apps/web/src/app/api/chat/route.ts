import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const conversationId = req.nextUrl.searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ success: false, error: { code: "BAD_REQUEST", message: "conversationId required" } }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ success: true, data: messages });
}
