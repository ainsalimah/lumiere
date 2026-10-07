'use client'

import AppShell from '@/components/AppShell'
import { useCart } from '@/hooks/useCart'
import CategoriesPage from '@/views/CategoriesPage'
import type { Page, ShopPreFilter } from '@/types'
import { useRouter } from 'next/navigation'

export default function CategoriesPageClient() {
  const router = useRouter()
  const { addToCartQty } = useCart()

  const navigate = (page: Page, preFilter?: ShopPreFilter) => {
    const routes: Record<Page, string> = {
      home: '/', shop: '/shop', categories: '/categories', about: '/about',
      contact: '/contact', account: '/account', wishlist: '/wishlist', cart: '/cart', admin: '/admin',
      login: '/login', register: '/register', 'forgot-password': '/forgot-password', 'reset-password': '/reset-password',
    }
    if (page === 'shop' && preFilter) {
      sessionStorage.setItem('shopPreFilter', JSON.stringify(preFilter))
    }
    router.push(routes[page] || '/')
  }

  return (
    <AppShell>
      <CategoriesPage navigate={navigate} addToCart={addToCartQty} />
    </AppShell>
  )
}
