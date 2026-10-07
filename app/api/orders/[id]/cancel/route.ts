import { NextRequest } from 'next/server'
import { orderService } from '@/services/OrderService'
import { requireAuth } from '@/lib/auth'
import { ApiResponse } from '@/lib/response'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAuth(req)
  if (authResult instanceof Response) return authResult

  const { id: orderId } = await params
  const { user } = authResult

  try {
    await orderService.cancelOrder(orderId, user.id, user.isAdmin)
    return ApiResponse.ok({ message: 'Order cancelled successfully.' })
  } catch (err: any) {
    console.error('Failed to cancel order:', err)
    const status = err.status || 500
    if (status === 404) return ApiResponse.notFound(err.message)
    if (status === 403) return ApiResponse.forbidden(err.message)
    if (status === 400) return ApiResponse.badRequest(err.message)
    return ApiResponse.serverError('Failed to cancel order.')
  }
}
