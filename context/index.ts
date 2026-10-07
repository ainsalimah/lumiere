'use client'

import { createContext, useContext } from 'react'
import type { Product } from '@/types'

// Primary Products Context
export const ProductsContext = createContext<Product[]>([])
export const ProductsStatusContext = createContext({ loading: true, error: '' })

// Products Refresh Context
export const ProductsRefreshContext = createContext<() => Promise<void>>(async () => {})

export function useProducts(): Product[] {
  return useContext(ProductsContext)
}

export function useRefreshProducts(): () => Promise<void> {
  return useContext(ProductsRefreshContext)
}
