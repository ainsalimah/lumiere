import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export const JWT_SECRET = process.env.JWT_SECRET || 'lumiere-super-secret-key-change-in-production'
export const SALT_ROUNDS = 10

export interface TokenPayload {
  id: number
  email: string
  isAdmin: boolean
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload
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
  if (!user.isAdmin) {
    return new Response(JSON.stringify({ error: 'Admin access required.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return null
}
