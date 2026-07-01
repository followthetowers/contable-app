const router = require('express').Router();
const { dashboard, resumen, exportarCSV, almanaque, gastosMes } = require('../controllers/reportes.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.use(verificarToken);

router.get('/dashboard',       dashboard);
router.get('/resumen',         resumen);
router.get('/exportar',        exportarCSV);
router.get('/almanaque',       almanaque);
router.get('/mes/:año/:mes',   gastosMes);

module.exports = router;
