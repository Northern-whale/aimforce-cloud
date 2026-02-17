import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const [totalCalls, totalConversations, completedCalls, allMessages] =
    await Promise.all([
      prisma.callLog.count(),
      prisma.conversation.count(),
      prisma.callLog.findMany({
        where: { duration: { not: null, gt: 0 } },
        select: { duration: true },
      }),
      prisma.message.findMany({
        where: { role: "assistant", latencyMs: { not: null } },
        select: { latencyMs: true },
      }),
    ]);

  const avgCallDuration =
    completedCalls.length > 0
      ? Math.round(
          completedCalls.reduce((sum, c) => sum + (c.duration || 0), 0) /
            completedCalls.length
        )
      : 0;

  const avgResponseTime =
    allMessages.length > 0
      ? Math.round(
          allMessages.reduce((sum, m) => sum + (m.latencyMs || 0), 0) /
            allMessages.length
        )
      : 0;

  return NextResponse.json({
    success: true,
    data: {
      totalCalls,
      totalConversations,
      avgCallDuration,
      avgResponseTime,
      callsTrend: 12,
      conversationsTrend: 8,
    },
  });
}
