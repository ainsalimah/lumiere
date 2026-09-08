import type { Metadata } from 'next'
import PageClient from './client'

export const metadata: Metadata = {
  title: 'Shop — Lumière Furniture',
  description: 'Browse our full collection of premium furniture.',
}

export default function Page() {
  return <PageClient />
}
