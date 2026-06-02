const db = require('../db/database');

const listar = (req, res) => {
  const categorias = db.prepare(
    "SELECT * FROM categorias WHERE activa = 1 ORDER BY tipo, nombre"
  ).all();
  res.json(categorias);
};

module.exports = { listar };
