const bcrypt = require('bcryptjs');
const db = require('./database');

function seed() {
  // Usuario admin por defecto
  const existeUsuario = db.prepare('SELECT id FROM usuarios WHERE usuario = ?').get('admin');
  if (!existeUsuario) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO usuarios (usuario, password) VALUES (?, ?)').run('admin', hash);
    console.log('✓ Usuario creado  →  usuario: admin  |  password: admin123');
  }

  // Actualizar password si está definido en variable de entorno
  if (process.env.ADMIN_PASSWORD) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    db.prepare('UPDATE usuarios SET password = ? WHERE usuario = ?').run(hash, 'admin');
    console.log('✓ Password de admin actualizado desde ADMIN_PASSWORD');
  }

  // Cajas
  const cajas = ['ATROX', 'PERSONAL', 'VALENTINO', 'JESICA', 'TARJETAS', 'SUELDOS'];
  for (const nombre of cajas) {
    const existe = db.prepare('SELECT id FROM categorias WHERE nombre = ?').get(nombre);
    if (!existe) {
      db.prepare('INSERT INTO categorias (nombre, tipo) VALUES (?, ?)').run(nombre, 'caja');
    }
  }

  // Categorias de gasto
  const categorias = ['SERVICIOS', 'ALQUILER', 'COMIDA', 'NAFTA', 'PUBLICIDAD', 'PROVEEDORES', 'OTROS'];
  for (const nombre of categorias) {
    const existe = db.prepare('SELECT id FROM categorias WHERE nombre = ?').get(nombre);
    if (!existe) {
      db.prepare('INSERT INTO categorias (nombre, tipo) VALUES (?, ?)').run(nombre, 'categoria');
    }
  }

  console.log('✓ Seed completado — categorias y cajas cargadas');
}

module.exports = seed;
