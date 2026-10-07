// Read-only inspection: never prints credentials or personal records.
require('@next/env').loadEnvConfig(process.cwd());
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [] });
(async () => {
  try {
    const columns = await prisma.$queryRaw`SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Product'`;
    console.log('Product description column:', columns.some(c => c.column_name === 'description'));
    console.log('Products:', await prisma.product.count());
    await prisma.product.findFirst({ select: { id: true, description: true, gallery: true } });
    console.log('Current product schema: compatible');
    console.log('Review aggregates:', (await prisma.review.groupBy({ by: ['productId'], _avg: { rating: true }, _count: { rating: true } })).length);
    console.log('Owner account exists:', !!(await prisma.user.findUnique({ where: { email: process.env.OWNER_EMAIL }, select: { id: true } })));
  } catch (error) { console.error('Database inspection failed:', error.code || error.name); process.exitCode = 1; }
  finally { await prisma.$disconnect(); }
})();
