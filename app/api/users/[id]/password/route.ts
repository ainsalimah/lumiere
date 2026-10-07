import { NextRequest } from 'next/server'
import { userService } from '@/services/UserService'
import { changePasswordSchema } from '@/lib/schemas'
import { requireAuth } from '@/lib/auth'
import { ApiResponse } from '@/lib/response'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAuth(req)
  if (authResult instanceof Response) return authResult

  const { id } = await params
  const userId = Number(id)
  if (isNaN(userId)) return ApiResponse.badRequest('Invalid user ID')

  // Users can only change their own password
  if (authResult.user.id !== userId) {
    return ApiResponse.forbidden('You are not authorized to change this password.')
  }

  try {
    const body = await req.json()
    const parsed = changePasswordSchema.safeParse(body)
    if (!parsed.success) {
      return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Invalid input')
    }
    await userService.changePassword(userId, parsed.data.currentPassword, parsed.data.newPassword)
    return ApiResponse.ok({ success: true, message: 'Password changed successfully.' })
  } catch (err: any) {
    console.error('Failed to change password:', err)
    const status = err.status || 500
    if (status === 400) return ApiResponse.badRequest(err.message)
    if (status === 404) return ApiResponse.notFound(err.message)
    return ApiResponse.serverError('Failed to change password.')
  }
}
