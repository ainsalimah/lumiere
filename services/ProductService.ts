import { prisma } from '@/lib/prisma'
import { productPrice } from '@/lib/store'
export interface CreateProductDTO {
  name: string; category: string; subcategory?: string | null; description?: string | null
  originalPrice: number; discount?: number; rating?: number; reviews?: number
  img?: string; gallery?: string[]; inStock?: boolean; room?: string; material?: string; colors?: string[]
}
export type UpdateProductDTO = Partial<CreateProductDTO>
export function enrichProduct(p: any) {
  return { ...p, price: productPrice(p.originalPrice, p.discount), tabs: p.tabs?.length ? p.tabs : ['latest'], hasTimer: false, subcategory: p.subcategory || p.category, description: p.description || null }
}
async function retryDatabaseConnection<T>(query: () => Promise<T>): Promise<T> {
  try {
    return await query()
  } catch (error: any) {
    if (error?.code !== 'P1001') throw error
    await new Promise(resolve => setTimeout(resolve, 300))
    return query()
  }
}
export class ProductService {
  async getAll() {
    const products = await prisma.product.findMany({ orderBy: { id: 'desc' } })
    const reviews = await prisma.review.groupBy({ by: ['productId'], _avg: { rating: true }, _count: { rating: true } })
    return products.map(p => {
      const review = reviews.find(r => r.productId === p.id)
      return enrichProduct({ ...p, rating: review ? Number((review._avg.rating || 0).toFixed(1)) : 0, reviews: review?._count.rating || 0 })
    })
  }
  async getById(id: number) {
    const p = await retryDatabaseConnection(() => prisma.product.findUnique({ where: { id } }))
    if (!p) return null
    const reviews = await retryDatabaseConnection(() => prisma.review.aggregate({ where: { productId: id }, _avg: { rating: true }, _count: { rating: true } }))
    return enrichProduct({ ...p, rating: Number((reviews._avg.rating || 0).toFixed(1)), reviews: reviews._count.rating })
  }
  async create(data: CreateProductDTO) {
    const product = await prisma.product.create({ data: {
      name: data.name.trim(), category: data.category, subcategory: data.subcategory || data.category,
      description: data.description?.trim() || null, originalPrice: data.originalPrice,
      discount: data.discount ?? 0, rating: 0, reviews: 0,
      img: data.img ?? '', gallery: data.gallery || [], inStock: data.inStock ?? true,
      room: data.room || 'Living Room', material: data.material || 'Wood',
      colors: data.colors?.length ? data.colors : ['Natural'], tabs: ['latest'],
    } })
    return enrichProduct(product)
  }
  async update(id: number, data: UpdateProductDTO) {
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) throw Object.assign(new Error('Produk tidak ditemukan.'), { status: 404 })
    const allowed = ['name', 'category', 'subcategory', 'description', 'originalPrice', 'discount', 'inStock', 'room', 'material', 'colors', 'img', 'gallery'] as const
    const values: Record<string, unknown> = {}
    for (const key of allowed) if (data[key] !== undefined) values[key] = typeof data[key] === 'string' ? (data[key] as string).trim() : data[key]
    return enrichProduct(await prisma.product.update({ where: { id }, data: values }))
  }
  async delete(id: number) {
    if (await prisma.orderItem.count({ where: { productId: id } })) throw Object.assign(new Error('Produk ini ada di riwayat pesanan. Ubah ketersediaannya menjadi belum tersedia agar riwayat tetap tersimpan.'), { status: 400 })
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) throw Object.assign(new Error('Produk tidak ditemukan.'), { status: 404 })
    await prisma.product.delete({ where: { id } })
  }
}
export const productService = new ProductService()
