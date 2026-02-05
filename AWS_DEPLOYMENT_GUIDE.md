# 🚀 AWS Deployment Guide for Resume Builder

This guide will help you deploy your Resume Builder to AWS with MongoDB Atlas.

## 📋 Overview

**Architecture:**
```
Frontend (React/HTML) → AWS S3 + CloudFront
Backend (Node.js API) → AWS EC2 / AWS Lambda
Database → MongoDB Atlas (Cloud)
```

## 🎯 Step 1: Prepare for AWS Deployment

### **1.1 Update Backend for Production**

Create production environment file:

```bash
# backend/.env.production
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resumebuilder
JWT_SECRET=your-super-secure-production-jwt-secret-here
FRONTEND_URL=https://your-cloudfront-domain.com
```

### **1.2 Update CORS for Production**

Update `backend/server.js`:
```javascript
// CORS configuration for production
app.use(cors({
  origin: [
    'http://localhost:8000', // Development
    'https://your-cloudfront-domain.com', // Production
    'https://your-custom-domain.com' // Custom domain
  ],
  credentials: true
}));
```

## 🗄️ Step 2: Set Up MongoDB Atlas (Cloud Database)

### **2.1 Create MongoDB Atlas Account**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create new cluster (Free tier available)

### **2.2 Configure Database**
1. **Create Database User:**
   - Username: `resumebuilder`
   - Password: Generate strong password
   - Roles: `Read and write to any database`

2. **Network Access:**
   - Add IP: `0.0.0.0/0` (Allow from anywhere)
   - Or specific AWS IP ranges

3. **Get Connection String:**
   ```
   mongodb+srv://resumebuilder:password@cluster0.xxxxx.mongodb.net/resumebuilder
   ```

### **2.3 Test Connection**
```bash
# Test locally first
cd backend
MONGODB_URI="your-atlas-connection-string" npm run dev
```

## ☁️ Step 3: Deploy Backend to AWS

### **Option A: AWS EC2 (Recommended)**

#### **3.1 Launch EC2 Instance**
1. **Instance Type:** t2.micro (Free tier)
2. **AMI:** Amazon Linux 2
3. **Security Group:**
   - SSH (22): Your IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0
   - Custom (3000): 0.0.0.0/0

#### **3.2 Connect and Setup**
```bash
# Connect to EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Clone your repository
git clone https://github.com/yourusername/resume-builder.git
cd resume-builder/backend

# Install dependencies
npm install

# Create production environment file
nano .env.production
# Add your production environment variables

# Start with PM2
pm2 start server.js --name "resume-api" --env production
pm2 startup
pm2 save
```

#### **3.3 Set Up Nginx (Reverse Proxy)**
```bash
# Install Nginx
sudo yum install -y nginx

# Configure Nginx
sudo nano /etc/nginx/conf.d/resume-api.conf
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### **Option B: AWS Lambda (Serverless)**

#### **3.1 Install Serverless Framework**
```bash
npm install -g serverless
```

#### **3.2 Create Serverless Configuration**
Create `backend/serverless.yml`:
```yaml
service: resume-builder-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    MONGODB_URI: ${env:MONGODB_URI}
    JWT_SECRET: ${env:JWT_SECRET}

functions:
  api:
    handler: lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true

plugins:
  - serverless-offline
```

#### **3.3 Create Lambda Handler**
Create `backend/lambda.js`:
```javascript
const serverless = require('serverless-http');
const app = require('./server');

module.exports.handler = serverless(app);
```

#### **3.4 Deploy**
```bash
cd backend
serverless deploy
```

## 🌐 Step 4: Deploy Frontend to AWS S3 + CloudFront

### **4.1 Create S3 Bucket**
```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Create S3 bucket
aws s3 mb s3://your-resume-builder-frontend
```

### **4.2 Update Frontend API URL**
Update your frontend JavaScript files:
```javascript
// Change API_BASE URL to your production backend
const API_BASE = 'https://your-api-domain.com/api';
// or
const API_BASE = 'https://your-lambda-url.amazonaws.com/api';
```

### **4.3 Build and Upload Frontend**
```bash
# Upload frontend files
aws s3 sync . s3://your-resume-builder-frontend --exclude "backend/*" --exclude "node_modules/*"

