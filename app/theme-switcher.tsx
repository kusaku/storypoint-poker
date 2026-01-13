'use client'

import { useTheme } from './theme-provider'
import { useEffect, useState } from 'react'

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md border border-gray-200 dark:border-gray-700 w-[120px] h-[40px]">
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-md border border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setTheme('light')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          theme === 'light'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="Light mode"
      >
        ☀️
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          theme === 'dark'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="Dark mode"
      >
        🌙
      </button>
      <button
        onClick={() => setTheme('auto')}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          theme === 'auto'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        title="Auto (follow system)"
      >
        ⚙️
      </button>
    </div>
  )
}

