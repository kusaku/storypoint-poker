# Deployment Guide

## 🚀 Quick Deploy to Render

### Step 1: Deploy to Render

1. Go to [render.com](https://render.com) and sign in
2. Click **"+ New"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your `storypoint-poker` repository

### Step 2: Configure

Render will auto-detect Node.js, but verify these settings:
- **Name:** `storypoint-poker` (or your preferred name)
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Plan:** Free (or paid if you prefer)

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your app
3. Your app will be available at `https://your-app-name.onrender.com`

### Step 4: Test

1. Open your Render URL in browser
2. Create a room and test!

**Note:** On the free tier, Render spins down your service after 15 minutes of inactivity. The first request after spin-down may take a few seconds to wake up the service.

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
└── package.json      # Dependencies
```

## 🔧 Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Socket.io (integrated in server.js)
- **Hosting:** Render (single service)

## ✅ That's It!

Everything runs in a single Render service - both frontend and backend together!

**Note:** No environment variables needed! The Socket.io server runs on the same port as Next.js, so it automatically connects to the same origin. You don't need `NEXT_PUBLIC_SOCKET_URL` or any other Socket.io-related variables.
