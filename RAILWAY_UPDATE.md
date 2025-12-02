# Update Railway to Use Integrated Server

## Problem
Railway is still running the old separate Socket.io server. You need to update it to use the new integrated `server.js` that runs both frontend and backend together.

## Solution

### Step 1: Update Railway Service Settings

1. Go to Railway → Your Service → **Settings** tab

2. **Build Settings:**
   - **Build Command:** `npm install && npm run build`
   - (Should build Next.js)

3. **Start Command:**
   - **Start Command:** `npm start`
   - (This will run `server.js` which has both Next.js and Socket.io)

4. **Root Directory:**
   - Should be `.` (root directory)
   - NOT `server`

5. **Save** and Railway will redeploy

### Step 2: Verify After Deploy

After Railway redeploys, check:

1. **Logs** should show:
   ```
   ✅ Server ready on http://0.0.0.0:XXXX
   🌐 Next.js frontend + Socket.io backend running together
   ```

2. **Test endpoints:**
   - Home page: `https://your-railway-url.up.railway.app/`
   - Health: `https://your-railway-url.up.railway.app/health`
   - Socket.io: `https://your-railway-url.up.railway.app/socket.io/`

3. **Frontend will automatically connect** to Socket.io on the same domain (no hardcoded URL needed)

## What Changed

- **Old:** Separate services (frontend on Vercel, backend on Railway)
- **New:** Single integrated service (both on Railway, same domain)

The frontend code already uses `window.location.origin` so it will automatically connect to Socket.io on the same Railway domain.

## If It Still Doesn't Work

1. Check Railway logs for errors
2. Verify `server.js` exists in root directory
3. Make sure `package.json` has `"start": "NODE_ENV=production node server.js"`
4. Check that `socket.io` is in root `package.json` dependencies

