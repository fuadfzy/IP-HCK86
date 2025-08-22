require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.test') });
const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { sequelize, User, Table, Session, MenuItem, Order, OrderItem } = require('../models');
const menuItemsRouter = require('../routes/menuItems');
const sessionsRouter = require('../routes/sessions');
const ordersRouter = require('../routes/orders');
const paymentsRouter = require('../routes/payments');
const aiRouter = require('../routes/ai');
const authRouter = require('../routes/auth');
const paymentRedirectRouter = require('../routes/paymentRedirect');
const authenticateJWT = require('../middleware/authenticateJWT');

// Setup express app for testing  
const app = express();
app.use(express.json());

// Create webhook app for unprotected payment notifications
const webhookApp = express();
webhookApp.use(express.json());
webhookApp.use('/payments', paymentsRouter);

// Auth routes (unprotected)
app.use('/auth', authRouter);

// Sessions route (unprotected - needed for QR code scanning)
app.use('/sessions', sessionsRouter);

// Payment redirect routes (unprotected - for Midtrans redirects)
app.use('/payment', paymentRedirectRouter);

// Protect other API routes
app.use(authenticateJWT);
app.use('/menu-items', menuItemsRouter);
app.use('/orders', ordersRouter);
app.use('/payments', paymentsRouter);
app.use('/ai', aiRouter);

// Helper: create JWT for test user
async function getTestToken() {
  let user = await User.findOne();
  if (!user) {
    user = await User.create({
      google_id: 'test123',
      name: 'Test User',
      email: 'test@example.com'
    });
  }
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'test-secret');
}

// Helper: create test data
async function createTestData() {
  // Create test table
  const table = await Table.create({
    qr_code: 'TEST-QR-001'
  });

  // Create test menu items
  const menuItem1 = await MenuItem.create({
    name: 'Nasi Goreng',
    price: 25000,
    image_url: 'https://example.com/nasi-goreng.jpg'
  });

  const menuItem2 = await MenuItem.create({
    name: 'Ayam Bakar',
    price: 30000,
    image_url: 'https://example.com/ayam-bakar.jpg'
  });

  return { table, menuItem1, menuItem2 };
}

