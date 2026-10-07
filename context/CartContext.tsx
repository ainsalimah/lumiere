'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback, useState, ReactNode } from 'react'
import type { Product, CartItem } from '@/types'
import { LOCAL_STORAGE_KEYS, FREE_SHIPPING_THRESHOLD, SHIPPING_COST, DEFAULT_PRODUCT_COLOR } from '@/constants'
import { useToast } from '@/context/ToastContext'

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; qty: number; color: string }
  | { type: 'UPDATE_QTY'; id: number; color: string; qty: number }
  | { type: 'REMOVE_ITEM'; id: number; color: string }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[] }

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'HYDRATE':
      return action.items
    case 'ADD_ITEM': {
      const existing = state.find(
        i => i.product.id === action.product.id && i.selectedColor === action.color
      )
      if (existing) {
        return state.map(i =>
          i.product.id === action.product.id && i.selectedColor === action.color
            ? { ...i, qty: i.qty + action.qty }
            : i
        )
      }
      return [...state, { product: action.product, qty: action.qty, selectedColor: action.color }]
    }
    case 'UPDATE_QTY': {
      if (action.qty <= 0) {
        return state.filter(i => !(i.product.id === action.id && i.selectedColor === action.color))
      }
      return state.map(i =>
        i.product.id === action.id && i.selectedColor === action.color ? { ...i, qty: action.qty } : i
      )
    }
    case 'REMOVE_ITEM':
      return state.filter(i => !(i.product.id === action.id && i.selectedColor === action.color))
    case 'CLEAR':
      return []
    default:
      return state
  }
}

export interface CartContextValue {
  cartItems: CartItem[]
  cartCount: number
  cartSubtotal: number
  cartShipping: number
  cartTotal: number
  addToCart: (product: Product, defaultColor?: string) => void
  addToCartQty: (product: Product, qty: number, color?: string) => void
  updateQty: (id: number, color: string, qty: number) => void
  removeItem: (id: number, color: string) => void
  clearCart: () => void
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  openCart: () => void
  closeCart: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, dispatch] = useReducer(cartReducer, [])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const toast = useToast()

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CART)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          dispatch({ type: 'HYDRATE', items: parsed })
        }
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Sync to localStorage only after hydration
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cartItems))
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e)
    }
  }, [cartItems, isHydrated])

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  const addToCart = useCallback((product: Product, defaultColor?: string) => {
    const color = defaultColor || product.colors?.[0] || DEFAULT_PRODUCT_COLOR
    dispatch({ type: 'ADD_ITEM', product, qty: 1, color })
    setIsCartOpen(true)
    toast?.success?.(`"${product.name}" ditambahkan ke keranjang!`)
  }, [toast])

  const addToCartQty = useCallback((product: Product, qty: number, color?: string) => {
    const selectedColor = color || product.colors?.[0] || DEFAULT_PRODUCT_COLOR
    dispatch({ type: 'ADD_ITEM', product, qty, color: selectedColor })
    setIsCartOpen(true)
    toast?.success?.(`${qty}× "${product.name}" ditambahkan ke keranjang!`)
  }, [toast])

  const updateQty = useCallback((id: number, color: string, qty: number) => {
    dispatch({ type: 'UPDATE_QTY', id, color, qty })
  }, [])

  const removeItem = useCallback((id: number, color: string) => {
    dispatch({ type: 'REMOVE_ITEM', id, color })
    toast?.info?.('Produk dihapus dari keranjang')
  }, [toast])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)
  const cartSubtotal = cartItems.reduce((sum, i) => sum + (i.product.price || 0) * i.qty, 0)
  const cartShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const cartTotal = cartSubtotal + cartShipping

  return (
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      cartSubtotal,
      cartShipping,
      cartTotal,
      addToCart,
      addToCartQty,
      updateQty,
      removeItem,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      openCart,
      closeCart,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
