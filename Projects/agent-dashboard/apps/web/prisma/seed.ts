import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Create owner user
  const email = process.env.OWNER_EMAIL || "owner@tars.ai";
  const password = process.env.OWNER_PASSWORD || "tars2026";
  const passwordHash = await bcryptjs.hash(password, 12);

  const owner = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      name: "Owner",
      passwordHash,
      role: "owner",
    },
  });
  console.log("✅ Owner user created");

  // 2. Seed cigar products from knowledge base
  const products = [
    // Cuban cigars
    {
      name: "Cohiba Siglo I",
      brand: "Cohiba",
      origin: "Cuban",
      price: 2500,
      priceUSD: 26.5,
      strength: "medium",
      length: 102,
      inStock: true,
      stock: 45,
      description: "Perfect choice for beginners. Smooth, balanced flavor with notes of cedar and cream.",
      category: "premium",
    },
    {
      name: "Cohiba Siglo VI",
      brand: "Cohiba",
      origin: "Cuban",
      price: 4200,
      priceUSD: 44.5,
      strength: "medium-full",
      length: 150,
      inStock: true,
      stock: 28,
      description: "Rich and complex. Flavors of coffee, dark chocolate, and leather.",
      category: "premium",
    },
    {
      name: "Cohiba Behike 56",
      brand: "Cohiba",
      origin: "Cuban",
      price: 8000,
      priceUSD: 85,
      strength: "full",
      length: 166,
      inStock: true,
      stock: 12,
      description: "Ultra-premium limited edition. Intense flavor with floral notes and spice.",
      category: "exclusive",
    },
    {
      name: "Montecristo No. 2",
      brand: "Montecristo",
      origin: "Cuban",
      price: 3200,
      priceUSD: 34,
      strength: "medium-full",
      length: 156,
      inStock: true,
      stock: 36,
      description: "Classic torpedo shape. Earthy with hints of cocoa and pepper.",
      category: "premium",
    },
    {
      name: "Montecristo No. 4",
      brand: "Montecristo",
      origin: "Cuban",
      price: 2800,
      priceUSD: 29.5,
      strength: "medium",
      length: 129,
      inStock: true,
      stock: 52,
      description: "Most popular Montecristo. Creamy smoke with nutty undertones.",
      category: "standard",
    },
    {
      name: "Romeo y Julieta Churchill",
      brand: "Romeo y Julieta",
      origin: "Cuban",
      price: 2600,
      priceUSD: 27.5,
      strength: "medium",
      length: 178,
      inStock: true,
      stock: 41,
      description: "Smooth and elegant. Perfect for long, relaxed sessions.",
      category: "standard",
    },
    {
      name: "Romeo y Julieta Wide Churchill",
      brand: "Romeo y Julieta",
      origin: "Cuban",
      price: 3100,
      priceUSD: 33,
      strength: "medium-full",
      length: 130,
      inStock: true,
      stock: 24,
      description: "Thicker ring gauge delivers richer flavor. Notes of cedar and toast.",
      category: "premium",
    },
    {
      name: "Partagas Serie D No. 4",
      brand: "Partagas",
      origin: "Cuban",
      price: 2900,
      priceUSD: 30.5,
      strength: "full",
      length: 124,
      inStock: true,
      stock: 33,
      description: "Bold and powerful. Espresso, dark chocolate, and earth.",
      category: "premium",
    },
    // Dominican cigars
    {
      name: "Davidoff Millennium Blend",
      brand: "Davidoff",
      origin: "Dominican",
      price: 1800,
      priceUSD: 19,
      strength: "mild-medium",
      length: 140,
      inStock: true,
      stock: 58,
      description: "Refined and sophisticated. Creamy with subtle spice.",
      category: "standard",
    },
    {
      name: "Arturo Fuente Opus X",
      brand: "Arturo Fuente",
      origin: "Dominican",
      price: 3500,
      priceUSD: 37,
      strength: "full",
      length: 152,
      inStock: true,
      stock: 18,
      description: "Legendary full-bodied cigar. Rich, peppery, complex.",
      category: "exclusive",
    },
    // Nicaraguan cigars
    {
      name: "Padron 1964 Anniversary",
      brand: "Padron",
      origin: "Nicaraguan",
      price: 2400,
      priceUSD: 25.5,
      strength: "medium-full",
      length: 152,
      inStock: true,
      stock: 29,
      description: "Aged Nicaraguan tobacco. Cocoa, coffee, and caramel notes.",
      category: "premium",
    },
  ];

  const createdProducts = [];
  for (const product of products) {
    const created = await prisma.product.create({ data: product });
    createdProducts.push(created);
  }
  console.log(`✅ Created ${createdProducts.length} products`);

  // 3. Generate realistic call logs with variety
  const callScenarios = [
    // Product inquiries
    {
      phoneNumber: "+7-923-456-7801",
      direction: "inbound",
      status: "completed",
      duration: 185,
      summary: "Customer asked about Cohiba Siglo I price and availability",
      transcript: "Customer: Сколько стоит Cohiba Siglo I? AI: Cohiba Siglo I стоит 2,500 рублей. У нас есть в наличии.",
      sentiment: "positive",
      category: "product_inquiry",
      aiResolved: true,
      transferred: false,
      topicTags: JSON.stringify(["pricing", "availability", "cohiba"]),
      customerIntent: "buying",
      productId: createdProducts[0].id, // Cohiba Siglo I
      productMentions: 1,
    },
    {
      phoneNumber: "+7-905-234-5678",
      direction: "inbound",
      status: "completed",
      duration: 342,
      summary: "Beginner asking for recommendations, suggested Montecristo No. 4",
      transcript: "Customer: Я новичок, что посоветуете? AI: Рекомендую Montecristo No. 4 - средней крепости, отличный выбор для начала.",
      sentiment: "positive",
      category: "product_inquiry",
      aiResolved: true,
      transferred: false,
      topicTags: JSON.stringify(["recommendations", "beginner", "montecristo"]),
      customerIntent: "browsing",
      productId: createdProducts[4].id, // Montecristo No. 4
      productMentions: 1,
    },
    {
      phoneNumber: "+7-912-765-4321",
      direction: "inbound",
      status: "completed",
      duration: 267,
      summary: "Customer comparing Cuban vs Dominican cigars",
      transcript: "Customer: Чем отличаются кубинские от доминиканских? AI: Кубинские обычно более насыщенные, доминиканские - мягче и сливочнее.",
      sentiment: "positive",
      category: "product_inquiry",
      aiResolved: true,
      transferred: false,
      topicTags: JSON.stringify(["comparison", "education", "cuban", "dominican"]),
      customerIntent: "information",
      productId: null,
      productMentions: 0,
    },
    // Wholesale/Business inquiries
    {
      phoneNumber: "+7-495-123-4567",
      direction: "inbound",
      status: "transferred",
      duration: 412,
      summary: "Restaurant owner interested in wholesale supply - transferred to owner",
      transcript: "Customer: Хочу закупать сигары оптом для своего ресторана. AI: Отлично! Сейчас соединю вас с владельцем для обсуждения условий.",
      sentiment: "neutral",
      category: "wholesale",
      aiResolved: false,
      transferred: true,
      transferredTo: "Owner",
      topicTags: JSON.stringify(["wholesale", "business", "restaurant"]),
      customerIntent: "buying",
      productId: null,
      productMentions: 0,
    },
    // Store information
    {
      phoneNumber: "+7-916-888-9999",
      direction: "inbound",
      status: "completed",
      duration: 98,
      summary: "Asked about store hours and location",
      transcript: "Customer: Когда вы работаете? AI: Пн-Пт 10:00-22:00, Сб-Вс 12:00-20:00",
      sentiment: "positive",
      category: "general",
      aiResolved: true,
      transferred: false,
      topicTags: JSON.stringify(["hours", "location"]),
      customerIntent: "information",
      productId: null,
      productMentions: 0,
    },
    // Delivery inquiry
    {
      phoneNumber: "+7-903-555-1234",
      direction: "inbound",
      status: "completed",
      duration: 156,
      summary: "Asked about delivery options and fees",
      transcript: "Customer: Есть доставка? AI: Да, бесплатная доставка при заказе от 5,000 рублей. Иначе - 500 рублей.",
      sentiment: "positive",
      category: "general",
      aiResolved: true,
      transferred: false,
      topicTags: JSON.stringify(["delivery", "pricing"]),
      customerIntent: "information",
      productId: null,
      productMentions: 0,
    },
    // Premium product inquiry
    {
      phoneNumber: "+7-925-777-8888",
      direction: "inbound",
      status: "completed",
      duration: 428,
      summary: "Interested in exclusive Cohiba Behike 56, discussed storage requirements",
      transcript: "Customer: Расскажите про Cohiba Behike 56. AI: Это наша самая премиальная сигара за 8,000 рублей. Очень насыщенная, с цветочными нотами.",
      sentiment: "positive",
      category: "product_inquiry",
      aiResolved: true,
      transferred: false,
      topicTags: JSON.stringify(["premium", "behike", "storage", "cohiba"]),
      customerIntent: "buying",
      productId: createdProducts[2].id, // Cohiba Behike 56
      productMentions: 2,
    },
    // Complaint (transferred)
    {
      phoneNumber: "+7-909-111-2222",
      direction: "inbound",
      status: "transferred",
      duration: 245,
      summary: "Quality complaint about previously purchased cigar - transferred to owner",
      transcript: "Customer: Купленная вчера сигара оказалась с дефектом. AI: Понимаю. Сейчас соединю с владельцем, он поможет решить этот вопрос.",
      sentiment: "negative",
      category: "complaint",
      aiResolved: false,
      transferred: true,
      transferredTo: "Owner",
      topicTags: JSON.stringify(["quality", "complaint", "defect"]),
      customerIntent: "complaining",
      productId: null,
      productMentions: 0,
    },
  ];

  // Create calls with varying timestamps (last 7 days)
  const now = new Date();
  const callLogs = [];
  
  for (let i = 0; i < callScenarios.length; i++) {
    const scenario = callScenarios[i];
    // Distribute calls across last 7 days
    const daysAgo = Math.floor(i / 2);
    const hoursAgo = (i % 12) + 9; // Business hours 9-21
    const callDate = new Date(now);
    callDate.setDate(callDate.getDate() - daysAgo);
    callDate.setHours(hoursAgo, Math.floor(Math.random() * 60), 0, 0);

    const { productId, productMentions, ...callData } = scenario;
    
    const call = await prisma.callLog.create({
      data: {
        ...callData,
        createdAt: callDate,
      },
    });
    
    callLogs.push(call);

    // Add product mentions if applicable
    if (productId && productMentions > 0) {
      await prisma.productMention.create({
        data: {
          callLogId: call.id,
          productId: productId,
          mentions: productMentions,
          context: scenario.summary,
        },
      });
    }
  }

  // Generate additional random calls for volume
  const additionalCallCount = 42; // Total ~50 calls
  const randomProducts = createdProducts.filter(p => p.price < 4000); // Popular products

  for (let i = 0; i < additionalCallCount; i++) {
    const daysAgo = Math.floor(Math.random() * 14); // Last 2 weeks
    const hour = Math.floor(Math.random() * 12) + 9; // 9-21
    const callDate = new Date(now);
    callDate.setDate(callDate.getDate() - daysAgo);
    callDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

    const isProductInquiry = Math.random() > 0.3;
    const isCompleted = Math.random() > 0.1;
    const sentiments = ["positive", "neutral", "negative"];
    const sentiment = sentiments[Math.floor(Math.random() * (isCompleted ? 2 : 3))];

    const call = await prisma.callLog.create({
      data: {
        phoneNumber: `+7-${900 + Math.floor(Math.random() * 100)}-${100 + Math.floor(Math.random() * 900)}-${1000 + Math.floor(Math.random() * 9000)}`,
        direction: "inbound",
        status: isCompleted ? "completed" : Math.random() > 0.5 ? "missed" : "transferred",
        duration: isCompleted ? Math.floor(Math.random() * 400) + 60 : Math.floor(Math.random() * 200),
        summary: isProductInquiry ? "Product inquiry and recommendations" : "General information request",
        sentiment,
        category: isProductInquiry ? "product_inquiry" : "general",
        aiResolved: isCompleted && Math.random() > 0.2,
        transferred: !isCompleted && Math.random() > 0.7,
        topicTags: JSON.stringify(isProductInquiry ? ["product", "pricing"] : ["info"]),
        customerIntent: ["buying", "browsing", "information"][Math.floor(Math.random() * 3)],
        createdAt: callDate,
      },
    });

    // Some calls mention products
    if (isProductInquiry && Math.random() > 0.4) {
      const randomProduct = randomProducts[Math.floor(Math.random() * randomProducts.length)];
      await prisma.productMention.create({
        data: {
          callLogId: call.id,
          productId: randomProduct.id,
          mentions: Math.floor(Math.random() * 3) + 1,
          context: "Customer asked about pricing and availability",
        },
      });
    }
  }

  console.log(`✅ Created ${callLogs.length + additionalCallCount} call logs`);

  // 4. Generate business insights
  const insights = [
    {
      type: "trending_product",
      title: "Cohiba Products Trending",
      description: "Cohiba brand mentioned in 35% of calls this week. Consider promoting Cohiba Siglo VI.",
      data: JSON.stringify({ brand: "Cohiba", mentionRate: 0.35, topProduct: "Cohiba Siglo VI" }),
      priority: "high",
      actionable: true,
    },
    {
      type: "peak_hour",
      title: "Peak Call Hours: 14:00-16:00",
      description: "Highest call volume between 2-4 PM. Ensure availability during these hours.",
      data: JSON.stringify({ peakStart: 14, peakEnd: 16, avgCalls: 8 }),
      priority: "normal",
      actionable: true,
    },
    {
      type: "customer_interest",
      title: "Beginner-Friendly Cigars in Demand",
      description: "20% of inquiries are from first-time buyers asking for recommendations.",
      data: JSON.stringify({ beginnerRate: 0.20, topRecommendation: "Montecristo No. 4" }),
      priority: "normal",
      actionable: true,
    },
    {
      type: "revenue_opportunity",
      title: "Premium Segment Growth",
      description: "Inquiries for $50+ cigars increased 40% this week. Stock Opus X and Behike.",
      data: JSON.stringify({ growthRate: 0.40, products: ["Opus X", "Behike 56"] }),
      priority: "high",
      actionable: true,
    },
  ];

  for (const insight of insights) {
    await prisma.businessInsight.create({ data: insight });
  }
  console.log(`✅ Created ${insights.length} business insights`);

  // 5. Seed metrics
  const today = new Date();
  const metrics = [
    { name: "total_calls", value: 50, period: "weekly", date: today },
    { name: "total_conversations", value: 42, period: "weekly", date: today },
    { name: "avg_call_duration", value: 220, period: "weekly", date: today },
    { name: "avg_response_time", value: 800, period: "weekly", date: today },
  ];

  for (const metric of metrics) {
    await prisma.metric.upsert({
      where: {
        name_period_date: {
          name: metric.name,
          period: metric.period,
          date: metric.date,
        },
      },
      update: { value: metric.value },
      create: metric,
    });
  }
  console.log(`✅ Created ${metrics.length} metrics`);

  console.log("\n🎉 Database seed completed successfully!\n");
  console.log("Summary:");
  console.log(`- ${createdProducts.length} cigar products`);
  console.log(`- ~50 realistic call logs (last 14 days)`);
  console.log(`- ${insights.length} business insights`);
  console.log(`- ${metrics.length} metrics`);
  console.log(`- 1 owner user (${email})`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
