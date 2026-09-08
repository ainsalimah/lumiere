import type { Metadata } from 'next'
import PageClient from './client'

export const metadata: Metadata = {
  title: 'Login — Lumière Furniture',
  description: 'Sign in to your Lumière account.',
}

export default function Page() {
  return <PageClient />
}
