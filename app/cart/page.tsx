import type { Metadata } from 'next'
import PageClient from './client'

export const metadata: Metadata = {
  title: 'Keranjang Belanja — Lumière Furniture',
  description: 'Kelola produk pilihan dan belanja furnitur berkualitas di Lumière.',
}

export default function Page() {
  return <PageClient />
}
