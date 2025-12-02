# 🃏 Story Point Poker

A real-time planning poker application built with Next.js, Socket.io, Tailwind CSS, and Supabase.

## ✨ Features

- 🎯 Create and join planning poker rooms
- ⚡ Real-time voting with Socket.io
- 🎴 Fibonacci sequence cards (0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?)
- 👁️ Reveal votes functionality
- 👑 Host controls for story management
- 📱 Responsive design with Tailwind CSS
- 🎨 Modern, beautiful UI

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies:**

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

2. **Set up environment variables:**

Create `.env.local` in the root directory:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

Create `server/.env`:

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
```

3. **Run development servers:**

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

4. **Open your browser:**
   - Navigate to http://localhost:3000
   - Create a room and start planning!

## 📁 Project Structure

```
storypoint-poker/
├── app/                    # Next.js app directory
│   ├── room/              # Room pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── server/                # Socket.io server
│   ├── index.ts           # Server entry point
│   ├── package.json       # Server dependencies
│   └── tsconfig.json      # TypeScript config
├── package.json           # Frontend dependencies
├── next.config.js         # Next.js config
├── tailwind.config.js     # Tailwind CSS config
└── tsconfig.json          # TypeScript config
```

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Summary:

1. **Deploy Socket.io Server to Railway:**
   - Connect GitHub repo
   - Set root directory to `server`
   - Add environment variables

2. **Deploy Frontend to Vercel:**
   - Import from GitHub
   - Set `NEXT_PUBLIC_SOCKET_URL` to your Railway server URL
   - Deploy!

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Real-time:** Socket.io
- **Database:** Supabase (for future persistence)
- **Hosting:** Vercel (frontend) + Railway (Socket.io server)

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

