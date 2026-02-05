#!/bin/bash

# 🚀 GitHub + Vercel Deployment Helper

echo "🚀 Resume Builder - GitHub + Vercel Deployment"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📋 GitHub + Vercel Deployment Steps:${NC}"
echo "1. ✅ Push code to GitHub (triggers auto-deploy)"
echo "2. 🔧 Configure environment variables in Vercel dashboard"
echo "3. 🌐 Access your live application"
echo ""

echo -e "${YELLOW}🔧 Environment Variables to Set in Vercel Dashboard:${NC}"
echo "MONGODB_URI = mongodb+srv://diyaraghavendra2_db_user:QxBrHlCIzufnQqc@resume-builder.vtamltf.mongodb.net/resumebuilder"
echo "JWT_SECRET = your-super-secure-random-string"
echo "NODE_ENV = production"
echo ""

echo -e "${BLUE}📊 Next Steps:${NC}"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Find your project and click on it"
echo "3. Go to Settings → Environment Variables"
echo "4. Add the variables shown above"
echo "5. Redeploy your application"
echo ""

echo -e "${GREEN}🎉 Your Resume Builder will be live after setting environment variables!${NC}"