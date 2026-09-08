import type { Metadata } from 'next'
import PageClient from './client'

export const metadata: Metadata = {
  title: 'Wishlist — Lumière Furniture',
  description: 'Your saved furniture items.',
}

export default function Page() {
  return <PageClient />
}
