#!/bin/bash
# Push AIMForce to GitHub

cd ~/Desktop/Tars/Projects/aimforce

# Add remote
git remote add origin https://github.com/Northern-whale/aimforce-cloud.git

# Push code
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"
echo "Next: Deploy to Vercel"
