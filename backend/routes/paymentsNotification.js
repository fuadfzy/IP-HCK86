const express = require('express');
const router = express.Router();
const { Order } = require('../models');

// POST /payments/notification - Midtrans callback endpoint
router.post('/', express.json(), async (req, res) => {
  try {
    const notification = req.body;
    console.log('=== Midtrans Notification Received ===');
    console.log('Notification body:', JSON.stringify(notification, null, 2));
    
    // Midtrans order_id format: ORDER-<orderId>-<timestamp>
    const orderIdMatch = notification.order_id && notification.order_id.match(/^ORDER-(\d+)-/);
    if (!orderIdMatch) {
      console.log('Invalid order_id format:', notification.order_id);
      return res.status(400).send('Invalid order_id');
    }
    
    const orderId = parseInt(orderIdMatch[1], 10);
    console.log('Extracted order ID:', orderId);
    
    const order = await Order.findByPk(orderId);
    if (!order) {
      console.log('Order not found for ID:', orderId);
      return res.status(404).send('Order not found');
    }

    // Update order status based on transaction_status
    let newStatus = order.status;
    const oldStatus = order.status;
    switch (notification.transaction_status) {
      case 'capture':
      case 'settlement':
        newStatus = 'paid';
        break;
      case 'pending':
        newStatus = 'pending';
        break;
      case 'deny':
      case 'expire':
      case 'cancel':
        newStatus = 'failed';
        break;
    }
    
    console.log(`Order ${orderId} status change: ${oldStatus} → ${newStatus}`);
    await order.update({ status: newStatus });
    console.log('Order status updated successfully');
    
    res.status(200).send('OK');
  } catch (err) {
    console.error('=== Notification Processing Error ===');
    console.error('Error:', err);
    res.status(500).send('Error processing notification');
  }
});

module.exports = router;
