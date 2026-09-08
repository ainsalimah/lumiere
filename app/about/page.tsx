import type { Metadata } from 'next'
import PageClient from './client'

export const metadata: Metadata = {
  title: 'About Us — Lumière Furniture',
  description: 'Learn about the story and mission of Lumière Furniture.',
}

export default function Page() {
  return <PageClient />
}
