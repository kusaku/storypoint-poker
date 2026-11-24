export const TABLE_PALETTES = ['blue', 'emerald', 'burgundy'] as const
export const DEFAULT_PALETTE = TABLE_PALETTES[0]
export const PALETTE_STORAGE_KEY = 'tablePalette'

export type TablePalette = typeof TABLE_PALETTES[number]

export function isTablePalette(value: string | null): value is TablePalette {
  return TABLE_PALETTES.some((palette) => palette === value)
}
