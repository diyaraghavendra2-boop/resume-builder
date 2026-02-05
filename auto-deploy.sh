#!/bin/bash

# 🤖 FULLY AUTOMATED AWS DEPLOYMENT SCRIPT
# This script does everything possible automatically

set -e  # Exit on any error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "🤖 FULLY AUTOMATED AWS DEPLOYMENT"
echo "=================================="
echo -e "${NC}"

# Configuration
BUCKET_NAME="resume-builder-$(date +%s)"
REGION="us-east-1"
APP_NAME="resume-builder"

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  App Name: $APP_NAME"
echo "  S3 Bucket: $BUCKET_NAME"
echo "  Region: $REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${YELLOW}📦 Installing AWS CLI...${NC}"
    if command -v pip &> /dev/null; then
        pip install awscli
    elif command -v brew &> /dev/null; then
        brew install awscli
    else
        echo -e "${RED}❌ Please install AWS CLI manually${NC}"
        echo "Visit: https://aws.amazon.com/cli/"
        exit 1
    fi
fi

# Check AWS configuration
echo -e "${YELLOW}🔍 Checking AWS Configuration...${NC}"
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS not configured. Please run:${NC}"
    echo "aws configure"
    echo ""
    echo "You'll need:"
    echo "1. AWS Access Key ID"
    echo "2. AWS Secret Access Key"
    echo "3. Default region: us-east-1"
    echo "4. Default output format: json"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configured!${NC}"

# Step 1: Prepare Frontend for Production
echo -e "${YELLOW}🔧 Step 1: Preparing Frontend for Production...${NC}"

# Create production config
cat > frontend-config.js << 'EOF'
// Production Configuration
const CONFIG = {
    development: {
        API_BASE: 'http://localhost:5001/api'
    },
    production: {
        API_BASE: 'https://REPLACE_WITH_EC2_IP:3000/api'
    }
};

// Auto-detect environment
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const API_BASE = isProduction ? CONFIG.production.API_BASE : CONFIG.development.API_BASE;

console.log('🌐 Environment:', isProduction ? 'Production' : 'Development');
console.log('🔗 API Base:', API_BASE);
EOF

# Update main HTML file to include config
if ! grep -q "frontend-config.js" index.html; then
    sed -i.bak 's/<\/head>/<script src="frontend-config.js"><\/script>\n<\/head>/' index.html
    echo -e "${GREEN}✅ Frontend configuration added${NC}"
fi

# Step 2: Create S3 Bucket and Deploy Frontend
echo -e "${YELLOW}🌐 Step 2: Creating S3 Bucket and Deploying Frontend...${NC}"

# Create bucket
aws s3 mb s3://$BUCKET_NAME --region $REGION
echo -e "${GREEN}✅ S3 Bucket created: $BUCKET_NAME${NC}"

# Configure bucket for static website hosting
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Set bucket policy for public access
cat > /tmp/bucket-policy.json << EOF
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

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/bucket-policy.json
rm /tmp/bucket-policy.json

# Upload frontend files
aws s3 sync . s3://$BUCKET_NAME \
  --exclude "backend/*" \
  --exclude "node_modules/*" \
  --exclude ".git/*" \
  --exclude "*.sh" \
  --exclude "*.md" \
  --exclude "deploy-*" \
  --exclude "compass-*" \
  --exclude "debug-*" \
  --exclude "all-users-*" \
  --exclude "check-all-*" \
  --exclude "my-resumes-*" \
  --exclude "enhanced-db-*" \
  --exclude "database-viewer*" \
  --delete

FRONTEND_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
echo -e "${GREEN}✅ Frontend deployed to: $FRONTEND_URL${NC}"

# Step 3: Prepare Backend Package
echo -e "${YELLOW}📦 Step 3: Preparing Backend Package...${NC}"

cd backend

# Create production package.json if it doesn't exist
if [ ! -f package.json ]; then
    npm init -y
fi

# Add production dependencies
npm install --save express mongoose cors helmet express-rate-limit bcryptjs jsonwebtoken dotenv

# Create production environment template
cat > .env.production.template << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=REPLACE_WITH_MONGODB_ATLAS_URI
JWT_SECRET=REPLACE_WITH_SECURE_JWT_SECRET
FRONTEND_URL=$FRONTEND_URL
CORS_ORIGIN=$FRONTEND_URL
EOF

# Create deployment package
zip -r ../resume-backend-deploy.zip . -x "node_modules/*" ".env*"
cd ..

echo -e "${GREEN}✅ Backend package created: resume-backend-deploy.zip${NC}"

# Step 4: Create EC2 User Data Script
echo -e "${YELLOW}🖥️ Step 4: Creating EC2 Setup Script...${NC}"

cat > ec2-setup.sh << 'EOF'
#!/bin/bash
# EC2 User Data Script - Runs automatically on instance launch

# Update system
yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs git unzip

# Install PM2
npm install -g pm2

# Create app directory
mkdir -p /home/ec2-user/app
cd /home/ec2-user/app

# Note: You'll need to upload resume-backend-deploy.zip to this instance
# and extract it here, then run:
# unzip resume-backend-deploy.zip
# npm install
# cp .env.production.template .env.production
# # Edit .env.production with your MongoDB Atlas URI
# pm2 start server.js --name "resume-api" --env production
# pm2 startup
# pm2 save

