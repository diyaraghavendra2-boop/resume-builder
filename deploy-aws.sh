#!/bin/bash

# AWS Deployment Script for Resume Builder
# Make sure you have AWS CLI configured before running this script

echo "🚀 Starting AWS Deployment for Resume Builder..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="resume-builder-frontend-$(date +%s)"
REGION="us-east-1"
BACKEND_ZIP="resume-backend.zip"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  S3 Bucket: $BUCKET_NAME"
echo "  Region: $REGION"
echo "  Backend Archive: $BACKEND_ZIP"
echo ""

# Step 1: Create S3 Bucket for Frontend
echo -e "${YELLOW}📦 Step 1: Creating S3 Bucket for Frontend...${NC}"
aws s3 mb s3://$BUCKET_NAME --region $REGION

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ S3 Bucket created successfully!${NC}"
else
    echo -e "${RED}❌ Failed to create S3 bucket${NC}"
    exit 1
fi

# Step 2: Enable Static Website Hosting
echo -e "${YELLOW}🌐 Step 2: Enabling Static Website Hosting...${NC}"
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Step 3: Set Bucket Policy for Public Access
echo -e "${YELLOW}🔓 Step 3: Setting Bucket Policy...${NC}"
cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file://bucket-policy.json
rm bucket-policy.json

# Step 4: Update Frontend API URL
echo -e "${YELLOW}🔧 Step 4: Updating Frontend Configuration...${NC}"
echo "Please update your frontend JavaScript files with the production API URL"
echo "You'll need to replace 'http://localhost:5001/api' with your EC2 instance URL"

# Step 5: Upload Frontend Files
echo -e "${YELLOW}📤 Step 5: Uploading Frontend Files...${NC}"
aws s3 sync . s3://$BUCKET_NAME \
  --exclude "backend/*" \
  --exclude "node_modules/*" \
  --exclude ".git/*" \
  --exclude "*.sh" \
  --exclude "*.md" \
  --exclude "deploy-*" \
  --delete

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend files uploaded successfully!${NC}"
else
    echo -e "${RED}❌ Failed to upload frontend files${NC}"
    exit 1
fi

# Step 6: Create Backend Deployment Package
echo -e "${YELLOW}📦 Step 6: Creating Backend Deployment Package...${NC}"
cd backend
zip -r ../$BACKEND_ZIP . -x "node_modules/*" ".env*"
cd ..

if [ -f $BACKEND_ZIP ]; then
    echo -e "${GREEN}✅ Backend package created: $BACKEND_ZIP${NC}"
else
    echo -e "${RED}❌ Failed to create backend package${NC}"
    exit 1
fi

# Step 7: Display Results
echo ""
echo -e "${GREEN}🎉 Deployment Preparation Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. 🌐 Frontend URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo "2. 📦 Backend Package: $BACKEND_ZIP (ready for EC2 deployment)"
echo "3. 🗄️  Set up MongoDB Atlas at: https://www.mongodb.com/atlas"
echo "4. 🖥️  Launch EC2 instance and upload $BACKEND_ZIP"
echo "5. 🔧 Update frontend API URLs with your EC2 public IP"
echo ""
echo -e "${YELLOW}⚠️  Important:${NC}"
echo "- Update backend/.env.production with your MongoDB Atlas connection string"
echo "- Configure EC2 security groups to allow HTTP/HTTPS traffic"
echo "- Update CORS settings with your actual domain names"
echo ""
echo -e "${BLUE}📚 Full deployment guide: AWS_DEPLOYMENT_GUIDE.md${NC}"