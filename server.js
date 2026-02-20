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
const socketSessions = new Map()

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
      userSockets: new Map(),
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

function getDisconnectKey(roomId, clientId) {
  return `${roomId}:${clientId}`
}

function updateRoomUser(roomId, socketId, updateFn) {
  const session = socketSessions.get(socketId)
  if (!session || session.roomId !== roomId) return false

  const room = rooms.get(roomId)
  if (!room) return false
  const user = room.users.get(session.clientId)
  if (!user) return false

  updateFn(user, room)
  room.users.set(session.clientId, user)
  broadcastRoomState(roomId)
  return true
}

function runHostAction(roomId, socketId, actionFn) {
  const session = socketSessions.get(socketId)
  if (!session || session.roomId !== roomId) return false

  const room = rooms.get(roomId)
  if (!room) return false

  const user = room.users.get(session.clientId)
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
  socket.on(SOCKET_EVENTS.JOIN_ROOM, ({ roomId, userName, clientId }) => {
    const normalizedClientId = (typeof clientId === 'string' && clientId.trim()) || socket.id
    const disconnectKey = getDisconnectKey(roomId, normalizedClientId)
    const room = getOrCreateRoom(roomId)
    const userSockets = room.userSockets
    clearTimer(roomDeleteTimers, roomId)
    clearTimer(disconnectTimers, disconnectKey)

    // Auto-reset room if it's empty and in revealed state
    // This prevents stale state when someone rejoins after everyone left
    if (room.users.size === 0 && room.revealed) {
      room.revealed = false
    }

    const existingUser = room.users.get(normalizedClientId)

    const user = {
      id: normalizedClientId,
      name: userName,
      isHost: existingUser?.isHost ?? false,
      vote: existingUser?.vote ?? null,
      hasVoted: existingUser?.hasVoted ?? false,
      comment: existingUser?.comment ?? null,
      wizardAnswers: existingUser?.wizardAnswers ?? null
    }

    room.users.set(normalizedClientId, user)
    if (!userSockets.has(normalizedClientId)) {
      userSockets.set(normalizedClientId, new Set())
    }
    userSockets.get(normalizedClientId).add(socket.id)
    socketSessions.set(socket.id, { roomId, clientId: normalizedClientId })
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
    const session = socketSessions.get(socket.id)
    if (!session) return

    const { roomId, clientId } = session
    socketSessions.delete(socket.id)
    const room = rooms.get(roomId)
    if (!room) return

    const clientSockets = room.userSockets.get(clientId)
    if (!clientSockets) return
    clientSockets.delete(socket.id)

    if (clientSockets.size > 0) {
      return
    }

    room.userSockets.delete(clientId)
    const disconnectKey = getDisconnectKey(roomId, clientId)
    clearTimer(disconnectTimers, disconnectKey)

    // Keep disconnected users for a short grace window to support refresh/reconnect.
    const timer = setTimeout(() => {
      const latestRoom = rooms.get(roomId)
      if (!latestRoom) return
      if (latestRoom.userSockets.get(clientId)?.size) return

      latestRoom.users.delete(clientId)
      disconnectTimers.delete(disconnectKey)
      broadcastRoomState(roomId)
      scheduleRoomDeleteIfEmpty(roomId)
    }, CLIENT_DISCONNECT_TIMEOUT)

    disconnectTimers.set(disconnectKey, timer)
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

