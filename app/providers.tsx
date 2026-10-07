'use client'

import { useState, useEffect, ReactNode } from 'react'
import { ToastProvider } from '@/context/ToastContext'
import { AuthProvider } from '@/context/AuthContext'
import { ProductsContext, ProductsRefreshContext, ProductsStatusContext } from '@/context'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { apiClient } from '@/services/apiClient'
import type { Product } from '@/types'

export function Providers({ children }: { children: ReactNode }) {
  const [globalProducts, setGlobalProducts] = useState<Product[]>([])
  const [status, setStatus] = useState({ loading: true, error: '' })

  const refreshProducts = async () => {
    setStatus({ loading: true, error: '' })
    try {
      const data = await apiClient.products.getAll()
      if (!Array.isArray(data)) throw new Error('Katalog tidak dapat dimuat.')
      setGlobalProducts(data)
      setStatus({ loading: false, error: '' })
    } catch (err) {
      setStatus({ loading: false, error: 'Katalog belum dapat dimuat. Coba lagi.' })
      throw err
    }
  }

  useEffect(() => { refreshProducts().catch(() => {}) }, [])

  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ProductsContext.Provider value={globalProducts}>
              <ProductsStatusContext.Provider value={status}>
              <ProductsRefreshContext.Provider value={refreshProducts}>
                {children}
              </ProductsRefreshContext.Provider>
              </ProductsStatusContext.Provider>
            </ProductsContext.Provider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
