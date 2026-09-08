import { NextRequest } from 'next/server'
import { productService } from '@/services/ProductService'
import { createProductSchema } from '@/lib/schemas'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { ApiResponse } from '@/lib/response'

export async function GET() {
  try {
    const products = await productService.getAll()
    return ApiResponse.ok(products)
  } catch (err) {
    console.error('Failed to fetch products:', err)
    return ApiResponse.serverError('Failed to fetch products')
  }
}

export async function POST(req: NextRequest) {
  const authResult = requireAuth(req)
  if (authResult instanceof Response) return authResult
  const adminErr = requireAdmin(authResult.user)
  if (adminErr) return adminErr

  try {
    const body = await req.json()
    const parsed = createProductSchema.safeParse(body)
    if (!parsed.success) {
      return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Invalid input')
    }
    const product = await productService.create(parsed.data)
    return ApiResponse.created(product)
  } catch (err: any) {
    console.error('Failed to create product:', err)
    return ApiResponse.serverError(err.message || 'Failed to create product')
  }
}
