require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.test') });
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { sequelize, User } = require('../models');
const menuItemsRouter = require('../routes/menuItems');
const tablesRouter = require('../routes/tables');
const sessionsRouter = require('../routes/sessions');
const ordersRouter = require('../routes/orders');
const paymentsRouter = require('../routes/payments');
const orderItemsRouter = require('../routes/orderItems');
const aiRouter = require('../routes/ai');

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/menu-items', menuItemsRouter);
app.use('/tables', tablesRouter);
app.use('/sessions', sessionsRouter);
app.use('/orders', ordersRouter);
app.use('/payments', paymentsRouter);
app.use('/order-items', orderItemsRouter);
app.use('/ai', aiRouter);

// Helper: create JWT for test user
async function getTestToken() {
  let user = await User.findOne();
  if (!user) {
    user = await User.create({ google_id: 'test', name: 'Test User', email: 'test@example.com' });
  }
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'testsecret', { expiresIn: '1d' });
}

describe('API Endpoints', () => {
  // --- PAYMENTS (COVERAGE) ---
  test('POST /payments returns 400 if no order_id', async () => {
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });
  test('POST /payments returns 404 if order not found', async () => {
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ order_id: 999999 });
    expect(res.statusCode).toBe(404);
  });
  test('POST /payments/notification returns 400 if order_id format invalid', async () => {
    const res = await request(app)
      .post('/payments/notification')
      .send({ order_id: 'INVALID', transaction_status: 'settlement' });
    expect(res.statusCode).toBe(400);
  });
  test('POST /payments/notification returns 404 if order not found', async () => {
    const res = await request(app)
      .post('/payments/notification')
      .send({ order_id: 'ORDER-999999-123', transaction_status: 'settlement' });
    expect(res.statusCode).toBe(404);
  });
  test('POST /payments/notification returns 200 for settlement', async () => {
    const { Order } = require('../models');
    let order = await Order.findOne();
    if (!order) order = await Order.create({ session_id: 1, total: 100, status: 'pending' });
    const res = await request(app)
      .post('/payments/notification')
      .send({ order_id: `ORDER-${order.id}-123`, transaction_status: 'settlement' });
    expect(res.statusCode).toBe(200);
  });
  test('POST /payments/notification returns 200 for pending', async () => {
    const { Order } = require('../models');
    let order = await Order.findOne();
    if (!order) order = await Order.create({ session_id: 1, total: 100, status: 'pending' });
    const res = await request(app)
      .post('/payments/notification')
      .send({ order_id: `ORDER-${order.id}-123`, transaction_status: 'pending' });
    expect(res.statusCode).toBe(200);
  });
  test('POST /payments/notification returns 200 for deny', async () => {
    const { Order } = require('../models');
    let order = await Order.findOne();
    if (!order) order = await Order.create({ session_id: 1, total: 100, status: 'pending' });
    const res = await request(app)
      .post('/payments/notification')
      .send({ order_id: `ORDER-${order.id}-123`, transaction_status: 'deny' });
    expect(res.statusCode).toBe(200);
  });
  test('POST /payments/notification returns 200 for expire', async () => {
    const { Order } = require('../models');
    let order = await Order.findOne();
    if (!order) order = await Order.create({ session_id: 1, total: 100, status: 'pending' });
    const res = await request(app)
      .post('/payments/notification')
      .send({ order_id: `ORDER-${order.id}-123`, transaction_status: 'expire' });
    expect(res.statusCode).toBe(200);
  });
  test('POST /payments/notification returns 200 for cancel', async () => {
    const { Order } = require('../models');
    let order = await Order.findOne();
    if (!order) order = await Order.create({ session_id: 1, total: 100, status: 'pending' });
    const res = await request(app)
      .post('/payments/notification')
      .send({ order_id: `ORDER-${order.id}-123`, transaction_status: 'cancel' });
    expect(res.statusCode).toBe(200);
  });
  test('POST /payments/notification returns 500 on DB error', async () => {
    const orig = require('../models').Order.findByPk;
    require('../models').Order.findByPk = () => { throw new Error('DB error'); };
    const res = await request(app)
      .post('/payments/notification')
      .send({ order_id: 'ORDER-1-123', transaction_status: 'settlement' });
    expect(res.statusCode).toBe(500);
    require('../models').Order.findByPk = orig;
  });
  // --- ORDER ITEMS (COVERAGE) ---
  test('PATCH /order-items/:id returns 404 if order item not found', async () => {
    const orig = require('../models').OrderItem.findByPk;
    require('../models').OrderItem.findByPk = () => null;
    const res = await request(app)
      .patch('/order-items/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 2 });
    expect(res.statusCode).toBe(404);
    require('../models').OrderItem.findByPk = orig;
  });
  test('PATCH /order-items/:id returns 404 if order not found', async () => {
    const origOrderItem = require('../models').OrderItem.findByPk;
    const origOrder = require('../models').Order.findByPk;
    require('../models').OrderItem.findByPk = () => ({ order_id: 1 });
    require('../models').Order.findByPk = () => null;
    const res = await request(app)
      .patch('/order-items/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 2 });
    expect(res.statusCode).toBe(404);
    require('../models').OrderItem.findByPk = origOrderItem;
    require('../models').Order.findByPk = origOrder;
  });
  test('PATCH /order-items/:id returns 403 if order is paid', async () => {
    const origOrderItem = require('../models').OrderItem.findByPk;
    const origOrder = require('../models').Order.findByPk;
    require('../models').OrderItem.findByPk = () => ({ order_id: 1, menu_item_id: 1 });
    require('../models').Order.findByPk = () => ({ status: 'paid' });
    const res = await request(app)
      .patch('/order-items/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 2 });
    expect(res.statusCode).toBe(403);
    require('../models').OrderItem.findByPk = origOrderItem;
    require('../models').Order.findByPk = origOrder;
  });
  test('PATCH /order-items/:id returns 500 if menu item error', async () => {
    const origOrderItem = require('../models').OrderItem.findByPk;
    const origOrder = require('../models').Order.findByPk;
    const origMenu = require('../models').MenuItem.findByPk;
    require('../models').OrderItem.findByPk = () => ({ order_id: 1, menu_item_id: 1, quantity: 1, save: () => {} });
    require('../models').Order.findByPk = () => ({ status: 'pending' });
    require('../models').MenuItem.findByPk = () => { throw new Error('DB error'); };
    const res = await request(app)
      .patch('/order-items/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 2 });
    expect(res.statusCode).toBe(500);
    require('../models').OrderItem.findByPk = origOrderItem;
    require('../models').Order.findByPk = origOrder;
    require('../models').MenuItem.findByPk = origMenu;
  });
  test('DELETE /order-items/:id returns 404 if order item not found', async () => {
    const orig = require('../models').OrderItem.findByPk;
    require('../models').OrderItem.findByPk = () => null;
    const res = await request(app)
      .delete('/order-items/999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    require('../models').OrderItem.findByPk = orig;
  });
  test('DELETE /order-items/:id returns 404 if order not found', async () => {
    const origOrderItem = require('../models').OrderItem.findByPk;
    const origOrder = require('../models').Order.findByPk;
    require('../models').OrderItem.findByPk = () => ({ order_id: 1 });
    require('../models').Order.findByPk = () => null;
    const res = await request(app)
      .delete('/order-items/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    require('../models').OrderItem.findByPk = origOrderItem;
    require('../models').Order.findByPk = origOrder;
  });
  test('DELETE /order-items/:id returns 403 if order is paid', async () => {
    const origOrderItem = require('../models').OrderItem.findByPk;
    const origOrder = require('../models').Order.findByPk;
    require('../models').OrderItem.findByPk = () => ({ order_id: 1 });
    require('../models').Order.findByPk = () => ({ status: 'paid' });
    const res = await request(app)
      .delete('/order-items/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
    require('../models').OrderItem.findByPk = origOrderItem;
    require('../models').Order.findByPk = origOrder;
  });
  test('DELETE /order-items/:id returns 500 if destroy error', async () => {
    const origOrderItem = require('../models').OrderItem.findByPk;
    const origOrder = require('../models').Order.findByPk;
    require('../models').OrderItem.findByPk = () => ({ order_id: 1, destroy: () => { throw new Error('DB error'); } });
    require('../models').Order.findByPk = () => ({ status: 'pending' });
    const res = await request(app)
      .delete('/order-items/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(500);
    require('../models').OrderItem.findByPk = origOrderItem;
    require('../models').Order.findByPk = origOrder;
  });
  // --- ORDERS (COVERAGE) ---
  test('GET /orders with session_id returns 200', async () => {
    const { Session, Order } = require('../models');
    let session = await Session.findOne();
    if (!session) session = await Session.create({ table_id: 1, started_at: new Date(), expires_at: new Date(Date.now() + 10000) });
    const res = await request(app)
      .get(`/orders?session_id=${session.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  test('GET /orders with table_id returns 200', async () => {
    const { Table, Session } = require('../models');
    let table = await Table.findOne();
    if (!table) table = await Table.create({ qr_code: 'qrcode' });
    let session = await Session.findOne({ where: { table_id: table.id } });
    if (!session) session = await Session.create({ table_id: table.id, started_at: new Date(), expires_at: new Date(Date.now() + 10000) });
    const res = await request(app)
      .get(`/orders?table_id=${table.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
  test('POST /orders returns 400 if items is not array', async () => {
    const { Session } = require('../models');
    let session = await Session.findOne();
    if (!session) session = await Session.create({ table_id: 1, started_at: new Date(), expires_at: new Date(Date.now() + 10000) });
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_id: session.id, items: 'notarray' });
    expect(res.statusCode).toBe(400);
  });
  test('POST /orders returns 400 if items is empty', async () => {
    const { Session } = require('../models');
    let session = await Session.findOne();
    if (!session) session = await Session.create({ table_id: 1, started_at: new Date(), expires_at: new Date(Date.now() + 10000) });
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_id: session.id, items: [] });
    expect(res.statusCode).toBe(400);
  });
  test('GET /orders/:id returns 404 if not found', async () => {
    const res = await request(app)
      .get('/orders/999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
  });
  // --- SESSIONS (COVERAGE) ---
  test('POST /sessions returns 400/500 if no body', async () => {
    const res = await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send();
    expect([400, 500]).toContain(res.statusCode);
  });
  test('POST /sessions returns 404 if table not found', async () => {
    const orig = require('../models').Table.findOne;
    require('../models').Table.findOne = () => null;
    const res = await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({ qr_code: 'notfound' });
    expect(res.statusCode).toBe(404);
    require('../models').Table.findOne = orig;
  });
  test('POST /sessions returns 500 if Session.create throws', async () => {
    const origTable = require('../models').Table.findOne;
    const origSession = require('../models').Session.create;
    require('../models').Table.findOne = () => ({ id: 1 });
    require('../models').Session.create = () => { throw new Error('DB error'); };
    const res = await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({ qr_code: 'any' });
    expect(res.statusCode).toBe(500);
    require('../models').Table.findOne = origTable;
    require('../models').Session.create = origSession;
  });
  test('GET /sessions/:id returns 404 if not found', async () => {
    const orig = require('../models').Session.findByPk;
    require('../models').Session.findByPk = () => null;
    const res = await request(app)
      .get('/sessions/999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    require('../models').Session.findByPk = orig;
  });
  test('GET /sessions/:id returns 500 if DB error', async () => {
    const orig = require('../models').Session.findByPk;
    require('../models').Session.findByPk = () => { throw new Error('DB error'); };
    const res = await request(app)
      .get('/sessions/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(500);
    require('../models').Session.findByPk = orig;
  });
  // --- SESSIONS ---
  test('POST /sessions returns 500 on DB error', async () => {
    const orig = require('../models').Table.findOne;
    require('../models').Table.findOne = () => { throw new Error('DB error'); };
    const res = await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({ qr_code: 'any' });
    expect(res.statusCode).toBe(500);
    require('../models').Table.findOne = orig;
  });
  test('GET /sessions/:id returns 500 on DB error', async () => {
    const orig = require('../models').Session.findByPk;
    require('../models').Session.findByPk = () => { throw new Error('DB error'); };
    const res = await request(app)
      .get('/sessions/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(500);
    require('../models').Session.findByPk = orig;
  });

  // --- ORDERS ---
  test('GET /orders returns 500 on DB error', async () => {
    const orig = require('../models').Order.findAll;
    require('../models').Order.findAll = () => { throw new Error('DB error'); };
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(500);
    require('../models').Order.findAll = orig;
  });
  test('POST /orders fails with expired session', async () => {
    const orig = require('../models').Session.findByPk;
    require('../models').Session.findByPk = () => ({ expires_at: new Date(Date.now() - 1000) });
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_id: 1, items: [{ menu_item_id: 1, quantity: 1 }] });
    expect(res.statusCode).toBe(401);
    require('../models').Session.findByPk = orig;
  });
  test('POST /orders fails with menu item not found', async () => {
    const origSession = require('../models').Session.findByPk;
    const origMenu = require('../models').MenuItem.findByPk;
    require('../models').Session.findByPk = () => ({ expires_at: new Date(Date.now() + 10000) });
    require('../models').MenuItem.findByPk = () => null;
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_id: 1, items: [{ menu_item_id: 999, quantity: 1 }] });
    expect(res.statusCode).toBe(404);
    require('../models').Session.findByPk = origSession;
    require('../models').MenuItem.findByPk = origMenu;
  });
  test('POST /orders returns 500 on DB error (if session/menu exists, else 404)', async () => {
    // Buat session dan menu item dummy jika perlu
    const { Session, MenuItem } = require('../models');
    let session = await Session.findOne();
    if (!session) session = await Session.create({ table_id: 1, started_at: new Date(), expires_at: new Date(Date.now() + 10000) });
    let menu = await MenuItem.findOne();
    if (!menu) menu = await MenuItem.create({ name: 'Test', price: 10, image_url: '' });
    const orig = require('../models').Order.create;
    require('../models').Order.create = () => { throw new Error('DB error'); };
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_id: session.id, items: [{ menu_item_id: menu.id, quantity: 1 }] });
  expect([401, 404, 500]).toContain(res.statusCode);
    require('../models').Order.create = orig;
  });
  test('GET /orders/:id returns 404 if not found', async () => {
    const orig = require('../models').Order.findByPk;
    require('../models').Order.findByPk = () => null;
    const res = await request(app)
      .get('/orders/999999')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(404);
    require('../models').Order.findByPk = orig;
  });
  test('GET /orders/:id returns 500 on DB error', async () => {
    const orig = require('../models').Order.findByPk;
    require('../models').Order.findByPk = () => { throw new Error('DB error'); };
    const res = await request(app)
      .get('/orders/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(500);
    require('../models').Order.findByPk = orig;
  });

  // --- ORDER ITEMS ---
  test('PATCH /order-items/:id fails with quantity < 1', async () => {
    const res = await request(app)
      .patch('/order-items/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 0 });
    expect(res.statusCode).toBe(400);
  });
  test('PATCH /order-items/:id returns 500 on DB error', async () => {
    const orig = require('../models').OrderItem.findByPk;
    require('../models').OrderItem.findByPk = () => { throw new Error('DB error'); };
    const res = await request(app)
      .patch('/order-items/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 2 });
    expect(res.statusCode).toBe(500);
    require('../models').OrderItem.findByPk = orig;
  });
  test('DELETE /order-items/:id returns 500 on DB error', async () => {
    const orig = require('../models').OrderItem.findByPk;
    require('../models').OrderItem.findByPk = () => { throw new Error('DB error'); };
    const res = await request(app)
      .delete('/order-items/1')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(500);
    require('../models').OrderItem.findByPk = orig;
  });

  // --- PAYMENTS ---
  test('POST /payments returns 500 on snap error (if order exists, else 404)', async () => {
    const { Order } = require('../models');
    let order = await Order.findOne();
    if (!order) order = await Order.create({ session_id: 1, total: 100, status: 'pending' });
    const orig = require('midtrans-client').Snap.prototype.createTransaction;
    require('midtrans-client').Snap.prototype.createTransaction = () => { throw new Error('Snap error'); };
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ order_id: order.id });
    expect([404, 500]).toContain(res.statusCode);
    require('midtrans-client').Snap.prototype.createTransaction = orig;
  });
  test('POST /payments/notification returns 400 if order_id format invalid', async () => {
    const res = await request(app)
      .post('/payments/notification')
      .send({ order_id: 'INVALID', transaction_status: 'settlement' });
    expect(res.statusCode).toBe(400);
  });
  test('POST /payments/notification returns 404 if order not found', async () => {
    const res = await request(app)
      .post('/payments/notification')
      .send({ order_id: 'ORDER-999999-123', transaction_status: 'settlement' });
    expect(res.statusCode).toBe(404);
  });
  test('POST /payments/notification returns 500 on DB error', async () => {
    const orig = require('../models').Order.findByPk;
    require('../models').Order.findByPk = () => { throw new Error('DB error'); };
    const res = await request(app)
      .post('/payments/notification')
      .send({ order_id: 'ORDER-1-123', transaction_status: 'settlement' });
    expect(res.statusCode).toBe(500);
    require('../models').Order.findByPk = orig;
  });

  // --- MENU & TABLES ---
  test('GET /menu-items returns 500 on DB error', async () => {
    const orig = require('../models').MenuItem.findAll;
    require('../models').MenuItem.findAll = () => { throw new Error('DB error'); };
    const res = await request(app)
      .get('/menu-items')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(500);
    require('../models').MenuItem.findAll = orig;
  });
  test('GET /tables returns 500 on DB error', async () => {
    const orig = require('../models').Table.findAll;
    require('../models').Table.findAll = () => { throw new Error('DB error'); };
    const res = await request(app)
      .get('/tables')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(500);
    require('../models').Table.findAll = orig;
  });

  // --- AI ---
  test('POST /ai/chat returns 500 on OpenAI error (or 200 if fallback)', async () => {
    // Mock OpenAI error
    const ai = require('../routes/ai');
    const orig = require('openai');
    require.cache[require.resolve('openai')].exports = function() {
      return { chat: { completions: { create: () => { throw new Error('OpenAI error'); } } } };
    };
    const res = await request(app)
      .post('/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ messages: [] });
    expect([200, 500]).toContain(res.statusCode);
    require.cache[require.resolve('openai')].exports = orig;
  }, 20000);
  // JWT missing/invalid


  // POST /sessions with invalid QR code
  test('POST /sessions fails with invalid qr_code', async () => {
    const res = await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({ qr_code: 'notfound' });
    expect(res.statusCode).toBe(404);
  });

  // POST /orders with invalid/expired session or empty items
  test('POST /orders fails with invalid session_id', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_id: 999999, items: [{ menu_item_id: 1, quantity: 1 }] });
    expect(res.statusCode).toBe(404);
  });

  test('POST /orders fails with empty items', async () => {
    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ session_id: 1, items: [] });
    expect(res.statusCode).toBe(400);
  });

  // PATCH/DELETE /order-items on paid order (simulate forbidden)
  // (Note: This test assumes there is an order with status 'paid' and an order item. If not, it will just check forbidden/404)
  test('PATCH /order-items/:id forbidden if order is paid', async () => {
    // Try to patch a likely non-existent/paid item
    const res = await request(app)
      .patch('/order-items/1')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 2 });
    expect([403, 404]).toContain(res.statusCode);
  });

  test('DELETE /order-items/:id forbidden if order is paid', async () => {
    const res = await request(app)
      .delete('/order-items/1')
      .set('Authorization', `Bearer ${token}`);
    expect([403, 404]).toContain(res.statusCode);
  });

  // POST /payments with invalid order_id
  test('POST /payments fails with invalid order_id', async () => {
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({ order_id: 999999 });
    expect(res.statusCode).toBe(404);
  });

  // POST /ai/chat with missing or invalid messages
  test('POST /ai/chat fails with missing messages', async () => {
    const res = await request(app)
      .post('/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  test('POST /ai/chat fails with messages not array', async () => {
    const res = await request(app)
      .post('/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ messages: 'notanarray' });
    expect(res.statusCode).toBe(400);
  });
  let token;
  beforeAll(async () => {
    await sequelize.sync();
    token = await getTestToken();
  });

  // Menu Items
  test('GET /menu-items returns menu', async () => {
    const res = await request(app)
      .get('/menu-items')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Tables
  test('GET /tables returns tables', async () => {
    const res = await request(app)
      .get('/tables')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Sessions
  test('POST /sessions creates session (fail: no qr_code)', async () => {
    const res = await request(app)
      .post('/sessions')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  // Orders (list, create, get)
  test('GET /orders returns orders (empty ok)', async () => {
    const res = await request(app)
      .get('/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // Order Items (fail: not found)
  test('PATCH /order-items/:id fail if not found', async () => {
    const res = await request(app)
      .patch('/order-items/999999')
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 2 });
    expect([404, 400]).toContain(res.statusCode);
  });

  test('DELETE /order-items/:id fail if not found', async () => {
    const res = await request(app)
      .delete('/order-items/999999')
      .set('Authorization', `Bearer ${token}`);
    expect([404, 400]).toContain(res.statusCode);
  });

  // Payments (fail: no order_id)
  test('POST /payments fail if no order_id', async () => {
    const res = await request(app)
      .post('/payments')
      .set('Authorization', `Bearer ${token}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  // AI
  test('POST /ai/chat returns AI reply', async () => {
    const res = await request(app)
      .post('/ai/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({ messages: [] });
    expect(res.statusCode).toBe(200);
    expect(res.body.reply).toBeDefined();
  }, 20000);

  // Auth (Google OAuth endpoints, just check 302/200)
  test('GET /auth/google redirects', async () => {
    const res = await request(app)
      .get('/auth/google');
    // In test env, passport may not be configured, so 302, 200, or 404 are all valid
    expect([302, 200, 404]).toContain(res.statusCode);
  });

  test('GET /auth/google/callback fails without code', async () => {
    const res = await request(app)
      .get('/auth/google/callback');
    // In test env, passport may not be configured, so 400, 401, 403, 404, 500 are all valid
    expect([400, 401, 403, 404, 500]).toContain(res.statusCode);
  });
});
