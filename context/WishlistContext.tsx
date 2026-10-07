'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react'
import { LOCAL_STORAGE_KEYS } from '@/constants'
import { useToast } from '@/context/ToastContext'

export interface WishlistContextValue {
  wishlist: Set<number>
  toggleWishlist: (id: number) => void
}

export const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Set<number>>(new Set())
  const [isHydrated, setIsHydrated] = useState(false)
  const wishlistRef = useRef<Set<number>>(new Set())
  const toast = useToast()

  // Keep ref in sync with state
  useEffect(() => {
    wishlistRef.current = wishlist
  }, [wishlist])

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.WISHLIST)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          const initialSet = new Set<number>(parsed)
          wishlistRef.current = initialSet
          setWishlist(initialSet)
        }
      }
    } catch {} finally {
      setIsHydrated(true)
    }
  }, [])

  // Sync to localStorage only after hydration
  useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.WISHLIST, JSON.stringify([...wishlist]))
    } catch {}
  }, [wishlist, isHydrated])

  const toggleWishlist = useCallback((id: number) => {
    const wasInWishlist = wishlistRef.current.has(id)
    const next = new Set(wishlistRef.current)

    if (wasInWishlist) {
      next.delete(id)
    } else {
      next.add(id)
    }

    wishlistRef.current = next
    setWishlist(next)

    // Call toast outside the state updater to avoid "setState during render" error
    if (wasInWishlist) {
      toast?.info?.('Dihapus dari wishlist')
    } else {
      toast?.success?.('Ditambahkan ke wishlist')
    }
  }, [toast])

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(): WishlistContextValue {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
