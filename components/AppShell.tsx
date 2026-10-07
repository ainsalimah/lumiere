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
  currentPage?: Page
}

/**
 * AppShell — provides Navbar, Footer, CartDrawer, and CheckoutModal.
 * Used by pages that need the full chrome layout.
 */
export default function AppShell({ children, showChrome = true, currentPage }: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { currentUser, login, logout, updateUser } = useAuth()
  const { cartItems, cartCount, addToCart, addToCartQty, updateQty, removeItem, clearCart, isCartOpen, setIsCartOpen } = useCart()
  const { wishlist } = useWishlist()
  const [cartPageOpen, setCartPageOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const activePage: Page = currentPage || (() => {
    if (!pathname || pathname === '/') return 'home'
    if (pathname.startsWith('/shop')) return 'shop'
    if (pathname.startsWith('/categories')) return 'categories'
    if (pathname.startsWith('/about')) return 'about'
    if (pathname.startsWith('/contact')) return 'contact'
    if (pathname.startsWith('/account')) return 'account'
    if (pathname.startsWith('/wishlist')) return 'wishlist'
    if (pathname.startsWith('/cart')) return 'cart'
    if (pathname.startsWith('/admin')) return 'admin'
    if (pathname.startsWith('/login')) return 'login'
    if (pathname.startsWith('/register')) return 'register'
    if (pathname.startsWith('/forgot-password')) return 'forgot-password'
    if (pathname.startsWith('/reset-password')) return 'reset-password'
    return 'home'
  })()

  const navigate = (page: Page, _preFilter?: ShopPreFilter) => {
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
    if (page === 'shop' && _preFilter) {
      sessionStorage.setItem('shopPreFilter', JSON.stringify(_preFilter))
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
          currentPage={activePage}
          navigate={navigate}
          cartCount={cartCount}
          wishlistCount={wishlist.size}
          onCartOpen={() => navigate('cart')}
          currentUser={currentUser}
          onLogout={() => { logout(); router.push('/') }}
          openProduct={(_p: Product) => {
            router.push(`/products/${_p.id}`)
          }}
        />
      )}

      <main className="flex-1">
        {children}
      </main>

      {showChrome && <Footer navigate={navigate} />}

      <CartDrawer
        open={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQty={updateQty}
        onRemove={removeItem}
        onCheckout={() => {
          setIsCartOpen(false)
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
