#!/bin/bash

# G4A School Management Portal Setup Script
echo "🏫 Setting up G4A School Management Portal..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Yarn is installed
if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn is not installed. Please install Yarn first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ is required. Current version: $(node -v)"
    echo "💡 Please use nvm to switch to Node.js 20+:"
    echo "   nvm use 20"
    echo "   or"
    echo "   nvm install 20 && nvm use 20"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo "✅ Yarn $(yarn -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Set up pre-commit hooks
echo "🔧 Setting up pre-commit hooks..."
yarn prepare

# Create environment files if they don't exist
echo "⚙️  Setting up environment files..."

if [ ! -f "api/.env" ]; then
    echo "📝 Creating API environment file..."
    cat > api/.env << EOF
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/g4a_portal

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
EOF
    echo "✅ Created api/.env"
else
    echo "ℹ️  api/.env already exists"
fi

if [ ! -f "web/.env" ]; then
    echo "📝 Creating Web environment file..."
    cat > web/.env << EOF
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=G4A School Management Portal
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development
EOF
    echo "✅ Created web/.env"
else
    echo "ℹ️  web/.env already exists"
fi

# Run initial build to check everything works
echo "🔨 Running initial build..."
yarn build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo ""
echo "🎉 Setup complete! You can now start developing:"
echo ""
echo "  Development mode:"
echo "    yarn dev          # Start both API and Web"
echo "    yarn api:dev      # Start API only"
echo "    yarn web:dev      # Start Web only"
echo ""
echo "  Testing:"
echo "    yarn test         # Run all tests"
echo "    yarn lint         # Run linting"
echo ""
echo "  Building:"
echo "    yarn build        # Build for production"
echo ""
echo "  Version management:"
echo "    yarn release      # Create a new release"
echo ""
echo "📚 Read the README.md for more information about contributing."
echo "🔗 API will be available at: http://localhost:3000"
echo "🔗 Web app will be available at: http://localhost:5173"
