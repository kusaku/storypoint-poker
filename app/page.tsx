'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [roomName, setRoomName] = useState('')
  const [userName, setUserName] = useState('')
  const router = useRouter()

  const createRoom = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Create room clicked', { userName, roomName })
    
    if (!userName || userName.trim() === '') {
      console.error('User name is required')
      alert('Please enter your name')
      return
    }
    
    const roomId = Math.random().toString(36).substring(2, 9)
    console.log('Creating room with ID:', roomId)
    const url = `/room/${roomId}?name=${encodeURIComponent(userName)}&host=true`
    console.log('Navigating to:', url)
    router.push(url)
  }

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Join room clicked', { userName, roomName })
    
    if (!userName || userName.trim() === '') {
      console.error('User name is required')
      alert('Please enter your name')
      return
    }
    
    if (!roomName || roomName.trim() === '') {
      console.error('Room ID is required')
      alert('Please enter a room ID')
      return
    }
    
    console.log('Joining room:', roomName)
    const url = `/room/${roomName}?name=${encodeURIComponent(userName)}`
    console.log('Navigating to:', url)
    router.push(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-indigo-600 dark:text-indigo-400">
          🃏 Story Point Poker
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Agile planning poker for your team
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

