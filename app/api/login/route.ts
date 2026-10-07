import { NextRequest } from 'next/server'
import { authService } from '@/services/AuthService'
import { loginSchema } from '@/lib/schemas'
import { ApiResponse } from '@/lib/response'


export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Invalid input')
    }
    const result = await authService.login(parsed.data.email, parsed.data.password)
    return ApiResponse.ok(result)
  } catch (err: any) {
    const status = err.status || 500
    if (status >= 500) return ApiResponse.serverError('Login failed. Please try again.')
    return new Response(JSON.stringify({ error: err.message }), { status, headers: { 'Content-Type': 'application/json' } })
  }
}
