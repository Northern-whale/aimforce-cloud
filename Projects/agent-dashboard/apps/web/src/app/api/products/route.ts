import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/products - List all products
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const origin = searchParams.get("origin");
    const inStock = searchParams.get("inStock");
    const category = searchParams.get("category");

    const products = await prisma.product.findMany({
      where: {
        ...(origin && { origin }),
        ...(inStock !== null && { inStock: inStock === "true" }),
        ...(category && { category }),
      },
      include: {
        productMentions: {
          include: {
            callLog: {
              select: {
                id: true,
                createdAt: true,
                sentiment: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate mention stats for each product
    const productsWithStats = products.map((product) => ({
      ...product,
      totalMentions: product.productMentions.reduce((sum, m) => sum + m.mentions, 0),
      recentMentions: product.productMentions.filter(
        (m) => new Date(m.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
    }));

    return NextResponse.json({ products: productsWithStats });
  } catch (error) {
    console.error("[Products API] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Validation
    if (!name || !brand || !origin || !price || !strength || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        brand,
        origin,
        price: parseFloat(price),
        priceUSD: priceUSD ? parseFloat(priceUSD) : null,
        strength,
        length: length ? parseInt(length) : null,
        inStock: inStock ?? true,
        stock: stock ? parseInt(stock) : 0,
        description,
        imageUrl,
        category,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("[Products API] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
