import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ApiResponse } from '@/lib/response'
import { sendContactEmail } from '@/lib/mailer'
import { z } from 'zod'
const schema = z.object({ name: z.string().trim().min(2).max(100), subject: z.string().trim().min(2).max(120), message: z.string().trim().min(10, 'Pesan minimal 10 karakter.').max(3000) })
export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof Response) return auth
  try {
    const parsed = schema.safeParse(await req.json())
    if (!parsed.success) return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Periksa pesan kamu.')
    await sendContactEmail({ ...parsed.data, email: auth.user.email })
    return ApiResponse.message('Pesan telah dikirim ke email pemilik.')
  } catch (e) {
    console.error('Contact delivery failed:', e instanceof Error ? e.message : 'unknown')
    return new Response(JSON.stringify({ error: 'Pesan belum terkirim. Coba lagi nanti.' }), { status: 503, headers: { 'Content-Type': 'application/json' } })
  }
}
