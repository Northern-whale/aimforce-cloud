import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/products/[id] - Get single product
export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        productMentions: {
          include: {
            callLog: {
              select: {
                id: true,
                phoneNumber: true,
                summary: true,
                sentiment: true,
                createdAt: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 20,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("[Products API] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      name,
      brand,
      origin,
      price,
      priceUSD,
      strength,
      length,
      inStock,
      stock,
      description,
      imageUrl,
      category,
    } = body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(brand && { brand }),
        ...(origin && { origin }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(priceUSD !== undefined && { priceUSD: priceUSD ? parseFloat(priceUSD) : null }),
        ...(strength && { strength }),
        ...(length !== undefined && { length: length ? parseInt(length) : null }),
        ...(inStock !== undefined && { inStock }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(category && { category }),
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("[Products API] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if product has mentions (optional: prevent deletion if has history)
    const mentionCount = await prisma.productMention.count({
      where: { productId: id },
    });

    if (mentionCount > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete product with call history",
          mentionCount,
        },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Products API] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
