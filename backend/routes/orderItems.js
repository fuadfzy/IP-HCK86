const express = require('express');
const router = express.Router();
const { OrderItem, Order, MenuItem } = require('../models');

// PATCH /order-items/:id - update quantity of an order item
router.patch('/:id', async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return res.status(400).json({ error: 'Quantity must be at least 1' });
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);
    if (!orderItem) return res.status(404).json({ error: 'Order item not found' });
    const order = await Order.findByPk(orderItem.order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status === 'paid') return res.status(403).json({ error: 'Cannot edit item in a paid order' });
    // Update total_price
    const menuItem = await MenuItem.findByPk(orderItem.menu_item_id);
    orderItem.quantity = quantity;
    orderItem.total_price = parseFloat(menuItem.price) * quantity;
    await orderItem.save();
    res.json(orderItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order item' });
  }
});

// DELETE /order-items/:id - delete an order item
router.delete('/:id', async (req, res) => {
  try {
    const orderItem = await OrderItem.findByPk(req.params.id);
    if (!orderItem) return res.status(404).json({ error: 'Order item not found' });
    const order = await Order.findByPk(orderItem.order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status === 'paid') return res.status(403).json({ error: 'Cannot delete item in a paid order' });
    await orderItem.destroy();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order item' });
  }
});

module.exports = router;
