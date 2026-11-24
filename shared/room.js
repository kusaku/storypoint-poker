const FIBONACCI_CARDS = /** @type {const} */ ([0, 1, 2, 3, 5, 8])
const NAME_MAX_LENGTH = 80
const COMMENT_MAX_LENGTH = 140

/** @param {unknown} value */
function isRoomId(value) {
  if (typeof value !== 'string' || !value || value.length > 128 || value !== value.trim()) return false
  if (value === '.' || value === '..' || /[/\\?#\x00-\x1F\x7F]/.test(value)) return false

  try {
    encodeURIComponent(value)
    return true
  } catch {
    return false
  }
}

/** @param {unknown} value */
function normalizeName(value) {
  if (typeof value !== 'string') return ''
  const name = value.trim()
  return name.length <= NAME_MAX_LENGTH ? name : ''
}

module.exports = { FIBONACCI_CARDS, NAME_MAX_LENGTH, COMMENT_MAX_LENGTH, isRoomId, normalizeName }
