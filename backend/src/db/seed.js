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
