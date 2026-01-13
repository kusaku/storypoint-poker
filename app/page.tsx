'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ThemeSwitcher } from './theme-switcher'

type Mode = 'create' | 'join'

export default function Home() {
  const [mode, setMode] = useState<Mode>('create')
  const [roomName, setRoomName] = useState('')
  const [userName, setUserName] = useState('')
  const [userNameError, setUserNameError] = useState('')
  const [roomNameError, setRoomNameError] = useState('')
  const router = useRouter()

  const validateAndNavigate = (roomId: string, isHost: boolean) => {
    let isValid = true
    
    if (!userName.trim()) {
      setUserNameError('Please enter your name')
      isValid = false
    } else {
      setUserNameError('')
    }

    if (mode === 'join' && !roomName.trim()) {
      setRoomNameError('Please enter a room ID')
      isValid = false
    } else {
      setRoomNameError('')
    }

    if (!isValid) return

    router.push(`/room/${roomId}?name=${encodeURIComponent(userName)}${isHost ? '&host=true' : ''}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'create') {
      const roomId = Math.random().toString(36).substring(2, 9)
      validateAndNavigate(roomId, true)
    } else {
      validateAndNavigate(roomName.trim(), false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
        <div className="flex-shrink-0 pl-8 pr-4 py-8 flex items-center justify-center border-b md:border-b-0 border-gray-200 dark:border-gray-700">
          <Image
            src="/logo.webp"
            alt="Story Point Poker"
            width={400}
            height={400}
            className="object-contain max-w-[400px] max-h-[400px] md:h-full md:w-auto"
            priority
          />
        </div>
        
        <div className="flex-1 pl-4 pr-8 py-8">
          <h1 className="text-4xl font-bold mb-2 text-center text-indigo-600 dark:text-indigo-400">
            Story Point Poker
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
            Agile planning poker for your team
          </p>

          <div className="mb-6">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('create')
                  setRoomNameError('')
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === 'create'
                    ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Create Room
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('join')
                  setRoomNameError('')
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  mode === 'join'
                    ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                Join Room
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Name
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value)
                  setUserNameError('')
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                  userNameError
                    ? 'border-red-300 dark:border-red-600'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter your name"
                required
              />
              {userNameError && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{userNameError}</p>
              )}
            </div>

            {mode === 'join' && (
              <div>
                <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Room ID
                </label>
                <input
                  id="roomName"
                  type="text"
                  value={roomName}
                  onChange={(e) => {
                    setRoomName(e.target.value)
                    setRoomNameError('')
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 ${
                    roomNameError
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Enter room ID"
                  required
                />
                {roomNameError && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{roomNameError}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${
                mode === 'create'
                  ? 'bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600'
                  : 'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600'
              }`}
            >
              {mode === 'create' ? 'Create & Join Room' : 'Join Room'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
