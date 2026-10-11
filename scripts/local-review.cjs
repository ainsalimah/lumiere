// Standalone localhost-only PostgreSQL cluster: never loads .env database URLs.
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
process.chdir(root);
const bin = process.env.PG_BIN || 'C:/Program Files/PostgreSQL/18/bin';
const data = path.join(root, '.tmp-review-postgres');
if (!fs.existsSync(path.join(data, 'PG_VERSION'))) {
  cp.execFileSync(path.join(bin, 'initdb.exe'), ['-D', data, '-U', 'lumiere_test', '-A', 'trust', '--encoding=UTF8', '--no-locale'], { stdio: 'ignore', windowsHide: true });
}
const ctl = path.join(bin, 'pg_ctl.exe');
try { cp.execFileSync(ctl, ['status', '-D', data], { stdio: 'ignore' }); }
catch { cp.execFileSync(ctl, ['start', '-D', data, '-l', path.join(data, 'server.log'), '-o', '-p 55432 -h 127.0.0.1'], { stdio: 'ignore', windowsHide: true }); }
Object.assign(process.env, {
  DATABASE_URL: 'postgresql://lumiere_test@127.0.0.1:55432/postgres?schema=public',
  DIRECT_URL: 'postgresql://lumiere_test@127.0.0.1:55432/postgres?schema=public',
  JWT_SECRET: 'isolated-local-review-secret-not-for-deployment',
  OWNER_EMAIL: 'owner@example.com', ALLOW_DEMO_SEED: 'false',
  NEXT_PUBLIC_SITE_URL: 'http://localhost:4180',
});
const originalLoad = Module._load;
Module._load = function (name, parent, isMain) {
  if (name.startsWith('@/')) name = path.join(root, name.slice(2)) + '.ts';
  return originalLoad.call(this, name, parent, isMain);
};
require.extensions['.ts'] = (mod, filename) => mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, filename);
async function main() {
  const { prisma } = require('../lib/prisma.ts');
  const exists = await prisma.$queryRaw`SELECT to_regclass('public."Product"')::text AS table_name`;
  if (!exists[0].table_name) {
    // Exercise the additive upgrade on the previous schema before using new fields.
    cp.execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--schema', 'tests/fixtures/legacy-schema.prisma', '--skip-generate'], { env: process.env, stdio: 'pipe' });
    cp.execFileSync(path.join(bin, 'psql.exe'), [process.env.DIRECT_URL.split('?')[0], '-v', 'ON_ERROR_STOP=1', '-f', 'prisma/upgrades/20261011_order_integrity.sql'], { stdio: 'pipe' });
  }
  cp.execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'db', 'push', '--skip-generate'], { env: process.env, stdio: 'pipe' });
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  const { OrderService } = require('../services/OrderService.ts');
  const { UserService } = require('../services/UserService.ts');
  const bcrypt = require('bcryptjs');
  const password = await bcrypt.hash('Review123!', 10);
  const users = [];
  for (const email of ['customer1@example.com', 'customer2@example.com', 'owner@example.com']) users.push(await prisma.user.upsert({ where: { email }, update: {}, create: { email, name: email.split('@')[0], password } }));
  const product = await prisma.product.upsert({ where: { id: 901 }, update: { originalPrice: 100000, name: 'Review chair', inStock: true }, create: { id: 901, name: 'Review chair', category: 'Chair', originalPrice: 100000, discount: 10, rating: 0, reviews: 0, img: '/sofa_1.png', inStock: true, room: 'Living room', material: 'Wood', colors: ['Oak', 'Walnut'], tabs: [] } });
  const service = new OrderService(); const addresses = new UserService();
  const address = await addresses.createAddress(users[1].id, { name: 'Test', phone: '08123456789', street: 'Isolated street', city: 'Jakarta', zip: '12345' });
  await assert.rejects(addresses.updateAddress(users[0].id, address.id, { street: 'Intrusion', isDefault: true }), e => e.status === 404);
  await assert.rejects(addresses.deleteAddress(users[0].id, address.id), e => e.status === 404);
  assert.equal((await prisma.address.findUnique({ where: { id: address.id } })).street, 'Isolated street');
  await Promise.all([1, 2].map(n => addresses.createAddress(users[0].id, { name: `Concurrent ${n}`, phone: '08123456789', street: 'Test', city: 'Jakarta', zip: '12345', isDefault: true })));
  assert.equal(await prisma.address.count({ where: { userId: users[0].id, isDefault: true } }), 1);
  const input = { userId: users[0].id, customerName: 'Test recipient', email: users[0].email, phone: '08123456789', address: 'Isolated delivery address', total: 1, paymentMethod: 'Untrusted', items: [{ productId: product.id, qty: 2, color: 'Oak' }, { productId: product.id, qty: 1, color: 'Walnut' }] };
  const order = await service.createOrder(input);
  assert.equal(order.total, 270000);
  assert.equal(order.recipientPhone, input.phone);
  await assert.rejects(service.updateStatus(order.id, 'Processing'), e => e.status === 400);
  const oldOffer = await service.createOffer(order.id, { shipping: 10000, delivery: '3 hari kerja' });
  const offer = await service.createOffer(order.id, { shipping: 25000, delivery: '5 hari kerja' });
  await assert.rejects(service.respondToOffer(order.id, users[0].id, true, oldOffer.version), e => e.status === 409);
  await assert.rejects(service.respondToOffer(order.id, users[1].id, true, offer.version), e => e.status === 403);
  const race = await Promise.allSettled([service.respondToOffer(order.id, users[0].id, true, offer.version), service.cancelOrder(order.id, users[0].id, false)]);
  assert.equal(race.filter(x => x.status === 'fulfilled').length, 1);
  assert.equal(await prisma.orderEvent.count({ where: { orderId: order.id } }), 4);
  await prisma.product.update({ where: { id: product.id }, data: { name: 'Edited name', originalPrice: 999999 } });
  const saved = (await service.getUserOrders(users[0].id)).find(o => o.id === order.id);
  assert.equal(saved.items[0].product.name, 'Review chair'); assert.equal(saved.items[0].unitPrice, 90000);
  const paymentOrder = await service.createOrder(input);
  const paymentOffer = await service.createOffer(paymentOrder.id, { shipping: 25000, delivery: '3 hari kerja' });
  await assert.rejects(service.recordPayment(paymentOrder.id, users[2].id, { amount: 295000, method: 'COD', note: '', expectedVersion: paymentOffer.version }), e => e.status === 400);
  const approved = await service.respondToOffer(paymentOrder.id, users[0].id, true, paymentOffer.version);
  await assert.rejects(service.recordPayment(paymentOrder.id, users[2].id, { amount: 1, method: 'COD', note: '', expectedVersion: approved.version }), e => e.status === 400);
  const payment = { amount: paymentOrder.total + 25000, method: 'Bank Transfer', note: 'Isolated receipt reference', expectedVersion: approved.version };
  const paymentRace = await Promise.allSettled([service.recordPayment(paymentOrder.id, users[2].id, payment), service.recordPayment(paymentOrder.id, users[2].id, payment)]);
  assert.equal(paymentRace.filter(x => x.status === 'fulfilled').length, 1);
  const paid = (await service.getAdminOrders()).find(o => o.id === paymentOrder.id);
  assert.equal(paid.paymentAmount, payment.amount);
  assert.ok(paid.paymentRecordedAt);
  await assert.rejects(service.updateStatus(paymentOrder.id, 'Cancelled'), e => e.status === 400);
  await service.updateStatus(paymentOrder.id, 'On the Way');
  const delivered = await service.updateStatus(paymentOrder.id, 'Delivered');
  assert.equal(delivered.status, 'Delivered');
  await assert.rejects(service.updateStatus(paymentOrder.id, 'Processing'), e => e.status === 400);
  // Keep a fresh two-item offer for browser verification.
  await prisma.product.update({ where: { id: product.id }, data: { name: 'Review chair', originalPrice: 100000 } });
  const browserOrder = await service.createOrder(input);
  await service.createOffer(browserOrder.id, { shipping: 25000, delivery: '3-5 hari kerja', note: 'Data lokal untuk pengujian.' });
  const { signToken } = require('../lib/auth.ts');
  fs.writeFileSync('.tmp-review-fixtures.json', JSON.stringify({ customerToken: signToken({ id: users[0].id, email: users[0].email }), ownerToken: signToken({ id: users[2].id, email: users[2].email }), orderId: browserOrder.id, customerId: users[0].id }));
  await prisma.$disconnect();
  console.log('PASS: migration, address ownership/default concurrency, offer approval/version, racing transitions, snapshots, recipient phone actual events, manual payment validation/race and delivery.');
  console.log('Isolated preview: http://localhost:4180. Local test login: customer1@example.com / Review123!');
  console.log(`Stop database: & '${ctl}' stop -D '${data}'`);
  if (process.argv.includes('--test-only')) return;
  const server = cp.spawn(process.execPath, ['node_modules/next/dist/bin/next', process.argv.includes('--production') ? 'start' : 'dev', '-p', '4180'], { env: process.env, stdio: 'inherit', windowsHide: true });
  process.on('SIGINT', () => { server.kill(); process.exit(0); });
}
main().catch(error => { console.error(error.message); process.exit(1); });
