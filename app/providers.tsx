'use client'

import { useState, useEffect, ReactNode } from 'react'
import { ToastProvider } from '@/context/ToastContext'
import { ProductsContext, ProductsRefreshContext } from '@/context'
import { apiClient } from '@/services/apiClient'
import type { Product } from '@/types'

import { products } from '@/data/products'

export function Providers({ children }: { children: ReactNode }) {
  const [globalProducts, setGlobalProducts] = useState<Product[]>(products)

  const refreshProducts = async () => {
    try {
      const data = await apiClient.products.getAll()
      if (Array.isArray(data) && data.length > 0) {
        setGlobalProducts(data)
      }
    } catch (err) {
      console.warn('API products unavailable, using static fallback:', err)
    }
  }

  useEffect(() => { refreshProducts() }, [])

  return (
    <ToastProvider>
      <ProductsContext.Provider value={globalProducts}>
        <ProductsRefreshContext.Provider value={refreshProducts}>
          {children}
        </ProductsRefreshContext.Provider>
      </ProductsContext.Provider>
    </ToastProvider>
  )
}
