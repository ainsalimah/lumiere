import { NextRequest } from 'next/server'
import { authService } from '@/services/AuthService'
import { ApiResponse } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { credential, accessToken } = body
    if ((!credential || typeof credential !== 'string') && (!accessToken || typeof accessToken !== 'string')) return ApiResponse.badRequest('Token Google diperlukan.')
    const result = await authService.loginWithGoogle(credential, accessToken)
    return ApiResponse.ok(result)
  } catch (err: any) {
    console.error('Google authentication failed:', err?.message)
    const status = err.status || 401
    return new Response(JSON.stringify({ error: err.status ? err.message : 'Login Google gagal. Silakan coba lagi.' }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
