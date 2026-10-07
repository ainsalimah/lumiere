import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'


export const metadata: Metadata = {
  title: 'Lumière Furniture · Ruang yang terasa seperti rumah',
  description: 'Jelajahi kursi, sofa, dan meja di Lumière. Pesan furnitur melalui konfirmasi langsung dengan pemilik toko.',
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
