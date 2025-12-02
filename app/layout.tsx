import type { Metadata } from 'next'
import { Kurale } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from './theme-provider'

const kurale = Kurale({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Story Point Poker',
  description: 'Agile planning poker for our team',
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
      <body className={kurale.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}