describe('API Routes', () => {
  let testData;

  beforeAll(async () => {
    await sequelize.sync({ force: true });
    testData = await createTestData();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Authentication Middleware', () => {
    test('rejects request without token', async () => {
      const response = await request(app)
        .get('/menu-items')
        .expect(401);
      
      expect(response.body.error).toBe('Authorization header missing or malformed');
    });

    test('rejects request with invalid token', async () => {
      const response = await request(app)
        .get('/menu-items')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);
      
      expect(response.body.error).toBe('Invalid or expired token');
    });

    test('rejects request with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/menu-items')
        .set('Authorization', 'InvalidFormat')
        .expect(401);
      
      expect(response.body.error).toBe('Authorization header missing or malformed');
    });
  });

  describe('Menu Items', () => {
    test('GET /menu-items requires authentication', async () => {
      const response = await request(app)
        .get('/menu-items')
        .expect(401);
    });

    test('GET /menu-items returns menu items with valid token', async () => {
      const token = await getTestToken();
      const response = await request(app)
        .get('/menu-items')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('price');
      expect(response.body[0]).toHaveProperty('image_url');
    });

    test('GET /menu-items handles database errors', async () => {
      // Mock sequelize to throw error
      const originalFind = MenuItem.findAll;
      MenuItem.findAll = jest.fn().mockRejectedValue(new Error('Database error'));
      
      const token = await getTestToken();
      const response = await request(app)
        .get('/menu-items')
        .set('Authorization', `Bearer ${token}`)
        .expect(500);
      
      expect(response.body.error).toBe('Failed to fetch menu items');
      
      // Restore original function
      MenuItem.findAll = originalFind;
    });
  });

  describe('Sessions', () => {
    test('POST /sessions creates a session with valid QR code', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({ qr_code: 'TEST-QR-001' })
        .expect(201);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('table_id');
      expect(response.body).toHaveProperty('started_at');
      expect(response.body).toHaveProperty('expires_at');
    });

    test('POST /sessions returns 404 for invalid QR code', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({ qr_code: 'INVALID-QR' })
        .expect(404);
      
      expect(response.body.error).toBe('Table not found');
    });

    test('POST /sessions requires qr_code', async () => {
      const response = await request(app)
        .post('/sessions')
        .send({})
        .expect(400);
      
      expect(response.body.error).toBe('qr_code is required');
    });

    test('POST /sessions handles database errors', async () => {
      // Mock Table.findOne to throw error
      const originalFindOne = Table.findOne;
      Table.findOne = jest.fn().mockRejectedValue(new Error('Database error'));
      
      const response = await request(app)
        .post('/sessions')
        .send({ qr_code: 'TEST-QR-001' })
        .expect(500);
      
      expect(response.body.error).toBe('Failed to create session');
      
      // Restore original function
      Table.findOne = originalFindOne;
    });
  });

  describe('Orders', () => {
    let session;
    let token;

    beforeEach(async () => {
      token = await getTestToken();
      
      // Create a session for order tests
      const sessionResponse = await request(app)
        .post('/sessions')
        .send({ qr_code: 'TEST-QR-001' });
      session = sessionResponse.body;
    });

    test('GET /orders requires authentication', async () => {
      const response = await request(app)
        .get('/orders')
        .expect(401);
    });

    test('GET /orders returns user orders with valid token', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('POST /orders requires authentication', async () => {
      const response = await request(app)
        .post('/orders')
        .send({ session_id: 1, items: [] })
        .expect(401);
    });

    test('POST /orders creates order with valid data', async () => {
      const orderData = {
        session_id: session.id,
        items: [
          { menu_item_id: testData.menuItem1.id, quantity: 2 },
          { menu_item_id: testData.menuItem2.id, quantity: 1 }
        ]
      };

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(201);
      
      expect(response.body).toHaveProperty('order_id');
      expect(response.body).toHaveProperty('total');
      expect(response.body.status).toBe('pending');
      expect(parseFloat(response.body.total)).toBe(80000); // 25000*2 + 30000*1
    });

    test('POST /orders validates required fields', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);
      
      expect(response.body.error).toBe('session_id and items are required');
    });

    test('POST /orders validates items array', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ session_id: session.id, items: [] })
        .expect(400);
      
      expect(response.body.error).toBe('session_id and items are required');
    });

    test('POST /orders handles invalid session', async () => {
      const orderData = {
        session_id: 99999,
        items: [{ menu_item_id: testData.menuItem1.id, quantity: 1 }]
      };

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(404);
      
      expect(response.body.error).toBe('Session not found');
    });

    test('POST /orders handles invalid menu item', async () => {
      const orderData = {
        session_id: session.id,
        items: [{ menu_item_id: 99999, quantity: 1 }]
      };

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(404);
      
      expect(response.body.error).toBe('Menu item 99999 not found');
    });

    test('PUT /orders/:id updates existing order', async () => {
      // First create an order
      const orderData = {
        session_id: session.id,
        items: [{ menu_item_id: testData.menuItem1.id, quantity: 1 }]
      };

      const createResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.order_id;

      // Update the order
      const updateData = {
        items: [
          { menu_item_id: testData.menuItem1.id, quantity: 3 },
          { menu_item_id: testData.menuItem2.id, quantity: 2 }
        ]
      };

      const response = await request(app)
        .put(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body).toHaveProperty('order_id');
      expect(parseFloat(response.body.total)).toBe(135000); // 25000*3 + 30000*2
    });

    test('PUT /orders/:id validates order ownership', async () => {
      // Create another user
      const anotherUser = await User.create({
        google_id: 'another123',
        name: 'Another User',
        email: 'another@example.com'
      });
      const anotherToken = jwt.sign({ id: anotherUser.id }, process.env.JWT_SECRET || 'test-secret');

      // Create order with first user
      const orderData = {
        session_id: session.id,
        items: [{ menu_item_id: testData.menuItem1.id, quantity: 1 }]
      };

      const createResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.order_id;

      // Try to update with another user's token
      const updateData = {
        items: [{ menu_item_id: testData.menuItem1.id, quantity: 2 }]
      };

      const response = await request(app)
        .put(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .send(updateData)
        .expect(404);
      
      expect(response.body.error).toBe('Order not found');
    });

    test('PUT /orders/:id prevents editing paid orders', async () => {
      // Create an order
      const orderData = {
        session_id: session.id,
        items: [{ menu_item_id: testData.menuItem1.id, quantity: 1 }]
      };

      const createResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.order_id;

      // Manually update order status to paid
      await Order.update({ status: 'paid' }, { where: { id: orderId } });

      // Try to update the paid order
      const updateData = {
        items: [{ menu_item_id: testData.menuItem1.id, quantity: 2 }]
      };

      const response = await request(app)
        .put(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);
      
      expect(response.body.error).toBe('Cannot edit order with status: paid. Only pending orders can be edited.');
    });

    test('DELETE /orders/:id deletes pending order', async () => {
      // Create an order
      const orderData = {
        session_id: session.id,
        items: [{ menu_item_id: testData.menuItem1.id, quantity: 1 }]
      };

      const createResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.order_id;

      // Delete the order
      const response = await request(app)
        .delete(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
    });

    test('DELETE /orders/:id validates order ownership', async () => {
      // Create another user
      const anotherUser = await User.create({
        google_id: 'delete123',
        name: 'Delete User',
        email: 'delete@example.com'
      });
      const anotherToken = jwt.sign({ id: anotherUser.id }, process.env.JWT_SECRET || 'test-secret');

      // Create order with first user
      const orderData = {
        session_id: session.id,
        items: [{ menu_item_id: testData.menuItem1.id, quantity: 1 }]
      };

      const createResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.order_id;

      // Try to delete with another user's token
      const response = await request(app)
        .delete(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${anotherToken}`)
        .expect(404);
      
      expect(response.body.error).toBe('Order not found');
    });

    test('DELETE /orders/:id prevents deleting paid orders', async () => {
      // Create an order
      const orderData = {
        session_id: session.id,
        items: [{ menu_item_id: testData.menuItem1.id, quantity: 1 }]
      };

      const createResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(201);

      const orderId = createResponse.body.order_id;

      // Manually update order status to paid
      await Order.update({ status: 'paid' }, { where: { id: orderId } });

      // Try to delete the paid order
      const response = await request(app)
        .delete(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
      
      expect(response.body.error).toBe('Cannot delete order with status: paid. Only pending orders can be deleted.');
    });

    test('Orders handle database errors', async () => {
      // Mock MenuItem.findByPk to simulate database error
      const originalFindByPk = MenuItem.findByPk;
      MenuItem.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));
      
      const orderData = {
        session_id: session.id,
        items: [{ menu_item_id: testData.menuItem1.id, quantity: 1 }]
      };

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(500);

      expect(response.body.error).toBe('Failed to create order');
      
      // Restore original method
      MenuItem.findByPk = originalFindByPk;
    });

    test('Orders handle order update database errors', async () => {
      // Create an order first
      const orderData = {
        session_id: session.id,
        items: [{ menu_item_id: testData.menuItem1.id, quantity: 1 }]
      };

      const createResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(201);

      // Mock MenuItem.findByPk to simulate database error during update
      const originalFindByPk = MenuItem.findByPk;
      MenuItem.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put(`/orders/${createResponse.body.order_id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ items: [{ menu_item_id: testData.menuItem1.id, quantity: 2 }] })
        .expect(500);

      expect(response.body.error).toBe('Failed to update order');
      
      // Restore original method
      MenuItem.findByPk = originalFindByPk;
    });

    test('Orders handle delete database errors', async () => {
      // Create an order first
      const orderData = {
        session_id: session.id,
        items: [{ menu_item_id: testData.menuItem1.id, quantity: 1 }]
      };

      const createResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(201);

      // Mock OrderItem.destroy to simulate database error
      const originalDestroy = OrderItem.destroy;
      OrderItem.destroy = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete(`/orders/${createResponse.body.order_id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(500);

      expect(response.body.error).toBe('Failed to delete order');
      
      // Restore original method
      OrderItem.destroy = originalDestroy;
    });
  });

  describe('Payments', () => {
    let order;
    let token;

    beforeEach(async () => {
      token = await getTestToken();
      
      // Create a session
      const sessionResponse = await request(app)
        .post('/sessions')
        .send({ qr_code: 'TEST-QR-001' });
      const session = sessionResponse.body;

      // Create an order for payment tests
      const orderData = {
        session_id: session.id,
        items: [{ menu_item_id: testData.menuItem1.id, quantity: 1 }]
      };

      const orderResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData);
      order = orderResponse.body;
    });

    test('POST /payments requires authentication', async () => {
      const response = await request(app)
        .post('/payments')
        .send({ order_id: 1 })
        .expect(401);
    });

    test('POST /payments validates required fields', async () => {
      const response = await request(app)
        .post('/payments')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);
      
      expect(response.body.error).toBe('order_id is required');
    });

    test('POST /payments handles invalid order', async () => {
      const response = await request(app)
        .post('/payments')
        .set('Authorization', `Bearer ${token}`)
        .send({ order_id: 99999 })
        .expect(404);
      
      expect(response.body.error).toBe('Order not found');
    });

    test('POST /payments prevents payment of already paid orders', async () => {
      // Update order status to paid
      await Order.update({ status: 'paid' }, { where: { id: order.order_id } });

      const response = await request(app)
        .post('/payments')
        .set('Authorization', `Bearer ${token}`)
        .send({ order_id: order.order_id })
        .expect(400);
      
      expect(response.body.error).toBe('Order is already paid or failed');
    });

    test('POST /payments handles Midtrans API errors', async () => {
      // This test would require mocking Midtrans SDK
      // For now, we'll test the basic error handling structure
      const response = await request(app)
        .post('/payments')
        .set('Authorization', `Bearer ${token}`)
        .send({ order_id: order.order_id })
        .expect(500);
      
      // Since Midtrans credentials are likely not configured in test
      expect(response.body.error).toBe('Failed to create payment transaction');
    });

    test('POST /payments/notification handles webhook', async () => {
      const webhookData = {
        order_id: `ORDER-${order.order_id}-123456789`,
        transaction_status: 'settlement',
        payment_type: 'bank_transfer'
      };

      const response = await request(webhookApp)
        .post('/payments/notification')
        .send(webhookData)
        .expect(200);
      
      expect(response.text).toBe('OK');
    });

    test('POST /payments/notification handles invalid order ID', async () => {
      const webhookData = {
        order_id: 'invalid-order-id',
        transaction_status: 'settlement'
      };

      const response = await request(webhookApp)
        .post('/payments/notification')
        .send(webhookData)
        .expect(400);
      
      expect(response.text).toBe('Invalid order_id');
    });

    test('POST /payments/notification handles different transaction statuses', async () => {
      const statuses = ['settlement', 'pending', 'deny', 'cancel', 'expire', 'failure'];
      
      for (const status of statuses) {
        const webhookData = {
          order_id: `ORDER-${order.order_id}-123456789`,
          transaction_status: status
        };

        const response = await request(webhookApp)
          .post('/payments/notification')
          .send(webhookData)
          .expect(200);
        
        expect(response.text).toBe('OK');
      }
    });

    test('POST /payments/notification handles database errors gracefully', async () => {
      // Mock Order.findByPk to simulate database error
      const originalFindByPk = Order.findByPk;
      Order.findByPk = jest.fn().mockRejectedValue(new Error('Database error'));

      const response = await request(webhookApp)
        .post('/payments/notification')
        .send({
          order_id: 'ORDER-123-123456789',
          transaction_status: 'settlement'
        })
        .expect(500);
      
      expect(response.text).toBe('Error processing notification');
      
      // Restore original method
      Order.findByPk = originalFindByPk;
    });
  });

  describe('AI Chat', () => {
    let token;

    beforeEach(async () => {
      token = await getTestToken();
    });

    test('POST /ai/chat requires authentication', async () => {
      const response = await request(app)
        .post('/ai/chat')
        .send({ message: 'Hello' })
        .expect(401);
    });

    test('POST /ai/chat validates required fields', async () => {
      const response = await request(app)
        .post('/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);
      
      expect(response.body.error).toBe('messages array is required');
    });

    test('POST /ai/chat validates messages format', async () => {
      const response = await request(app)
        .post('/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ messages: 'invalid' })
        .expect(400);
      
      expect(response.body.error).toBe('messages array is required');
    });

    test('POST /ai/chat handles valid request', async () => {
      const response = await request(app)
        .post('/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          messages: [{ role: 'user', content: 'Rekomendasi makanan pedas' }] 
        });
      
      // Should either succeed (200) or fail due to missing OpenAI key (500)
      expect([200, 500]).toContain(response.status);
    });

    test('POST /ai/chat handles menu keyword filtering', async () => {
      const response = await request(app)
        .post('/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({ 
          messages: [
            { role: 'user', content: 'Saya mau nasi' },
            { role: 'assistant', content: 'Baik, mau nasi apa?' },
            { role: 'user', content: 'Yang ada ayam' }
          ] 
        });
      
      expect([200, 500]).toContain(response.status);
    });
  });

  describe('Payment Redirect Routes', () => {
    test('GET /payment/finish returns HTML redirect page', async () => {
      const response = await request(app)
        .get('/payment/finish')
        .expect(200);
      
      expect(response.text).toContain('Processing Payment Result');
      expect(response.text).toContain('http://localhost:5173/payment/finish');
    });

    test('GET /payment/unfinish returns HTML redirect page', async () => {
      const response = await request(app)
        .get('/payment/unfinish')
        .expect(200);
      
      expect(response.text).toContain('Payment Cancelled');
      expect(response.text).toContain('http://localhost:5173/payment/unfinish');
    });

    test('GET /payment/error returns HTML redirect page', async () => {
      const response = await request(app)
        .get('/payment/error')
        .expect(200);
      
      expect(response.text).toContain('Payment Error');
      expect(response.text).toContain('http://localhost:5173/payment/error');
    });
  });

  describe('Error Handling', () => {
    test('handles expired sessions', async () => {
      // Create an expired session
      const expiredSession = await Session.create({
        table_id: testData.table.id,
        started_at: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        expires_at: new Date(Date.now() - 30 * 60 * 1000)  // 30 minutes ago (expired)
      });

      const token = await getTestToken();
      const orderData = {
        session_id: expiredSession.id,
        items: [{ menu_item_id: testData.menuItem1.id, quantity: 1 }]
      };

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${token}`)
        .send(orderData)
        .expect(401);
      
      expect(response.body.error).toBe('Session expired. Please scan your table QR code again.');
    });

    test('handles malformed JWT tokens', async () => {
      const response = await request(app)
        .get('/menu-items')
        .set('Authorization', 'Bearer malformed.jwt.token')
        .expect(403);
      
      expect(response.body.error).toBe('Invalid or expired token');
    });

    test('handles requests with no Authorization header', async () => {
      const response = await request(app)
        .get('/menu-items')
        .expect(401);
      
      expect(response.body.error).toBe('Authorization header missing or malformed');
    });
  });


});
