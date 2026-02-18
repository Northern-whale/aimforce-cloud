#!/bin/bash

# Social Media Automation - Quick Setup Script

set -e

echo "🚀 Setting up Social Media Automation Platform..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "✅ .env file created"
else
  echo "✅ .env file already exists"
fi

# Generate encryption key if not set
if ! grep -q "ENCRYPTION_KEY=\".*[a-fA-F0-9]" .env; then
  echo "🔐 Generating encryption key..."
  ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/ENCRYPTION_KEY=\".*\"/ENCRYPTION_KEY=\"$ENCRYPTION_KEY\"/" .env
  else
    # Linux
    sed -i "s/ENCRYPTION_KEY=\".*\"/ENCRYPTION_KEY=\"$ENCRYPTION_KEY\"/" .env
  fi
  
  echo "✅ Encryption key generated and added to .env"
else
  echo "✅ Encryption key already set"
fi

# Generate CRON secret if not set
if ! grep -q "CRON_SECRET=\".*[a-zA-Z0-9]" .env; then
  echo "🔐 Generating CRON secret..."
  CRON_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/CRON_SECRET=\".*\"/CRON_SECRET=\"$CRON_SECRET\"/" .env
  else
    sed -i "s/CRON_SECRET=\".*\"/CRON_SECRET=\"$CRON_SECRET\"/" .env
  fi
  
  echo "✅ CRON secret generated and added to .env"
else
  echo "✅ CRON secret already set"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Run database migration
echo ""
echo "🗄️  Running database migration..."
npx prisma migrate dev --name add_social_media_models || echo "⚠️  Migration already applied"

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. Configure OAuth credentials in .env (see SOCIAL_MEDIA_SETUP.md)"
echo "2. Start dev server: npm run dev"
echo "3. Navigate to: http://localhost:3000/social"
echo ""
echo "🧪 For testing without OAuth:"
echo "   Set MOCK_SOCIAL=true in .env"
echo ""
echo "📖 Documentation:"
echo "   - README_SOCIAL_MEDIA.md - Architecture overview"
echo "   - SOCIAL_MEDIA_SETUP.md - OAuth setup guide"
echo "   - TESTING_GUIDE.md - Testing procedures"
echo ""
echo "🎉 Happy posting!"
