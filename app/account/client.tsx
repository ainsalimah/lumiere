'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import AccountPage from '@/views/AccountPage'
import AppShell from '@/components/AppShell'
import type { Page } from '@/types'
import { useEffect } from 'react'

export default function AccountPageClient() {
  const { currentUser, logout, updateUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (currentUser === null) {
      // null = loaded but not logged in
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

  if (!currentUser) return null

  return (
    <AppShell>
      <AccountPage
        currentUser={currentUser}
        onLogout={() => { logout(); router.push('/') }}
        navigate={navigate}
        onUpdateUser={updateUser}
      />
    </AppShell>
  )
}
