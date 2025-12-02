# Railway Configuration Fix

## Problem
Railway is running the Next.js frontend instead of the Socket.io server.

## Solution

### Option 1: Set Root Directory in Railway (Recommended)

1. Go to Railway → Your Service → **Settings** tab
2. Scroll to **"Source"** section
3. Set **Root Directory** to: `server`
4. Verify these settings:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Click **Save**
6. Railway will automatically redeploy

### Option 2: Create Separate Service

If Option 1 doesn't work:

1. In Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select your `storypoint-poker` repository
3. Set **Root Directory** to: `server`
4. Configure:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Deploy

## Verify It's Working

After redeploy, check:

1. **Railway Logs** should show:
   ```
   ✅ Socket.io server running on 0.0.0.0:XXXX
   ```

2. **Test Health Endpoint:**
   - Visit: `https://storypoint-poker-production.up.railway.app/health`
   - Should return: `{"status":"ok","service":"storypoint-poker-socket-server",...}`

3. **Test Socket.io:**
   - Visit: `https://storypoint-poker-production.up.railway.app/socket.io/?EIO=4&transport=polling`
   - Should return Socket.io handshake (not 404)

## Current Issue

The logs show Next.js is starting instead of the Socket.io server:
```
storypoint-poker > next start
▲ Next.js 14.2.33
```

This means Railway is using the root `package.json` instead of `server/package.json`.

**Fix:** Set Root Directory to `server` in Railway settings.

