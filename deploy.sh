#!/bin/bash
# PriceTracker Deployment Script
# Usage: ./deploy.sh

set -e

echo "🚀 PriceTracker Deployment"
echo "=========================="

# Navigate to project directory
cd "$(dirname "$0")"

# Pull latest code
echo ""
echo "📥 Pulling latest code from GitHub..."
git pull origin main

# Build and restart containers
echo ""
echo "🔨 Building and starting containers..."
docker-compose up -d --build

# Wait for health check
echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check status
echo ""
echo "📊 Container Status:"
docker-compose ps

# Show logs tail
echo ""
echo "📜 Recent logs (last 10 lines):"
docker-compose logs --tail=10

echo ""
echo "✅ Deployment complete!"
echo "   Access PriceTracker at: http://localhost:3000"
