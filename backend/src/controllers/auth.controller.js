const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const SECRET = 'contable_secret_key_2024';

const login = (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ error: 'Usuario y contrasena son requeridos.' });
  }

  const user = db.prepare('SELECT * FROM usuarios WHERE usuario = ?').get(usuario);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Usuario o contrasena incorrectos.' });
  }

  const token = jwt.sign(
    { id: user.id, usuario: user.usuario, rol: user.rol || 'usuario' },
    SECRET,
    { expiresIn: '7d' }
  );

  res.json({ token, usuario: user.usuario, rol: user.rol || 'usuario' });
};

module.exports = { login };
