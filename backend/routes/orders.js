const express = require('express');
const router = express.Router();
const { Order, OrderItem, MenuItem, Session } = require('../models');

// GET /orders - list orders by session_id or table_id
router.get('/', async (req, res) => {
  try {
    const { session_id, table_id } = req.query;
    let where = {};
    if (session_id) {
      where.session_id = session_id;
    } else if (table_id) {
      // Find all sessions for this table
      const sessions = await Session.findAll({ where: { table_id } });
      const sessionIds = sessions.map(s => s.id);
      where.session_id = sessionIds;
    }
    const orders = await Order.findAll({
      where,
      include: [
        {
          model: OrderItem,
          include: [MenuItem]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// POST /orders - create a new order for a session
router.post('/', async (req, res) => {
  const { session_id, items } = req.body;
  // items: [{ menu_item_id, quantity }]
  if (!session_id || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'session_id and items are required' });
  }
  try {
    // Check session exists
    const session = await Session.findByPk(session_id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    // Check session expiry
    if (new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Session expired. Please scan your table QR code again.' });
    }

    // Calculate total
    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menu_item_id);
      if (!menuItem) return res.status(404).json({ error: `Menu item ${item.menu_item_id} not found` });
      const total_price = parseFloat(menuItem.price) * item.quantity;
      total += total_price;
      orderItems.push({
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        total_price
      });
    }

    // Create order
    const order = await Order.create({
      session_id,
      total,
      status: 'pending'
    });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        total_price: item.total_price
      });
    }

    res.status(201).json({ order_id: order.id, total, status: order.status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /orders/:id - get order details with items
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          include: [MenuItem]
        }
      ]
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

module.exports = router;
