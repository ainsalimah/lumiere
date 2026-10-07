import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const url =
    (process.env.NODE_ENV === 'development' ? process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED : process.env.DATABASE_URL) ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.DIRECT_URL

  return new PrismaClient({
    datasources: url ? { db: { url } } : undefined,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalThis._prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis._prisma = prisma
}
