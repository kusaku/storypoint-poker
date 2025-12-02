import { Server } from 'socket.io'
import { createServer } from 'http'

const httpServer = createServer()

// Health check endpoint (before Socket.io)
httpServer.on('request', (req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ 
      status: 'ok', 
      service: 'storypoint-poker-socket-server',
      timestamp: new Date().toISOString()
    }))
    return
  }
})

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow all origins for now (can restrict later)
      callback(null, true)
    },
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["*"]
  },
  allowEIO3: true
})

interface User {
  id: string
  name: string
  vote: number | string | null
  hasVoted: boolean
}

interface Room {
  id: string
  users: Map<string, User>
  revealed: boolean
}

const rooms = new Map<string, Room>()

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id)

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id)

  socket.on('join-room', ({ roomId, userName }: { roomId: string; userName: string }) => {
    console.log('👤 User joining room:', { socketId: socket.id, roomId, userName })
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        revealed: false
      })
    }

    const room = rooms.get(roomId)!
    const user: User = {
      id: socket.id,
      name: userName,
      vote: null,
      hasVoted: false
    }

    room.users.set(socket.id, user)
    socket.join(roomId)

    // Broadcast updated room state to all users in the room (including the new user)
    io.to(roomId).emit('room-state', {
      users: Array.from(room.users.values()),
      revealed: room.revealed
    })
  })

  socket.on('vote', ({ roomId, vote }: { roomId: string; vote: number | string }) => {
    console.log('🗳️ Vote received:', { socketId: socket.id, roomId, vote })
    const room = rooms.get(roomId)
    if (room) {
      const user = room.users.get(socket.id)
      if (user) {
        user.vote = vote
        user.hasVoted = true
        room.users.set(socket.id, user)

        // Broadcast updated room state to all users in the room
        io.to(roomId).emit('room-state', {
          users: Array.from(room.users.values()),
          revealed: room.revealed
        })
      }
    }
  })

  socket.on('reveal-votes', ({ roomId }: { roomId: string }) => {
    console.log('👁️ Revealing votes for room:', roomId)
    const room = rooms.get(roomId)
    if (room) {
      room.revealed = true
      io.to(roomId).emit('votes-revealed')
      io.to(roomId).emit('room-state', {
        users: Array.from(room.users.values()),
        revealed: room.revealed,
        currentStory: room.currentStory
      })
    }
  })

  socket.on('reset-votes', ({ roomId }: { roomId: string }) => {
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
    
    // Remove user from all rooms
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id)
        
        // Broadcast updated room state to remaining users
        io.to(roomId).emit('room-state', {
          users: Array.from(room.users.values()),
          revealed: room.revealed
        })
        
        // Clean up empty rooms after 5 minutes
        if (room.users.size === 0) {
          setTimeout(() => {
            if (rooms.get(roomId)?.users.size === 0) {
              rooms.delete(roomId)
            }
          }, 300000) // 5 minutes
        }
      }
    })
  })
})

const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '0.0.0.0'

httpServer.listen(PORT, HOST, () => {
  console.log(`✅ Socket.io server running on ${HOST}:${PORT}`)
  console.log(`🌐 Server is ready to accept connections`)
})

httpServer.on('error', (error: NodeJS.ErrnoException) => {
  console.error('❌ Server error:', error)
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`)
  }
})

