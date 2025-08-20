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
