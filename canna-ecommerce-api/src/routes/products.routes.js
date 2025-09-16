const { Router } = require('express');
const ctrl = require('../controllers/products.controller');
const router = Router();

router.get('/', ctrl.getAll);
router.get('/:pid', ctrl.getById);
router.post('/', ctrl.createProduct);
router.put('/:pid', ctrl.updateProduct);
router.delete('/:pid', ctrl.deleteProduct);

module.exports = router;
