import { NextRequest } from 'next/server'
import { orderService } from '@/services/OrderService'
import { updateOrderStatusSchema } from '@/lib/schemas'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { ApiResponse } from '@/lib/response'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAuth(req)
  if (authResult instanceof Response) return authResult
  const adminErr = requireAdmin(authResult.user)
  if (adminErr) return adminErr

  const { id: orderId } = await params

  try {
    const body = await req.json()
    const parsed = updateOrderStatusSchema.safeParse(body)
    if (!parsed.success) {
      return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Invalid status')
    }
    const updated = await orderService.updateStatus(orderId, parsed.data.status)
    return ApiResponse.ok(updated)
  } catch (err: any) {
    if (err.status === 400) return ApiResponse.badRequest(err.message)
    if (err.status === 404) return ApiResponse.notFound(err.message)
    console.error('Failed to update order status:', err)
    return ApiResponse.serverError('Failed to update order status.')
  }
}
