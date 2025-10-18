#!/bin/bash

# Redis Setup Script for Rate Limiting
# This script helps you set up Redis for development

echo "🚀 Redis Rate Limiting Setup"
echo "=============================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Check if Redis container already exists
if docker ps -a | grep -q redis; then
    echo "⚠️  Redis container already exists"
    echo ""
    
    # Check if it's running
    if docker ps | grep -q redis; then
        echo "✅ Redis is already running on port 6379"
        echo ""
        echo "Testing connection..."
        if docker exec redis redis-cli ping &> /dev/null; then
            echo "✅ Redis connection successful!"
        else
            echo "❌ Redis connection failed"
        fi
    else
        echo "Starting existing Redis container..."
        docker start redis
        sleep 2
        echo "✅ Redis started on port 6379"
    fi
else
    echo "📦 Creating new Redis container..."
    docker run -d \
        --name redis \
        -p 6379:6379 \
        redis:latest
    
    sleep 3
    echo "✅ Redis container created and running on port 6379"
fi

echo ""
echo "🔍 Testing Redis connection..."

# Test Redis connection
if docker exec redis redis-cli ping &> /dev/null; then
    echo "✅ Redis is working correctly!"
else
    echo "❌ Redis connection failed"
    exit 1
fi

echo ""
echo "📝 Next steps:"
echo "1. Add REDIS_URL to your .env file:"
echo "   REDIS_URL=redis://localhost:6379"
echo ""
echo "2. Start your application:"
echo "   pnpm dev"
echo ""
echo "3. Monitor Redis (optional):"
echo "   docker exec -it redis redis-cli"
echo ""
echo "✨ Setup complete!"
