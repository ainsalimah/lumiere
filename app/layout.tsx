import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Lumière Furniture — Premium Furniture Store',
  description: 'Discover premium furniture crafted for modern living. Shop sofas, chairs, tables, and more at Lumière.',
  keywords: 'furniture, premium furniture, sofa, chair, table, home decor, Indonesia',
  openGraph: {
    title: 'Lumière Furniture',
    description: 'Premium furniture for modern living',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
