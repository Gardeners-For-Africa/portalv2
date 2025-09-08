#!/bin/bash

# Script to ensure Node.js 20+ is being used
echo "🔍 Checking Node.js version..."

# Check if nvm is available
if command -v nvm &> /dev/null; then
    echo "📦 NVM detected, switching to Node.js 20..."
    nvm use 20 || nvm install 20 && nvm use 20
elif command -v n &> /dev/null; then
    echo "📦 n detected, switching to Node.js 20..."
    n 20
else
    echo "❌ Neither nvm nor n found. Please install Node.js 20+ manually."
    echo "💡 Recommended: Install nvm from https://github.com/nvm-sh/nvm"
    exit 1
fi

# Verify the version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    echo "✅ Node.js $(node -v) is now active"
    echo "🚀 You can now run: yarn install"
else
    echo "❌ Failed to switch to Node.js 20+. Current version: $(node -v)"
    exit 1
fi
