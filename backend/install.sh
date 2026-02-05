#!/bin/bash

echo "🚀 Setting up Resume Builder Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running (optional check)
echo "📊 Checking MongoDB connection..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Please create one with your configuration."
    echo "📝 Example .env file:"
    cat << EOF
MONGODB_URI=mongodb://localhost:27017/resumebuilder
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=http://localhost:8000
NODE_ENV=development
EOF
else
    echo "✅ .env file found"
fi

echo ""
echo "🎉 Backend setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Update .env file with your settings"
echo "3. Run: npm run dev"
echo ""
echo "🔗 API will be available at: http://localhost:5000"
echo "📊 Health check: http://localhost:5000/api/health"