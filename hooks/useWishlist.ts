'use client'

import { useState, useEffect, useCallback } from 'react'
import { LOCAL_STORAGE_KEYS } from '@/constants'

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Set<number>>(new Set())

  // Hydrate from localStorage after mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.WISHLIST)
      if (saved) setWishlist(new Set(JSON.parse(saved)))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.WISHLIST, JSON.stringify([...wishlist]))
  }, [wishlist])

  const toggleWishlist = useCallback((id: number) => {
    setWishlist(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  return { wishlist, toggleWishlist }
}
