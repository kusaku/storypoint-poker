const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

const httpServer = createServer()

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
    
    let existingUser = null
    for (const [userId, user] of room.users.entries()) {
      if (user.name === userName) {
        existingUser = user
        room.users.delete(userId)
        break
      }
    }

    const user = {
      id: socket.id,
      name: userName,
      vote: existingUser?.vote ?? null,
      hasVoted: existingUser?.hasVoted ?? false
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
        user.hasVoted = vote !== null && vote !== undefined
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
      io.to(roomId).emit('room-state', {
        users: Array.from(room.users.values()),
        revealed: true
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
      io.to(roomId).emit('room-state', {
        users: Array.from(room.users.values()),
        revealed: false
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
  httpServer.on('request', async (req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname } = parsedUrl

    if (pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ 
        status: 'ok', 
        service: 'storypoint-poker',
        timestamp: new Date().toISOString()
      }))
      return
    }

    if (pathname?.startsWith('/socket.io')) {
      return
    }

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

