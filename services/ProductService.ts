import { prisma } from '@/lib/prisma'
import { saveBase64Image, deleteUploadedImage } from '@/lib/imageUpload'
import { products as fallbackProducts } from '@/data/products'

export interface CreateProductDTO {
  name: string
  category: string
  subcategory?: string | null
  originalPrice: number
  discount?: number
  rating?: number
  reviews?: number
  img?: string
  gallery?: string[]
  inStock?: boolean
  room?: string
  material?: string
  colors?: string[]
}

export type UpdateProductDTO = Partial<Omit<CreateProductDTO, 'name'>> & { name?: string }

function processImage(img: string | undefined, prefix: string): string | undefined {
  if (!img) return img
  if (img.startsWith('data:image/')) {
    return saveBase64Image(img, prefix) || img
  }
  return img
}

function processGallery(gallery: string[] | undefined, idPrefix: string): string[] {
  if (!Array.isArray(gallery)) return []
  return gallery.reduce<string[]>((acc, gImg, idx) => {
    if (typeof gImg !== 'string') return acc
    if (gImg.startsWith('data:image/')) {
      const uploaded = saveBase64Image(gImg, `${idPrefix}-${idx}`)
      if (uploaded) acc.push(uploaded)
    } else if (gImg.trim()) {
      acc.push(gImg)
    }
    return acc
  }, [])
}

export function enrichProduct(p: any) {
  return {
    ...p,
    price: Math.round((p.originalPrice * (1 - p.discount / 100)) / 1000) * 1000,
    tabs: p.tabs?.length ? p.tabs : ['featured'],
    hasTimer: p.id % 6 === 0,
    subcategory: p.subcategory || p.category,
  }
}

export class ProductService {
  async getAll() {
    try {
      if (!process.env.DATABASE_URL) {
        return fallbackProducts
      }
      const dbProducts = await prisma.product.findMany({ orderBy: { id: 'asc' } })
      if (!dbProducts || dbProducts.length === 0) {
        return fallbackProducts
      }
      return dbProducts.map(enrichProduct)
    } catch (err) {
      console.warn('Database unavailable, returning fallback products:', err)
      return fallbackProducts
    }
  }

  async create(data: CreateProductDTO) {
    const finalImg = processImage(data.img, 'product') ?? ''
    const finalGallery = processGallery(data.gallery, 'gallery')

    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        category: data.category,
        subcategory: data.subcategory || data.category,
        originalPrice: data.originalPrice,
        discount: data.discount ?? 0,
        rating: data.rating ?? 5,
        reviews: data.reviews ?? 0,
        img: finalImg,
        gallery: finalGallery,
        inStock: data.inStock ?? true,
        room: data.room ?? 'Living Room',
        material: data.material ?? 'Wood',
        colors: Array.isArray(data.colors) && data.colors.length ? data.colors : ['#000000'],
        tabs: ['Description', 'Details'],
      },
    })

    return enrichProduct(product)
  }

  async update(id: number, data: UpdateProductDTO) {
    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      throw Object.assign(new Error('Product not found'), { status: 404 })
    }

    const dataToUpdate: Record<string, unknown> = {}
    if (data.name !== undefined) dataToUpdate.name = data.name.trim()
    if (data.category !== undefined) dataToUpdate.category = data.category
    if (data.subcategory !== undefined) dataToUpdate.subcategory = data.subcategory
    if (data.originalPrice !== undefined) dataToUpdate.originalPrice = data.originalPrice
    if (data.discount !== undefined) dataToUpdate.discount = data.discount
    if (data.inStock !== undefined) dataToUpdate.inStock = data.inStock
    if (data.room !== undefined) dataToUpdate.room = data.room
    if (data.material !== undefined) dataToUpdate.material = data.material
    if (data.colors !== undefined) dataToUpdate.colors = data.colors

    if (data.img !== undefined) {
      const newImg = processImage(data.img, `product-${id}`) ?? data.img
      if (existing.img && existing.img !== newImg) {
        deleteUploadedImage(existing.img)
      }
      dataToUpdate.img = newImg
    }

    if (data.gallery !== undefined) {
      dataToUpdate.gallery = processGallery(data.gallery, `gallery-${id}`)
    }

    const updated = await prisma.product.update({ where: { id }, data: dataToUpdate })
    return enrichProduct(updated)
  }

  async delete(id: number): Promise<void> {
    const orderItems = await prisma.orderItem.findMany({ where: { productId: id } })
    if (orderItems.length > 0) {
      throw Object.assign(
        new Error('Cannot delete product because it is linked to existing customer order history.'),
        { status: 400 }
      )
    }

    const existing = await prisma.product.findUnique({ where: { id } })
    if (existing) {
      deleteUploadedImage(existing.img)
      if (Array.isArray(existing.gallery)) {
        existing.gallery.forEach(g => deleteUploadedImage(g))
      }
    }

    await prisma.product.delete({ where: { id } })
  }
}

export const productService = new ProductService()
