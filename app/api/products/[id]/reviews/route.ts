import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/lib/response'
import { seedDemoReviews } from '@/lib/seedAdmin'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const productId = Number(id)
  if (isNaN(productId)) return ApiResponse.badRequest('Invalid product ID')

  try {
    await seedDemoReviews()
    const reviews = await (prisma as any).review.findMany({
      where: { productId },
      orderBy: { date: 'desc' },
      select: { id: true, authorName: true, rating: true, title: true, body: true, date: true },
    })
    return ApiResponse.ok(reviews)
  } catch (err) {
    console.error('Failed to fetch reviews:', err)
    return ApiResponse.serverError('Failed to fetch reviews')
  }
}
