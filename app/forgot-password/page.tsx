import type { Metadata } from 'next'
import PageClient from './client'

export const metadata: Metadata = {
  title: 'Forgot Password — Lumière Furniture',
  description: 'Reset your Lumière account password.',
}

export default function Page() {
  return <PageClient />
}
