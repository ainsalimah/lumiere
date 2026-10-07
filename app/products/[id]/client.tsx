'use client'
import { useRouter } from 'next/navigation'
import type { Product, Page } from '@/types'
import { useCart } from '@/hooks/useCart'
import { useWishlist } from '@/hooks/useWishlist'
import AppShell from '@/components/AppShell'
import ProductDetailPage from '@/views/ProductDetailPage'
export default function ProductClient({ product }: { product: Product }) {
  const router = useRouter()
  const { addToCartQty } = useCart()
  const { wishlist, toggleWishlist } = useWishlist()
  const navigate = (page: Page) => router.push(page === 'home' ? '/' : `/${page}`)
  return <AppShell currentPage="shop"><ProductDetailPage product={product} onBack={() => router.push('/shop')} addToCart={addToCartQty} openProduct={p => router.push(`/products/${p.id}`)} navigate={navigate} wishlist={wishlist} toggleWishlist={toggleWishlist} /></AppShell>
}
