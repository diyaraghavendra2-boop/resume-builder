# 🚀 Deploy Your Resume Builder to AWS - Step by Step

## **Prerequisites (Do These First):**

### 1. **Install AWS CLI**
```bash
# Install AWS CLI
pip install awscli

# Or using Homebrew (macOS)
brew install awscli
```

### 2. **Create AWS Account**
- Go to [AWS Console](https://aws.amazon.com/)
- Sign up for free account (includes free tier)
- Note: You'll need a credit card but won't be charged for free tier usage

### 3. **Configure AWS CLI**
```bash
aws configure
```
Enter:
- **AWS Access Key ID**: (from AWS Console → IAM → Users → Security credentials)
- **AWS Secret Access Key**: (from AWS Console)
- **Default region**: `us-east-1`
- **Default output format**: `json`

---

## **🎯 Deployment Steps (Simple Version):**

### **Step 1: Set Up MongoDB Atlas (Cloud Database)**

1. **Go to [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Sign up for free account**
3. **Create new cluster** (choose free tier)
4. **Create database user:**
   - Username: `resumebuilder`
   - Password: (generate strong password)
5. **Network Access:** Add `0.0.0.0/0` (allow from anywhere)
6. **Get connection string:** 
   ```
   mongodb+srv://resumebuilder:PASSWORD@cluster0.xxxxx.mongodb.net/resumebuilder
   ```

### **Step 2: Deploy Frontend to S3**

```bash
# Run the deployment script
./deploy-aws.sh
```

This will:
- ✅ Create S3 bucket for your frontend
- ✅ Upload all your HTML/CSS/JS files
- ✅ Enable static website hosting
- ✅ Give you a public URL

### **Step 3: Deploy Backend to EC2**

#### **3.1 Launch EC2 Instance**
1. **Go to AWS Console → EC2**
2. **Launch Instance:**
   - **AMI**: Amazon Linux 2
   - **Instance Type**: t2.micro (free tier)
   - **Security Group**: Create new with these rules:
     - SSH (22): Your IP only
     - HTTP (80): 0.0.0.0/0
     - HTTPS (443): 0.0.0.0/0
     - Custom TCP (3000): 0.0.0.0/0
3. **Download key pair** (.pem file)

#### **3.2 Connect to EC2 and Setup**
```bash
# Connect to your EC2 instance
ssh -i your-key.pem ec2-user@YOUR-EC2-PUBLIC-IP

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### **3.3 Deploy Your Backend**
```bash
# On EC2 instance:
# Upload your backend zip file (created by deploy script)
# Or clone from GitHub:
git clone https://github.com/yourusername/resume-builder.git
cd resume-builder/backend

# Install dependencies
npm install

# Create production environment file
nano .env.production
```

Add to `.env.production`:
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://resumebuilder:YOUR-PASSWORD@cluster0.xxxxx.mongodb.net/resumebuilder
JWT_SECRET=your-super-secure-jwt-secret-change-this
FRONTEND_URL=http://your-s3-bucket.s3-website-us-east-1.amazonaws.com
```

```bash
# Start the application
pm2 start server.js --name "resume-api" --env production
pm2 startup
pm2 save

# Check if it's running
pm2 status
curl http://localhost:3000/api/health
```

### **Step 4: Update Frontend API URL**

Update your frontend files to point to your EC2 instance:

```javascript
// In your JavaScript files, change:
const API_BASE = 'http://localhost:5001/api';

// To:
const API_BASE = 'http://YOUR-EC2-PUBLIC-IP:3000/api';
```

Then re-upload to S3:
```bash
aws s3 sync . s3://your-bucket-name --exclude "backend/*"
```

### **Step 5: Test Your Deployment**

1. **Frontend**: Visit your S3 website URL
2. **Backend**: Test `http://YOUR-EC2-IP:3000/api/health`
3. **Full App**: Try registering and creating a resume

---

## **🎉 You're Done!**

Your resume builder is now live on AWS:
- **Frontend**: Fast global delivery via S3
- **Backend**: Scalable API on EC2
- **Database**: Reliable MongoDB Atlas

## **📊 Costs (Approximate):**
- **EC2 t2.micro**: Free for 12 months, then ~$8/month
- **S3 Storage**: ~$1-3/month
- **MongoDB Atlas**: Free tier (512MB)
- **Total**: Free for first year, then ~$10/month

## **🔧 Optional Improvements:**
1. **Custom Domain**: Route 53 + CloudFront
2. **SSL Certificate**: AWS Certificate Manager
3. **Load Balancer**: For high availability
4. **Auto Scaling**: For traffic spikes

## **🆘 Need Help?**
- Check `AWS_DEPLOYMENT_GUIDE.md` for detailed instructions
- AWS Free Tier: [aws.amazon.com/free](https://aws.amazon.com/free/)
- MongoDB Atlas Docs: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com/)

---

**🚀 Your resume builder is now professional-grade and ready for the world!**