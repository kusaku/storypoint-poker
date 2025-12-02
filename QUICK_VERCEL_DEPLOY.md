# Quick Vercel Deployment Guide

## 🚀 Deploy Frontend to Vercel (5 minutes)

### Step 1: Sign Up / Login
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub (free tier)

### Step 2: Import Project
1. Click **"Add New Project"** or **"Import Project"**
2. Click **"Import Git Repository"**
3. Find and select your `storypoint-poker` repository
4. Click **"Import"**

### Step 3: Configure Project
Vercel should auto-detect Next.js, but verify:
- **Framework Preset:** Next.js (should be auto-detected)
- **Root Directory:** `.` (leave as root - don't change to `server`)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)

### Step 4: Add Environment Variable (IMPORTANT!)
**Before clicking Deploy**, add this environment variable:

1. In the **"Environment Variables"** section
2. Click **"Add"** or **"+ Add"**
3. Add:
   - **Key:** `NEXT_PUBLIC_SOCKET_URL`
   - **Value:** `https://storypoint-poker-production.up.railway.app`
4. Click **"Add"** to save

### Step 5: Deploy
1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://storypoint-poker.vercel.app`

### Step 6: Test Your App
1. Open your Vercel URL in browser
2. You should see the Story Point Poker home page
3. Create a room and test!

## ✅ That's It!

Your app architecture:
- **Frontend:** Vercel (Next.js) - `https://your-app.vercel.app`
- **Backend:** Railway (Socket.io) - `https://storypoint-poker-production.up.railway.app`

The frontend will automatically connect to the Railway backend!

## 🔧 Troubleshooting

**If connection fails:**
- Check that `NEXT_PUBLIC_SOCKET_URL` is set correctly in Vercel
- Verify Railway server is running (check Railway logs)
- Check browser console for connection errors

