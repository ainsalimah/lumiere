import { NextRequest } from 'next/server'
import { userService } from '@/services/UserService'
import { updateProfileSchema } from '@/lib/schemas'
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

  // Users can only update their own profile unless they are admin
  if (!authResult.user.isAdmin && authResult.user.id !== userId) {
    return ApiResponse.forbidden('You are not authorized to update this profile.')
  }

  try {
    const body = await req.json()
    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Invalid input')
    }
    const updated = await userService.updateProfile(userId, parsed.data)
    return ApiResponse.ok(updated)
  } catch (err: any) {
    console.error('Failed to update profile:', err)
    if (err.status === 404) return ApiResponse.notFound(err.message)
    return ApiResponse.serverError('Failed to update profile.')
  }
}
