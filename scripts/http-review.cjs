// Run only against the isolated preview started by local-review.cjs.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const jwt = require('jsonwebtoken');
const fixture = JSON.parse(fs.readFileSync('.tmp-review-fixtures.json', 'utf8'));
const customer2 = jwt.sign({ id: 2, email: 'customer2@example.com', isAdmin: false }, 'isolated-local-review-secret-not-for-deployment', { expiresIn: '1h' });
let checks = 0;
async function request(path, token, method = 'GET', body, expected = 200) {
  const res = await fetch('http://127.0.0.1:4180/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
  const data = await res.json();
  assert.equal(res.status, expected, `${method} ${path}: ${JSON.stringify(data)}`);
  checks++; return data;
}
async function main() {
  const customer = fixture.customerToken; const owner = fixture.ownerToken;
  await request('/orders', null, 'GET', undefined, 401);
  await request('/orders', customer, 'GET', undefined, 403);
  await request('/users/2/orders', customer, 'GET', undefined, 403);
  const address = await request('/users/2/addresses', customer2, 'POST', { name: 'HTTP test', phone: '08123456789', street: 'Isolated HTTP address', city: 'Jakarta', zip: '12345', country: 'Indonesia' }, 201);
  await request(`/users/${fixture.customerId}/addresses/${address.id}`, customer, 'PUT', { street: 'Intrusion' }, 404);
  await request(`/users/${fixture.customerId}/addresses/${address.id}`, customer, 'DELETE', undefined, 404);
  const own = await request('/users/2/addresses', customer2);
  assert.equal(own.find(a => a.id === address.id).street, 'Isolated HTTP address');
  const order = await request('/orders', customer, 'POST', { customerName: 'HTTP recipient', email: 'customer1@example.com', phone: '08123456789', address: 'Isolated HTTP delivery', total: 1, paymentMethod: 'Untrusted', items: [{ productId: 901, qty: 1, color: 'Oak' }] }, 201);
  assert.equal(order.total, 90000);
  const url = '/orders/' + encodeURIComponent(order.id);
  await request(url + '/status', owner, 'PUT', { status: 'Processing' }, 400);
  await request(url + '/offer', customer, 'PUT', { shipping: 0, delivery: '3 hari kerja' }, 403);
  const old = await request(url + '/offer', owner, 'PUT', { shipping: 10000, delivery: '3 hari kerja' });
  const latest = await request(url + '/offer', owner, 'PUT', { shipping: 20000, delivery: '5 hari kerja' });
  await request(url + '/offer-response', customer, 'PUT', { accept: true }, 400);
  await request(url + '/offer-response', customer2, 'PUT', { accept: true, expectedVersion: latest.version }, 403);
  await request(url + '/offer-response', customer, 'PUT', { accept: true, expectedVersion: old.version }, 409);
  const approved = await request(url + '/offer-response', customer, 'PUT', { accept: true, expectedVersion: latest.version });
  assert.equal(approved.status, 'Processing'); assert.equal(approved.offerShipping, 20000);
  await request(url + '/cancel', customer, 'PUT', undefined, 400);
  const payment = { amount: 110000, method: 'Bank Transfer', note: 'HTTP test reference', expectedVersion: approved.version };
  await request(url + '/payment', customer, 'PUT', payment, 403);
  await request(url + '/payment', owner, 'PUT', { ...payment, amount: 1 }, 400);
  const paid = await request(url + '/payment', owner, 'PUT', payment);
  assert.equal(paid.paymentAmount, 110000);
  await request(url + '/payment', owner, 'PUT', { ...payment, expectedVersion: paid.version }, 409);
  await request(url + '/cancel', owner, 'PUT', undefined, 400);
  await request(url + '/status', owner, 'PUT', { status: 'On the Way' });
  await request(url + '/status', owner, 'PUT', { status: 'Delivered' });
  const saved = (await request(`/users/${fixture.customerId}/orders`, customer)).find(o => o.id === order.id);
  assert.equal(saved.status, 'Delivered'); assert.equal(saved.items[0].unitPrice, 90000);
  assert.equal(saved.phone, '08123456789'); assert.equal(saved.paymentAmount, 110000);
  assert.ok(saved.events.every(e => !Number.isNaN(new Date(e.occurredAt).getTime())));
  console.log(`PASS: ${checks} HTTP checks across customer, second customer, and owner; full request → quote → approval → manual payment → dispatch → delivery.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
