const { createServer } = require('http')
const next = require('next')
const { Server } = require('socket.io')
const SOCKET_EVENTS = require('./shared/socket-events.json')

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

function clearTimer(timerMap, key) {
  if (!timerMap.has(key)) return
  clearTimeout(timerMap.get(key))
  timerMap.delete(key)
}

function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      users: new Map(),
      revealed: false
    })
  }
  return rooms.get(roomId)
}

function broadcastRoomState(roomId) {
  const room = rooms.get(roomId)
  if (room) {
    io.to(roomId).emit(SOCKET_EVENTS.ROOM_STATE, {
      users: Array.from(room.users.values()),
      revealed: room.revealed
    })
  }
}

function findUserByName(room, userName) {
  for (const [userId, user] of room.users.entries()) {
    if (user.name === userName) {
      return { userId, user }
    }
  }
  return null
}

function updateRoomUser(roomId, socketId, updateFn) {
  const room = rooms.get(roomId)
  if (!room) return false

  const user = room.users.get(socketId)
  if (!user) return false

  updateFn(user, room)
  room.users.set(socketId, user)
  broadcastRoomState(roomId)
  return true
}

function runHostAction(roomId, socketId, actionFn) {
  const room = rooms.get(roomId)
  if (!room) return false

  const user = room.users.get(socketId)
  if (!user || !user.isHost) return false

  actionFn(room, user)
  broadcastRoomState(roomId)
  return true
}

function resetRoomVotes(room) {
  room.revealed = false
  room.users.forEach((user) => {
    user.vote = null
    user.hasVoted = false
    user.comment = null
    user.wizardAnswers = null
  })
}

function scheduleRoomDeleteIfEmpty(roomId) {
  const room = rooms.get(roomId)
  if (!room || room.users.size !== 0 || roomDeleteTimers.has(roomId)) return

  const roomTimer = setTimeout(() => {
    if (rooms.get(roomId)?.users.size === 0) {
      rooms.delete(roomId)
      roomDeleteTimers.delete(roomId)
    }
  }, ROOM_DELETE_TIMEOUT)

  roomDeleteTimers.set(roomId, roomTimer)
}

io.on('connection', (socket) => {
  socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ roomId, userName }) => {
    const room = getOrCreateRoom(roomId)
    clearTimer(roomDeleteTimers, roomId)

    // Auto-reset room if it's empty and in revealed state
    // This prevents stale state when someone rejoins after everyone left
    if (room.users.size === 0 && room.revealed) {
      room.revealed = false
    }

    const existingEntry = findUserByName(room, userName)
    if (existingEntry) {
      clearTimer(disconnectTimers, existingEntry.userId)
      room.users.delete(existingEntry.userId)
    }

    const user = {
      id: socket.id,
      name: userName,
      isHost: existingEntry?.user?.isHost ?? false,
      vote: existingEntry?.user?.vote ?? null,
      hasVoted: existingEntry?.user?.hasVoted ?? false,
      comment: existingEntry?.user?.comment ?? null,
      wizardAnswers: existingEntry?.user?.wizardAnswers ?? null
    }

    room.users.set(socket.id, user)
    socket.join(roomId)

    broadcastRoomState(roomId)
  })

  socket.on(SOCKET_EVENTS.VOTE, ({ roomId, vote }) => {
    updateRoomUser(roomId, socket.id, (user) => {
      user.vote = vote
      user.hasVoted = vote !== null && vote !== undefined
    })
  })

  socket.on(SOCKET_EVENTS.COMMENT, ({ roomId, comment }) => {
    updateRoomUser(roomId, socket.id, (user) => {
      user.comment = comment
    })
  })

  socket.on(SOCKET_EVENTS.WIZARD_ANSWERS, ({ roomId, wizardAnswers }) => {
    updateRoomUser(roomId, socket.id, (user) => {
      user.wizardAnswers = wizardAnswers
    })
  })

  socket.on(SOCKET_EVENTS.REVEAL_VOTES, ({ roomId }) => {
    runHostAction(roomId, socket.id, (room) => {
      room.revealed = true
    })
  })

  socket.on(SOCKET_EVENTS.RESET_VOTES, ({ roomId }) => {
    runHostAction(roomId, socket.id, (room) => {
      resetRoomVotes(room)
    })
  })

  socket.on(SOCKET_EVENTS.BECOME_HOST, ({ roomId }) => {
    updateRoomUser(roomId, socket.id, (user) => {
      user.isHost = true
    })
  })

  socket.on(SOCKET_EVENTS.REMOVE_HOST, ({ roomId }) => {
    updateRoomUser(roomId, socket.id, (user) => {
      user.isHost = false
    })
  })

  socket.on('disconnect', () => {
    const roomEntry = Array.from(rooms.entries()).find(([, room]) => room.users.has(socket.id))
    if (!roomEntry) return

    const [roomId, room] = roomEntry
    clearTimer(disconnectTimers, socket.id)

    // Keep disconnected users for a short grace window to support refresh/reconnect.
    const timer = setTimeout(() => {
      if (!room.users.has(socket.id)) return

      room.users.delete(socket.id)
      disconnectTimers.delete(socket.id)
      broadcastRoomState(roomId)
      scheduleRoomDeleteIfEmpty(roomId)
    }, CLIENT_DISCONNECT_TIMEOUT)

    disconnectTimers.set(socket.id, timer)
  })
})

async function onRequest(req, res) {
  if (req.url?.startsWith('/socket.io')) return

  const host = req.headers.host || `${hostname}:${port}`
  const parsed = new URL(req.url || '/', `http://${host}`)

  if (parsed.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ 
      status: 'ok', 
      service: 'storypoint-poker', 
      timestamp: new Date().toISOString(),
      git_sha: process.env.GIT_SHA || 'unknown',
      repo_url: process.env.REPO_URL || 'unknown'
    }))
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
  })
  httpServer.once('error', (err) => { console.error('Failed to listen:', err); process.exit(1) })
  httpServer.listen(port, hostname)
}).catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})

