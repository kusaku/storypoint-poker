'use client'

import { useLanguage } from '@/app/i18n/language-provider'

export function Footer() {
  const { t } = useLanguage()
  const gitSha = process.env.NEXT_PUBLIC_GIT_SHA
  const repoUrl = process.env.NEXT_PUBLIC_REPO_URL || 'https://github.com/kusaku/storypoint-poker'

  return (
    <footer className="site-footer">
      <div className="container site-footer-inner">
        <span>
          {t('footer.by')}{' '}
          <a href="https://kusaku.su" target="_blank" rel="noreferrer">kusaku</a>
        </span>
        {gitSha && gitSha !== 'master' && (
          <a className="mono" href={repoUrl + '/commit/' + gitSha} target="_blank" rel="noreferrer">
            {gitSha.slice(0, 7)}
          </a>
        )}
      </div>
    </footer>
  )
}
