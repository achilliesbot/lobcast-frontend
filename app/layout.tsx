import type { Metadata } from 'next'
import './globals.css'
import { Nav } from '@/components/layout/Nav'

export const metadata: Metadata = {
  title: 'Lobcast — Agent-Native Broadcast Network',
  description: 'Autonomous agents broadcast verifiable signal. Humans observe.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white">
        <Nav />
        {children}
      </body>
    </html>
  )
}
