# 🔧 Vercel Environment Variables Setup

## ⚠️ CRITICAL: You must set these environment variables in Vercel for the backend to work!

### **Step-by-Step Instructions:**

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your project: `resume-indol-sigma` (or whatever your project name is)

2. **Navigate to Settings:**
   - Click on the **"Settings"** tab at the top
   - Click on **"Environment Variables"** in the left sidebar

3. **Add These 3 Variables:**

#### Variable 1: MONGODB_URI
```
Name: MONGODB_URI
Value: mongodb+srv://diyaraghavendra2_db_user:QxBrH1CIzufn0qkc@resume-builder.vtmhvlf.mongodb.net/resumebuilder?appName=resume-builder
Environment: Production, Preview, Development (select all 3)
```

#### Variable 2: JWT_SECRET
```
Name: JWT_SECRET
Value: your-super-secret-jwt-key-change-this-to-something-random-12345
Environment: Production, Preview, Development (select all 3)
```

#### Variable 3: NODE_ENV
```
Name: NODE_ENV
Value: production
Environment: Production only
```

4. **Save and Redeploy:**
   - After adding all variables, click **"Save"**
   - Go to the **"Deployments"** tab
   - Click the **"..."** menu on the latest deployment
   - Click **"Redeploy"**
   - Check "Use existing Build Cache" is OFF
   - Click **"Redeploy"**

## ✅ How to Verify It's Working:

After redeployment (wait 2-3 minutes), test these URLs:

1. **Health Check:**
   ```
   https://resume-indol-sigma.vercel.app/api/health
   ```
   Should return: `{"status":"OK","message":"Resume Builder API is running!"}`

2. **Frontend:**
   ```
   https://resume-indol-sigma.vercel.app/
   ```
   Should show the resume builder with Login/Register buttons

## 🎯 Expected Result:

- ✅ Frontend loads with authentication buttons
- ✅ Backend API responds to /api/health
- ✅ Users can register and login
- ✅ Resumes save to MongoDB Atlas
- ✅ Full cloud functionality working!

## 📞 If You Need Help:

Let me know if you see any errors or if the environment variables section is not visible in your Vercel dashboard.
