# 🔐 Google OAuth Setup Guide

## 📋 **What We Added:**

✅ **Backend Integration:**
- Google OAuth library installed
- `/api/auth/google` endpoint for Google authentication
- User model updated to support Google ID
- Automatic user creation/linking for Google users

✅ **Frontend Integration:**
- Google Sign-In SDK loaded
- Google Sign-In buttons in login/register modals
- Seamless authentication flow

## 🛠️ **Setup Required:**

### **Step 1: Create Google OAuth Credentials**

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create/Select Project:**
   - Create new project or select existing one
   - Name: "Resume Builder" (or your preferred name)

3. **Enable Google+ API:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" 
   - Click "Enable"

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Resume Builder Web Client"

5. **Configure Authorized Origins:**
   ```
   Authorized JavaScript origins:
   - http://localhost:8000 (for local development)
   - https://your-vercel-app.vercel.app (for production)
   
   Authorized redirect URIs:
   - http://localhost:8000 (for local development)  
   - https://your-vercel-app.vercel.app (for production)
   ```

6. **Get Your Credentials:**
   - Copy the **Client ID** (looks like: 1234567890-abc...xyz.apps.googleusercontent.com)
   - Copy the **Client Secret** (looks like: GOCSPX-abc...xyz)

### **Step 2: Update Environment Variables**

**Local Development (.env):**
```bash
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
```

**Production (Vercel Dashboard):**
```bash
GOOGLE_CLIENT_ID=your-actual-client-id-here
GOOGLE_CLIENT_SECRET=your-actual-client-secret-here
```

### **Step 3: Update Frontend Client ID**

In `script-with-backend.js`, replace the placeholder:
```javascript
client_id: 'your-actual-client-id-here', // Replace with your real Client ID
```

## 🎯 **How It Works:**

### **User Experience:**
1. User clicks "Login" or "Register"
2. Modal shows with traditional form + Google Sign-In button
3. User clicks Google button → Google popup appears
4. User selects Google account → Automatic login/registration
5. User is logged in with Google profile info

### **Technical Flow:**
1. **Frontend:** Google SDK handles authentication popup
2. **Google:** Returns JWT credential to frontend
3. **Frontend:** Sends credential to `/api/auth/google`
4. **Backend:** Verifies credential with Google
5. **Backend:** Creates/finds user in MongoDB
6. **Backend:** Returns JWT token for app authentication
7. **Frontend:** Stores token and logs user in

## ✅ **Benefits:**

- **🚀 Faster signup** - No password needed
- **🔒 More secure** - Google handles authentication
- **📱 Better UX** - Familiar Google interface
- **🎯 Higher conversion** - Users more likely to sign up
- **🔄 Auto-sync** - Profile picture from Google account

## 🧪 **Testing:**

1. **Set up Google credentials** (steps above)
2. **Update environment variables**
3. **Restart your backend server**
4. **Test login/register** with Google button
5. **Verify user creation** in MongoDB Atlas

## 🚀 **Ready for Production:**

Once you have Google credentials:
1. Add them to Vercel environment variables
2. Update authorized origins with your Vercel URL
3. Deploy and test!

**Your resume builder now supports both traditional and Google authentication! 🎉**