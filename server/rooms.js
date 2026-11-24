const { randomUUID } = require('node:crypto')
const { COMMENT_MAX_LENGTH, FIBONACCI_CARDS, isRoomId, normalizeName } = require('../shared/room')
const wizardOptions = require('../shared/wizard-options')
const events = require('../shared/socket-events.json')

const emptyBallot = { vote: null, comment: null, wizardAnswers: null }

function normalizeWizardAnswers(input) {
  if (typeof input?.taskType !== 'string' || !Object.hasOwn(wizardOptions, input.taskType)) return null
  if (!input.answers || typeof input.answers !== 'object' || Array.isArray(input.answers)) return null

  const answers = {}
  for (const [section, { options }] of Object.entries(wizardOptions[input.taskType])) {
    const option = options.find(({ label }) => label === input.answers[section]?.option)
    if (option) {
      const { label, ...scores } = option
      answers[section] = { section, option: label, ...scores }
    }
  }
  return { taskType: input.taskType, answers }
}

function publish(room) {
  const users = Array.from(room.users.values(), ({ id, name, isHost, sockets, ballot }) => ({
    id,
    name,
    isHost,
    connected: sockets.size > 0,
    hasVoted: ballot.vote !== null,
    ...(room.revealed ? ballot : emptyBallot),
  }))
  const state = { round: room.round, revealed: room.revealed, users }

  for (const user of room.users.values()) {
    for (const socket of user.sockets) {
      socket.emit(events.ROOM_STATE, { ...state, viewerId: user.id, ballot: user.ballot })
    }
  }
}

function registerRooms(io, { participantGraceMs = 60_000 } = {}) {
  const rooms = new Map()

  function leave(socket) {
    const membership = socket.data.membership
    if (!membership) return

    const { room, user } = membership
    delete socket.data.membership
    user.sockets.delete(socket)
    if (user.sockets.size > 0) return

    publish(room)
    user.expiry = setTimeout(() => {
      room.users.delete(user.name)
      if (room.users.size === 0) rooms.delete(room.id)
      else publish(room)
    }, participantGraceMs).unref()
  }

  io.on('connection', (socket) => {
    socket.on(events.JOIN_ROOM, (payload) => {
      const { roomId, userName, asHost } = payload ?? {}
      const name = normalizeName(userName)
      if (!name || !isRoomId(roomId)) return

      const membership = socket.data.membership
      if (membership && (membership.room.id !== roomId || membership.user.name !== name)) leave(socket)

      let room = rooms.get(roomId)
      if (!room) {
        room = { id: roomId, users: new Map(), round: 1, revealed: false }
        rooms.set(roomId, room)
      }
      let user = room.users.get(name)
      if (!user) {
        user = {
          id: randomUUID(),
          name,
          isHost: false,
          sockets: new Set(),
          expiry: null,
          ballot: { ...emptyBallot },
        }
        room.users.set(name, user)
      }
      if (typeof asHost === 'boolean') user.isHost = asHost
      clearTimeout(user.expiry)
      user.sockets.add(socket)
      socket.data.membership = { room, user }
      publish(room)
    })

    function onAction(event, update, roundScoped = true) {
      socket.on(event, (payload, acknowledge) => {
        const membership = socket.data.membership
        if (membership && payload?.roomId === membership.room.id && (!roundScoped || payload.round === membership.room.round)) {
          if (update(membership.room, membership.user, payload) !== false) publish(membership.room)
        }
        if (typeof acknowledge === 'function') acknowledge()
      })
    }

    onAction(events.VOTE, (room, user, { vote, toggle }) => {
      if (room.revealed || (vote !== null && !FIBONACCI_CARDS.includes(vote))) return false
      user.ballot.vote = toggle === true && vote === user.ballot.vote ? null : vote
    })

    onAction(events.COMMENT, (_room, user, { comment }) => {
      if (comment !== null && (typeof comment !== 'string' || comment.length > COMMENT_MAX_LENGTH)) return false
      if (user.ballot.comment === comment) return false
      user.ballot.comment = comment
    })

    onAction(events.WIZARD_ANSWERS, (room, user, { wizardAnswers }) => {
      if (room.revealed) return false
      const answers = normalizeWizardAnswers(wizardAnswers)
      if (!answers) return false
      user.ballot.wizardAnswers = answers
    })

    onAction(events.REVEAL_VOTES, (room, user) => {
      if (!user.isHost || room.revealed || !Array.from(room.users.values()).some(({ ballot }) => ballot.vote !== null)) return false
      room.revealed = true
    })

    onAction(events.RESET_VOTES, (room, user) => {
      if (!user.isHost) return false
      room.round += 1
      room.revealed = false
      for (const member of room.users.values()) member.ballot = { ...emptyBallot }
    })

    onAction(events.BECOME_HOST, (_room, user) => { user.isHost = true }, false)
    onAction(events.REMOVE_HOST, (_room, user) => { user.isHost = false }, false)

    socket.on('disconnect', () => leave(socket))
  })
}

module.exports = { registerRooms }
