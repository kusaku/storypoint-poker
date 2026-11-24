'use client'

import { useEffect, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import type { CardValue } from '@/app/fibonacci'
import { parseRoomId, setHostInUrl } from '@/app/room-url'
import type { RoomState } from '@/app/types/room'
import type { WizardAnswers } from '@/app/wizard-data'
import { normalizeName } from '@/shared/room'
import events from '@/shared/socket-events.json'

type RoomActions = {
  VOTE: { vote: CardValue | null; toggle?: boolean }
  COMMENT: { comment: string | null }
  WIZARD_ANSWERS: { wizardAnswers: WizardAnswers }
  REVEAL_VOTES: undefined
  RESET_VOTES: undefined
}

export type Connection = 'connecting' | 'connected' | 'disconnected'

export function useRoom(roomId: string, userName: string, asHost: boolean) {
  const socket = useRef<Socket | null>(null)
  const urlHost = useRef(asHost)
  const pendingHost = useRef<symbol | null>(null)
  const [connection, setConnection] = useState<Connection>('connecting')
  const [state, setState] = useState<RoomState | null>(null)

  useEffect(() => {
    const client = io({ autoConnect: false, reconnectionDelayMax: 20_000 })
    socket.current = client

    client.on('connect', () => {
      client.emit(events.JOIN_ROOM, { roomId, userName, asHost: urlHost.current })
    })

    function handleDisconnect() {
      pendingHost.current = null
      setConnection('disconnected')
    }

    client.on('connect_error', handleDisconnect)
    client.on('disconnect', handleDisconnect)
    client.on(events.ROOM_STATE, (nextState: RoomState) => {
      const isHost = nextState.users.some(({ id, isHost }) => id === nextState.viewerId && isHost)
      if (isHost !== urlHost.current && !pendingHost.current) {
        const url = new URL(window.location.href)
        // Leave a URL edit or history navigation in control while React processes it.
        if (
          (url.searchParams.get('host') === 'true') === urlHost.current
          && normalizeName(url.searchParams.get('name')) === userName
          && parseRoomId(url.href) === roomId
        ) {
          urlHost.current = isHost
          setHostInUrl(isHost, true)
        }
      }
      setState(nextState)
      setConnection('connected')
    })
    client.connect()

    return () => {
      client.removeAllListeners()
      client.close()
      socket.current = null
    }
  }, [roomId, userName])

  useEffect(() => {
    if (urlHost.current === asHost) return
    urlHost.current = asHost
    const client = socket.current
    if (!client?.connected) return

    const request = Symbol()
    pendingHost.current = request
    client.emit(asHost ? events.BECOME_HOST : events.REMOVE_HOST, { roomId }, () => {
      if (pendingHost.current === request) pendingHost.current = null
    })
  }, [asHost, roomId])

  function send<Action extends keyof RoomActions>(
    action: Action,
    payload: RoomActions[Action],
    acknowledge?: (delivered: boolean) => void,
  ) {
    const client = socket.current
    if (!state || connection !== 'connected' || !client?.connected) {
      acknowledge?.(false)
      return
    }

    const message = { roomId, round: state.round, ...payload }
    if (acknowledge) {
      client.timeout(5000).emit(events[action], message, (error: Error | null) => acknowledge(!error))
    } else {
      client.emit(events[action], message)
    }
  }

  return { state, connection, send }
}
