#!/bin/bash

# Simple deployment script - assumes Node.js and PM2 are already installed

echo "🚀 Starting deployment..."

# Pull latest code
echo "📥 Pulling latest code..."
git pull

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Restart PM2 processes
echo "🔄 Restarting application..."
pm2 restart ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production

# Show status
echo "✅ Deployment complete!"
pm2 status