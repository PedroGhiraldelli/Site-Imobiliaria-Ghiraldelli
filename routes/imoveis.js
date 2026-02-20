const router  = require('express').Router();
const db      = require('../config/database');
const auth    = require('../middleware/auth');
const upload  = require('../middleware/upload');
const fs      = require('fs');
const path    = require('path');

// GET /api/imoveis  (público)
router.get('/', async (req, res) => {
  try {
    const { tipo, transacao, cidade, min, max, destaque, page = 1, limit = 12 } = req.query;
    const conditions = ['i.ativo = 1'];
    const params     = [];

    if (tipo)      { conditions.push('i.tipo = ?');      params.push(tipo); }
    if (transacao) { conditions.push('i.transacao = ?'); params.push(transacao); }
    if (cidade)    { conditions.push('i.cidade LIKE ?'); params.push(`%${cidade}%`); }
    if (min)       { conditions.push('i.preco >= ?');    params.push(Number(min)); }
    if (max)       { conditions.push('i.preco <= ?');    params.push(Number(max)); }
    if (destaque === '1') { conditions.push('i.destaque = 1'); }

    const where  = 'WHERE ' + conditions.join(' AND ');
    const offset = (Number(page) - 1) * Number(limit);

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) AS total FROM imoveis i ${where}`, params
    );

    const [rows] = await db.query(
      `SELECT i.*,
        (SELECT caminho FROM fotos WHERE imovel_id = i.id ORDER BY ordem LIMIT 1) AS foto_capa
       FROM imoveis i ${where}
       ORDER BY i.destaque DESC, i.criado_em DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({ total, paginas: Math.ceil(total / limit), imoveis: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar imóveis.' });
  }
});

// GET /api/imoveis/:id  (público)
router.get('/:id', async (req, res) => {
  try {
    const [[imovel]] = await db.query(
      'SELECT * FROM imoveis WHERE id = ? AND ativo = 1', [req.params.id]
    );
    if (!imovel) return res.status(404).json({ error: 'Imóvel não encontrado.' });

    const [fotos] = await db.query(
      'SELECT * FROM fotos WHERE imovel_id = ? ORDER BY ordem', [imovel.id]
    );
    res.json({ ...imovel, fotos });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar imóvel.' });
  }
});

// POST /api/imoveis  (admin)
router.post('/', auth, async (req, res) => {
  const { titulo, tipo, transacao, preco, cidade, bairro, area,
          quartos, banheiros, vagas, descricao, destaque } = req.body;

  if (!titulo || !tipo || !transacao || !preco || !cidade)
    return res.status(400).json({ error: 'Campos obrigatórios faltando.' });

  try {
    const [result] = await db.query(
      `INSERT INTO imoveis (titulo,tipo,transacao,preco,cidade,bairro,area,quartos,banheiros,vagas,descricao,destaque)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [titulo, tipo, transacao, preco, cidade, bairro || null, area || null,
       quartos || 0, banheiros || 0, vagas || 0, descricao || null, destaque ? 1 : 0]
    );
    const [[novo]] = await db.query('SELECT * FROM imoveis WHERE id = ?', [result.insertId]);
    res.status(201).json(novo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar imóvel.' });
  }
});

// PUT /api/imoveis/:id  (admin)
router.put('/:id', auth, async (req, res) => {
  const { titulo, tipo, transacao, preco, cidade, bairro, area,
          quartos, banheiros, vagas, descricao, destaque, ativo } = req.body;
  try {
    await db.query(
      `UPDATE imoveis SET titulo=?,tipo=?,transacao=?,preco=?,cidade=?,bairro=?,area=?,
       quartos=?,banheiros=?,vagas=?,descricao=?,destaque=?,ativo=? WHERE id=?`,
      [titulo, tipo, transacao, preco, cidade, bairro || null, area || null,
       quartos || 0, banheiros || 0, vagas || 0, descricao || null,
       destaque ? 1 : 0, ativo !== undefined ? (ativo ? 1 : 0) : 1, req.params.id]
    );
    const [[atualizado]] = await db.query('SELECT * FROM imoveis WHERE id = ?', [req.params.id]);
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar imóvel.' });
  }
});

// DELETE /api/imoveis/:id  (admin — soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('UPDATE imoveis SET ativo = 0 WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir imóvel.' });
  }
});

// POST /api/imoveis/:id/fotos  (admin)
router.post('/:id/fotos', auth, upload.array('fotos', 10), async (req, res) => {
  try {
    const files  = req.files || [];
    if (!files.length) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    const [[{ maxOrdem }]] = await db.query(
      'SELECT COALESCE(MAX(ordem),0) AS maxOrdem FROM fotos WHERE imovel_id = ?', [req.params.id]
    );

    const inserts = files.map((f, i) => [req.params.id, f.filename, maxOrdem + i + 1]);
    await db.query('INSERT INTO fotos (imovel_id, caminho, ordem) VALUES ?', [inserts]);

    const [fotos] = await db.query(
      'SELECT * FROM fotos WHERE imovel_id = ? ORDER BY ordem', [req.params.id]
    );
    res.json(fotos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar fotos.' });
  }
});

// DELETE /api/fotos/:id  (admin)
router.delete('/fotos/:id', auth, async (req, res) => {
  try {
    const [[foto]] = await db.query('SELECT * FROM fotos WHERE id = ?', [req.params.id]);
    if (!foto) return res.status(404).json({ error: 'Foto não encontrada.' });

    const filePath = path.join(__dirname, '..', 'uploads', foto.caminho);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await db.query('DELETE FROM fotos WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover foto.' });
  }
});

module.exports = router;
