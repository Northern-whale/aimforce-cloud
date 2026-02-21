import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      // Business info
      businessName,
      industry,
      address,
      phone,
      website,
      hours,
      // Owner info
      ownerName,
      ownerEmail,
      ownerPhone,
      ownerTelegram,
      // Agent config
      voicePreference,
      language,
      greeting,
      transferTriggers,
      // Products/services
      products,
      // FAQs
      faqs,
      // Policies
      policies,
      // Plan
      plan,
      // Phone setup
      phoneOption, // "new_number" | "forward_existing"
    } = body;

    if (!businessName || !ownerEmail || !ownerName) {
      return NextResponse.json(
        { error: "Business name, owner name, and owner email are required" },
        { status: 400 }
      );
    }

    // Check if owner email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ownerEmail },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 409 }
      );
    }

    // Build knowledge base JSON
    const knowledgeBase = JSON.stringify({
      products: products || [],
      faqs: faqs || [],
      policies: policies || {},
    });

    // Create business
    const business = await prisma.business.create({
      data: {
        name: businessName,
        industry: industry || null,
        address: address || null,
        phone: phone || null,
        website: website || null,
        hours: hours ? JSON.stringify(hours) : null,
        ownerPhone: ownerPhone || null,
        ownerEmail: ownerEmail,
        ownerTelegram: ownerTelegram || null,
        voiceId: voicePreference || null,
        greeting:
          greeting ||
          `Hello! You've reached ${businessName}. I'm the AI assistant. How can I help you today?`,
        transferTriggers: transferTriggers
          ? JSON.stringify(transferTriggers)
          : JSON.stringify([
              "complaint",
              "return",
              "speak to owner",
              "speak to manager",
              "wholesale",
              "partnership",
            ]),
        knowledgeBase,
        plan: plan || "starter",
        status: "onboarding",
      },
    });

    // Create owner user account
    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: ownerEmail,
        name: ownerName,
        passwordHash,
        role: "owner",
        businessId: business.id,
      },
    });

    // Seed products if provided
    if (products && Array.isArray(products) && products.length > 0) {
      for (const product of products) {
        await prisma.product.create({
          data: {
            businessId: business.id,
            name: product.name,
            brand: product.brand || businessName,
            origin: product.origin || "local",
            price: product.price || 0,
            priceUSD: product.priceUSD || null,
            strength: product.strength || "medium",
            length: product.length || null,
            description: product.description || null,
            category: product.category || "standard",
            inStock: product.inStock ?? true,
            stock: product.stock || 0,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
        status: business.status,
      },
      user: {
        id: user.id,
        email: user.email,
        tempPassword,
      },
      nextSteps: {
        phoneOption: phoneOption || "new_number",
        agentSetup: "pending",
        dashboardUrl: `/dashboard`,
      },
    });
  } catch (error) {
    console.error("[Onboarding] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create business",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        users: { select: { id: true, email: true, name: true } },
        _count: { select: { callLogs: true, products: true } },
      },
    });

    return NextResponse.json({ businesses });
  } catch (error) {
    console.error("[Onboarding] Error fetching businesses:", error);
    return NextResponse.json(
      { error: "Failed to fetch businesses" },
      { status: 500 }
    );
  }
}

function generateTempPassword(): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}
