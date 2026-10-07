'use client'

import { useState } from 'react'
import AppShell from '@/components/AppShell'
import { useAuth } from '@/hooks/useAuth'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import ShopPage from '@/views/ShopPage'
import ProductDetailPage from '@/views/ProductDetailPage'
import type { Product, Page, ShopPreFilter } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ShopPageClient() {
  const router = useRouter()
  const { addToCart, addToCartQty } = useCart()
  const { wishlist, toggleWishlist } = useWishlist()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [preFilter, setPreFilter] = useState<ShopPreFilter | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('shopPreFilter')
    if (stored) { setPreFilter(JSON.parse(stored)); sessionStorage.removeItem('shopPreFilter') }
    const storedProduct = sessionStorage.getItem('openProductOnShop')
    if (storedProduct) {
      try {
        setSelectedProduct(JSON.parse(storedProduct))
      } catch {}
      sessionStorage.removeItem('openProductOnShop')
    }
  }, [])

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
      <ShopPage
        addToCart={addToCart}
        openProduct={handleOpenProduct}
        preFilter={preFilter}
        wishlist={wishlist}
        toggleWishlist={toggleWishlist}
      />
    </AppShell>
  )
}
