'use client'

interface NameModalProps {
  nameInput: string
  setNameInput: (value: string) => void
  onEnterName: () => void
}

export function NameModal({ nameInput, setNameInput, onEnterName }: NameModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full m-4">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">Enter Your Name</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Please enter your name to join the room</p>
        <div className="space-y-4">
          <div>
            <label htmlFor="nameInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name:
            </label>
            <input
              id="nameInput"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && nameInput.trim().length > 0) {
                  onEnterName()
                }
              }}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              autoFocus
              required
            />
            {nameInput.trim().length === 0 && (
              <p className="mt-1 text-xs text-red-500 dark:text-red-400">Name is required</p>
            )}
          </div>
          <button
            onClick={onEnterName}
            disabled={nameInput.trim().length === 0}
            className="w-full bg-indigo-600 dark:bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  )
}
