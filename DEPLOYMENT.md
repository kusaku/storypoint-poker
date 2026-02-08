# Deployment Guide

## 🚀 Deploy to VDS (Virtual Dedicated Server)

### Prerequisites

- VDS with SSH access
- Nginx installed
- Root or sudo access

### Step 1: Initial Server Setup

SSH into your VDS and run the setup script:

```bash
# Clone repository or upload files
cd /opt
git clone <your-repo-url> storypoint-poker
cd storypoint-poker

# Run setup script (installs Node.js, sets up systemd, configures nginx)
# Note: Setup scripts should be provided separately or run manually
```

The setup script will:
- Install Node.js 20.x if not present
- Create application directory
- Install systemd service
- Configure nginx reverse proxy

### Step 2: Configure Nginx

Edit the nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/storypoint-poker
```

Update `server_name` with your domain:
```nginx
server_name your-domain.com;
```

### Step 3: Set Up SSL (Recommended)

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

Or for HTTP-only (development):
- Comment out SSL lines in nginx config
- Change `listen 443 ssl http2;` to `listen 80;`

### Step 4: Configure GitHub Actions

Add these secrets to your GitHub repository:

1. Go to Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `DEPLOY_HOST` - Your VDS IP or domain
   - `DEPLOY_USER` - SSH username
   - `DEPLOY_SSH_KEY` - Private SSH key for deployment
   - `DEPLOY_PORT` - SSH port (optional, defaults to 22)
   - `APP_DIR` - Application directory (optional, defaults to /opt/storypoint-poker)

### Step 5: Deploy

Push to `master` branch - GitHub Actions will automatically:
1. Sync files via rsync
2. Install dependencies
3. Build the application
4. Restart the systemd service

### Step 6: Verify Deployment

```bash
# Check service status
sudo systemctl status storypoint-poker

# View logs
sudo journalctl -u storypoint-poker -f

# Test nginx
sudo nginx -t
sudo systemctl reload nginx
```

## 🧪 Local Testing

```bash
# Install dependencies
npm install

# Build
npm run build

# Start (runs both frontend and backend)
npm start
```

Then open: http://localhost:3000

## 📁 Project Structure

```
storypoint-poker/
├── app/              # Next.js app directory
│   ├── page.tsx      # Home page
│   └── room/         # Room pages
├── public/           # Static assets (logo, favicon)
├── server.js         # Custom server (Next.js + Socket.io)
└── package.json
```

## 🔧 Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Socket.io (in `server.js`)
- **Hosting:** VDS with Nginx + systemd

## 📋 Service Management

```bash
# Start service
sudo systemctl start storypoint-poker

# Stop service
sudo systemctl stop storypoint-poker

# Restart service
sudo systemctl restart storypoint-poker

# Check status
sudo systemctl status storypoint-poker

# View logs
sudo journalctl -u storypoint-poker -f
```

## 🔍 Troubleshooting

### Check if Node.js is installed
```bash
node --version
npm --version
```

### Check service logs
```bash
sudo journalctl -u storypoint-poker -n 50
```

### Check nginx logs
```bash
sudo tail -f /var/log/nginx/storypoint-poker-error.log
```

### Test nginx configuration
```bash
sudo nginx -t
```
