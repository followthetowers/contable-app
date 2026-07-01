const db = require('../db/database');

const dashboard = (req, res) => {
  const ahora = new Date();
  const hoy = ahora.toISOString().split('T')[0];

  const diaSemana = ahora.getDay() === 0 ? 7 : ahora.getDay();
  const inicioSemana = new Date(ahora);
  inicioSemana.setDate(ahora.getDate() - diaSemana + 1);
  const inicioSemanaStr = inicioSemana.toISOString().split('T')[0];

  const inicioMes = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-01`;

  const totalHoy = db.prepare(
    "SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE fecha = ?"
  ).get(hoy);

  const totalSemana = db.prepare(
    "SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE fecha >= ?"
  ).get(inicioSemanaStr);

  const totalMes = db.prepare(
    "SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE fecha >= ?"
  ).get(inicioMes);

  const porCategoria = db.prepare(`
    SELECT COALESCE(c.nombre, 'Sin categoria') AS nombre,
           COALESCE(SUM(g.monto), 0) AS total
    FROM gastos g
    LEFT JOIN categorias c ON g.categoria_id = c.id
    WHERE g.fecha >= ?
    GROUP BY g.categoria_id
    ORDER BY total DESC
  `).all(inicioMes);

  const porCaja = db.prepare(`
    SELECT COALESCE(c.nombre, 'Sin caja') AS nombre,
           COALESCE(SUM(g.monto), 0) AS total
    FROM gastos g
    LEFT JOIN categorias c ON g.caja_id = c.id
    WHERE g.fecha >= ?
    GROUP BY g.caja_id
    ORDER BY total DESC
  `).all(inicioMes);

  const ultimosMovimientos = db.prepare(`
    SELECT g.*,
           c.nombre  AS categoria_nombre,
           ca.nombre AS caja_nombre
    FROM gastos g
    LEFT JOIN categorias c  ON g.categoria_id = c.id
    LEFT JOIN categorias ca ON g.caja_id      = ca.id
    ORDER BY g.fecha DESC, g.creado_en DESC
    LIMIT 10
  `).all();

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
  const ahora = new Date();
  const fechaDesde = req.query.desde || `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-01`;
  const fechaHasta = req.query.hasta || ahora.toISOString().split('T')[0];

  const porCategoria = db.prepare(`
    SELECT COALESCE(c.nombre, 'Sin categoria') AS nombre,
           COALESCE(SUM(g.monto), 0) AS total,
           COUNT(*) AS cantidad
    FROM gastos g
    LEFT JOIN categorias c ON g.categoria_id = c.id
    WHERE g.fecha BETWEEN ? AND ?
    GROUP BY g.categoria_id
    ORDER BY total DESC
  `).all(fechaDesde, fechaHasta);

  const porCaja = db.prepare(`
    SELECT COALESCE(c.nombre, 'Sin caja') AS nombre,
           COALESCE(SUM(g.monto), 0) AS total,
           COUNT(*) AS cantidad
    FROM gastos g
    LEFT JOIN categorias c ON g.caja_id = c.id
    WHERE g.fecha BETWEEN ? AND ?
    GROUP BY g.caja_id
    ORDER BY total DESC
  `).all(fechaDesde, fechaHasta);

  const totalGeneral = db.prepare(
    "SELECT COALESCE(SUM(monto), 0) AS total FROM gastos WHERE fecha BETWEEN ? AND ?"
  ).get(fechaDesde, fechaHasta);

  res.json({ porCategoria, porCaja, totalGeneral: totalGeneral.total, desde: fechaDesde, hasta: fechaHasta });
};

const exportarCSV = (req, res) => {
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
    WHERE g.fecha BETWEEN ? AND ?
    ORDER BY g.fecha DESC
  `).all(fechaDesde, fechaHasta);

  const encabezado = 'Fecha,Monto,Descripcion,Categoria,Caja,Metodo de Pago,Tipo Periodo\n';
  const filas = gastos.map(g =>
    `${g.fecha},${g.monto},"${(g.descripcion || '').replace(/"/g, '""')}",${g.categoria},${g.caja},${g.metodo_pago || ''},${g.tipo_periodo || ''}`
  ).join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename=gastos_${fechaDesde}_${fechaHasta}.csv`);
  res.send(encabezado + filas);
};

const almanaque = (req, res) => {
  const año = parseInt(req.query.año) || new Date().getFullYear();

  const filas = db.prepare(`
    SELECT strftime('%m', fecha) AS mes,
           COALESCE(SUM(monto), 0) AS total,
           COUNT(*) AS cantidad
    FROM gastos
    WHERE strftime('%Y', fecha) = ?
    GROUP BY strftime('%m', fecha)
  `).all(String(año));

  const meses = Array.from({ length: 12 }, (_, i) => {
    const mesStr = String(i + 1).padStart(2, '0');
    const fila = filas.find(f => f.mes === mesStr);
    return { mes: i + 1, total: fila ? fila.total : 0, cantidad: fila ? fila.cantidad : 0 };
  });

  res.json({ año, meses });
};

const gastosMes = (req, res) => {
  const año = parseInt(req.params.año);
  const mes = parseInt(req.params.mes);
  const rol = req.usuario.rol || 'usuario';

  const ahora = new Date();
  const mesActual = ahora.getMonth() + 1;
  const añoActual = ahora.getFullYear();
  const esMesActual = año === añoActual && mes === mesActual;
  const esMesFuturo = año > añoActual || (año === añoActual && mes > mesActual);

  const desde = `${año}-${String(mes).padStart(2, '0')}-01`;
  const diasMes = new Date(año, mes, 0).getDate();
  const hasta = `${año}-${String(mes).padStart(2, '0')}-${String(diasMes).padStart(2, '0')}`;

  const totalRow = db.prepare(
    "SELECT COALESCE(SUM(monto), 0) AS total, COUNT(*) AS cantidad FROM gastos WHERE fecha BETWEEN ? AND ?"
  ).get(desde, hasta);

  // admin (rol='usuario') no puede ver detalle de meses pasados
  if (!esMesActual && !esMesFuturo && rol !== 'admin') {
    return res.json({ año, mes, total: totalRow.total, cantidad: totalRow.cantidad, restringido: true, gastos: [] });
  }

  const gastos = db.prepare(`
    SELECT g.*,
           c.nombre  AS categoria_nombre,
           ca.nombre AS caja_nombre
    FROM gastos g
    LEFT JOIN categorias c  ON g.categoria_id = c.id
    LEFT JOIN categorias ca ON g.caja_id      = ca.id
    WHERE g.fecha BETWEEN ? AND ?
    ORDER BY g.fecha DESC, g.creado_en DESC
  `).all(desde, hasta);

  res.json({ año, mes, total: totalRow.total, cantidad: totalRow.cantidad, restringido: false, gastos });
};

module.exports = { dashboard, resumen, exportarCSV, almanaque, gastosMes };
