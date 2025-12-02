const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Socket.io server setup
const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true)
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["*"]
  },
  allowEIO3: true
})

// Socket.io room management
const rooms = new Map()

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id)

  socket.on('join-room', ({ roomId, userName }) => {
    console.log('👤 User joining room:', { socketId: socket.id, roomId, userName })
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        revealed: false
      })
    }

    const room = rooms.get(roomId)
    const user = {
      id: socket.id,
      name: userName,
      vote: null,
      hasVoted: false
    }

    room.users.set(socket.id, user)
    socket.join(roomId)

    io.to(roomId).emit('room-state', {
      users: Array.from(room.users.values()),
      revealed: room.revealed
    })
  })

  socket.on('vote', ({ roomId, vote }) => {
    console.log('🗳️ Vote received:', { socketId: socket.id, roomId, vote })
    const room = rooms.get(roomId)
    if (room) {
      const user = room.users.get(socket.id)
      if (user) {
        user.vote = vote
        user.hasVoted = true
        room.users.set(socket.id, user)

        io.to(roomId).emit('room-state', {
          users: Array.from(room.users.values()),
          revealed: room.revealed
        })
      }
    }
  })

  socket.on('reveal-votes', ({ roomId }) => {
    console.log('👁️ Revealing votes for room:', roomId)
    const room = rooms.get(roomId)
    if (room) {
      room.revealed = true
      io.to(roomId).emit('votes-revealed')
      io.to(roomId).emit('room-state', {
        users: Array.from(room.users.values()),
        revealed: room.revealed
      })
    }
  })

  socket.on('reset-votes', ({ roomId }) => {
    console.log('🔄 Resetting votes for room:', roomId)
    const room = rooms.get(roomId)
    if (room) {
      room.revealed = false
      room.users.forEach(user => {
        user.vote = null
        user.hasVoted = false
      })
      io.to(roomId).emit('votes-reset')
      io.to(roomId).emit('room-state', {
        users: Array.from(room.users.values()),
        revealed: room.revealed
      })
    }
  })

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id)
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id)
        io.to(roomId).emit('room-state', {
          users: Array.from(room.users.values()),
          revealed: room.revealed
        })
        if (room.users.size === 0) {
          setTimeout(() => {
            if (rooms.get(roomId)?.users.size === 0) {
              rooms.delete(roomId)
            }
          }, 300000)
        }
      }
    })
  })
})

app.prepare().then(() => {
  httpServer.on('request', async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      const { pathname } = parsedUrl

      // Health check
      if (pathname === '/health' || pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ 
          status: 'ok', 
          service: 'storypoint-poker',
          timestamp: new Date().toISOString()
        }))
        return
      }

      // Let Next.js handle all other routes
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  httpServer.listen(port, hostname, (err) => {
    if (err) throw err
    console.log(`✅ Server ready on http://${hostname}:${port}`)
    console.log(`🌐 Next.js frontend + Socket.io backend running together`)
  })
})

