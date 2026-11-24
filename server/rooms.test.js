const assert = require('node:assert/strict')
const { once } = require('node:events')
const { createServer } = require('node:http')
const { test } = require('node:test')
const { setTimeout: delay } = require('node:timers/promises')
const { Server } = require('socket.io')
const { io: connect } = require('socket.io-client')
const { registerRooms } = require('./rooms')
const events = require('../shared/socket-events.json')

const roomId = 'test-room'

async function setup(t, timers) {
  const server = createServer()
  const io = new Server(server)
  const sockets = []
  registerRooms(io, timers)
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')

  t.after(async () => {
    for (const socket of sockets) socket.disconnect()
    await io.close()
  })

  return async function join(userName, asHost = false) {
    const socket = connect('http://127.0.0.1:' + server.address().port, { reconnection: false })
    sockets.push(socket)
    await once(socket, 'connect', { signal: AbortSignal.timeout(2500) })
    const joined = roomState(socket)
    socket.emit(events.JOIN_ROOM, { roomId, userName, asHost })
    return { socket, state: await joined }
  }
}

function roomState(socket, condition = () => true) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(events.ROOM_STATE, read)
      reject(new Error('Timed out waiting for room state'))
    }, 2500)

    function read(state) {
      if (!condition(state)) return
      clearTimeout(timer)
      socket.off(events.ROOM_STATE, read)
      resolve(state)
    }

    socket.on(events.ROOM_STATE, read)
  })
}

