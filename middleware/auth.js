const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers['authorization'];
  const token  = header && header.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET || 'ghiraldelli_secret');
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido ou expirado.' });
  }
};
