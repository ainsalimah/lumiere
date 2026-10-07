'use client'

import { useState } from 'react'
import AppShell from '@/components/AppShell'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import HomePage from '@/views/HomePage'
import ProductDetailPage from '@/views/ProductDetailPage'
import type { Product, Page, ShopPreFilter } from '@/types'
import { useRouter } from 'next/navigation'

export default function HomePageClient() {
  const router = useRouter()
  const { currentUser } = useAuth()
  const { addToCart, addToCartQty } = useCart()
  const { wishlist, toggleWishlist } = useWishlist()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const navigate = (page: Page, preFilter?: ShopPreFilter) => {
    const routes: Record<Page, string> = {
      home: '/', shop: '/shop', categories: '/categories', about: '/about',
      contact: '/contact', account: '/account', wishlist: '/wishlist', cart: '/cart', admin: '/admin',
      login: '/login', register: '/register', 'forgot-password': '/forgot-password', 'reset-password': '/reset-password',
    }
    if (page === 'shop' && preFilter) {
      sessionStorage.setItem('shopPreFilter', JSON.stringify(preFilter))
    }
    setSelectedProduct(null)
    router.push(routes[page] || '/')
  }

  const handleOpenProduct = (p: Product) => {
    router.push(`/products/${p.id}`)
  }

  if (selectedProduct) {
    return (
      <AppShell>
        <ProductDetailPage
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          addToCart={addToCartQty}
          openProduct={handleOpenProduct}
          navigate={navigate}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
        />
      </AppShell>
    )
  }

  return (
    <AppShell>
      <HomePage
        navigate={navigate}
        addToCart={addToCart}
        openProduct={handleOpenProduct}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />
    </AppShell>
  )
}
