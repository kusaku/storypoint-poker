'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ThemeSwitcher } from './theme-switcher'

export default function Home() {
  const [roomName, setRoomName] = useState('')
  const [userName, setUserName] = useState('')
  const [logoWidth, setLogoWidth] = useState<number | undefined>(undefined)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const router = useRouter()

  const validateAndNavigate = (roomId: string, isHost: boolean) => {
    if (!userName.trim()) {
      alert('Please enter your name')
      return
    }
    router.push(`/room/${roomId}?name=${encodeURIComponent(userName)}${isHost ? '&host=true' : ''}`)
  }

  const createRoom = (e: React.FormEvent) => {
    e.preventDefault()
    const roomId = Math.random().toString(36).substring(2, 9)
    validateAndNavigate(roomId, true)
  }

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (!roomName.trim()) {
      alert('Please enter a room ID')
      return
    }
    validateAndNavigate(roomName.trim(), false)
  }

  useEffect(() => {
    if (titleRef.current) {
      setLogoWidth(titleRef.current.offsetWidth)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="Story Point Poker"
            width={logoWidth || 400}
            height={0}
            sizes="100vw"
            className="h-auto"
            style={{ width: logoWidth ? `${logoWidth}px` : 'auto' }}
            priority
          />
        </div>
        <h1 ref={titleRef} className="text-4xl font-bold text-center mb-2 text-indigo-600 dark:text-indigo-400">
          Story Point Poker
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Agile planning poker for our team
        </p>

        <form className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Your Name
            </label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Room ID
            </label>
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Enter room ID"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={createRoom}
              className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium"
            >
              Create Room
            </button>
            <button
              type="button"
              onClick={joinRoom}
              className="flex-1 bg-green-600 dark:bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors font-medium"
            >
              Join Room
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

