# 🚀 Deploy Backend to Render.com - Step by Step

## Why Render Instead of Vercel?
- Render works perfectly with Express.js (no conversion needed)
- Free tier available
- Much simpler setup
- Your code works as-is!

## Step 1: Create Render Account (2 minutes)

1. Go to: https://render.com
2. Click "Get Started for Free"
3. Sign up with your GitHub account (easiest option)
4. Verify your email if asked

## Step 2: Deploy Your Backend (5 minutes)

### Option A: Connect GitHub Repository (Recommended)

1. **In Render Dashboard:**
   - Click "New +" button (top right)
   - Select "Web Service"

2. **Connect Repository:**
   - Click "Connect account" under GitHub
   - Authorize Render to access your GitHub
   - Find and select your `resume-builder` repository
   - Click "Connect"

3. **Configure Service:**
   - **Name**: `resume-builder-backend` (or any name you like)
   - **Region**: Oregon (US West) - closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. **Add Environment Variables:**
   Click "Advanced" and add these:
   
   - **MONGODB_URI**
     ```
     mongodb+srv://diyaraghavendra2_db_user:QxBrH1CIzufn0qkc@resume-builder.vtmhvlf.mongodb.net/resumebuilder?appName=resume-builder
     ```
   
   - **JWT_SECRET**
     ```
     your-super-secret-jwt-key-change-this-in-production
     ```
   
   - **NODE_ENV**
     ```
     production
     ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - You'll see logs showing the build process

6. **Get Your Backend URL:**
   - After deployment succeeds, you'll see a URL like:
     `https://resume-builder-backend-xxxx.onrender.com`
   - **COPY THIS URL** - you'll need it!

## Step 3: Update Frontend Configuration (1 minute)

1. Open `config.js` in your project
2. Replace `YOUR-RENDER-APP-NAME` with your actual Render URL
3. Example:
   ```javascript
   window.RESUME_BUILDER_CONFIG = {
       API_BASE: window.location.hostname === 'localhost' 
           ? 'http://localhost:5001/api'
           : 'https://resume-builder-backend-xxxx.onrender.com/api'
   };
   ```

## Step 4: Push Changes to GitHub (1 minute)

```bash
git add config.js
git commit -m "Update backend URL to Render"
git push origin main
```

## Step 5: Vercel Will Auto-Deploy (1 minute)

- Vercel automatically detects the GitHub push
- It will redeploy your frontend with the new config
- Wait 1-2 minutes for deployment

## Step 6: Test Your Live App! 🎉

1. Go to your Vercel URL: `https://resume-indol-sigma.vercel.app`
2. Try registering a new account
3. Create a resume
4. Save it
5. Check MongoDB Compass - you should see the new resume!

## Troubleshooting

### Backend Not Responding
- Check Render logs: Dashboard → Your Service → Logs
- Make sure environment variables are set correctly
- Verify MongoDB connection string is correct

### CORS Errors
- Your backend already has CORS configured for Vercel domains
- Should work automatically!

### Frontend Can't Connect
- Double-check the URL in `config.js`
- Make sure you pushed changes to GitHub
- Verify Vercel redeployed (check Vercel dashboard)

## What You'll Have After This:

✅ **Frontend**: Hosted on Vercel (fast, global CDN)
✅ **Backend**: Hosted on Render (free, reliable)
✅ **Database**: MongoDB Atlas (cloud, secure)
✅ **Shareable Link**: Works from anywhere!

## Free Tier Limits:

- **Render Free**: Backend may sleep after 15 min of inactivity (wakes up in ~30 seconds on first request)
- **Vercel Free**: Unlimited bandwidth for personal projects
- **MongoDB Atlas Free**: 512 MB storage (plenty for resumes!)

---

**Ready to start? Go to Step 1!** 🚀
