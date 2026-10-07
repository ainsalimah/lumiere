import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { ApiResponse } from '@/lib/response'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  const authResult = requireAuth(req)
  if (authResult instanceof Response) return authResult
  const adminErr = requireAdmin(authResult.user)
  if (adminErr) return adminErr

  const { email } = await params
  const decodedEmail = decodeURIComponent(email)

  try {
    const user = await prisma.user.findUnique({ where: { email: decodedEmail } })
    if (!user) return ApiResponse.notFound('Customer not found')

    await prisma.user.delete({ where: { email: decodedEmail } })
    return ApiResponse.ok({ success: true, message: 'Customer deleted successfully.' })
  } catch (err) {
    console.error('Failed to delete customer:', err)
    return ApiResponse.serverError('Failed to delete customer')
  }
}
