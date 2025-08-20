const express = require('express');
const router = express.Router();
const { Session, Table } = require('../models');

// POST /sessions - create a session for a table (by qr_code)
router.post('/', async (req, res) => {
  const { qr_code } = req.body;
  if (!qr_code) return res.status(400).json({ error: 'qr_code is required' });
  try {
    const table = await Table.findOne({ where: { qr_code } });
    if (!table) return res.status(404).json({ error: 'Table not found' });

    // Expire time: 30 minutes from now
    const started_at = new Date();
    const expires_at = new Date(Date.now() + 30 * 60 * 1000);

    const session = await Session.create({
      table_id: table.id,
      started_at,
      expires_at
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /sessions/:id - get session info
router.get('/:id', async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

module.exports = router;
