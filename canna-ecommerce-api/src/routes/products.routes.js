// src/routes/products.routes.js
const express = require('express');
const ctrl = require('../controllers/products.controller');

const router = express.Router();

// GET /api/products  (paginación/filtros/orden)
router.get('/', ctrl.getAll);

// POST /api/products  (crear producto)
router.post('/', ctrl.create);

// GET /api/products/:pid  (detalle)
router.get('/:pid', ctrl.getById);

// PUT /api/products/:pid  (actualizar)
router.put('/:pid', ctrl.update);

// DELETE /api/products/:pid  (eliminar)
router.delete('/:pid', ctrl.remove);

module.exports = router;
