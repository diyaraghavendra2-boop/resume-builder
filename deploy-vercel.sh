#!/bin/bash

echo "🚀 Starting Vercel deployment process..."

# Install Vercel CLI if not present
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy backend first
echo "🔧 Deploying backend to Vercel..."
cd backend

# Set environment variables for Vercel
echo "⚙️ Setting up environment variables..."
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add NODE_ENV production
vercel env add FRONTEND_URL production
vercel env add CORS_ORIGIN production

# Deploy backend
echo "🚀 Deploying backend..."
vercel --prod

# Get backend URL
BACKEND_URL=$(vercel ls | grep backend | head -1 | awk '{print $2}')
echo "✅ Backend deployed to: https://$BACKEND_URL"

# Go back to root and deploy frontend
cd ..
echo "🎨 Deploying frontend..."

# Update frontend config with backend URL
cat > config.js << EOF
const config = {
    API_BASE_URL: 'https://$BACKEND_URL/api',
    ENVIRONMENT: 'production'
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
}
EOF

# Deploy frontend
vercel --prod

# Get frontend URL
FRONTEND_URL=$(vercel ls | grep -v backend | head -1 | awk '{print $2}')
echo "✅ Frontend deployed to: https://$FRONTEND_URL"

# Update backend CORS settings with frontend URL
cd backend
vercel env add FRONTEND_URL "https://$FRONTEND_URL" production
vercel env add CORS_ORIGIN "https://$FRONTEND_URL" production

# Redeploy backend with updated CORS
vercel --prod

echo "🎉 Deployment complete!"
echo "🌐 Frontend: https://$FRONTEND_URL"
echo "🔧 Backend: https://$BACKEND_URL"
echo ""
echo "📋 Next steps:"
echo "1. Update MongoDB Atlas IP whitelist to allow 0.0.0.0/0"
echo "2. Test the application end-to-end"
echo "3. Monitor logs for any issues"