const express = require('express');
const router = express.Router();
const { Order, OrderItem, MenuItem, Session } = require('../models');

// GET /orders - list orders by user (authenticated user only)
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id; // From JWT token
    const { session_id } = req.query;
    
    let where = { user_id: userId }; // Always filter by user
    
    if (session_id) {
      where.session_id = session_id;
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
  const userId = req.user.id; // From JWT token
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
      user_id: userId, // Associate order with logged-in user
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

// PUT /orders/:id - edit order (only if status is pending and belongs to user)
router.put('/:id', async (req, res) => {
  const { items } = req.body;
  const userId = req.user.id; // From JWT token
  // items: [{ menu_item_id, quantity }]
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items are required' });
  }
  
  try {
    const order = await Order.findOne({
      where: { 
        id: req.params.id,
        user_id: userId // Only allow editing user's own orders
      }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Only allow editing pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        error: `Cannot edit order with status: ${order.status}. Only pending orders can be edited.` 
      });
    }

    // Calculate new total
    let total = 0;
    const newOrderItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menu_item_id);
      if (!menuItem) return res.status(404).json({ error: `Menu item ${item.menu_item_id} not found` });
      const total_price = parseFloat(menuItem.price) * item.quantity;
      total += total_price;
      newOrderItems.push({
        order_id: order.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
        total_price
      });
    }

    // Delete existing order items
    await OrderItem.destroy({ where: { order_id: order.id } });

    // Create new order items
    for (const item of newOrderItems) {
      await OrderItem.create(item);
    }

    // Update order total
    await order.update({ total });

    res.json({ message: 'Order updated successfully', order_id: order.id, total, status: order.status });
  } catch (err) {
    console.error('Edit order error:', err);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE /orders/:id - delete order (only if status is pending and belongs to user)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id; // From JWT token
    const order = await Order.findOne({
      where: { 
        id: req.params.id,
        user_id: userId // Only allow deleting user's own orders
      }
    });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Only allow deleting pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        error: `Cannot delete order with status: ${order.status}. Only pending orders can be deleted.` 
      });
    }

    // Delete order items first (due to foreign key constraint)
    await OrderItem.destroy({ where: { order_id: order.id } });
    
    // Delete order
    await order.destroy();

    res.status(204).send();
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