# Set bucket policy for public access
aws s3api put-bucket-policy --bucket your-resume-builder-frontend --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-resume-builder-frontend/*"
    }
  ]
}'

# Enable static website hosting
aws s3 website s3://your-resume-builder-frontend --index-document index.html
```

### **4.4 Set Up CloudFront (CDN)**
1. **Create CloudFront Distribution:**
   - Origin: Your S3 bucket
   - Default Root Object: `index.html`
   - Viewer Protocol Policy: `Redirect HTTP to HTTPS`

2. **Custom Error Pages:**
   - 404 → `/index.html` (for SPA routing)

## 🔒 Step 5: Set Up SSL/HTTPS

### **5.1 Get SSL Certificate (AWS Certificate Manager)**
```bash
# Request certificate
aws acm request-certificate --domain-name your-domain.com --validation-method DNS
```

### **5.2 Update CloudFront**
- Add custom domain
- Select SSL certificate
- Update DNS records

## 🔧 Step 6: Environment Configuration

### **6.1 Production Environment Variables**

**Backend (.env.production):**
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/resumebuilder
JWT_SECRET=super-secure-production-secret
FRONTEND_URL=https://your-domain.com
```

**Frontend (update JavaScript):**
```javascript
const config = {
  development: {
    API_BASE: 'http://localhost:5001/api'
  },
  production: {
    API_BASE: 'https://your-api-domain.com/api'
  }
};

const API_BASE = config[process.env.NODE_ENV || 'production'].API_BASE;
```

## 📊 Step 7: Monitoring and Maintenance

### **7.1 Set Up CloudWatch (AWS Monitoring)**
- Monitor EC2/Lambda performance
- Set up alerts for errors
- Track API usage

### **7.2 Set Up Backup**
- MongoDB Atlas automatic backups
- S3 versioning for frontend
- Regular database exports

### **7.3 CI/CD Pipeline (Optional)**
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy Backend
        run: |
          # Deploy to EC2 or Lambda
          
      - name: Deploy Frontend
        run: |
          aws s3 sync . s3://your-bucket --exclude "backend/*"
          aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

## 💰 Cost Estimation

**Monthly AWS Costs (Approximate):**
- **EC2 t2.micro:** $8-10/month
- **S3 Storage:** $1-3/month
- **CloudFront:** $1-5/month
- **MongoDB Atlas:** Free tier available
- **Total:** ~$10-20/month

## 🚀 Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to EC2/Lambda
- [ ] Frontend uploaded to S3
- [ ] CloudFront distribution configured
- [ ] SSL certificate installed
- [ ] DNS records updated
- [ ] Environment variables configured
- [ ] CORS settings updated
- [ ] Database connection tested
- [ ] API endpoints tested
- [ ] Frontend-backend integration tested

## 🔧 Troubleshooting

### **Common Issues:**

1. **CORS Errors:**
   - Check FRONTEND_URL in backend
   - Verify CORS configuration

2. **Database Connection:**
   - Check MongoDB Atlas IP whitelist
   - Verify connection string

3. **API Not Found:**
   - Check Nginx configuration
   - Verify PM2 process running

4. **Frontend Not Loading:**
   - Check S3 bucket policy
   - Verify CloudFront distribution

## 📚 Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/s3/latest/userguide/WebsiteHosting.html)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)

---

**🎉 Congratulations! Your Resume Builder is now deployed on AWS with MongoDB Atlas!**

Your users can now access your resume builder from anywhere in the world with:
- ✅ Scalable cloud infrastructure
- ✅ Global CDN for fast loading
- ✅ Secure HTTPS connections
- ✅ Reliable database hosting
- ✅ Professional domain name