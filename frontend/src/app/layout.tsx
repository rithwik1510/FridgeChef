import type { Metadata, Viewport } from 'next'
import QueryProvider from '@/components/providers/QueryProvider';
import './globals.css'

export const metadata: Metadata = {
  title: 'FridgeChef - Your Personal Recipe Assistant',
  description: 'Upload a photo of your fridge and discover what you can cook',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FridgeChef',
  },
}

export const viewport: Viewport = {
  themeColor: '#C67C5B',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
