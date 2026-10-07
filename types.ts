import { VALID_PAGES } from '@/constants'

// ── Product ───────────────────────────────────────────────────────────────────
export type ProductCategory = 'Sofa' | 'Chair' | 'Table' | 'Bundle'
export type ProductTab = 'latest' | 'bestseller' | 'featured'

export interface Product {
  id: number
  name: string
  category: ProductCategory
  subcategory: string
  description?: string | null
  price: number
  originalPrice: number
  discount: number
  rating: number
  reviews: number
  img: string
  gallery?: string[]
  tabs: ProductTab[]
  hasTimer?: boolean
  colors: string[]
  material: string
  inStock: boolean
  room: string
  bundleItems?: Product[]
}

// ── Cart ──────────────────────────────────────────────────────────────────────
export interface CartItem {
  product: Product
  qty: number
  selectedColor: string
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: number
  name: string
  email: string
  phone?: string
  isAdmin?: boolean
}

// ── Order ─────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'Accepted'
  | 'Processing'
  | 'On the Way'
  | 'Delivered'
  | 'Cancelled'

export type PaymentMethod = 'Bank Transfer' | 'COD' | 'E-Wallet'

export interface OrderItem {
  productName: string
  qty: number
  color: string
  img: string
}

export interface Order {
  id: string
  customer: string
  email?: string
  phone?: string
  createdAt?: string
  address: string
  total: number
  status: OrderStatus
  date: string
  method: string
  items: number
  itemDetails?: OrderItem[]
  offerShipping?: number | null
  offerDelivery?: string | null
  offerNote?: string | null
  offerSentAt?: string | null
}

// ── Address ───────────────────────────────────────────────────────────────────
export interface Address {
  id: number
  name: string
  phone: string
  street: string
  city: string
  zip: string
  country: string
  isDefault: boolean
}

// ── Review ────────────────────────────────────────────────────────────────────
export interface Review {
  id: number
  productId: number
  orderId: string
  authorName: string
  rating: number
  title: string
  body: string
  date: string
}

// ── Routing ───────────────────────────────────────────────────────────────────
export type Page = (typeof VALID_PAGES)[number]

export interface ShopPreFilter {
  categories?: string[]
  subcategories?: string[]
  rooms?: string[]
  label?: string
}

// ── API ───────────────────────────────────────────────────────────────────────
export interface ApiError {
  error: string
}
