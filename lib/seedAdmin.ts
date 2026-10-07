import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { SALT_ROUNDS } from '@/lib/auth'

const ADMIN_EMAIL = 'admin@lumiere.com'

let seeded = false
let reviewsSeeded = false

const DEMO_REVIEWS = [
  { productId: 1, orderId: 'demo-review-001', authorName: 'Nadia Putri', rating: 5, title: 'Nyaman untuk sudut baca', body: 'Dudukannya empuk dan ukurannya pas untuk sudut baca di kamar. Warnanya juga sesuai dengan foto.', date: new Date('2026-08-14') },
  { productId: 1, orderId: 'demo-review-002', authorName: 'Raka Pratama', rating: 4, title: 'Kualitasnya baik', body: 'Material terasa kokoh dan pengiriman rapi. Akan lebih sempurna bila pilihan warnanya lebih banyak.', date: new Date('2026-08-02') },
  { productId: 5, orderId: 'demo-review-003', authorName: 'Salsa Maharani', rating: 5, title: 'Jadi aksen ruangan', body: 'Kursinya terlihat elegan dan nyaman dipakai menerima tamu. Sangat cocok dengan ruang tamu kami.', date: new Date('2026-07-26') },
  { productId: 46, orderId: 'demo-review-004', authorName: 'Dimas Haryanto', rating: 5, title: 'Sofa keluarga yang nyaman', body: 'Cukup lega untuk tiga orang dan dudukannya tetap nyaman setelah dipakai lama. Proses konfirmasinya juga cepat.', date: new Date('2026-08-19') },
  { productId: 46, orderId: 'demo-review-005', authorName: 'Intan Permata', rating: 4, title: 'Sesuai ekspektasi', body: 'Warna dan bahan sesuai deskripsi. Sofa datang dalam kondisi bersih dan langsung membuat ruang keluarga terasa hangat.', date: new Date('2026-08-08') },
  { productId: 76, orderId: 'demo-review-006', authorName: 'Fajar Nugroho', rating: 5, title: 'Meja makan yang solid', body: 'Konstruksinya kuat, finishing kayunya rapi, dan ukurannya pas untuk makan bersama keluarga.', date: new Date('2026-07-18') },
]

/**
 * Ensures a default super admin user exists in the database.
 * Called once on first API request via a module-level singleton guard.
 */
export async function seedAdmin(): Promise<void> {
  if (process.env.NODE_ENV === 'production') return
  if (!process.env.DATABASE_URL) return
  if (seeded) return
  seeded = true

  try {
    const existingAdmin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', SALT_ROUNDS)
      await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: ADMIN_EMAIL,
          password: hashedPassword,
          isAdmin: true,
        },
      })
      console.log('Default admin user created (admin@lumiere.com / admin123)')
      return
    }

    // Migrate legacy plaintext password to bcrypt
    if (existingAdmin.password && !existingAdmin.password.startsWith('$2')) {
      const hashedPassword = await bcrypt.hash(existingAdmin.password, SALT_ROUNDS)
      await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { password: hashedPassword },
      })
    }
  } catch (err) {
    console.error('Error seeding default admin:', err)
  }
}

/** Adds a few sample reviews locally without affecting production data. */
export async function seedDemoReviews(): Promise<void> {
  if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL || reviewsSeeded) return
  reviewsSeeded = true

  try {
    const products = await prisma.product.findMany({
      where: { id: { in: DEMO_REVIEWS.map(review => review.productId) } },
      select: { id: true },
    })
    const productIds = new Set(products.map(product => product.id))
    await prisma.review.createMany({
      data: DEMO_REVIEWS.filter(review => productIds.has(review.productId)),
      skipDuplicates: true,
    })
  } catch (err) {
    reviewsSeeded = false
    console.error('Error seeding demo reviews:', err)
  }
}
