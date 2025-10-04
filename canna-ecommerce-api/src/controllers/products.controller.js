// src/controllers/products.controller.js
const ProductsService = require('../services/products.service');
const productsService = new ProductsService();

/* --------------------------------------------
   Helper: mapear errores de Mongoose a HTTP
---------------------------------------------*/
function handleMongooseError(err, res) {
  // Índice único duplicado (por ejemplo, code repetido)
  if (err && err.code === 11000) {
    return res.status(409).json({
      status: 'error',
      message: 'El código de producto ya existe',
      keyValue: err.keyValue
    });
  }

  // Errores de validación del schema
  if (err && err.name === 'ValidationError') {
    const errors = Object.keys(err.errors || {}).reduce((acc, k) => {
      acc[k] = err.errors[k].message;
      return acc;
    }, {});
    return res.status(400).json({
      status: 'error',
      message: 'Datos inválidos',
      errors
    });
  }

  // Si no reconocemos el error, devolvemos null y que lo maneje el middleware global (500)
  return null;
}

/* --------------------------------------------
   Handlers
---------------------------------------------*/
async function getAll(req, res, next) {
  try {
    const result = await productsService.getAllProducts(req.query);
    return res.json(result); // { status, payload, totalPages, ... }
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const product = await productsService.getProductById(req.params.pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    return res.json({ status: 'success', payload: product });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const created = await productsService.createProduct(req.body);
    return res.status(201).json({ status: 'success', payload: created });
  } catch (err) {
    const handled = handleMongooseError(err, res);
    if (handled) return; // ya respondimos 400/409
    return next(err);    // 500 u otros
  }
}

async function update(req, res, next) {
  try {
    const updated = await productsService.updateProduct(req.params.pid, req.body);
    if (!updated) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    return res.json({ status: 'success', payload: updated });
  } catch (err) {
    const handled = handleMongooseError(err, res);
    if (handled) return;
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const removed = await productsService.deleteProduct(req.params.pid);
    if (!removed) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    return res.json({ status: 'success', payload: removed });
  } catch (err) {
    return next(err);
  }
}

/* --------------------------------------------
   Export explícito
---------------------------------------------*/
const controller = { getAll, getById, create, update, remove };
module.exports = controller;
