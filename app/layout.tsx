import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'myBidly - Bid-Based Upsells',
  description: 'Turn Every Thank-You Page Into Your Next Sale',
  keywords: 'upsell, post-purchase, e-commerce, bid-based, thank you page, conversion optimization',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'myBidly - Bid-Based Upsells',
    description: 'Turn Every Thank-You Page Into Your Next Sale',
    type: 'website',
    locale: 'en_US',
    siteName: 'myBidly',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'myBidly - Bid-Based Upsells',
    description: 'Turn Every Thank-You Page Into Your Next Sale',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
