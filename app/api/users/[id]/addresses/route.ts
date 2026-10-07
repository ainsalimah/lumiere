import { NextRequest } from 'next/server'
import { userService } from '@/services/UserService'
import { addressSchema } from '@/lib/schemas'
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

  if (!authResult.user.isAdmin && authResult.user.id !== userId) {
    return ApiResponse.forbidden('You are not authorized to view these addresses.')
  }

  try {
    const addresses = await userService.getAddresses(userId)
    return ApiResponse.ok(addresses)
  } catch (err) {
    console.error('Failed to fetch addresses:', err)
    return ApiResponse.serverError('Failed to fetch addresses')
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAuth(req)
  if (authResult instanceof Response) return authResult

  const { id } = await params
  const userId = Number(id)
  if (isNaN(userId)) return ApiResponse.badRequest('Invalid user ID')

  if (!authResult.user.isAdmin && authResult.user.id !== userId) {
    return ApiResponse.forbidden('You are not authorized to add addresses for this user.')
  }

  try {
    const body = await req.json()
    const parsed = addressSchema.safeParse(body)
    if (!parsed.success) {
      return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Invalid input')
    }
    const address = await userService.createAddress(userId, parsed.data)
    return ApiResponse.created(address)
  } catch (err: any) {
    console.error('Failed to create address:', err)
    return ApiResponse.serverError('Failed to create address')
  }
}
