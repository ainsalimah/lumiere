'use client'

import { useRouter } from 'next/navigation'
import ForgotPasswordPage from '@/views/ForgotPasswordPage'
import type { Page } from '@/types'

export default function ForgotPasswordPageClient() {
  const router = useRouter()

  const navigate = (page: Page) => {
    const routes: Record<Page, string> = {
      home: '/', shop: '/shop', categories: '/categories', about: '/about',
      contact: '/contact', account: '/account', wishlist: '/wishlist', admin: '/admin',
      login: '/login', register: '/register', 'forgot-password': '/forgot-password', 'reset-password': '/reset-password',
    }
    router.push(routes[page] || '/')
  }

  return <ForgotPasswordPage navigate={navigate} />
}
