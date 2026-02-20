'use client'

import { useLanguage } from '@/app/i18n/language-provider'

export function Footer() {
  const { t } = useLanguage()
  const gitSha = process.env.NEXT_PUBLIC_GIT_SHA || 'master'
  const repoUrl = process.env.NEXT_PUBLIC_REPO_URL || 'https://github.com/kusaku/storypoint-poker'
  
  const commitLink = repoUrl ? `${repoUrl}/commit/${gitSha}` : '#'
  const shortSha = gitSha.length > 7 ? gitSha.substring(0, 7) : gitSha

  return (
    <footer className="w-full py-2 mt-auto flex-shrink-0">
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        <span>{t('footer.by')} </span>
        <a 
          href="https://kusaku.su" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-gray-700 dark:hover:text-gray-300 underline"
        >
          kusaku
        </a>
        {gitSha !== 'master' && (
          <>
            <span> • </span>
            <a
              href={commitLink}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 dark:hover:text-gray-300 underline font-mono"
            >
              {shortSha}
            </a>
          </>
        )}
      </div>
    </footer>
  )
}
