'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import ResetPasswordPage from '@/views/ResetPasswordPage'
import type { Page } from '@/types'
import { Suspense } from 'react'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') || ''

  const navigate = (page: Page) => {
    const routes: Record<Page, string> = {
      home: '/', shop: '/shop', categories: '/categories', about: '/about',
      contact: '/contact', account: '/account', wishlist: '/wishlist', admin: '/admin',
      login: '/login', register: '/register', 'forgot-password': '/forgot-password', 'reset-password': '/reset-password',
    }
    router.push(routes[page] || '/')
  }

  return <ResetPasswordPage navigate={navigate} token={token} />
}

export default function ResetPasswordPageClient() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  )
}
