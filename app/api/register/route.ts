import { NextRequest } from 'next/server'
import { authService } from '@/services/AuthService'
import { registerSchema } from '@/lib/schemas'
import { ApiResponse } from '@/lib/response'
import { seedAdmin } from '@/lib/seedAdmin'

export async function POST(req: NextRequest) {
  try {
    await seedAdmin()
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Invalid input')
    }
    const result = await authService.register(parsed.data)
    return ApiResponse.created(result)
  } catch (err: any) {
    const status = err.status || 500
    if (status >= 500) return ApiResponse.serverError('Registration failed. Please try again.')
    return new Response(JSON.stringify({ error: err.message }), { status, headers: { 'Content-Type': 'application/json' } })
  }
}
