import { NextRequest } from 'next/server'
import { userService } from '@/services/UserService'
import { addressSchema } from '@/lib/schemas'
import { requireAuth } from '@/lib/auth'
import { ApiResponse } from '@/lib/response'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; addressId: string }> }
) {
  const authResult = requireAuth(req)
  if (authResult instanceof Response) return authResult

  const { id, addressId } = await params
  const userId = Number(id)
  const addrId = Number(addressId)
  if (isNaN(userId) || isNaN(addrId)) return ApiResponse.badRequest('Invalid ID')

  if (!authResult.user.isAdmin && authResult.user.id !== userId) {
    return ApiResponse.forbidden('You are not authorized to update this address.')
  }

  try {
    const body = await req.json()
    const parsed = addressSchema.partial().safeParse(body)
    if (!parsed.success) {
      return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Invalid input')
    }
    const updated = await userService.updateAddress(userId, addrId, parsed.data)
    return ApiResponse.ok(updated)
  } catch (err: any) {
    console.error('Failed to update address:', err)
    return ApiResponse.serverError('Failed to update address')
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; addressId: string }> }
) {
  const authResult = requireAuth(req)
  if (authResult instanceof Response) return authResult

  const { id, addressId } = await params
  const userId = Number(id)
  const addrId = Number(addressId)
  if (isNaN(userId) || isNaN(addrId)) return ApiResponse.badRequest('Invalid ID')

  if (!authResult.user.isAdmin && authResult.user.id !== userId) {
    return ApiResponse.forbidden('You are not authorized to delete this address.')
  }

  try {
    await userService.deleteAddress(addrId)
    return ApiResponse.ok({ success: true, message: 'Address deleted successfully.' })
  } catch (err: any) {
    console.error('Failed to delete address:', err)
    return ApiResponse.serverError('Failed to delete address')
  }
}
