#!/bin/bash

echo "🚀 Deploying Backend to Vercel..."
echo ""

# Navigate to backend directory
cd backend

# Deploy to Vercel
echo "📦 Deploying backend API..."
vercel --prod

echo ""
echo "✅ Backend deployment initiated!"
echo ""
echo "⚠️  IMPORTANT: After deployment completes:"
echo "1. Copy the backend URL (e.g., https://your-backend.vercel.app)"
echo "2. Update the frontend API_BASE configuration"
echo "3. Set environment variables in Vercel dashboard:"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo "   - NODE_ENV=production"
echo ""
