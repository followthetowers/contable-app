const db = require('../db/database');

const listar = (req, res) => {
  const { fecha_desde, fecha_hasta, categoria_id, caja_id, metodo_pago, busqueda } = req.query;

  let query = `
    SELECT g.*,
           c.nombre  AS categoria_nombre,
           ca.nombre AS caja_nombre
    FROM gastos g
    LEFT JOIN categorias c  ON g.categoria_id = c.id
    LEFT JOIN categorias ca ON g.caja_id      = ca.id
    WHERE 1=1
  `;
  const params = [];

  if (fecha_desde)  { query += ' AND g.fecha >= ?';             params.push(fecha_desde); }
  if (fecha_hasta)  { query += ' AND g.fecha <= ?';             params.push(fecha_hasta); }
  if (categoria_id) { query += ' AND g.categoria_id = ?';       params.push(categoria_id); }
  if (caja_id)      { query += ' AND g.caja_id = ?';            params.push(caja_id); }
  if (metodo_pago)  { query += ' AND g.metodo_pago = ?';        params.push(metodo_pago); }
  if (busqueda)     { query += ' AND g.descripcion LIKE ?';     params.push(`%${busqueda}%`); }

  query += ' ORDER BY g.fecha DESC, g.creado_en DESC';

  const gastos = db.prepare(query).all(...params);
  res.json(gastos);
};

const crear = (req, res) => {
  const { fecha, monto, descripcion, categoria_id, caja_id, metodo_pago, tipo_periodo } = req.body;

  if (!fecha || monto === undefined || monto === null || monto === '') {
    return res.status(400).json({ error: 'Fecha y monto son obligatorios.' });
  }

  const result = db.prepare(`
    INSERT INTO gastos (fecha, monto, descripcion, categoria_id, caja_id, metodo_pago, tipo_periodo, usuario_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    fecha,
    parseFloat(monto),
    descripcion || '',
    categoria_id || null,
    caja_id || null,
    metodo_pago || 'Efectivo',
    tipo_periodo || 'diario',
    req.usuario.id
  );

  const gasto = db.prepare(`
    SELECT g.*, c.nombre AS categoria_nombre, ca.nombre AS caja_nombre
    FROM gastos g
    LEFT JOIN categorias c  ON g.categoria_id = c.id
    LEFT JOIN categorias ca ON g.caja_id      = ca.id
    WHERE g.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(gasto);
};

const actualizar = (req, res) => {
  const { id } = req.params;
  const { fecha, monto, descripcion, categoria_id, caja_id, metodo_pago, tipo_periodo } = req.body;

  const gasto = db.prepare('SELECT * FROM gastos WHERE id = ? AND usuario_id = ?').get(id, req.usuario.id);
  if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado.' });

  db.prepare(`
    UPDATE gastos
    SET fecha = ?, monto = ?, descripcion = ?, categoria_id = ?, caja_id = ?,
        metodo_pago = ?, tipo_periodo = ?, actualizado_en = CURRENT_TIMESTAMP
    WHERE id = ? AND usuario_id = ?
  `).run(
    fecha,
    parseFloat(monto),
    descripcion || '',
    categoria_id || null,
    caja_id || null,
    metodo_pago || 'Efectivo',
    tipo_periodo || 'diario',
    id,
    req.usuario.id
  );

  const actualizado = db.prepare(`
    SELECT g.*, c.nombre AS categoria_nombre, ca.nombre AS caja_nombre
    FROM gastos g
    LEFT JOIN categorias c  ON g.categoria_id = c.id
    LEFT JOIN categorias ca ON g.caja_id      = ca.id
    WHERE g.id = ?
  `).get(id);

  res.json(actualizado);
};

const eliminar = (req, res) => {
  const { id } = req.params;
  const gasto = db.prepare('SELECT * FROM gastos WHERE id = ? AND usuario_id = ?').get(id, req.usuario.id);
  if (!gasto) return res.status(404).json({ error: 'Gasto no encontrado.' });

  db.prepare('DELETE FROM gastos WHERE id = ?').run(id);
  res.json({ mensaje: 'Gasto eliminado correctamente.' });
};

module.exports = { listar, crear, actualizar, eliminar };
