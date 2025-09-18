import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import VisitTracker from '../components/VisitTracker'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TaskOn Embed Demo - White Label',
  description: 'TaskOn Embed SDK demos with different login methods',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <VisitTracker />
        {children}
      </body>
    </html>
  )
}