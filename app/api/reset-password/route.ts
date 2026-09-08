import { NextRequest } from 'next/server'
import { authService } from '@/services/AuthService'
import { resetPasswordSchema } from '@/lib/schemas'
import { ApiResponse } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = resetPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Invalid input')
    }

    await authService.resetPassword(parsed.data.token, parsed.data.newPassword)
    return ApiResponse.ok({ message: 'Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.' })
  } catch (err: any) {
    const status = err.status || 500
    if (status >= 500) return ApiResponse.serverError('Gagal mengatur ulang kata sandi. Silakan coba lagi.')
    return new Response(JSON.stringify({ error: err.message }), { status, headers: { 'Content-Type': 'application/json' } })
  }
}
