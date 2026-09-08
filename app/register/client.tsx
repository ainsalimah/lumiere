'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import RegisterPage from '@/views/RegisterPage'
import type { Page, AuthUser } from '@/types'

export default function RegisterPageClient() {
  const { login } = useAuth()
  const router = useRouter()

  const navigate = (page: Page) => {
    const routes: Record<Page, string> = {
      home: '/', shop: '/shop', categories: '/categories', about: '/about',
      contact: '/contact', account: '/account', wishlist: '/wishlist', admin: '/admin',
      login: '/login', register: '/register', 'forgot-password': '/forgot-password', 'reset-password': '/reset-password',
    }
    router.push(routes[page] || '/')
  }

  const handleAuth = (user: AuthUser) => {
    login(user, localStorage.getItem('lumiere_token') || '')
    router.push(user.isAdmin ? '/admin' : '/')
  }

  return <RegisterPage navigate={navigate} onAuth={handleAuth} />
}
