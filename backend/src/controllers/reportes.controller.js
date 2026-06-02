const db = require('../db/database');

const dashboard = (req, res) => {
  const uid = req.usuario.id;
  const ahora = new Date();
  const hoy = ahora.toISOString().split('T')[0];

  // Inicio de semana (lunes)
  const diaSemana = ahora.getDay() === 0 ? 7 : ahora.getDay();
  const inicioSemana = new Date(ahora);
  inicioSemana.setDate(ahora.getDate() - diaSemana + 1);
  const inicioSemanaStr = inicioSemana.toISOString().split('T')[0];

  // Inicio de mes
  const inicioMes = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-01`;

  const totalHoy = db.prepare(
    "SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE usuario_id = ? AND fecha = ?"
  ).get(uid, hoy);

  const totalSemana = db.prepare(
    "SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE usuario_id = ? AND fecha >= ?"
  ).get(uid, inicioSemanaStr);

  const totalMes = db.prepare(
    "SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE usuario_id = ? AND fecha >= ?"
  ).get(uid, inicioMes);

  const porCategoria = db.prepare(`
    SELECT COALESCE(c.nombre, 'Sin categoria') AS nombre,
           COALESCE(SUM(g.monto), 0) AS total
    FROM gastos g
    LEFT JOIN categorias c ON g.categoria_id = c.id
    WHERE g.usuario_id = ? AND g.fecha >= ?
    GROUP BY g.categoria_id
    ORDER BY total DESC
  `).all(uid, inicioMes);

  const porCaja = db.prepare(`
    SELECT COALESCE(c.nombre, 'Sin caja') AS nombre,
           COALESCE(SUM(g.monto), 0) AS total
    FROM gastos g
    LEFT JOIN categorias c ON g.caja_id = c.id
    WHERE g.usuario_id = ? AND g.fecha >= ?
    GROUP BY g.caja_id
    ORDER BY total DESC
  `).all(uid, inicioMes);

  const ultimosMovimientos = db.prepare(`
    SELECT g.*,
           c.nombre  AS categoria_nombre,
           ca.nombre AS caja_nombre
    FROM gastos g
    LEFT JOIN categorias c  ON g.categoria_id = c.id
    LEFT JOIN categorias ca ON g.caja_id      = ca.id
    WHERE g.usuario_id = ?
    ORDER BY g.fecha DESC, g.creado_en DESC
    LIMIT 10
  `).all(uid);

  res.json({
    totalHoy: totalHoy.total,
    totalSemana: totalSemana.total,
    totalMes: totalMes.total,
    porCategoria,
    porCaja,
    ultimosMovimientos
  });
};

const resumen = (req, res) => {
  const uid = req.usuario.id;
  const ahora = new Date();
  const fechaDesde = req.query.desde || `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-01`;
  const fechaHasta = req.query.hasta || ahora.toISOString().split('T')[0];

  const porCategoria = db.prepare(`
    SELECT COALESCE(c.nombre, 'Sin categoria') AS nombre,
           COALESCE(SUM(g.monto), 0) AS total,
           COUNT(*) AS cantidad
    FROM gastos g
    LEFT JOIN categorias c ON g.categoria_id = c.id
    WHERE g.usuario_id = ? AND g.fecha BETWEEN ? AND ?
    GROUP BY g.categoria_id
    ORDER BY total DESC
  `).all(uid, fechaDesde, fechaHasta);

  const porCaja = db.prepare(`
    SELECT COALESCE(c.nombre, 'Sin caja') AS nombre,
           COALESCE(SUM(g.monto), 0) AS total,
           COUNT(*) AS cantidad
    FROM gastos g
    LEFT JOIN categorias c ON g.caja_id = c.id
    WHERE g.usuario_id = ? AND g.fecha BETWEEN ? AND ?
    GROUP BY g.caja_id
    ORDER BY total DESC
  `).all(uid, fechaDesde, fechaHasta);

  const totalGeneral = db.prepare(
    "SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE usuario_id = ? AND fecha BETWEEN ? AND ?"
  ).get(uid, fechaDesde, fechaHasta);

  res.json({ porCategoria, porCaja, totalGeneral: totalGeneral.total, desde: fechaDesde, hasta: fechaHasta });
};

const exportarCSV = (req, res) => {
  const uid = req.usuario.id;
  const ahora = new Date();
  const fechaDesde = req.query.desde || `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-01`;
  const fechaHasta = req.query.hasta || ahora.toISOString().split('T')[0];

  const gastos = db.prepare(`
    SELECT g.fecha, g.monto, g.descripcion,
           COALESCE(c.nombre,  'Sin categoria') AS categoria,
           COALESCE(ca.nombre, 'Sin caja')      AS caja,
           g.metodo_pago, g.tipo_periodo
    FROM gastos g
    LEFT JOIN categorias c  ON g.categoria_id = c.id
    LEFT JOIN categorias ca ON g.caja_id      = ca.id
    WHERE g.usuario_id = ? AND g.fecha BETWEEN ? AND ?
    ORDER BY g.fecha DESC
  `).all(uid, fechaDesde, fechaHasta);

  const encabezado = 'Fecha,Monto,Descripcion,Categoria,Caja,Metodo de Pago,Tipo Periodo\n';
  const filas = gastos.map(g =>
    `${g.fecha},${g.monto},"${(g.descripcion || '').replace(/"/g, '""')}",${g.categoria},${g.caja},${g.metodo_pago || ''},${g.tipo_periodo || ''}`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=gastos_${fechaDesde}_${fechaHasta}.csv`);
  res.send(encabezado + filas);
};

module.exports = { dashboard, resumen, exportarCSV };
