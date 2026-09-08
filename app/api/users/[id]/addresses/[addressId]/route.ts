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

    const review = await (prisma as any).review.upsert({
      where: { productId_orderId: { productId: Number(productId), orderId } },
      update: {
        rating: Number(rating),
        title: title || '',
        body: reviewBody || '',
        authorName: authorName || authResult.user.email || 'Anonymous',
      },
      create: {
        productId: Number(productId),
        orderId,
        authorName: authorName || authResult.user.email || 'Anonymous',
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
