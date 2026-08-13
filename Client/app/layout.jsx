import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata = {
  title: '⚡ Balaji Electricals | Trusted Electrician in Manalurpet',
  description: 'Safe, honest and reliable electrical services for homes, shops and offices in Manalurpet. Call Balaji Electricals today.',
  generator: 'v0.app',
  openGraph: {
    title: '⚡ Balaji Electricals | Manalurpet',
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

export const viewport = { colorScheme: 'light', themeColor: '#f5f7fa', userScalable: false }

export default function RootLayout({ children }) {
  return <html lang="en" className="bg-background"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
