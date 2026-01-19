# 🃏 Story Point Poker

<div align="center">
  <img src="./public/logo.webp" alt="Story Point Poker Logo" width="200"/>
</div>

A real-time planning poker application for agile teams. Built with Next.js, Socket.io, and Tailwind CSS.

## ✨ Features

- 🎯 Create and join planning poker rooms
- ⚡ Real-time voting with Socket.io
- 🎴 Fibonacci cards: 0 (Joker), 1, 2, 3, 5, 8
- 🧙 **Story Point Wizard** — guided estimation for Technical or Content tasks; suggests a card and can apply as vote; choices visible in participant details after reveal
- 💬 Comments with emoji picker (140 character limit)
- 👁️ Reveal votes and reset round (host only)
- 📊 Vote distribution pie chart after reveal
- 🌓 Light, dark, and auto (system) theme
- 👑 Host: reveal and reset. Any participant can become host or remove host
- 🔗 Copy invitation link
- 📱 Responsive design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation & Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - auto-reloads on changes.

### Production

```bash
npm run build
npm start
```

## 🚢 Deployment

Deploy to Render (free tier available). See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Real-time:** Socket.io (custom server, see `server.js`)
- **Charts:** Recharts
- **Hosting:** Render

## 📝 License

MIT
