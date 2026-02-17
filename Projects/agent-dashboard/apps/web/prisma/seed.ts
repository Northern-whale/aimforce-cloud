import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.OWNER_EMAIL || "owner@tars.ai";
  const password = process.env.OWNER_PASSWORD || "tars2026";

  const passwordHash = await bcryptjs.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      name: "Owner",
      passwordHash,
      role: "owner",
    },
  });

  // Seed some sample call logs for the reports page
  const sampleCalls = [
    {
      phoneNumber: "+1-555-0101",
      direction: "inbound",
      status: "completed",
      duration: 204,
      summary: "Customer asked about product pricing and availability",
      sentiment: "positive",
    },
    {
      phoneNumber: "+1-555-0102",
      direction: "inbound",
      status: "transferred",
      duration: 330,
      summary: "Wholesale inquiry - transferred to owner",
      sentiment: "neutral",
      transferredTo: "Owner",
    },
    {
      phoneNumber: "+1-555-0103",
      direction: "inbound",
      status: "completed",
      duration: 145,
      summary: "Store hours and location request",
      sentiment: "positive",
    },
    {
      phoneNumber: "+1-555-0104",
      direction: "inbound",
      status: "missed",
      duration: 0,
      summary: "Missed call - no voicemail",
      sentiment: "neutral",
    },
    {
      phoneNumber: "+1-555-0105",
      direction: "inbound",
      status: "completed",
      duration: 420,
      summary: "Detailed product consultation and recommendations",
      sentiment: "positive",
    },
  ];

  for (const call of sampleCalls) {
    await prisma.callLog.create({ data: call });
  }

  // Seed some metrics
  const today = new Date();
  const metrics = [
    { name: "total_calls", value: 47, period: "weekly", date: today },
    { name: "total_conversations", value: 23, period: "weekly", date: today },
    { name: "avg_call_duration", value: 180, period: "weekly", date: today },
    { name: "avg_response_time", value: 1200, period: "weekly", date: today },
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

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
