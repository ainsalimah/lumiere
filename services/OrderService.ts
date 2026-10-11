import { prisma } from '@/lib/prisma'
import { productPrice, PAYMENT_METHOD } from '@/lib/store'
import { randomUUID } from 'crypto'

const DEFAULT_PRODUCT_COLOR = 'Sesuai foto'

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
    phone: o.recipientPhone || '',
    version: o.version,
    events: o.events,
    offerAcceptedAt: o.offerAcceptedAt?.toISOString() || null,
    method: o.paymentMethod,
    paymentAmount: o.paymentAmount,
    paymentRecordedAt: o.paymentRecordedAt?.toISOString() || null,
    paymentNote: o.paymentNote,
    offerShipping: o.offerShipping,
    offerDelivery: o.offerDelivery,
    offerNote: o.offerNote,
    offerSentAt: o.offerSentAt?.toISOString() || null,
    items: o.items.reduce((sum: number, item: any) => sum + item.qty, 0),
    itemDetails: o.items.map((i: any) => ({
      productName: i.productName ?? i.product?.name ?? 'Produk lama',
      qty: i.qty,
      color: i.color,
      img: i.productImage ?? i.product?.img ?? '',
      unitPrice: i.unitPrice,
    })),
  }
}

function formatOrderForUser(o: any) {
  return {
    id: o.id,
    customer: o.customerName,
    createdAt: o.date.toISOString(),
    version: o.version,
    events: o.events,
    offerAcceptedAt: o.offerAcceptedAt?.toISOString() || null,
    phone: o.recipientPhone || '',
    address: o.address,
    total: o.total,
    status: o.status,
    date: o.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    method: o.paymentMethod,
    paymentAmount: o.paymentAmount,
    paymentRecordedAt: o.paymentRecordedAt?.toISOString() || null,
    paymentNote: o.paymentNote,
    offerShipping: o.offerShipping,
    offerDelivery: o.offerDelivery,
    offerNote: o.offerNote,
    offerSentAt: o.offerSentAt?.toISOString() || null,
    items: o.items.map((item: any) => ({
      id: item.id,
      unitPrice: item.unitPrice,
      product: { ...item.product, name: item.productName ?? item.product?.name, img: item.productImage ?? item.product?.img, price: item.unitPrice },
      qty: item.qty,
      color: item.color,
    })),
  }
}

