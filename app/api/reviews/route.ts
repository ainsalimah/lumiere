import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { createReviewSchema } from '@/lib/schemas'
import { ApiResponse } from '@/lib/response'

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req)
  if (authResult instanceof Response) return authResult

  try {
    const body = await req.json()
    const parsed = createReviewSchema.safeParse(body)
    if (!parsed.success) return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Invalid input')

    const { productId, orderId, authorName, rating, title, body: reviewBody } = parsed.data
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } })
    if (!order || order.userId !== authResult.user.id || order.status !== 'Delivered' || !order.items.some(item => item.productId === productId)) return ApiResponse.forbidden('Ulasan hanya untuk produk pada pesanan milikmu yang sudah selesai.')
    const user = await prisma.user.findUnique({ where: { id: authResult.user.id }, select: { name: true } })

    const review = await (prisma as any).review.upsert({
      where: { productId_orderId: { productId: Number(productId), orderId } },
      update: {
        rating: Number(rating),
        title: title || '',
        body: reviewBody || '',
        authorName: user?.name || 'Pelanggan',
      },
      create: {
        productId: Number(productId),
        orderId,
        authorName: user?.name || 'Pelanggan',
        rating: Number(rating),
        title: title || '',
        body: reviewBody || '',
      },
    })

    return ApiResponse.created(review)
  } catch (error) {
    console.error('Failed to save review:', error)
    return ApiResponse.serverError('Failed to save review')
  }
}
