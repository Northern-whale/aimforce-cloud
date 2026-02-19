#!/bin/bash
# Initialize AIMForce Production Database

echo "🗄️  Initializing AIMForce database on Railway..."
echo ""

# Set database URL
export DATABASE_URL="postgresql://postgres:NxCJtYhmoFdPRCPNNvvAUvcDReuSNGDC@switchyard.proxy.rlwy.net:29390/railway"

# Push schema
echo "📋 Creating database tables..."
npx prisma db push --accept-data-loss

echo ""
echo "🌱 Seeding initial data..."
npx prisma db seed

echo ""
echo "✅ Database initialized!"
echo ""
echo "Owner account created:"
echo "  Email: owner@aimforce.cloud"
echo "  Password: aimforce2026"
echo ""
echo "Ready to test at: https://aimforce.cloud"