function action(socket, event, payload = {}) {
  return new Promise((resolve, reject) => {
    socket.timeout(2500).emit(event, { roomId, round: 1, ...payload }, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })
}

test('keeps each named participant’s ballot private until the host reveals it', async (t) => {
  const join = await setup(t)
  const host = await join('Taylor', true)
  const guest = await join('Morgan')
  const hostId = host.state.viewerId
  assert.notEqual(hostId, guest.state.viewerId)
  assert.equal(guest.state.users.length, 2)
  assert.deepEqual(guest.state.users.map(({ name }) => name), ['Taylor', 'Morgan'])

  const hostVote = roomState(host.socket, ({ ballot }) => ballot.vote === 0)
  const guestView = roomState(guest.socket, ({ users }) => users.some(({ hasVoted }) => hasVoted))
  await action(host.socket, events.WIZARD_ANSWERS, {
    wizardAnswers: {
      taskType: 'technical-implementation',
      answers: { scope: { option: 'wizardData.multipleLayers', value: 99 } },
    },
  })
  await action(host.socket, events.COMMENT, { comment: 'Check dependency ' })
  await action(host.socket, events.VOTE, { vote: 0 })

  assert.equal((await hostVote).ballot.comment, 'Check dependency ')
  const hidden = await guestView
  assert.deepEqual(hidden.ballot, { vote: null, comment: null, wizardAnswers: null })
  assert.deepEqual(hidden.users.find(({ id }) => id === hostId), {
    id: hostId, name: 'Taylor', connected: true, isHost: true, hasVoted: true,
    vote: null, comment: null, wizardAnswers: null,
  })

  await action(guest.socket, events.REVEAL_VOTES)
  const stillHidden = roomState(guest.socket, ({ ballot }) => ballot.vote === 3)
  await action(guest.socket, events.VOTE, { vote: 3 })
  assert.equal((await stillHidden).revealed, false)

  const revealed = roomState(guest.socket, (state) => state.revealed)
  await action(host.socket, events.REVEAL_VOTES)
  const revealedHost = (await revealed).users.find(({ id }) => id === hostId)
  assert.equal(revealedHost.vote, 0)
  assert.equal(revealedHost.comment, 'Check dependency ')
  assert.deepEqual(revealedHost.wizardAnswers.answers.scope, {
    section: 'scope', option: 'wizardData.multipleLayers', value: 2, minSp: 3,
  })
})

test('shares a named seat across tabs and restores its ballot using the room link', async (t) => {
  const join = await setup(t)
  const first = await join('Taylor', true)
  await action(first.socket, events.VOTE, { vote: 5 })
  const demoted = roomState(first.socket, ({ users }) => users.some(({ id, isHost }) => id === first.state.viewerId && !isHost))
  const second = await join('Taylor')
  const observer = await join('Morgan')
  assert.equal(second.state.viewerId, first.state.viewerId)
  assert.equal(second.state.users.length, 1)
  assert.equal(second.state.ballot.vote, 5)
  assert.equal((await demoted).users[0].isHost, false)

  const promoted = roomState(second.socket, ({ users }) => users.some(({ id, isHost }) => id === first.state.viewerId && isHost))
  await action(first.socket, events.BECOME_HOST)
  assert.equal((await promoted).users[0].isHost, true)

  first.socket.disconnect()
  const afterFirstClose = roomState(second.socket, ({ ballot }) => ballot.vote === 8)
  await action(second.socket, events.VOTE, { vote: 8 })
  assert.equal((await afterFirstClose).users.find(({ id }) => id === second.state.viewerId).connected, true)

  const offline = roomState(observer.socket, ({ users }) => users.some(({ connected }) => !connected))
  second.socket.disconnect()
  await offline
  const restored = await join('Taylor', true)
  assert.equal(restored.state.viewerId, first.state.viewerId)
  assert.equal(restored.state.ballot.vote, 8)
  assert.equal(restored.state.users.find(({ id }) => id === restored.state.viewerId).isHost, true)
})

test('only a host can reset a round before votes are revealed', async (t) => {
  const join = await setup(t)
  const host = await join('Taylor', true)
  const guest = await join('Morgan')
  await action(host.socket, events.VOTE, { vote: 3 })
  await action(guest.socket, events.VOTE, { vote: 5 })
  await action(host.socket, events.WIZARD_ANSWERS, {
    wizardAnswers: {
      taskType: 'technical-implementation',
      answers: { scope: { option: 'wizardData.multipleLayers' } },
    },
  })

  await action(guest.socket, events.RESET_VOTES)
  const beforeReset = roomState(host.socket, ({ ballot }) => ballot.comment === 'Pending estimate')
  await action(host.socket, events.COMMENT, { comment: 'Pending estimate' })
  const current = await beforeReset
  assert.equal(current.round, 1)
  assert.equal(current.revealed, false)
  assert.equal(current.ballot.vote, 3)
  assert.ok(current.ballot.wizardAnswers)

  const nextHost = roomState(host.socket, ({ round }) => round === 2)
  const nextGuest = roomState(guest.socket, ({ round }) => round === 2)
  await action(host.socket, events.RESET_VOTES)
  for (const result of await Promise.all([nextHost, nextGuest])) {
    assert.equal(result.revealed, false)
    assert.deepEqual(result.ballot, { vote: null, comment: null, wizardAnswers: null })
    assert.ok(result.users.every(({ hasVoted }) => !hasVoted))
  }
})

test('locks a revealed vote and rejects stale updates after the next round starts', async (t) => {
  const join = await setup(t)
  const { socket } = await join('Taylor', true)

  await action(socket, events.VOTE, { vote: 1, toggle: true })
  const cleared = roomState(socket, (state) => state.ballot.vote === null)
  await action(socket, events.VOTE, { vote: 1, toggle: true })
  await cleared
  await action(socket, events.VOTE, { vote: 2 })
  await action(socket, events.REVEAL_VOTES)
  await action(socket, events.VOTE, { vote: 8 })
  const locked = roomState(socket, (state) => state.revealed)
  await action(socket, events.COMMENT, { comment: 'Discuss again' })
  assert.equal((await locked).ballot.vote, 2)

  const reset = roomState(socket, (state) => state.round === 2)
  await action(socket, events.RESET_VOTES)
  assert.deepEqual((await reset).ballot, { vote: null, comment: null, wizardAnswers: null })

  await action(socket, events.VOTE, { vote: 2 })
  const fresh = roomState(socket, ({ ballot }) => ballot.comment === 'New round')
  await action(socket, events.COMMENT, { round: 2, comment: 'New round' })
  assert.equal((await fresh).ballot.vote, null)
})

test('starts a fresh round when an empty revealed room is rejoined', async (t) => {
  const join = await setup(t, { participantGraceMs: 30 })
  const first = await join('Taylor', true)
  await action(first.socket, events.VOTE, { vote: 5 })
  await action(first.socket, events.REVEAL_VOTES)

  first.socket.disconnect()
  await delay(100)
  const next = await join('Taylor')
  assert.equal(next.state.round, 1)
  assert.equal(next.state.revealed, false)
  assert.equal(next.state.ballot.vote, null)
  assert.notEqual(next.state.viewerId, first.state.viewerId)
})
