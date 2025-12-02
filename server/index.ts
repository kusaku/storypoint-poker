import { Server } from 'socket.io'
import { createServer } from 'http'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL 
      ? [
          process.env.FRONTEND_URL,
          /\.vercel\.app$/,
          /\.railway\.app$/,
          /\.onrender\.com$/
        ]
      : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
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
  currentStory: string
}

const rooms = new Map<string, Room>()

io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  socket.on('join-room', ({ roomId, userName }: { roomId: string; userName: string }) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: new Map(),
        revealed: false,
        currentStory: ''
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

    socket.emit('room-state', {
      users: Array.from(room.users.values()),
      revealed: room.revealed,
      currentStory: room.currentStory
    })

    socket.to(roomId).emit('user-joined', user)
  })

  socket.on('vote', ({ roomId, vote }: { roomId: string; vote: number | string }) => {
    const room = rooms.get(roomId)
    if (room) {
      const user = room.users.get(socket.id)
      if (user) {
        user.vote = vote
        user.hasVoted = true
        room.users.set(socket.id, user)

        socket.to(roomId).emit('vote-received', {
          userId: socket.id,
          vote
        })
      }
    }
  })

  socket.on('reveal-votes', ({ roomId }: { roomId: string }) => {
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
    const room = rooms.get(roomId)
    if (room) {
      room.revealed = false
      room.currentStory = ''
      room.users.forEach(user => {
        user.vote = null
        user.hasVoted = false
      })
      io.to(roomId).emit('votes-reset')
      io.to(roomId).emit('room-state', {
        users: Array.from(room.users.values()),
        revealed: room.revealed,
        currentStory: room.currentStory
      })
    }
  })

  socket.on('set-story', ({ roomId, story }: { roomId: string; story: string }) => {
    const room = rooms.get(roomId)
    if (room) {
      room.currentStory = story
      io.to(roomId).emit('room-state', {
        users: Array.from(room.users.values()),
        revealed: room.revealed,
        currentStory: room.currentStory
      })
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
    
    // Remove user from all rooms
    rooms.forEach((room, roomId) => {
      if (room.users.has(socket.id)) {
        room.users.delete(socket.id)
        socket.to(roomId).emit('user-left', socket.id)
        
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
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
})

