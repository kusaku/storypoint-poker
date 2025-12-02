# Deployment & Testing Guide

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- GitHub account (already set up)
- Vercel account (free tier)
- Railway/Render account (free tier for Socket.io server)
- Supabase account (free tier, optional for persistence)

---

## 🧪 Local Testing

### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### Step 2: Set Up Environment Variables

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

Create `server/.env`:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Step 3: Run Development Servers

**Terminal 1 - Frontend (Next.js):**
```bash
npm run dev
```
Frontend will run on: http://localhost:3000

**Terminal 2 - Socket.io Server:**
```bash
cd server
npm run dev
```
Socket.io server will run on: http://localhost:3001

### Step 4: Test Locally

1. Open http://localhost:3000
2. Create a room with your name
3. Open another browser tab/window (or use incognito)
4. Join the same room with a different name
5. Test voting, revealing votes, and reset functionality
6. Verify real-time updates work between both clients

---

## 🚀 Deployment

### Part 1: Deploy Socket.io Server (Railway - Recommended)

#### Option A: Railway (Easiest)

1. **Sign up at [railway.app](https://railway.app)** (free $5 credit/month)

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `storypoint-poker` repository

3. **Configure Service:**
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     ```
     PORT=3001
     FRONTEND_URL=https://your-vercel-app.vercel.app
     NODE_ENV=production
     ```

4. **Get Server URL:**
   - Railway will provide a URL like: `https://your-app.railway.app`
   - Copy this URL (you'll need it for Vercel)

#### Option B: Render

1. **Sign up at [render.com](https://render.com)**

2. **Create New Web Service:**
   - Connect your GitHub repo
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables:
     ```
     PORT=3001
     FRONTEND_URL=https://your-vercel-app.vercel.app
     ```

3. **Note:** Render free tier spins down after 15 min inactivity (first request will be slow)

#### Option C: Fly.io

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Create App:**
   ```bash
   cd server
   fly launch
   ```

4. **Set Environment Variables:**
   ```bash
   fly secrets set FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

---

### Part 2: Deploy Frontend to Vercel

1. **Sign up at [vercel.com](https://vercel.com)** (free tier)

2. **Import Project:**
   - Click "Add New Project"
   - Import from GitHub
   - Select `storypoint-poker` repository
   - Framework Preset: **Next.js** (auto-detected)

3. **Configure Environment Variables:**
   - Add: `NEXT_PUBLIC_SOCKET_URL`
   - Value: Your Socket.io server URL from Railway/Render/Fly.io
   - Example: `https://your-app.railway.app` or `https://your-app.onrender.com`

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy
   - You'll get a URL like: `https://storypoint-poker.vercel.app`

5. **Update Socket.io Server:**
   - Go back to Railway/Render/Fly.io
   - Update `FRONTEND_URL` environment variable to your Vercel URL
   - Redeploy the server

---

### Part 3: Update CORS Settings

Make sure your Socket.io server allows your Vercel domain:

In `server/index.ts`, the CORS should include your Vercel URL:

```typescript
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "https://your-app.vercel.app", // Add your Vercel URL
      /\.vercel\.app$/, // Allow all Vercel preview deployments
    ],
    methods: ["GET", "POST"]
  }
})
```

---

## ✅ Post-Deployment Testing

### 1. Test Basic Functionality

1. Visit your Vercel URL
2. Create a room
3. Open another browser/device
4. Join the same room
5. Test voting and revealing

### 2. Test Real-time Features

- ✅ Multiple users can join the same room
- ✅ Votes appear in real-time for all users
- ✅ Reveal votes works correctly
- ✅ Reset functionality works
- ✅ Users leaving doesn't break the room

### 3. Test Edge Cases

- ✅ Room ID validation
- ✅ Empty room cleanup
- ✅ Network disconnection handling
- ✅ Multiple rooms simultaneously

---

## 🔧 Troubleshooting

### Socket.io Connection Issues

**Problem:** Frontend can't connect to Socket.io server

**Solutions:**
- Check `NEXT_PUBLIC_SOCKET_URL` in Vercel matches your server URL
- Verify CORS settings in Socket.io server
- Check server logs in Railway/Render dashboard
- Ensure server is running (not sleeping on Render free tier)

### Environment Variables Not Working

**Problem:** Environment variables not loading

**Solutions:**
- Vercel: Restart deployment after adding env vars
- Railway/Render: Redeploy after changing env vars
- Frontend env vars must start with `NEXT_PUBLIC_` to be exposed to browser

### Build Failures

**Problem:** Build fails on Vercel

**Solutions:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation passes locally
- Check for missing files or imports

---

## 📊 Monitoring

### Vercel Analytics (Optional)

- Enable Vercel Analytics in project settings
- Monitor page views and performance

### Railway/Render Logs

- Check server logs for errors
- Monitor connection counts
- Watch for memory/CPU usage

---

## 🔄 Continuous Deployment

Both Vercel and Railway/Render support automatic deployments:

- **Vercel:** Auto-deploys on push to `main` branch
- **Railway:** Auto-deploys on push to `main` branch
- **Render:** Auto-deploys on push to `main` branch

Just push to GitHub and both will redeploy automatically!

---

## 🎯 Quick Deployment Checklist

- [ ] Socket.io server deployed (Railway/Render/Fly.io)
- [ ] Server URL copied
- [ ] Frontend deployed to Vercel
- [ ] `NEXT_PUBLIC_SOCKET_URL` set in Vercel
- [ ] `FRONTEND_URL` set in Socket.io server
- [ ] CORS configured correctly
- [ ] Tested with multiple users
- [ ] Verified real-time functionality works
- [ ] Custom domain configured (optional)

---

## 💡 Pro Tips

1. **Use Railway for Socket.io:** Most reliable free tier, doesn't sleep
2. **Vercel Preview Deployments:** Every PR gets a preview URL - great for testing
3. **Environment Variables:** Use Vercel's environment variable UI for easy management
4. **Monitoring:** Set up error tracking (Sentry free tier) for production
5. **Database:** Add Supabase later for room persistence and user history

---

## 📝 Next Steps After Deployment

1. Add Supabase for room persistence
2. Add user authentication (optional)
3. Add room history/analytics
4. Custom domain setup
5. Add error tracking (Sentry)
6. Performance monitoring

