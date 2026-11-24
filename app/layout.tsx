import type { Metadata } from 'next'
import Script from 'next/script'
import '@/app/globals.css'
import { ThemeProvider } from '@/app/theme-provider'
import { DEFAULT_PALETTE, PALETTE_STORAGE_KEY, TABLE_PALETTES } from '@/app/appearance'
import { LanguageProvider } from '@/app/i18n/language-provider'
import { SiteHeader } from '@/app/components/SiteHeader'
import { Footer } from '@/app/components/Footer'

const initializeAppearance = `
  try {
    const root = document.documentElement
    const theme = localStorage.getItem('theme')
    const palette = localStorage.getItem(${JSON.stringify(PALETTE_STORAGE_KEY)})
    if (theme === 'light' || theme === 'dark') root.dataset.theme = theme
    if (${JSON.stringify(TABLE_PALETTES)}.includes(palette)) root.dataset.palette = palette
  } catch {}
`

export const metadata: Metadata = {
  title: 'Story Point Poker',
  description: 'A shared table for real-time story point estimates',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-palette={DEFAULT_PALETTE} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: initializeAppearance }} /></head>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-J8N1Q1GVVB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-J8N1Q1GVVB');
          `}
        </Script>
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=105986243', 'ym');
            ym(105986243, 'init', {ssr:true, webvisor:true, clickmap:true, accurateTrackBounce:true, trackLinks:true});
          `}
        </Script>
        <ThemeProvider>
          <LanguageProvider>
            <SiteHeader />
            {children}
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

