# Vercel Frontend Deployment Guide

## 🚀 Quick Steps to Deploy

### 1. Sign Up / Login to Vercel
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub (free tier)

### 2. Import Your Project
1. Click **"Add New Project"** or **"Import Project"**
2. Select **"Import Git Repository"**
3. Choose your `storypoint-poker` repository
4. Vercel will auto-detect Next.js

### 3. Configure Project Settings
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** Leave as `.` (root)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)

### 4. Add Environment Variable
**IMPORTANT:** Before deploying, add this environment variable:

- **Key:** `NEXT_PUBLIC_SOCKET_URL`
- **Value:** Your Railway Socket.io server URL
  - Example: `https://storypoint-poker-production-xxxx.up.railway.app`
  - Get this from Railway → Settings → Networking

### 5. Deploy
- Click **"Deploy"**
- Wait 2-3 minutes for build to complete
- You'll get a URL like: `https://storypoint-poker.vercel.app`

### 6. Update Railway Server
After Vercel deploys:
1. Go back to Railway
2. Go to **Variables** tab
3. Update `FRONTEND_URL` to your Vercel URL
4. Railway will auto-redeploy

## ✅ Test Your App

1. Open your Vercel URL in browser
2. Create a room
3. Open another browser tab/window
4. Join the same room
5. Test voting and real-time features!

## 🔧 Troubleshooting

**If Socket.io connection fails:**
- Check `NEXT_PUBLIC_SOCKET_URL` in Vercel matches Railway URL
- Verify Railway server is running (check Logs)
- Check CORS settings in Railway (should allow Vercel domain)

