import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata = {
  title: '⚡ Balaji Electrical Solution | Premium Electrical Services in Manalurpet',
  description: 'Safe, honest and reliable electrical services for homes, shops and offices in Manalurpet. Call Balaji Electricals today.',
  generator: 'v0.app',
  openGraph: {
    title: '⚡ Balaji Electrical Solution | Manalurpet',
    description: 'Professional electrical work, repairs and installations by Balaji in Manalurpet.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
}

export const viewport = { colorScheme: 'light', themeColor: '#0b1a2d', userScalable: false }

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
