const express = require('express');
const ctrl = require('../controllers/carts.controller');
const router = express.Router();

// POST /api/carts - Crear nuevo carrito
router.post('/', ctrl.createCart);

// GET /api/carts/:cid - Obtener carrito con populate
router.get('/:cid', ctrl.getCartById);

// POST /api/carts/:cid/product/:pid - Agregar producto
router.post('/:cid/product/:pid', ctrl.addProductToCart);

// PUT /api/carts/:cid/product/:pid - Actualizar cantidad de un producto
router.put('/:cid/product/:pid', ctrl.updateProductQuantity);

// DELETE /api/carts/:cid/product/:pid - Eliminar un producto
router.delete('/:cid/product/:pid', ctrl.removeProductFromCart);

// PUT /api/carts/:cid - Reemplazar todos los productos del carrito
router.put('/:cid', ctrl.updateAllProducts);

// DELETE /api/carts/:cid - Vaciar carrito
router.delete('/:cid', ctrl.clearCart);

// === Aliases en plural para cumplir la consigna literalmente ===
router.put('/:cid/products/:pid', ctrl.updateProductQuantity);   // alias de PUT /:cid/product/:pid
router.delete('/:cid/products/:pid', ctrl.removeProductFromCart); // alias de DELETE /:cid/product/:pid

module.exports = router;
