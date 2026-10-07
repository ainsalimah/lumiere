import { NextRequest } from 'next/server'
import { productService } from '@/services/ProductService'
import { updateProductSchema } from '@/lib/schemas'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { ApiResponse } from '@/lib/response'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const productId = Number(id)
  if (isNaN(productId)) return ApiResponse.badRequest('Invalid product ID')

  try {
    const product = await productService.getById(productId)
    if (!product) return ApiResponse.notFound('Product not found')
    return ApiResponse.ok(product)
  } catch (err) {
    console.error('Failed to fetch product:', err)
    return ApiResponse.serverError('Failed to fetch product')
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAuth(req)
  if (authResult instanceof Response) return authResult
  const adminErr = requireAdmin(authResult.user)
  if (adminErr) return adminErr

  const { id } = await params
  const productId = Number(id)
  if (isNaN(productId)) return ApiResponse.badRequest('Invalid product ID')

  try {
    const body = await req.json()
    const parsed = updateProductSchema.safeParse(body)
    if (!parsed.success) {
      return ApiResponse.badRequest(parsed.error.issues[0]?.message || 'Invalid input')
    }
    const product = await productService.update(productId, parsed.data)
    return ApiResponse.ok(product)
  } catch (err: any) {
    console.error('Failed to update product:', err)
    if (err.status === 404) return ApiResponse.notFound(err.message)
    return ApiResponse.serverError(err.message || 'Failed to update product')
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = requireAuth(req)
  if (authResult instanceof Response) return authResult
  const adminErr = requireAdmin(authResult.user)
  if (adminErr) return adminErr

  const { id } = await params
  const productId = Number(id)
  if (isNaN(productId)) return ApiResponse.badRequest('Invalid product ID')

  try {
    await productService.delete(productId)
    return ApiResponse.ok({ message: 'Product deleted successfully.' })
  } catch (err: any) {
    console.error('Failed to delete product:', err)
    if (err.status === 404) return ApiResponse.notFound(err.message)
    if (err.status === 400) return ApiResponse.badRequest(err.message)
    return ApiResponse.serverError('Failed to delete product.')
  }
}
