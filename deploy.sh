#!/bin/bash

# Deployment script for ECS instance

echo "🚀 Starting WeChat POC deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt-get update

# Install Node.js (if not installed)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally (if not installed)
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

# Install serve globally (for serving frontend)
if ! command -v serve &> /dev/null; then
    echo "📦 Installing serve..."
    sudo npm install -g serve
fi

# Install dependencies
echo "📦 Installing project dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Create logs directory
mkdir -p logs

# Stop existing PM2 processes
echo "🛑 Stopping existing processes..."
pm2 stop all || true
pm2 delete all || true

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd -u $USER --hp /home/$USER

# Show status
echo "✅ Deployment complete!"
pm2 status
echo ""
echo "📝 View logs with: pm2 logs"
echo "🔄 Restart with: pm2 restart all"
echo "🛑 Stop with: pm2 stop all"

# Optional: Install and configure Nginx
read -p "Do you want to install and configure Nginx? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Install Nginx
    sudo apt-get install -y nginx
    
    # Copy nginx configuration
    echo "Please update nginx.conf.example with your domain and copy to /etc/nginx/sites-available/"
    echo "Then create a symlink: sudo ln -s /etc/nginx/sites-available/your-site /etc/nginx/sites-enabled/"
    echo "Finally restart nginx: sudo systemctl restart nginx"
fi