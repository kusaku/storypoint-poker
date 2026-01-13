'use client'

import { COMMENT_MAX_LENGTH, POPULAR_EMOJIS } from '../../../constants'

interface CommentInputProps {
  comment: string
  onCommentChange: (value: string) => void
  onRemoveComment: () => void
}

export function CommentInput({ comment, onCommentChange, onRemoveComment }: CommentInputProps) {
  const handleInsertEmoji = (emoji: string) => {
    if (comment.length + emoji.length <= COMMENT_MAX_LENGTH) {
      const newComment = comment + emoji
      onCommentChange(newComment)
    }
  }

  return (
    <div className="pt-4">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Add Comment</p>
      <textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Type your comment here..."
        maxLength={COMMENT_MAX_LENGTH}
        rows={2}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none text-sm"
      />
      <div className="flex justify-between items-center mt-1">
          <div className="w-16 text-xs text-gray-500 dark:text-gray-400">
            {comment.length}/{COMMENT_MAX_LENGTH}
          </div>
          <div className="flex items-center gap-1 flex-1 justify-center">
            {POPULAR_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleInsertEmoji(emoji)}
                disabled={comment.length + emoji.length > COMMENT_MAX_LENGTH}
                className="text-lg hover:scale-125 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
                title={`Insert ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          <div className="w-20 flex justify-end">
            {comment.trim() && (
              <button
                onClick={onRemoveComment}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center gap-1"
                title="Remove comment"
              >
                <span>×</span> Remove
              </button>
            )}
          </div>
        </div>
    </div>
  )
}
