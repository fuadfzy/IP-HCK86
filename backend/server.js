require('dotenv').config();
const express = require('express');
const cors = require('cors');
const menuItemsRouter = require('./routes/menuItems');
const tablesRouter = require('./routes/tables');
const sessionsRouter = require('./routes/sessions');
const ordersRouter = require('./routes/orders');
const paymentsRouter = require('./routes/payments');
const orderItemsRouter = require('./routes/orderItems');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/menu-items', menuItemsRouter);
app.use('/tables', tablesRouter);
app.use('/sessions', sessionsRouter);
app.use('/orders', ordersRouter);
app.use('/payments', paymentsRouter);
app.use('/order-items', orderItemsRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'API is running' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`Backend server running at \x1b]8;;${url}\x1b\\${url}\x1b]8;;\x1b\\`);
});
