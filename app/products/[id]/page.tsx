import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { productService } from '@/services/ProductService'
import ProductClient from './client'
export const dynamic = 'force-dynamic'
const getProduct = cache(async (id: string) => {
  const number = Number(id)
  if (!Number.isInteger(number) || number <= 0) return null
  return productService.getById(number)
})
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const product = await getProduct((await params).id)
    return { title: product ? `${product.name} · Lumière Furniture` : 'Produk tidak ditemukan', description: product?.description?.slice(0, 160) || 'Lihat detail furnitur dan konfirmasikan pesanan bersama pemilik Lumière.' }
  } catch {
    return { title: 'Detail produk · Lumière Furniture', description: 'Lihat detail furnitur dan konfirmasikan pesanan bersama pemilik Lumière.' }
  }
}
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = await getProduct((await params).id)
  if (!product) notFound()
  return <ProductClient product={product} />
}
