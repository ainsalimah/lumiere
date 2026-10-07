import { NextRequest } from 'next/server'
import { orderService } from '@/services/OrderService'
import { requireAuth } from '@/lib/auth'
import { ApiResponse } from '@/lib/response'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAuth(req)
  if (authResult instanceof Response) return authResult

  const { id } = await params
  const userId = Number(id)
  if (isNaN(userId)) return ApiResponse.badRequest('Invalid user ID')

  // Users can only fetch their own orders unless they are admin
  if (!authResult.user.isAdmin && authResult.user.id !== userId) {
    return ApiResponse.forbidden('You are not authorized to view these orders.')
  }

  try {
    const orders = await orderService.getUserOrders(userId)
    return ApiResponse.ok(orders)
  } catch (err) {
    console.error('Failed to fetch user orders:', err)
    return ApiResponse.serverError('Failed to fetch orders')
  }
}
