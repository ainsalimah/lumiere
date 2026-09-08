'use client'

import { useReducer, useEffect, useCallback } from 'react'
import type { Product, CartItem } from '@/types'
import { LOCAL_STORAGE_KEYS, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/constants'

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

export function useCart() {
  const [cartItems, dispatch] = useReducer(cartReducer, [])

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CART)
      if (saved) dispatch({ type: 'HYDRATE', items: JSON.parse(saved) })
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = useCallback((product: Product, defaultColor?: string) => {
    const color = defaultColor || product.colors?.[0] || 'Mixed'
    dispatch({ type: 'ADD_ITEM', product, qty: 1, color })
  }, [])

  const addToCartQty = useCallback((product: Product, qty: number, color?: string) => {
    const selectedColor = color || product.colors?.[0] || 'Mixed'
    dispatch({ type: 'ADD_ITEM', product, qty, color: selectedColor })
  }, [])

  const updateQty = useCallback((id: number, color: string, qty: number) => {
    dispatch({ type: 'UPDATE_QTY', id, color, qty })
  }, [])

  const removeItem = useCallback((id: number, color: string) => {
    dispatch({ type: 'REMOVE_ITEM', id, color })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR' })
  }, [])

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)
  const cartSubtotal = cartItems.reduce((sum, i) => sum + (i.product.price || 0) * i.qty, 0)
  const cartShipping = cartSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const cartTotal = cartSubtotal + cartShipping

  return { cartItems, cartCount, cartSubtotal, cartShipping, cartTotal, addToCart, addToCartQty, updateQty, removeItem, clearCart }
}
