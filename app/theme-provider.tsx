'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_PALETTE, PALETTE_STORAGE_KEY, isTablePalette, type TablePalette } from '@/app/appearance'
import { readStorage, writeStorage } from '@/app/storage'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  palette: TablePalette
  setPalette: (palette: TablePalette) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('auto')
  const [palette, setPaletteState] = useState<TablePalette>(DEFAULT_PALETTE)

  useEffect(() => {
    const storedTheme = readStorage('theme')
    const storedPalette = readStorage(PALETTE_STORAGE_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') {
      document.documentElement.dataset.theme = storedTheme
      setThemeState(storedTheme)
    }
    if (isTablePalette(storedPalette)) {
      document.documentElement.dataset.palette = storedPalette
      setPaletteState(storedPalette)
    }
  }, [])

  function setTheme(value: Theme) {
    document.documentElement.dataset.theme = value
    setThemeState(value)
    writeStorage('theme', value)
  }

  function setPalette(value: TablePalette) {
    document.documentElement.dataset.palette = value
    setPaletteState(value)
    writeStorage(PALETTE_STORAGE_KEY, value)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, palette, setPalette }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('ThemeProvider is missing')
  return context
}
