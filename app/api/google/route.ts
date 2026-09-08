import { NextRequest } from 'next/server'
import { authService } from '@/services/AuthService'
import { ApiResponse } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const { credential, accessToken } = await req.json()
    const result = await authService.loginWithGoogle(credential, accessToken)
    return ApiResponse.ok(result)
  } catch (err: any) {
    const status = err.status || 401
    return new Response(JSON.stringify({ error: err.message || 'Google authentication failed.' }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
