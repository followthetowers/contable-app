const router = require('express').Router();
const { listar } = require('../controllers/categorias.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.use(verificarToken);
router.get('/', listar);

module.exports = router;
