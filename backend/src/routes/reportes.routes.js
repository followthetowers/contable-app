const router = require('express').Router();
const { dashboard, resumen, exportarCSV } = require('../controllers/reportes.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.use(verificarToken);

router.get('/dashboard', dashboard);
router.get('/resumen',   resumen);
router.get('/exportar',  exportarCSV);

module.exports = router;
