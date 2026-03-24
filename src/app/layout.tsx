import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { CustomCursor } from '@/components/shared/custom-cursor'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: {
    default: 'Golf Charity Platform',
    template: '%s | Golf Charity Platform',
  },
  description: 'Subscribe, play, win, and give back. Join our monthly draws with charity donations.',
  keywords: ['golf', 'charity', 'subscription', 'monthly draw', 'Stableford', 'golf scores'],
  authors: [{ name: 'Golf Charity Platform' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'Golf Charity Platform',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans min-h-screen bg-background`}>
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
