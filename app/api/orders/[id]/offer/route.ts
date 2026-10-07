import { NextRequest } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { orderOfferSchema } from '@/lib/schemas'
import { orderService } from '@/services/OrderService'
import { ApiResponse } from '@/lib/response'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req)
  if (auth instanceof Response) return auth
  const adminError = requireAdmin(auth.user)
  if (adminError) return adminError
  try {
    const parsed = orderOfferSchema.safeParse(await req.json())
    if (!parsed.success) return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Data penawaran tidak valid.')
    return ApiResponse.ok(await orderService.createOffer((await params).id, parsed.data))
  } catch (error: any) {
    if (error.status === 404) return ApiResponse.notFound(error.message)
    if (error.status === 400) return ApiResponse.badRequest(error.message)
    return ApiResponse.serverError('Penawaran belum dapat disimpan.')
  }
}