const ORDER_INCLUDE = {
  items: { include: { product: true } },
  events: { orderBy: { occurredAt: 'asc' as const } },
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
        address: data.address.trim(),
        recipientPhone: data.phone || null,
        events: { create: { status: 'Accepted', action: 'Permintaan dibuat' } },
        total,
        status: 'Accepted',
        paymentMethod: PAYMENT_METHOD,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            qty: item.qty,
            color: item.color || DEFAULT_PRODUCT_COLOR,
            productName: dbProducts.find(p => p.id === item.productId)!.name,
            productImage: dbProducts.find(p => p.id === item.productId)!.img,
            unitPrice: productPrice(dbProducts.find(p => p.id === item.productId)!.originalPrice, dbProducts.find(p => p.id === item.productId)!.discount),
            originalPrice: dbProducts.find(p => p.id === item.productId)!.originalPrice,
            discount: dbProducts.find(p => p.id === item.productId)!.discount,
          })),
        },
      },
      include: ORDER_INCLUDE,
    })

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

  private async change(order: any, data: any, action: string, admin = false) {
    const updated = await prisma.$transaction(async tx => {
      const result = await tx.order.updateMany({ where: { id: order.id, version: order.version, status: order.status }, data: { ...data, version: { increment: 1 } } })
      if (result.count !== 1) throw Object.assign(new Error('Pesanan berubah. Muat ulang dan periksa penawaran terbaru.'), { status: 409 })
      await tx.orderEvent.create({ data: { orderId: order.id, status: data.status || order.status, action } })
      return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: ORDER_INCLUDE })
    })
    return admin ? formatOrderForAdmin(updated) : formatOrderForUser(updated)
  }

  private async find(orderId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) throw Object.assign(new Error('Pesanan tidak ditemukan.'), { status: 404 })
    return order
  }

  async cancelOrder(orderId: string, userId: number, isAdmin: boolean) {
    if (isAdmin) return this.updateStatus(orderId, 'Cancelled')
    const order = await this.find(orderId)
    if (order.userId !== userId) throw Object.assign(new Error('Kamu tidak berwenang mengubah pesanan ini.'), { status: 403 })
    if (order.status !== 'Accepted') throw Object.assign(new Error('Pesanan yang sudah diproses tidak dapat dibatalkan oleh pelanggan.'), { status: 400 })
    return this.change(order, { status: 'Cancelled' }, 'Dibatalkan pelanggan')
  }

  async updateStatus(orderId: string, status: string) {
    const order = await this.find(orderId)
    if (status === 'Cancelled' && order.paymentAmount > 0) throw Object.assign(new Error('Pembayaran sudah tercatat. Hubungi pelanggan dan selesaikan pengembalian dana terlebih dahulu; pembatalan otomatis tidak tersedia.'), { status: 400 })
    const transitions: Record<string, string[]> = { Accepted: ['Cancelled'], Processing: ['On the Way', 'Cancelled'], 'On the Way': ['Delivered'], Delivered: [], Cancelled: [] }
    if (!transitions[order.status]?.includes(status)) throw Object.assign(new Error('Perubahan status tidak sesuai alur pesanan. Pelanggan harus menyetujui penawaran sebelum diproses.'), { status: 400 })
    return this.change(order, { status }, 'Status diperbarui pemilik', true)
  }

  async createOffer(orderId: string, data: { shipping: number; delivery: string; note?: string }) {
    const order = await this.find(orderId)
    if (order.status !== 'Accepted') throw Object.assign(new Error('Penawaran hanya dapat dibuat untuk pesanan yang menunggu konfirmasi.'), { status: 400 })
    if (order.total + data.shipping > 2147483647) throw Object.assign(new Error('Total penawaran terlalu besar.'), { status: 400 })
    return this.change(order, { offerShipping: data.shipping, offerDelivery: data.delivery, offerNote: data.note || null, offerSentAt: new Date() }, 'Penawaran diperbarui pemilik', true)
  }

  async respondToOffer(orderId: string, userId: number, accept: boolean, expectedVersion: number) {
    const order = await this.find(orderId)
    if (order.userId !== userId) throw Object.assign(new Error('Kamu tidak berwenang mengubah pesanan ini.'), { status: 403 })
    if (order.version !== expectedVersion) throw Object.assign(new Error('Penawaran berubah. Muat ulang dan periksa total terbaru sebelum menyetujui.'), { status: 409 })
    if (order.status !== 'Accepted' || !order.offerSentAt) throw Object.assign(new Error('Penawaran belum tersedia atau sudah ditanggapi.'), { status: 400 })
    return this.change(order, { status: accept ? 'Processing' : 'Cancelled', offerAcceptedAt: accept ? new Date() : null }, accept ? 'Penawaran disetujui pelanggan' : 'Penawaran ditolak pelanggan')
  }

  async recordPayment(orderId: string, actorId: number, data: { amount: number; method: string; note: string; expectedVersion: number }) {
    const order = await this.find(orderId)
    if (order.version !== data.expectedVersion) throw Object.assign(new Error('Pesanan berubah. Muat ulang sebelum mencatat pembayaran.'), { status: 409 })
    if (!['Processing', 'On the Way', 'Delivered'].includes(order.status) || !order.offerAcceptedAt) throw Object.assign(new Error('Pembayaran hanya dapat dicatat setelah penawaran disetujui.'), { status: 400 })
    if (order.paymentAmount > 0) throw Object.assign(new Error('Pembayaran sudah tercatat. Pencatatan ganda ditolak.'), { status: 409 })
    if (data.amount !== order.total + (order.offerShipping || 0)) throw Object.assign(new Error('Catat pembayaran penuh sesuai total penawaran yang disetujui. Cicilan belum didukung.'), { status: 400 })
    return this.change(order, { paymentAmount: data.amount, paymentMethod: data.method, paymentNote: data.note || null, paymentRecordedAt: new Date(), paymentRecordedBy: actorId }, `Pembayaran manual dicatat pemilik: Rp ${data.amount} (${data.method})`, true)
  }
}

export const orderService = new OrderService()
