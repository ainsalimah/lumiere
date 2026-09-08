'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'
import CheckoutModal from '@/components/CheckoutModal'
import type { Product, Page, ShopPreFilter } from '@/types'
import { useRouter, usePathname } from 'next/navigation'

interface AppShellProps {
  children: React.ReactNode
  showChrome?: boolean
}

/**
 * AppShell — provides Navbar, Footer, CartDrawer, and CheckoutModal.
 * Used by pages that need the full chrome layout.
 */
export default function AppShell({ children, showChrome = true }: AppShellProps) {
  const router = useRouter()
  const { currentUser, login, logout, updateUser } = useAuth()
  const { cartItems, cartCount, addToCart, addToCartQty, updateQty, removeItem, clearCart } = useCart()
  const { wishlist } = useWishlist()
  const [cartOpen, setCartOpen] = useState(false)
  const [cartPageOpen, setCartPageOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const navigate = (page: Page, _preFilter?: ShopPreFilter) => {
    const routes: Record<Page, string> = {
      home: '/',
      shop: '/shop',
      categories: '/categories',
      about: '/about',
      contact: '/contact',
      account: '/account',
      wishlist: '/wishlist',
      admin: '/admin',
      login: '/login',
      register: '/register',
      'forgot-password': '/forgot-password',
      'reset-password': '/reset-password',
    }
    router.push(routes[page] || '/')
  }

  const handleOrderComplete = () => {
    clearCart()
    setCartPageOpen(false)
    setCheckoutOpen(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-sans)' }}>
      {showChrome && (
        <Navbar
          currentPage={'home' as Page}
          navigate={navigate}
          cartCount={cartCount}
          wishlistCount={wishlist.size}
          onCartOpen={() => setCartOpen(true)}
          currentUser={currentUser}
          onLogout={() => { logout(); router.push('/') }}
          openProduct={(_p: Product) => {}}
        />
      )}

      <main className="flex-1">
        {children}
      </main>

      {showChrome && <Footer navigate={navigate} />}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onCheckout={() => {
          setCartOpen(false)
          if (!currentUser) router.push('/login')
          else setCheckoutOpen(true)
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        onOrderComplete={handleOrderComplete}
        user={currentUser}
        setCurrentUser={(u) => { if (u) updateUser(u) }}
      />
    </div>
  )
}