echo "✅ EC2 setup complete! Upload your backend package and configure environment."
EOF

chmod +x ec2-setup.sh

# Step 5: Generate MongoDB Atlas Setup Instructions
echo -e "${YELLOW}🗄️ Step 5: Creating MongoDB Atlas Setup Guide...${NC}"

cat > mongodb-atlas-setup.md << 'EOF'
# 🗄️ MongoDB Atlas Setup (5 minutes)

## Step 1: Create Account
1. Go to: https://www.mongodb.com/atlas
2. Click "Try Free"
3. Sign up with your email

## Step 2: Create Cluster
1. Choose "Build a Database"
2. Select "FREE" tier (M0 Sandbox)
3. Choose AWS as provider
4. Select region: us-east-1
5. Cluster Name: "resume-builder"
6. Click "Create Cluster"

## Step 3: Create Database User
1. Go to "Database Access" (left sidebar)
2. Click "Add New Database User"
3. Username: resumebuilder
4. Password: (generate strong password - save it!)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

## Step 4: Configure Network Access
1. Go to "Network Access" (left sidebar)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

## Step 5: Get Connection String
1. Go to "Databases" (left sidebar)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace <password> with your actual password

Your connection string will look like:
mongodb+srv://resumebuilder:YOUR_PASSWORD@resume-builder.xxxxx.mongodb.net/resumebuilder

Save this - you'll need it for EC2 setup!
EOF

# Step 6: Create Complete Deployment Summary
echo -e "${YELLOW}📋 Step 6: Creating Deployment Summary...${NC}"

cat > DEPLOYMENT_COMPLETE.md << EOF
# 🎉 AWS Deployment Status

## ✅ Completed Automatically:
- ✅ Frontend deployed to S3: $FRONTEND_URL
- ✅ S3 bucket configured for static hosting
- ✅ Backend package created: resume-backend-deploy.zip
- ✅ EC2 setup script created: ec2-setup.sh
- ✅ Production configuration files created

## 🔑 Manual Steps Required (10 minutes):

### 1. Set Up MongoDB Atlas (5 minutes)
Follow: mongodb-atlas-setup.md
- Create free MongoDB Atlas account
- Create cluster and database user
- Get connection string

### 2. Launch EC2 Instance (5 minutes)
1. Go to AWS Console → EC2 → Launch Instance
2. Choose: Amazon Linux 2 AMI
3. Instance Type: t2.micro (free tier)
4. Security Group: Allow HTTP (80), HTTPS (443), SSH (22), Custom TCP (3000)
5. Download key pair (.pem file)
6. Launch instance

### 3. Deploy Backend to EC2
\`\`\`bash
# Connect to EC2
ssh -i your-key.pem ec2-user@YOUR-EC2-IP

# Upload backend package (use scp or AWS console)
scp -i your-key.pem resume-backend-deploy.zip ec2-user@YOUR-EC2-IP:~/

# On EC2 instance:
unzip resume-backend-deploy.zip
cd resume-backend-deploy
npm install

# Configure environment
cp .env.production.template .env.production
nano .env.production  # Add your MongoDB Atlas URI

# Start application
pm2 start server.js --name "resume-api" --env production
pm2 startup
pm2 save
\`\`\`

### 4. Update Frontend API URL
Replace YOUR-EC2-IP in frontend-config.js with your actual EC2 public IP, then:
\`\`\`bash
aws s3 cp frontend-config.js s3://$BUCKET_NAME/
\`\`\`

## 🌐 Your URLs:
- **Frontend**: $FRONTEND_URL
- **Backend**: http://YOUR-EC2-IP:3000/api/health
- **Full App**: $FRONTEND_URL (after backend is running)

## 💰 Costs:
- **S3**: ~\$1-3/month
- **EC2 t2.micro**: Free for 12 months, then ~\$8/month
- **MongoDB Atlas**: Free tier (512MB)

## 🆘 Support:
- AWS Free Tier: https://aws.amazon.com/free/
- MongoDB Atlas: https://docs.atlas.mongodb.com/
- Full Guide: AWS_DEPLOYMENT_GUIDE.md
EOF

# Final Summary
echo ""
echo -e "${GREEN}🎉 AUTOMATED DEPLOYMENT COMPLETE!${NC}"
echo ""
echo -e "${BLUE}📋 What's Done:${NC}"
echo "✅ Frontend deployed to S3"
echo "✅ Backend package ready for EC2"
echo "✅ All configuration files created"
echo "✅ Setup scripts prepared"
echo ""
echo -e "${YELLOW}🔑 Next Steps (10 minutes):${NC}"
echo "1. 📖 Read: mongodb-atlas-setup.md"
echo "2. 🗄️  Set up MongoDB Atlas (5 min)"
echo "3. 🖥️  Launch EC2 instance (5 min)"
echo "4. 📦 Deploy backend using provided scripts"
echo ""
echo -e "${PURPLE}📊 Summary:${NC}"
echo "Frontend URL: $FRONTEND_URL"
echo "Backend Package: resume-backend-deploy.zip"
echo "Setup Guide: DEPLOYMENT_COMPLETE.md"
echo ""
echo -e "${GREEN}🚀 Your resume builder will be live in ~10 minutes!${NC}"
EOF

chmod +x auto-deploy.sh