-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "hours" TEXT,
    "ownerPhone" TEXT,
    "ownerEmail" TEXT,
    "ownerTelegram" TEXT,
    "elevenlabsAgentId" TEXT,
    "twilioNumber" TEXT,
    "knowledgeBase" TEXT,
    "voiceId" TEXT,
    "greeting" TEXT,
    "transferTriggers" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'starter',
    "status" TEXT NOT NULL DEFAULT 'onboarding',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BusinessInsight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "data" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "actionable" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BusinessInsight_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BusinessInsight" ("actionable", "createdAt", "data", "description", "id", "priority", "title", "type") SELECT "actionable", "createdAt", "data", "description", "id", "priority", "title", "type" FROM "BusinessInsight";
DROP TABLE "BusinessInsight";
ALTER TABLE "new_BusinessInsight" RENAME TO "BusinessInsight";
CREATE INDEX "BusinessInsight_businessId_idx" ON "BusinessInsight"("businessId");
CREATE TABLE "new_CallLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT,
    "externalId" TEXT,
    "phoneNumber" TEXT,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "duration" INTEGER,
    "summary" TEXT,
    "transcript" TEXT,
    "sentiment" TEXT,
    "transferredTo" TEXT,
    "metadata" TEXT,
    "category" TEXT,
    "aiResolved" BOOLEAN NOT NULL DEFAULT false,
    "transferred" BOOLEAN NOT NULL DEFAULT false,
    "topicTags" TEXT,
    "customerIntent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CallLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CallLog" ("aiResolved", "category", "createdAt", "customerIntent", "direction", "duration", "externalId", "id", "metadata", "phoneNumber", "sentiment", "status", "summary", "topicTags", "transcript", "transferred", "transferredTo") SELECT "aiResolved", "category", "createdAt", "customerIntent", "direction", "duration", "externalId", "id", "metadata", "phoneNumber", "sentiment", "status", "summary", "topicTags", "transcript", "transferred", "transferredTo" FROM "CallLog";
DROP TABLE "CallLog";
ALTER TABLE "new_CallLog" RENAME TO "CallLog";
CREATE UNIQUE INDEX "CallLog_externalId_key" ON "CallLog"("externalId");
CREATE INDEX "CallLog_businessId_idx" ON "CallLog"("businessId");
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT,
    "type" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Event_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("createdAt", "id", "payload", "read", "type") SELECT "createdAt", "id", "payload", "read", "type" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE INDEX "Event_businessId_idx" ON "Event"("businessId");
CREATE TABLE "new_Metric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT,
    "name" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "period" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Metric_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Metric" ("createdAt", "date", "id", "metadata", "name", "period", "value") SELECT "createdAt", "date", "id", "metadata", "name", "period", "value" FROM "Metric";
DROP TABLE "Metric";
ALTER TABLE "new_Metric" RENAME TO "Metric";
CREATE INDEX "Metric_businessId_idx" ON "Metric"("businessId");
CREATE UNIQUE INDEX "Metric_name_period_date_key" ON "Metric"("name", "period", "date");
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "businessId" TEXT,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "priceUSD" REAL,
    "strength" TEXT NOT NULL,
    "length" INTEGER,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "imageUrl" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("brand", "category", "createdAt", "description", "id", "imageUrl", "inStock", "length", "name", "origin", "price", "priceUSD", "stock", "strength", "updatedAt") SELECT "brand", "category", "createdAt", "description", "id", "imageUrl", "inStock", "length", "name", "origin", "price", "priceUSD", "stock", "strength", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE INDEX "Product_businessId_idx" ON "Product"("businessId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "businessId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "passwordHash", "role", "updatedAt") SELECT "createdAt", "email", "id", "name", "passwordHash", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
