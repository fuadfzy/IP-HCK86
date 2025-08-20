const express = require('express');
const router = express.Router();
const { Table } = require('../models');

// GET /tables - get all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.findAll();
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

module.exports = router;
