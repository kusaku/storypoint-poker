# Railway Setup Checklist

## ✅ Step-by-Step Configuration

### 1. Source Settings
- [ ] Click "Source" in left sidebar
- [ ] Set **Root Directory** to: `server`

### 2. Build Settings
- [ ] Go to "Settings" tab → "Build" section
- [ ] Click "+ Build Command"
- [ ] Enter: `npm install && npm run build`
- [ ] Start Command should auto-detect: `npm start`

### 3. Environment Variables
- [ ] Go to "Variables" tab
- [ ] Add these variables:
  ```
  PORT=3001
  NODE_ENV=production
  FRONTEND_URL=https://your-vercel-app.vercel.app
  ```
  ⚠️ Update `FRONTEND_URL` after deploying to Vercel!

### 4. Networking
- [ ] Go to "Settings" tab → "Networking" section
- [ ] Click "Generate Domain"
- [ ] Copy the generated URL (e.g., `https://storypoint-poker-production-xxxx.up.railway.app`)

### 5. Deploy
- [ ] Click "Deploy" button (top right)
- [ ] Wait for build to complete
- [ ] Check deployment logs for any errors

## 🔍 Verify Deployment

After deployment:
1. Check the "Deployments" tab - should show "Active"
2. Check the "Logs" tab - should show "Socket.io server running on port 3001"
3. Test the domain URL in browser (should show connection or Socket.io handshake)

## 📝 Next Steps

After Railway is deployed:
1. Copy your Railway domain URL
2. Deploy frontend to Vercel
3. Set `NEXT_PUBLIC_SOCKET_URL` in Vercel to your Railway URL
4. Update `FRONTEND_URL` in Railway to your Vercel URL
5. Test the full application!

