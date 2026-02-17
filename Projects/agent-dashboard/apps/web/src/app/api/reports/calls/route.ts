import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } }, { status: 401 });
  }

  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const [calls, total] = await Promise.all([
    prisma.callLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.callLog.count(),
  ]);

  return NextResponse.json({
    success: true,
    data: calls,
    pagination: { page, limit, total },
  });
}
