import type { Metadata } from 'next'
import PageClient from './client'

export const metadata: Metadata = {
  title: 'Contact — Lumière Furniture',
  description: 'Get in touch with Lumière Furniture.',
}

export default function Page() {
  return <PageClient />
}
