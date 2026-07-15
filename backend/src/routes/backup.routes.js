const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/db', (req, res) => {
  const expected = (process.env.BACKUP_TOKEN || '').trim();
  const provided = (req.query.token || '').trim();
  if (!expected || provided !== expected) {
    return res.status(403).json({ error: 'Token invalido.' });
  }
  const dbPath = process.env.DB_PATH || path.join(__dirname, '../../contable.db');
  res.download(dbPath, 'contable.db');
});

module.exports = router;
