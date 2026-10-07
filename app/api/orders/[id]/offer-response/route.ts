import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { orderService } from '@/services/OrderService'
import { ApiResponse } from '@/lib/response'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAuth(req)
  if (auth instanceof Response) return auth
  try {
    const parsed = z.object({ accept: z.boolean() }).safeParse(await req.json())
    if (!parsed.success) return ApiResponse.badRequest('Respons penawaran tidak valid.')
    return ApiResponse.ok(await orderService.respondToOffer((await params).id, auth.user.id, parsed.data.accept))
  } catch (error: any) {
    if (error.status === 403) return ApiResponse.forbidden(error.message)
    if (error.status === 404) return ApiResponse.notFound(error.message)
    if (error.status === 400) return ApiResponse.badRequest(error.message)
    return ApiResponse.serverError('Respons penawaran belum dapat disimpan.')
  }
}
