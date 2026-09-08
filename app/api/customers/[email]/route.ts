import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { ApiResponse } from '@/lib/response'

export async function GET(req: NextRequest) {
  const authResult = requireAuth(req)
  if (authResult instanceof Response) return authResult
  const adminErr = requireAdmin(authResult.user)
  if (adminErr) return adminErr

  try {
    const users = await prisma.user.findMany({
      where: { isAdmin: false },
      include: { orders: true },
    })

    const customers = users.map(u => {
      const orders = u.orders || []
      const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
      return {
        name: u.name,
        email: u.email,
        phone: u.phone || '-',
        orders: orders.length,
        spent: totalSpent,
        joined: u.joinedAt.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
      }
    })

    const guestOrders = await prisma.order.findMany({ where: { userId: null } })
    const guestMap = new Map<string, any>()
    guestOrders.forEach(o => {
      if (!guestMap.has(o.email)) {
        guestMap.set(o.email, { name: o.customerName, email: o.email, phone: '-', orders: 0, spent: 0, joined: 'Guest' })
      }
      const g = guestMap.get(o.email)
      g.orders += 1
      g.spent += o.total
    })

    const allCustomers = [...customers, ...Array.from(guestMap.values())].sort((a, b) => b.spent - a.spent)
    return ApiResponse.ok(allCustomers)
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    return ApiResponse.serverError('Failed to fetch customers')
  }
}
