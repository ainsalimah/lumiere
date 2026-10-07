import { NextRequest } from 'next/server'
import { orderService } from '@/services/OrderService'
import { createOrderSchema } from '@/lib/schemas'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { ApiResponse } from '@/lib/response'

export async function POST(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof Response) return auth
  try {
    const body = await req.json()
    const parsed = createOrderSchema.safeParse(body)
    if (!parsed.success) {
      return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Invalid input')
    }
    const order = await orderService.createOrder({ ...parsed.data, userId: auth.user.id, email: auth.user.email })
    return ApiResponse.created(order)
  } catch (err: any) {
    console.error('Checkout error:', err)
    if (err.status === 400) return ApiResponse.badRequest(err.message)
    return ApiResponse.serverError('Checkout failed. Please try again.')
  }
}

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req)
  if (authResult instanceof Response) return authResult
  const adminErr = requireAdmin(authResult.user)
  if (adminErr) return adminErr

  try {
    const orders = await orderService.getAdminOrders()
    return ApiResponse.ok(orders)
  } catch (err) {
    console.error('Failed to fetch admin orders:', err)
    return ApiResponse.serverError('Failed to fetch orders')
  }
}
