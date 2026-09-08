import type { Metadata } from 'next'
import PageClient from './client'

export const metadata: Metadata = {
  title: 'Reset Password — Lumière Furniture',
  description: 'Set a new password for your Lumière account.',
}

export default function Page() {
  return <PageClient />
}
