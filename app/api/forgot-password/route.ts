import { NextRequest } from 'next/server'
import { authService } from '@/services/AuthService'
import { forgotPasswordSchema } from '@/lib/schemas'
import { ApiResponse } from '@/lib/response'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)
    if (!parsed.success) {
      return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Invalid input')
    }

    const email = parsed.data.email.toLowerCase().trim()
    const clientUrl = process.env.NEXT_PUBLIC_SITE_URL || req.headers.get('origin') || 'http://localhost:3000'
    await authService.forgotPassword(email, clientUrl)

    return ApiResponse.ok({
      message: 'Jika email Anda terdaftar, instruksi reset kata sandi telah dikirim ke email tersebut.',
    })
  } catch (err: any) {
    console.error('[ForgotPassword] Error:', err)
    return ApiResponse.serverError(err?.message || 'Gagal memproses permintaan reset kata sandi. Silakan coba lagi.')
  }
}
