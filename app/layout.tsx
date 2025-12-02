import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from './theme-provider'

export const metadata: Metadata = {
  title: 'Story Point Poker',
  description: 'Agile planning poker for your team',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

