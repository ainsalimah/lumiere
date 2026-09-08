import type { Metadata } from 'next'
import PageClient from './client'

export const metadata: Metadata = {
  title: 'My Account — Lumière Furniture',
  description: 'Manage your Lumière account, orders, and addresses.',
}

export default function Page() {
  return <PageClient />
}
