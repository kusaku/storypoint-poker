const { createServer } = require('http')
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

const rooms = new Map()
const disconnectTimers = new Map()
const roomDeleteTimers = new Map()

const CLIENT_DISCONNECT_TIMEOUT = 60 * 1000
const ROOM_DELETE_TIMEOUT = 60 * 60 * 1000

function broadcastRoomState(roomId) {
  const room = rooms.get(roomId)
  if (room) {
    io.to(roomId).emit('room-state', {
      users: Array.from(room.users.values()),
      revealed: room.revealed
    })
  }
}

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
    
    if (roomDeleteTimers.has(roomId)) {
      clearTimeout(roomDeleteTimers.get(roomId))
      roomDeleteTimers.delete(roomId)
    }
    
    let existingUser = null
    for (const [userId, user] of room.users.entries()) {
      if (user.name === userName) {
        existingUser = user
        if (disconnectTimers.has(userId)) {
          clearTimeout(disconnectTimers.get(userId))
          disconnectTimers.delete(userId)
        }
        room.users.delete(userId)
        break
      }
    }

    const user = {
      id: socket.id,
      name: userName,
      isHost: existingUser?.isHost ?? false,
      vote: existingUser?.vote ?? null,
      hasVoted: existingUser?.hasVoted ?? false,
      comment: existingUser?.comment ?? null,
      wizardAnswers: existingUser?.wizardAnswers ?? null
    }

    room.users.set(socket.id, user)
    socket.join(roomId)

    broadcastRoomState(roomId)
  })

  socket.on('vote', ({ roomId, vote }) => {
    const room = rooms.get(roomId)
    if (room) {
      const user = room.users.get(socket.id)
      if (user) {
        user.vote = vote
        user.hasVoted = vote !== null && vote !== undefined
        room.users.set(socket.id, user)

        broadcastRoomState(roomId)
      }
    }
  })

  socket.on('comment', ({ roomId, comment }) => {
    const room = rooms.get(roomId)
    if (room) {
      const user = room.users.get(socket.id)
      if (user) {
        user.comment = comment
        room.users.set(socket.id, user)

        broadcastRoomState(roomId)
      }
    }
  })

  socket.on('wizard-answers', ({ roomId, wizardAnswers }) => {
    const room = rooms.get(roomId)
    if (room) {
      const user = room.users.get(socket.id)
      if (user) {
        user.wizardAnswers = wizardAnswers
        room.users.set(socket.id, user)

        broadcastRoomState(roomId)
      }
    }
  })

  socket.on('reveal-votes', ({ roomId }) => {
    const room = rooms.get(roomId)
    if (room) {
      const user = room.users.get(socket.id)
      if (user && user.isHost) {
        room.revealed = true
        broadcastRoomState(roomId)
      }
    }
  })

  socket.on('reset-votes', ({ roomId }) => {
    const room = rooms.get(roomId)
    if (room) {
      const user = room.users.get(socket.id)
      if (user && user.isHost) {
        room.revealed = false
        room.users.forEach(user => {
          user.vote = null
          user.hasVoted = false
          user.comment = null
          user.wizardAnswers = null
        })
        broadcastRoomState(roomId)
      }
    }
  })

  socket.on('become-host', ({ roomId }) => {
    const room = rooms.get(roomId)
    if (room) {
      const user = room.users.get(socket.id)
      if (user) {
        user.isHost = true
        room.users.set(socket.id, user)
        broadcastRoomState(roomId)
      }
    }
  })

  socket.on('remove-host', ({ roomId }) => {
    const room = rooms.get(roomId)
    if (room) {
      const user = room.users.get(socket.id)
      if (user) {
        user.isHost = false
        room.users.set(socket.id, user)
        broadcastRoomState(roomId)
      }
    }
  })

  socket.on('disconnect', () => {
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        const timer = setTimeout(() => {
          if (room.users.has(socket.id)) {
            room.users.delete(socket.id)
            disconnectTimers.delete(socket.id)
            
            broadcastRoomState(roomId)
            
            if (room.users.size === 0) {
              const roomTimer = setTimeout(() => {
                if (rooms.get(roomId)?.users.size === 0) {
                  rooms.delete(roomId)
                  roomDeleteTimers.delete(roomId)
                }
              }, ROOM_DELETE_TIMEOUT)
              roomDeleteTimers.set(roomId, roomTimer)
            }
          }
        }, CLIENT_DISCONNECT_TIMEOUT)
        
        disconnectTimers.set(socket.id, timer)
      }
    })
  })
})

async function onRequest(req, res) {
  if (req.url?.startsWith('/socket.io')) return

  const host = req.headers.host || `${hostname}:${port}`
  const parsed = new URL(req.url || '/', `http://${host}`)

  if (parsed.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ status: 'ok', service: 'storypoint-poker', timestamp: new Date().toISOString() }))
  }

  try {
    await handle(req, res, { pathname: parsed.pathname, query: Object.fromEntries(parsed.searchParams), href: parsed.href })
  } catch (err) {
    console.error('Error handling request:', err)
    if (!res.headersSent) { res.statusCode = 500; res.end('internal server error') }
  }
}

app.prepare().then(() => {
  httpServer.on('request', onRequest)
  httpServer.once('listening', () => {
    console.log(`Server ready on http://${hostname}:${port}`)
    if (process.env.RENDER_EXTERNAL_URL) {
      console.log(`Available at ${process.env.RENDER_EXTERNAL_URL}`)
    }
  })
  httpServer.once('error', (err) => { console.error('Failed to listen:', err); process.exit(1) })
  httpServer.listen(port, hostname)
}).catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

