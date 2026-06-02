const express = require('express');
const cors    = require('cors');
const seed    = require('./db/seed');

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth',       require('./routes/auth.routes'));
app.use('/api/gastos',     require('./routes/gastos.routes'));
app.use('/api/categorias', require('./routes/categorias.routes'));
app.use('/api/reportes',   require('./routes/reportes.routes'));

// Health check
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// Seed inicial
seed();

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n🟠 Servidor corriendo en http://localhost:${PORT}`);
  console.log('   Presiona Ctrl+C para detener\n');
});
