# Local Testing Guide

## ✅ Verified Working

All components tested and working locally:

1. **Build:** ✅ `npm run build` - Success
2. **Health Endpoint:** ✅ `http://localhost:3000/health` - Returns JSON
3. **Socket.io:** ✅ `http://localhost:3000/socket.io/` - Returns handshake
4. **Server Startup:** ✅ Both Next.js and Socket.io running together

## 🚀 Run Locally

### Quick Start

```bash
# Install dependencies
npm install

# Build Next.js
npm run build

# Start server (runs both frontend and backend)
npm start
```

### Development Mode

```bash
# Run in development mode (with hot reload)
npm run dev
```

The server will start on `http://localhost:3000`

## 🧪 Test Endpoints

1. **Home Page:** http://localhost:3000
2. **Health Check:** http://localhost:3000/health
3. **Socket.io:** http://localhost:3000/socket.io/?EIO=4&transport=polling

## 📋 What's Running

- **Next.js Frontend:** Port 3000 (or PORT env var)
- **Socket.io Backend:** Same port, integrated with Next.js
- **Single Process:** Both run in one Node.js process

## 🎯 Test the App

1. Open http://localhost:3000 in browser
2. Create a room
3. Open another browser tab/window
4. Join the same room
5. Test voting and real-time features!

## ✅ Ready for Railway

The single service setup is ready to deploy to Railway:
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Root directory: `.` (root)

Everything works locally! 🎉

