'use client'

import { useState } from 'react'
import AppShell from '@/components/AppShell'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import WishlistPage from '@/views/WishlistPage'
import ProductDetailPage from '@/views/ProductDetailPage'
import type { Product, Page } from '@/types'
import { useRouter } from 'next/navigation'

export default function WishlistPageClient() {
  const router = useRouter()
  const { addToCart, addToCartQty } = useCart()
  const { wishlist, toggleWishlist } = useWishlist()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const navigate = (page: Page) => {
    const routes: Record<Page, string> = {
      home: '/', shop: '/shop', categories: '/categories', about: '/about',
      contact: '/contact', account: '/account', wishlist: '/wishlist', cart: '/cart', admin: '/admin',
      login: '/login', register: '/register', 'forgot-password': '/forgot-password', 'reset-password': '/reset-password',
    }
    setSelectedProduct(null)
    router.push(routes[page] || '/')
  }

  const handleOpenProduct = (p: Product) => {
    setSelectedProduct(p)
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
      <WishlistPage
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
        addToCart={addToCart}
        openProduct={handleOpenProduct}
        navigate={navigate}
      />
    </AppShell>
  )
}
