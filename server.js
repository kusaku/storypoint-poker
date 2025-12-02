const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Create HTTP server - we'll attach handlers after Socket.io is set up
const httpServer = createServer()

// Attach Socket.io - it will handle /socket.io requests automatically
// Socket.io attaches its own request handlers internally
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true)
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["*"]
  }
})

// Socket.io room management
const rooms = new Map()

io.on('connection', (socket) => {
  socket.on('join-room', ({ roomId, userName }) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        revealed: false
      })
    }

    const room = rooms.get(roomId)
    
    // Check if user with same name already exists (for reconnection)
    let existingUser = null
    for (const [userId, user] of room.users.entries()) {
      if (user.name === userName) {
        existingUser = user
        // Remove old socket.id entry
        room.users.delete(userId)
        break
      }
    }

    const user = {
      id: socket.id,
      name: userName,
      vote: existingUser ? existingUser.vote : null,
      hasVoted: existingUser ? existingUser.hasVoted : false
    }

    room.users.set(socket.id, user)
    socket.join(roomId)

    io.to(roomId).emit('room-state', {
      users: Array.from(room.users.values()),
      revealed: room.revealed
    })
  })

  socket.on('vote', ({ roomId, vote }) => {
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
  // Handle HTTP requests
  // Socket.io automatically handles /socket.io requests when attached to the server
  // Our handler only processes non-Socket.io requests
  httpServer.on('request', async (req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname } = parsedUrl

    // Health check
    if (pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ 
        status: 'ok', 
        service: 'storypoint-poker',
        timestamp: new Date().toISOString()
      }))
      return
    }

    // Skip Socket.io - Socket.io handles these automatically
    // If pathname starts with /socket.io, Socket.io's internal handler should process it
    // We check this to avoid interfering, but Socket.io should handle it before our handler runs
    if (pathname && pathname.startsWith('/socket.io')) {
      // Socket.io should have already handled this
      // If response not sent, it means Socket.io didn't process it (unlikely)
      // In that case, we still don't handle it to avoid conflicts
      return
    }

    // Let Next.js handle all other routes
    try {
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling request:', err)
      if (!res.headersSent) {
        res.statusCode = 500
        res.end('internal server error')
      }
    }
  })

  httpServer.listen(port, hostname, (err) => {
    if (err) throw err
    console.log(`✅ Server ready on http://${hostname}:${port}`)
    console.log(`🌐 Next.js frontend + Socket.io backend running together`)
    console.log(`🔌 Socket.io available at /socket.io/`)
  })
})

