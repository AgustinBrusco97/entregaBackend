const express = require('express');
const CartsController = require('../controllers/carts.controller');

const router = express.Router();
const cartsController = new CartsController();

// POST /api/carts - Crear nuevo carrito
router.post('/', (req, res, next) => {
  cartsController.createCart(req, res, next);
});

// GET /api/carts/:cid - Obtener carrito por ID con productos detallados
router.get('/:cid', (req, res, next) => {
  cartsController.getCartById(req, res, next);
});

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', (req, res, next) => {
  cartsController.addProductToCart(req, res, next);
});

// DELETE /api/carts/:cid/product/:pid - Eliminar producto del carrito
router.delete('/:cid/product/:pid', (req, res, next) => {
  cartsController.removeProductFromCart(req, res, next);
});

// PUT /api/carts/:cid/product/:pid - Actualizar cantidad de producto en carrito
router.put('/:cid/product/:pid', (req, res, next) => {
  cartsController.updateProductQuantity(req, res, next);
});

// DELETE /api/carts/:cid - Vaciar carrito
router.delete('/:cid', (req, res, next) => {
  cartsController.clearCart(req, res, next);
});

module.exports = router;


