const bcrypt = require('bcryptjs');
const db = require('./database');

function seed() {
  // Usuario admin (rol limitado)
  const existeAdmin = db.prepare('SELECT id FROM usuarios WHERE usuario = ?').get('admin');
  if (!existeAdmin) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare("INSERT INTO usuarios (usuario, password, rol) VALUES (?, ?, 'usuario')").run('admin', hash);
    console.log('✓ Usuario creado  →  usuario: admin  |  password: admin123  |  rol: usuario');
  } else {
    db.prepare("UPDATE usuarios SET rol = 'usuario' WHERE usuario = 'admin'").run();
  }

  // Actualizar password de admin si está definido en variable de entorno
  if (process.env.ADMIN_PASSWORD) {
    const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
    db.prepare('UPDATE usuarios SET password = ? WHERE usuario = ?').run(hash, 'admin');
    console.log('✓ Password de admin actualizado desde ADMIN_PASSWORD');
  }

  // Usuario admin2 (rol completo)
  const existeAdmin2 = db.prepare('SELECT id FROM usuarios WHERE usuario = ?').get('admin2');
  if (!existeAdmin2) {
    const hash = bcrypt.hashSync('M3dr4n0348$', 10);
    db.prepare("INSERT INTO usuarios (usuario, password, rol) VALUES (?, ?, 'admin')").run('admin2', hash);
    console.log('✓ Usuario creado  →  usuario: admin2  |  rol: admin');
  } else {
    db.prepare("UPDATE usuarios SET rol = 'admin' WHERE usuario = 'admin2'").run();
  }

  // Actualizar password de admin2 si está definido en variable de entorno
  if (process.env.ADMIN2_PASSWORD) {
    const hash = bcrypt.hashSync(process.env.ADMIN2_PASSWORD, 10);
    db.prepare('UPDATE usuarios SET password = ? WHERE usuario = ?').run(hash, 'admin2');
    console.log('✓ Password de admin2 actualizado desde ADMIN2_PASSWORD');
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
