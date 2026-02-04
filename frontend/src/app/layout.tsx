import type { Metadata } from 'next'
import QueryProvider from '@/components/providers/QueryProvider';
import './globals.css'

export const metadata: Metadata = {
  title: 'FridgeChef - Your Personal Recipe Assistant',
  description: 'Upload a photo of your fridge and discover what you can cook',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
