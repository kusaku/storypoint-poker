import { isRoomId } from '@/shared/room'

export function createRoomId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(5)), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
}

export function parseRoomId(input: string): string | null {
  const value = input.trim()
  if (isRoomId(value)) return value

  try {
    const link = value.startsWith('/') ? new URL(value, 'https://localhost') : new URL(value)
    if (link.protocol !== 'https:' && link.protocol !== 'http:') return null
    const match = /^\/room\/([^/]+)\/?$/.exec(link.pathname)
    const roomId = match ? decodeURIComponent(match[1]) : ''
    return isRoomId(roomId) ? roomId : null
  } catch {
    return null
  }
}

export function roomPath(roomId: string): string {
  return '/room/' + encodeURIComponent(roomId)
}

export function playerRoomPath(roomId: string, name: string, asHost: boolean): string {
  const params = new URLSearchParams({ name })
  if (asHost) params.set('host', 'true')
  return roomPath(roomId) + '?' + params
}

export function setHostInUrl(asHost: boolean, replace = false) {
  const url = new URL(window.location.href)
  if (asHost) url.searchParams.set('host', 'true')
  else url.searchParams.delete('host')

  if (url.href === window.location.href) return
  if (replace) window.history.replaceState(null, '', url)
  else window.history.pushState(null, '', url)
}
