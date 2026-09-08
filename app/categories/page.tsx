import type { Metadata } from 'next'
import PageClient from './client'

export const metadata: Metadata = {
  title: 'Categories — Lumière Furniture',
  description: 'Explore furniture by category at Lumière.',
}

export default function Page() {
  return <PageClient />
}
