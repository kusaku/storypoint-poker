export const COMMENT_MAX_LENGTH = 140
export const POPULAR_EMOJIS = [
  '👍', '❤️', '✅', '👏', '💯',
  '😊', '😄', '😃', '😁', '😍', '🥰', '😘', '😎',
  '🎉', '🔥',
  '😂', '🤣', '💩', '🤡',
  '😢', '😭',
  '🤔', '🤯', '😴'
] as const

export const CHART_COLORS = [
  '#4F46E5',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#EC4899',
  '#84CC16',
] as const

export const COPY_FEEDBACK_DURATION = 2000

export const PAGE_SHELL_CLASS =
  'min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 flex flex-col'

export const SECONDARY_BUTTON_CLASS =
  'px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium'

export const PANEL_CARD_CLASS = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-4'

export const SMALL_SECONDARY_BUTTON_CLASS =
  'w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium'

export const PRIMARY_BUTTON_CLASS =
  'px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-medium'

export const SUCCESS_ACTION_BUTTON_CLASS =
  'flex-1 bg-green-600 dark:bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium'

export const WARNING_ACTION_BUTTON_CLASS =
  'flex-1 bg-orange-600 dark:bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed font-medium'

export const SOCKET_CLIENT_OPTIONS = {
  transports: ['polling', 'websocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 20000,
  timeout: 20000,
}
