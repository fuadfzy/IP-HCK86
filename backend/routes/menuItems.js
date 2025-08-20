const express = require('express');
const router = express.Router();
const { MenuItem } = require('../models');

// GET /menu-items - get all menu items
router.get('/', async (req, res) => {
  try {
    const menuItems = await MenuItem.findAll();
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

module.exports = router;
