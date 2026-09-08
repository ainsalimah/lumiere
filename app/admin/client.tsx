'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import AdminPage from '@/views/AdminPage'
import type { Page } from '@/types'
import { useEffect } from 'react'

export default function AdminPageClient() {
  const { currentUser, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (currentUser !== undefined && !currentUser?.isAdmin) {
      router.push('/login')
    }
  }, [currentUser, router])

  const navigate = (page: Page) => {
    const routes: Record<Page, string> = {
      home: '/', shop: '/shop', categories: '/categories', about: '/about',
      contact: '/contact', account: '/account', wishlist: '/wishlist', admin: '/admin',
      login: '/login', register: '/register', 'forgot-password': '/forgot-password', 'reset-password': '/reset-password',
    }
    router.push(routes[page] || '/')
  }

  if (!currentUser?.isAdmin) return null

  return (
    <AdminPage
      navigate={navigate}
      onLogout={() => { logout(); router.push('/') }}
    />
  )
}
