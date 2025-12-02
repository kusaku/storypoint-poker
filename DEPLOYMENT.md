# Deployment Guide

## 🚀 Quick Deploy to Railway

### Step 1: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"+ New"** → **"GitHub Repo"**
3. Select your `storypoint-poker` repository
4. Railway will auto-detect the setup

### Step 2: Configure (if needed)

Railway should auto-detect from `railway.json`, but verify:
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Root Directory:** `.` (root)

### Step 3: Generate Domain

1. Go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy your Railway URL

### Step 4: Test

1. Open your Railway URL in browser
2. Create a room and test!

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
│   ├── page.tsx     # Home page
│   └── room/        # Room pages
├── server.js         # Integrated server (Next.js + Socket.io)
├── package.json      # Dependencies
└── railway.json      # Railway configuration
```

## 🔧 Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Socket.io (integrated in server.js)
- **Hosting:** Railway (single service)

## ✅ That's It!

Everything runs in a single Railway service - both frontend and backend together!

**Note:** No environment variables needed! The Socket.io server runs on the same port as Next.js, so it automatically connects to the same origin. You don't need `NEXT_PUBLIC_SOCKET_URL` or any other Socket.io-related variables.
