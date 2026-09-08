'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AuthUser } from '@/types'
import { LOCAL_STORAGE_KEYS } from '@/constants'

function loadUserFromStorage(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USER)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function useAuth() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)

  // Hydrate from localStorage after mount (client-only)
  useEffect(() => {
    setCurrentUser(loadUserFromStorage())
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (currentUser) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(currentUser))
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER)
    }
  }, [currentUser])

  const login = useCallback((user: AuthUser, token: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token)
    setCurrentUser(user)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN)
    setCurrentUser(null)
  }, [])

  const updateUser = useCallback((updated: AuthUser) => {
    setCurrentUser(updated)
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(updated))
  }, [])

  return { currentUser, setCurrentUser, login, logout, updateUser }
}
