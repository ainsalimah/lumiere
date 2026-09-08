import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { SALT_ROUNDS } from '@/lib/auth'

const ADMIN_EMAIL = 'admin@lumiere.com'

let seeded = false

/**
 * Ensures a default super admin user exists in the database.
 * Called once on first API request via a module-level singleton guard.
 */
export async function seedAdmin(): Promise<void> {
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
