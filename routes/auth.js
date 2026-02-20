const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../config/database');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;
  if (usuario !== 'admin') return res.status(401).json({ error: 'Credenciais inválidas.' });

  try {
    const [[row]] = await db.query("SELECT valor FROM config WHERE chave='admin_hash'");
    if (!row) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const ok = await bcrypt.compare(senha, row.valor);
    if (!ok) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign(
      { usuario: 'admin' },
      process.env.JWT_SECRET || 'ghiraldelli_secret',
      { expiresIn: '8h' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno.' });
  }
});

module.exports = router;
