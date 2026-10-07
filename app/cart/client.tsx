'use client'

import { useState } from 'react'
import AppShell from '@/components/AppShell'
import { useCart } from '@/hooks/useCart'
import { useAuth } from '@/hooks/useAuth'
import CartPage from '@/views/CartPage'
import CheckoutModal from '@/components/CheckoutModal'
import type { Page, ShopPreFilter } from '@/types'
import { useRouter } from 'next/navigation'

export default function CartPageClient() {
  const router = useRouter()
  const { cartItems, updateQty, removeItem, clearCart } = useCart()
  const { currentUser, updateUser } = useAuth()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const navigate = (page: Page, preFilter?: ShopPreFilter) => {
    const routes: Record<Page, string> = {
      home: '/',
      shop: '/shop',
      categories: '/categories',
      about: '/about',
      contact: '/contact',
      account: '/account',
      wishlist: '/wishlist',
      cart: '/cart',
      admin: '/admin',
      login: '/login',
      register: '/register',
      'forgot-password': '/forgot-password',
      'reset-password': '/reset-password',
    }
    if (page === 'shop' && preFilter) {
      sessionStorage.setItem('shopPreFilter', JSON.stringify(preFilter))
    }
    router.push(routes[page] || '/')
  }

  const handleCheckout = () => {
    if (!currentUser) {
      router.push('/login')
    } else {
      setCheckoutOpen(true)
    }
  }

  const handleOrderComplete = () => {
    clearCart()
    setCheckoutOpen(false)
  }

  return (
    <AppShell currentPage="cart">
      <CartPage
        items={cartItems}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onClear={clearCart}
        onCheckout={handleCheckout}
        navigate={navigate}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        onOrderComplete={handleOrderComplete}
        user={currentUser}
        setCurrentUser={(u) => { if (u) updateUser(u) }}
      />
    </AppShell>
  )
}
