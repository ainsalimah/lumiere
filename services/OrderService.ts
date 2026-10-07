import { prisma } from '@/lib/prisma'
import { productPrice, PAYMENT_METHOD } from '@/lib/store'
import { DEFAULT_PRODUCT_COLOR } from '@/constants'
import { randomUUID } from 'crypto'

export interface CreateOrderDTO {
  userId?: number | null
  customerName: string
  email: string
  phone?: string
  address: string
  total: number
  paymentMethod: string
  items: Array<{ productId: number; qty: number; color?: string }>
}

function generateOrderId(): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = randomUUID().slice(0, 8).toUpperCase()
  return `#LM-${today}-${rand}`
}

function formatOrderForAdmin(o: any) {
  return {
    id: o.id,
    customer: o.customerName,
    email: o.email,
    address: o.address,
    total: o.total,
    status: o.status,
    date: o.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    createdAt: o.date.toISOString(),
    phone: o.user?.phone || '',
    method: o.paymentMethod,
    items: o.items.reduce((sum: number, item: any) => sum + item.qty, 0),
    itemDetails: o.items.map((i: any) => ({
      productName: i.product?.name ?? 'Unknown Product',
      qty: i.qty,
      color: i.color,
      img: i.product?.img ?? '',
    })),
  }
}

function formatOrderForUser(o: any) {
  return {
    id: o.id,
    customer: o.customerName,
    address: o.address,
    total: o.total,
    status: o.status,
    date: o.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    method: o.paymentMethod,
    items: o.items.map((item: any) => ({
      product: item.product,
      qty: item.qty,
      color: item.color,
    })),
  }
}

const ORDER_INCLUDE = {
  items: { include: { product: true } },
  user: { select: { phone: true } },
} as const

export class OrderService {
  async createOrder(data: CreateOrderDTO) {
    const productIds = [...new Set(data.items.map(i => i.productId))]
    const dbProducts = await prisma.product.findMany({ where: { id: { in: productIds } } })
    if (dbProducts.length !== productIds.length) {
      throw Object.assign(new Error('One or more selected products no longer exist.'), { status: 400 })
    }

    const outOfStock = dbProducts.filter(p => !p.inStock)
    if (outOfStock.length > 0) {
      const names = outOfStock.map(p => `"${p.name}"`).join(', ')
      throw Object.assign(
        new Error(`Sorry, the following product(s) are currently out of stock: ${names}.`),
        { status: 400 }
      )
    }

    // Price comes from the catalog, never from the browser's submitted total.
    const total = data.items.reduce((sum, item) => {
      const product = dbProducts.find(p => p.id === item.productId)!
      const selectedColor = item.color || DEFAULT_PRODUCT_COLOR
      const validColor = product.colors.length ? product.colors.includes(selectedColor) : selectedColor === DEFAULT_PRODUCT_COLOR
      if (!validColor) throw Object.assign(new Error('Pilihan warna produk tidak tersedia.'), { status: 400 })
      return sum + productPrice(product.originalPrice, product.discount) * item.qty
    }, 0)
    if (total > 2147483647) throw Object.assign(new Error('Nilai pesanan terlalu besar. Hubungi pemilik untuk pesanan ini.'), { status: 400 })
    const order = await prisma.order.create({
      data: {
        id: generateOrderId(),
        userId: data.userId ?? null,
        customerName: data.customerName.trim(),
        email: data.email.toLowerCase().trim(),
        address: `${data.address.trim()}\nKontak penerima: ${data.phone || '-'}`,
        total,
        status: 'Accepted',
        paymentMethod: PAYMENT_METHOD,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            qty: item.qty,
            color: item.color ?? 'Default',
          })),
        },
      },
      include: ORDER_INCLUDE,
    })

    if (data.userId && data.phone) {
      await prisma.user.update({
        where: { id: data.userId },
        data: { phone: data.phone },
      }).catch(() => {})
    }

    return order
  }

  async getAdminOrders() {
    const orders = await prisma.order.findMany({
      orderBy: { date: 'desc' },
      include: ORDER_INCLUDE,
    })
    return orders.map(formatOrderForAdmin)
  }

  async getUserOrders(userId: number) {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: ORDER_INCLUDE,
    })
    return orders.map(formatOrderForUser)
  }

  async cancelOrder(orderId: string, userId: number, isAdmin: boolean) {
    if (isAdmin) return this.updateStatus(orderId, 'Cancelled')
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      throw Object.assign(new Error('Order not found'), { status: 404 })
    }
    if (!isAdmin && order.userId !== userId) {
      throw Object.assign(new Error('You are not authorized to cancel this order.'), { status: 403 })
    }
    if (!isAdmin && order.status !== 'Accepted') {
      throw Object.assign(
        new Error(`Order cannot be cancelled because it is already in "${order.status}" status.`),
        { status: 400 }
      )
    }
    return prisma.order.update({ where: { id: orderId }, data: { status: 'Cancelled' } })
  }

  async updateStatus(orderId: string, status: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) throw Object.assign(new Error('Pesanan tidak ditemukan.'), { status: 404 })
    const transitions: Record<string, string[]> = { Accepted: ['Processing', 'Cancelled'], Processing: ['On the Way', 'Cancelled'], 'On the Way': ['Delivered'], Delivered: [], Cancelled: [] }
    if (status !== order.status && !transitions[order.status]?.includes(status)) throw Object.assign(new Error('Perubahan status tidak sesuai alur pesanan. Konfirmasi lalu proses dan kirim secara berurutan.'), { status: 400 })
    return prisma.order.update({ where: { id: orderId }, data: { status } })
  }
}

export const orderService = new OrderService()
