const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

// Execute the real TypeScript services against an isolated in-memory adapter.
// No network, credentials, or production data are used by this suite.
process.env.OWNER_EMAIL = 'owner@example.com';
process.env.JWT_SECRET = 'test-secret-for-isolated-store-tests';
process.env.GOOGLE_CLIENT_ID = 'test-client';
process.env.DATABASE_URL = 'unused-in-memory-adapter';
const database = { products: [], order: { id: 'test', status: 'Accepted' }, created: null };
const prisma = {
  review: { groupBy: async () => [], aggregate: async () => ({ _avg: { rating: null }, _count: { rating: 0 } }) },
  product: {
    findMany: async ({ where } = {}) => where ? database.products.filter(p => where.id.in.includes(p.id)) : database.products,
    findUnique: async ({ where }) => database.products.find(p => p.id === where.id),
    create: async ({ data }) => { const p = { id: 101, ...data }; database.products.push(p); return p; },
    update: async ({ where, data }) => { const p = database.products.find(p => p.id === where.id); Object.assign(p, data); return p; },
    delete: async ({ where }) => { database.products = database.products.filter(p => p.id !== where.id); },
  },
  order: {
    create: async ({ data }) => { database.created = data; return data; },
    findUnique: async () => database.order,
    update: async ({ data }) => Object.assign(database.order, data),
  },
  orderItem: { count: async () => 0 },
  user: { update: async () => ({}), findUnique: async () => null },
};
const originalLoad = Module._load;
Module._load = function (name, parent, isMain) {
  if (name === '@/lib/prisma') return { prisma };
  if (name === '@/lib/mailer') return { sendPasswordResetEmail: async () => {} };
  if (name === 'google-auth-library') return { OAuth2Client: class { async getTokenInfo() { return { aud: 'wrong-client' }; } } };
  if (name.startsWith('@/')) name = path.join(__dirname, '..', name.slice(2)) + '.ts';
  return originalLoad.call(this, name, parent, isMain);
};
require.extensions['.ts'] = function (mod, filename) {
  mod._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText, filename);
};
const { ProductService } = require('../services/ProductService.ts');
const { OrderService } = require('../services/OrderService.ts');
const { AuthService } = require('../services/AuthService.ts');
const { signToken, verifyToken, requireAdmin } = require('../lib/auth.ts');
const { createProductSchema } = require('../lib/schemas.ts');
const product = { id: 1, name: 'Oak chair', category: 'Chair', originalPrice: 1250001, discount: 10, colors: ['Oak', 'Walnut'], inStock: true, img: '/chair.png', gallery: [] };

test('only configured owner receives admin access, regardless of a legacy role claim', () => {
  const customer = verifyToken(signToken({ id: 1, email: 'admin-customer@example.com', isAdmin: true }));
  assert.equal(customer.isAdmin, false);
  assert.equal(requireAdmin(customer).status, 403);
  assert.equal(verifyToken(signToken({ id: 2, email: 'owner@example.com', isAdmin: false })).isAdmin, true);
});
test('owner identity cannot be registered or logged in with an unverified password', async () => {
  const service = new AuthService();
  await assert.rejects(service.register({ name: 'Owner', email: 'owner@example.com', password: 'anything' }), /Google/);
  await assert.rejects(service.login('owner@example.com', 'anything'), /Google/);
  await assert.rejects(service.loginWithGoogle(undefined, 'untrusted-token'), /bukan untuk aplikasi/);
});
test('an empty catalog stays empty instead of reappearing with seeded sample products', async () => {
  database.products = [];
  assert.deepEqual(await new ProductService().getAll(), []);
});
test('product create, gallery edit, and delete preserve owner changes without invented reviews', async () => {
  database.products = [];
  const service = new ProductService();
  const p = await service.create({ ...product, rating: 5, reviews: 100 });
  assert.equal(p.rating, 0); assert.equal(p.reviews, 0);
  const updated = await service.update(p.id, { gallery: ['/new-photo.jpg'], inStock: false });
  assert.deepEqual(updated.gallery, ['/new-photo.jpg']); assert.equal(updated.inStock, false);
  await service.delete(p.id);
  assert.deepEqual(await service.getAll(), []);
});
test('product API rejects unsafe images and accepts compressed photos', () => {
  assert.equal(createProductSchema.safeParse({ ...product, img: 'javascript:alert(1)' }).success, false);
  assert.equal(createProductSchema.safeParse({ ...product, img: 'data:image/svg+xml;base64,abcd' }).success, false);
  assert.equal(createProductSchema.safeParse({ ...product, img: 'data:image/jpeg;base64,abcd' }).success, true);
  assert.equal(createProductSchema.safeParse({ ...product, inStock: 'false' }).success, false);
});
test('orders use catalog prices and accept multiple color variants of the same product', async () => {
  database.products = [{ ...product }];
  const data = { customerName: 'Customer', email: 'customer@example.com', address: 'Test address', phone: '081234567890', total: 1, paymentMethod: 'Credit Card', items: [{ productId: 1, qty: 2, color: 'Oak' }, { productId: 1, qty: 1, color: 'Walnut' }] };
  await new OrderService().createOrder(data);
  assert.equal(database.created.total, Math.round(product.originalPrice * .9) * 3);
  assert.equal(database.created.paymentMethod, 'Konfirmasi pemilik');
  assert.equal(database.created.status, 'Accepted');
  assert.match(database.created.address, /081234567890/);
  await assert.rejects(new OrderService().createOrder({ ...data, items: [{ productId: 1, qty: 1, color: 'Invalid' }] }), /warna/);
  database.products[0].inStock = false;
  await assert.rejects(new OrderService().createOrder(data), /out of stock/);
});
test('orders cannot skip confirmation or change after completion', async () => {
  const service = new OrderService(); database.order = { id: 'test', status: 'Accepted' };
  await assert.rejects(service.updateStatus('test', 'Delivered'), /alur pesanan/);
  await service.updateStatus('test', 'Processing'); await service.updateStatus('test', 'On the Way'); await service.updateStatus('test', 'Delivered');
  await assert.rejects(service.updateStatus('test', 'Cancelled'), /alur pesanan/);
});
test('HTTP routes reject anonymous orders and customer attempts to write the catalog', async () => {
  const orderRoute = require('../app/api/orders/route.ts');
  const productRoute = require('../app/api/products/route.ts');
  const anonymous = { headers: new Headers(), json: async () => ({}) };
  assert.equal((await orderRoute.POST(anonymous)).status, 401);
  const token = signToken({ id: 3, email: 'customer@example.com', isAdmin: true });
  const customer = { ...anonymous, headers: new Headers({ Authorization: `Bearer ${token}` }) };
  assert.equal((await productRoute.POST(customer)).status, 403);
});
test('reviews cannot be written for another customer order', async () => {
  const reviewRoute = require('../app/api/reviews/route.ts');
  database.order = { id: 'test', status: 'Delivered', userId: 50, items: [{ productId: 1 }] };
  const token = signToken({ id: 3, email: 'customer@example.com', isAdmin: false });
  const request = { headers: new Headers({ Authorization: `Bearer ${token}` }), json: async () => ({ productId: 1, orderId: 'test', rating: 5 }) };
  assert.equal((await reviewRoute.POST(request)).status, 403);
});
