import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id, status: "active" },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: conversations.map((c) => ({
      id: c.id,
      title: c.title || "New conversation",
      updatedAt: c.updatedAt.toISOString(),
      lastMessage: c.messages[0]?.content?.slice(0, 80) || null,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const body = await req.json();

  const conversation = await prisma.conversation.create({
    data: {
      userId: session.user.id,
      title: body.title || null,
    },
  });

  return NextResponse.json({ success: true, data: { id: conversation.id } });
}
