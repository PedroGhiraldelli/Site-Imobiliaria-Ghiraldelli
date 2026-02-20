const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db     = require('../config/database');
const auth   = require('../middleware/auth');

// GET /api/config  (público — retorna só whatsapp)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT chave, valor FROM config WHERE chave = 'whatsapp'");
    const cfg = {};
    rows.forEach(r => { cfg[r.chave] = r.valor; });
    res.json(cfg);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar configurações.' });
  }
});

// PUT /api/config  (admin)
router.put('/', auth, async (req, res) => {
  const { whatsapp, nova_senha } = req.body;
  try {
    if (whatsapp !== undefined) {
      await db.query(
        "INSERT INTO config (chave, valor) VALUES ('whatsapp', ?) ON DUPLICATE KEY UPDATE valor = ?",
        [whatsapp, whatsapp]
      );
    }
    if (nova_senha) {
      const hash = await bcrypt.hash(nova_senha, 10);
      await db.query(
        "INSERT INTO config (chave, valor) VALUES ('admin_hash', ?) ON DUPLICATE KEY UPDATE valor = ?",
        [hash, hash]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar configurações.' });
  }
});

module.exports = router;
