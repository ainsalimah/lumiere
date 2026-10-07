import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { isOwner } from '@/lib/owner'

export const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'lumiere-local-development-secret')
export const SALT_ROUNDS = 10

export interface TokenPayload {
  id: number
  email: string
  isAdmin: boolean
}

export function signToken(payload: TokenPayload): string {
  if (!JWT_SECRET) throw new Error('Session signing is not configured.')
  return jwt.sign({ ...payload, isAdmin: isOwner(payload.email) }, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload {
  const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as TokenPayload
  return { ...payload, isAdmin: isOwner(payload.email) }
}

/**
 * Extracts and verifies JWT from Authorization header.
 * Returns the payload if valid, or null if missing/invalid.
 */
export function getAuthUser(req: NextRequest): TokenPayload | null {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) return null
  try {
    return verifyToken(token)
  } catch {
    return null
  }
}

/**
 * Returns 401 response if user is not authenticated.
 */
export function requireAuth(req: NextRequest): { user: TokenPayload } | Response {
  const user = getAuthUser(req)
  if (!user) {
    return new Response(JSON.stringify({ error: 'Authentication required. Please log in.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return { user }
}

/**
 * Returns 403 response if user is not admin.
 */
export function requireAdmin(user: TokenPayload): Response | null {
  if (!isOwner(user.email)) {
    return new Response(JSON.stringify({ error: 'Admin access required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return null
}
