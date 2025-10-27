#!/bin/bash

# SSL Configuration Fix Script
# This script helps you set the correct SSL environment variables

echo "🔧 SSL Configuration Fix Script"
echo "================================"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Creating one from env.example..."
    cp env.example .env
    echo "✅ Created .env file from env.example"
    echo ""
fi

echo "Current SSL configuration in .env:"
echo "----------------------------------"
grep -E "DB_SSL" .env || echo "No DB_SSL configuration found"

echo ""
echo "Choose your database setup:"
echo "1. Cloud database with self-signed certificates (AWS RDS, Google Cloud SQL, etc.)"
echo "2. Cloud database with valid certificates"
echo "3. Local database without SSL"
echo "4. Show current configuration and exit"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo "Setting up SSL for cloud database with self-signed certificates..."
        # Remove existing DB_SSL lines
        sed -i.bak '/^DB_SSL/d' .env
        sed -i.bak '/^DB_SSL_REJECT_UNAUTHORIZED/d' .env
        
        # Add new SSL configuration
        echo "" >> .env
        echo "# SSL Settings (for cloud databases with self-signed certificates)" >> .env
        echo "DB_SSL=true" >> .env
        echo "DB_SSL_REJECT_UNAUTHORIZED=false" >> .env
        
        echo "✅ Configuration updated!"
        echo "   - DB_SSL=true"
        echo "   - DB_SSL_REJECT_UNAUTHORIZED=false"
        ;;
    2)
        echo "Setting up SSL for cloud database with valid certificates..."
        # Remove existing DB_SSL lines
        sed -i.bak '/^DB_SSL/d' .env
        sed -i.bak '/^DB_SSL_REJECT_UNAUTHORIZED/d' .env
        
        # Add new SSL configuration
        echo "" >> .env
        echo "# SSL Settings (for cloud databases with valid certificates)" >> .env
        echo "DB_SSL=true" >> .env
        echo "DB_SSL_REJECT_UNAUTHORIZED=true" >> .env
        
        echo "✅ Configuration updated!"
        echo "   - DB_SSL=true"
        echo "   - DB_SSL_REJECT_UNAUTHORIZED=true"
        ;;
    3)
        echo "Disabling SSL for local database..."
        # Remove existing DB_SSL lines
        sed -i.bak '/^DB_SSL/d' .env
        sed -i.bak '/^DB_SSL_REJECT_UNAUTHORIZED/d' .env
        
        # Add new SSL configuration
        echo "" >> .env
        echo "# SSL Settings (disabled for local development)" >> .env
        echo "DB_SSL=false" >> .env
        echo "DB_SSL_REJECT_UNAUTHORIZED=true" >> .env
        
        echo "✅ Configuration updated!"
        echo "   - DB_SSL=false"
        echo "   - DB_SSL_REJECT_UNAUTHORIZED=true"
        ;;
    4)
        echo "Current SSL configuration:"
        echo "-------------------------"
        grep -E "DB_SSL" .env || echo "No DB_SSL configuration found"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "📋 Next steps:"
echo "1. Restart your application to pick up the new configuration"
echo "2. Check the console output for SSL configuration debug logs"
echo "3. If you still get SSL errors, try the other options"
echo ""
echo "🔍 To debug SSL issues, look for these log messages in your console:"
echo "   '🔧 Database SSL Configuration:'"
echo ""
