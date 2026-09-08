import type { Metadata } from 'next'
import PageClient from './client'

export const metadata: Metadata = {
  title: 'Admin Dashboard — Lumière Furniture',
  description: 'Admin dashboard for Lumière Furniture.',
}

export default function Page() {
  return <PageClient />
}
