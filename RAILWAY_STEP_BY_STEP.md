# Railway Configuration - Step by Step

## Problem
Railway is running Next.js instead of the Socket.io server because it's using the root directory.

## Solution Options

### Option 1: Create a NEW Service for the Server (Easiest)

1. **In Railway Dashboard:**
   - Go to your project
   - Click **"+ New"** button (top right)
   - Select **"GitHub Repo"**

2. **Select Repository:**
   - Choose your `storypoint-poker` repository
   - Click **"Deploy"**

3. **After it creates the service:**
   - Go to the **Settings** tab
   - Look for **"Service Source"** or **"Configure"** section
   - Find **"Root Directory"** or **"Working Directory"**
   - Set it to: `server`
   - If you don't see this option, use Option 2 below

4. **Set Build/Start Commands:**
   - In Settings → **"Build"** section
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

5. **Add Environment Variables:**
   - Go to **"Variables"** tab
   - Add:
     - `PORT=3001` (Railway sets this automatically, but you can override)
     - `NODE_ENV=production`

6. **Generate Domain:**
   - Go to **"Networking"** section
   - Click **"Generate Domain"**

### Option 2: Use railway.json in Root (Alternative)

I've created a `railway.json` in the root that tells Railway to:
- Build from the `server` directory
- Start from the `server` directory

**Steps:**
1. The `railway.json` file is already in your repo
2. Railway should automatically detect it
3. If not, you may need to:
   - Delete the current service
   - Create a new one
   - Railway should pick up the config

### Option 3: Manual Configuration via Settings

If you're in the Settings tab, look for:

1. **"Build"** section:
   - **Build Command:** `cd server && npm install && npm run build`
   - **Start Command:** `cd server && npm start`

2. **"Source"** section (if visible):
   - **Root Directory:** `server`

3. **"Deploy"** section:
   - Check if there's a working directory option

## What to Look For in Railway UI

The setting might be called:
- "Root Directory"
- "Working Directory" 
- "Service Root"
- "Source Directory"
- "Base Directory"

Or it might be in:
- Settings → Source
- Settings → Build
- Settings → Deploy
- Service configuration (when creating new service)

## Quick Test

After configuration, check the logs. You should see:
```
✅ Socket.io server running on 0.0.0.0:XXXX
```

NOT:
```
▲ Next.js 14.2.33
```

## If Nothing Works

**Create a completely new service:**
1. Delete the current service in Railway
2. Create a new one from GitHub
3. During setup, look for "Root Directory" option
4. Set it to `server` before deploying

Or use the `railway.json` approach - I've already created it in the root directory with the correct commands.

