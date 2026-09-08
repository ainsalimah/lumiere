import type { Metadata } from 'next'
import PageClient from './client'

export const metadata: Metadata = {
  title: 'Register — Lumière Furniture',
  description: 'Create your Lumière account.',
}

export default function Page() {
  return <PageClient />
}
