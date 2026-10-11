import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { ApiResponse } from '@/lib/response'
import { orderService } from '@/services/OrderService'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req)
  if (auth instanceof Response) return auth
  const denied = requireAdmin(auth.user)
  if (denied) return denied
  try {
    const parsed = z.object({ amount: z.number().int().positive().max(2147483647), method: z.enum(['Bank Transfer', 'COD', 'E-Wallet']), note: z.string().trim().max(500), expectedVersion: z.number().int().nonnegative() }).safeParse(await req.json())
    if (!parsed.success) return ApiResponse.badRequest('Catatan pembayaran tidak valid.')
    return ApiResponse.ok(await orderService.recordPayment((await params).id, auth.user.id, parsed.data))
  } catch (error: any) {
    if (error.status === 409) return ApiResponse.conflict(error.message)
    if (error.status === 404) return ApiResponse.notFound(error.message)
    if (error.status === 400) return ApiResponse.badRequest(error.message)
    return ApiResponse.serverError('Pembayaran belum dapat dicatat.')
  }
}
