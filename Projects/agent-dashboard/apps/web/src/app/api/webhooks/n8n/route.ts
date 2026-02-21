import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Validate webhook secret (optional - for production security)
    const secret = req.headers.get("x-webhook-secret");
    if (process.env.N8N_WEBHOOK_SECRET && secret !== process.env.N8N_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Invalid webhook secret" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, data, businessId } = body;

    // Resolve business from businessId or agentId
    let resolvedBusinessId = businessId || null;
    if (!resolvedBusinessId && data?.agentId) {
      const business = await prisma.business.findFirst({
        where: { elevenlabsAgentId: data.agentId },
        select: { id: true },
      });
      resolvedBusinessId = business?.id || null;
    }

    console.log(`[Webhook] Received event: ${type}`, { businessId: resolvedBusinessId, data });

    switch (type) {
      case "call_completed": {
        // Create call log with enhanced fields
        const call = await prisma.callLog.create({
          data: {
            businessId: resolvedBusinessId,
            externalId: data.externalId,
            phoneNumber: data.phoneNumber,
            direction: data.direction || "inbound",
            status: data.status || "completed",
            duration: data.duration || 0,
            summary: data.summary,
            transcript: data.transcript,
            sentiment: data.sentiment || "neutral",
            transferredTo: data.transferredTo,
            metadata: data.metadata ? JSON.stringify(data.metadata) : null,

            // Enhanced fields
            category: data.category || inferCategory(data),
            aiResolved: data.aiResolved ?? (data.transferredTo ? false : true),
            transferred: data.transferred ?? Boolean(data.transferredTo),
            topicTags: data.topicTags ? JSON.stringify(data.topicTags) : null,
            customerIntent: data.customerIntent || inferIntent(data),
          },
        });

        // Handle product mentions if provided
        if (data.productMentions && Array.isArray(data.productMentions)) {
          for (const mention of data.productMentions) {
            // Find product by name or ID
            let product = null;
            if (mention.productId) {
              product = await prisma.product.findUnique({
                where: { id: mention.productId },
              });
            } else if (mention.productName) {
              product = await prisma.product.findFirst({
                where: {
                  ...(resolvedBusinessId ? { businessId: resolvedBusinessId } : {}),
                  OR: [
                    { name: { contains: mention.productName } },
                    { brand: { contains: mention.productName } },
                  ],
                },
              });
            }

            if (product) {
              await prisma.productMention.create({
                data: {
                  callLogId: call.id,
                  productId: product.id,
                  mentions: mention.count || 1,
                  context: mention.context || data.summary,
                },
              });
            }
          }
        }

        // Auto-generate insights for certain patterns
        await generateInsightsFromCall(call, data, resolvedBusinessId);

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
          update: { value: data.value, metadata: data.metadata },
          create: {
            businessId: resolvedBusinessId,
            name: data.name,
            value: data.value,
            period: data.period || "daily",
            date: new Date(data.date || new Date()),
            metadata: data.metadata,
          },
        });
        break;
      }

      case "product_inquiry": {
        await prisma.event.create({
          data: {
            businessId: resolvedBusinessId,
            type: "product_inquiry",
            payload: JSON.stringify({
              productName: data.productName,
              customerPhone: data.phoneNumber,
              timestamp: new Date(),
            }),
          },
        });
        break;
      }

      default: {
        await prisma.event.create({
          data: {
            businessId: resolvedBusinessId,
            type: type || "unknown",
            payload: JSON.stringify(data),
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: `Event ${type} processed` });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    return NextResponse.json(
      { error: "Failed to process webhook", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Helper: Infer call category from content
function inferCategory(data: any): string {
  const summary = (data.summary || "").toLowerCase();
  const transcript = (data.transcript || "").toLowerCase();
  const text = `${summary} ${transcript}`;

  if (text.includes("опт") || text.includes("wholesale") || text.includes("партн")) {
    return "wholesale";
  }
  if (text.includes("жалоб") || text.includes("дефект") || text.includes("complaint")) {
    return "complaint";
  }
  if (text.includes("сигар") || text.includes("cohiba") || text.includes("monte") || text.includes("price") || text.includes("цен")) {
    return "product_inquiry";
  }
  return "general";
}

// Helper: Infer customer intent
function inferIntent(data: any): string {
  const summary = (data.summary || "").toLowerCase();
  const transcript = (data.transcript || "").toLowerCase();
  const text = `${summary} ${transcript}`;

  if (text.includes("купить") || text.includes("заказ") || text.includes("buy")) {
    return "buying";
  }
  if (text.includes("жалоб") || text.includes("дефект") || text.includes("complaint")) {
    return "complaining";
  }
  if (text.includes("посовет") || text.includes("рекоменд") || text.includes("recommend") || text.includes("новичок")) {
    return "browsing";
  }
  return "information";
}

// Helper: Generate insights from call patterns
async function generateInsightsFromCall(call: any, data: any, businessId: string | null) {
  try {
    // Check for high-value inquiries (premium products)
    if (data.category === "product_inquiry") {
      const summary = (data.summary || "").toLowerCase();
      if (summary.includes("behike") || summary.includes("opus") || summary.includes("премиум")) {
        await prisma.businessInsight.create({
          data: {
            businessId,
            type: "revenue_opportunity",
            title: "Premium Product Interest",
            description: `Customer inquired about high-end cigars: ${data.summary}`,
            data: JSON.stringify({
              callId: call.id,
              phoneNumber: data.phoneNumber,
              timestamp: new Date(),
            }),
            priority: "high",
            actionable: true,
          },
        });
      }
    }

    // Track wholesale opportunities
    if (data.transferred && data.category === "wholesale") {
      await prisma.businessInsight.create({
        data: {
          businessId,
          type: "customer_interest",
          title: "Wholesale Opportunity",
          description: "Potential wholesale customer transferred to owner",
          data: JSON.stringify({
            callId: call.id,
            phoneNumber: data.phoneNumber,
          }),
          priority: "high",
          actionable: true,
        },
      });
    }
  } catch (error) {
    console.error("[Insights] Failed to generate insights:", error);
    // Non-critical, don't throw
  }
}
