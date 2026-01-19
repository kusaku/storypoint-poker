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
- **Build Command:** `npm run build`
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
│   ├── page.tsx      # Home page
│   └── room/         # Room pages
├── public/           # Static assets (logo, favicon)
├── server.js         # Custom server (Next.js + Socket.io)
└── package.json
```

## 🔧 Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Socket.io (in `server.js`)
- **Hosting:** Render (single service)

## ✅ Done

Frontend and backend run in a single Render service.
