import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { isOwner } from '@/lib/owner'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/lib/response'
export async function GET(req: NextRequest) {
  const auth = requireAuth(req)
  if (auth instanceof Response) return auth
  try {
    const user = await prisma.user.findUnique({ where: { id: auth.user.id }, select: { id: true, name: true, email: true, phone: true } })
    if (!user || user.email !== auth.user.email) return ApiResponse.unauthorized()
    return ApiResponse.ok({ ...user, phone: user.phone || '', isAdmin: isOwner(user.email) })
  } catch { return ApiResponse.serverError('Sesi belum dapat diperiksa. Coba lagi.') }
}
