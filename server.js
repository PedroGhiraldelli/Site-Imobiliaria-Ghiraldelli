require('dotenv').config();
const express = require('express');
const path    = require('path');
const cors    = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/imoveis', require('./routes/imoveis'));
app.use('/api/config',  require('./routes/config'));

// SPA fallback — envia index.html para rotas não-API
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    res.status(404).json({ error: 'Rota não encontrada.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🏠  Ghiraldelli Imobiliária rodando em http://localhost:${PORT}`);
  console.log(`    Admin: http://localhost:${PORT}/admin/login.html\n`);
});
