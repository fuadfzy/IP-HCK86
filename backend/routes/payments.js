const express = require('express');
const router = express.Router();
const midtransClient = require('midtrans-client');
const { Order } = require('../models');

// Setup Midtrans Snap
const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'YOUR_SERVER_KEY',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'YOUR_CLIENT_KEY',
});

// Setup Midtrans Core API for notification handling
const core = new midtransClient.CoreApi({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY || 'YOUR_SERVER_KEY',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || 'YOUR_CLIENT_KEY',
});

// POST /payments - create payment transaction for an order
router.post('/', async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ error: 'order_id is required' });
  try {
    const order = await Order.findByPk(order_id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const parameter = {
      transaction_details: {
        order_id: `ORDER-${order.id}-${Date.now()}`,
        gross_amount: parseInt(order.total, 10),
      },
      credit_card: {
        secure: true
      },
      callbacks: {
        finish: `${process.env.BACKEND_URL || 'http://localhost:3001'}/payment/finish`,
        unfinish: `${process.env.BACKEND_URL || 'http://localhost:3001'}/payment/unfinish`,
        error: `${process.env.BACKEND_URL || 'http://localhost:3001'}/payment/error`
      }
    };

    const transaction = await snap.createTransaction(parameter);
    res.json({ token: transaction.token, redirect_url: transaction.redirect_url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create payment transaction', details: err.message });
  }
});

// POST /payments/notification - Midtrans callback endpoint
router.post('/notification', express.json(), async (req, res) => {
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
