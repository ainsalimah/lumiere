// Preview the original public catalog in an isolated local schema.
// The source database is accessed in a read-only transaction only.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const { PrismaClient } = require('@prisma/client');
const { loadEnvConfig } = require('@next/env');
const root = path.resolve(__dirname, '..');
process.chdir(root);
loadEnvConfig(root, true, { info() {}, error() {} });
const sourceUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const localUrl = 'postgresql://lumiere_test@127.0.0.1:55432/postgres?schema=catalog_preview';
async function main() {
  if (!sourceUrl) throw new Error('Database katalog belum dikonfigurasi.');
  const source = new PrismaClient({ datasources: { db: { url: sourceUrl } }, log: [] });
  let catalog;
  try {
    catalog = await source.$transaction(async tx => {
      await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY');
      return { products: await tx.product.findMany(), reviews: await tx.review.findMany() };
    });
  } finally { await source.$disconnect(); }
  const bin = process.env.PG_BIN || 'C:/Program Files/PostgreSQL/18/bin';
  const data = path.join(root, '.tmp-review-postgres');
  if (!fs.existsSync(path.join(data, 'PG_VERSION'))) {
    cp.execFileSync(path.join(bin, 'initdb.exe'), ['-D', data, '-U', 'lumiere_test', '-A', 'trust', '--encoding=UTF8', '--no-locale'], { stdio: 'ignore', windowsHide: true });
  }
  try { cp.execFileSync(path.join(bin, 'pg_ctl.exe'), ['status', '-D', data], { stdio: 'ignore' }); }
  catch { cp.execFileSync(path.join(bin, 'pg_ctl.exe'), ['start', '-D', data, '-l', path.join(data, 'server.log'), '-o', '-p 55432 -h 127.0.0.1'], { stdio: 'ignore', windowsHide: true }); }
  Object.assign(process.env, { DATABASE_URL: localUrl, DIRECT_URL: localUrl, DATABASE_URL_UNPOOLED: localUrl, ALLOW_DEMO_SEED: 'false', NEXT_PUBLIC_SITE_URL: 'http://localhost:4180' });
  cp.execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--skip-generate'], { env: process.env, stdio: 'pipe' });
  const target = new PrismaClient({ datasources: { db: { url: localUrl } }, log: [] });
  try {
    await target.$transaction(async tx => {
      for (const product of catalog.products) await tx.product.upsert({ where: { id: product.id }, create: product, update: product });
      for (const review of catalog.reviews) await tx.review.upsert({ where: { id: review.id }, create: review, update: review });
      // Keep serial IDs ahead of the imported catalog when the owner adds a product.
      await tx.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('catalog_preview."Product"','id'), COALESCE((SELECT MAX(id) FROM "Product"), 1), EXISTS(SELECT 1 FROM "Product"))`);
      await tx.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('catalog_preview."Review"','id'), COALESCE((SELECT MAX(id) FROM "Review"), 1), EXISTS(SELECT 1 FROM "Review"))`);
    }, { timeout: 30000 });
    console.log(`Katalog asli: ${catalog.products.length} produk disalin ke preview lokal. Database asli tidak diubah.`);
  } finally { await target.$disconnect(); }
  if (process.argv.includes('--sync-only')) return;
  const server = cp.spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '4180'], { env: process.env, stdio: 'inherit', windowsHide: true });
  console.log('Preview katalog: http://localhost:4180/shop');
  process.on('SIGINT', () => { server.kill(); process.exit(0); });
}
main().catch(() => { console.error('Preview katalog gagal disiapkan. Detail koneksi disembunyikan; database asli tidak diubah.'); process.exitCode = 1; });
