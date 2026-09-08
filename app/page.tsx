import type { Metadata } from 'next'
import HomePageClient from './client'

export const metadata: Metadata = {
  title: 'Lumière Furniture — Premium Furniture Store',
  description: 'Discover premium furniture crafted for modern living. Shop sofas, chairs, tables, and more at Lumière.',
}

export default function HomePage() {
  return <HomePageClient />
}
