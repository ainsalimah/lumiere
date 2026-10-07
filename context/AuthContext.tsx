'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import type { AuthUser } from '@/types'
import { LOCAL_STORAGE_KEYS } from '@/constants'

interface AuthContextType {
  currentUser: AuthUser | null
  isHydrated: boolean
  login: (user: AuthUser, token: string) => void
  logout: () => void
  updateUser: (updated: AuthUser) => void
  setCurrentUser: React.Dispatch<React.SetStateAction<AuthUser | null>>
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  isHydrated: false,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  setCurrentUser: () => {},
})

function loadUserFromStorage(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USER)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isHydrated, setIsHydrated] = useState<boolean>(false)

  // Hydrate on mount
  useEffect(() => {
    let cancelled = false
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN)
    if (!token) { setIsHydrated(true); return }
    fetch('/api/session', { headers: { Authorization: `Bearer ${token}` } }).then(async res => {
      if (cancelled) return
      if (res.status === 401) {
        localStorage.removeItem(LOCAL_STORAGE_KEYS.USER); localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN)
        setCurrentUser(null); return
      }
      if (!res.ok) throw new Error('Session unavailable')
      const user = await res.json()
      if (!cancelled) { setCurrentUser(user); localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user)) }
    }).catch(() => { if (!cancelled) setCurrentUser(loadUserFromStorage()) }).finally(() => { if (!cancelled) setIsHydrated(true) })
    return () => { cancelled = true }
  }, [])

  // Sync across tabs/windows
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEYS.USER) {
        try {
          setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null)
        } catch {
          setCurrentUser(null)
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const login = useCallback((user: AuthUser, token: string) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token)
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user))
    } catch (e) {
      console.error('Failed to save auth to localStorage:', e)
    }
    setCurrentUser(user)
  }, [])

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN)
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER)
    } catch (e) {
      console.error('Failed to remove auth from localStorage:', e)
    }
    setCurrentUser(null)
  }, [])

  const updateUser = useCallback((updated: AuthUser) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(updated))
    } catch (e) {
      console.error('Failed to update auth in localStorage:', e)
    }
    setCurrentUser(updated)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isHydrated,
        login,
        logout,
        updateUser,
        setCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextType {
  return useContext(AuthContext)
}
