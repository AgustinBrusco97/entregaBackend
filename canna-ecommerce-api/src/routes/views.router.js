// src/routes/views.router.js
const { Router } = require('express');
const ProductsService = require('../services/products.service');
const CartsService = require('../services/carts.service');

const router = Router();
const productsSvc = new ProductsService();
const cartsSvc = new CartsService();

/**
 * HOME -> usa tu vista `home.handlebars`
 */
router.get('/', async (_req, res, next) => {
  try {
    const result = await productsSvc.getAllProducts({ limit: 100 });
    res.render('home', { products: result.payload, cartId: res.locals.cartId });
  } catch (err) { next(err); }
});

/**
 * Catálogo con paginación/filtros/orden (entrega final)
 */
router.get('/products', async (req, res, next) => {
  try {
    const result = await productsSvc.getAllProducts(req.query);
    res.render('products', {
      ...result,
      query: req.query.query || '',
      sort: req.query.sort || '',
      limit: parseInt(req.query.limit) || 10,
      cartId: res.locals.cartId
    });
  } catch (err) { next(err); }
});

/**
 * Detalle de producto
 */
router.get('/products/:pid', async (req, res, next) => {
  try {
    const product = await productsSvc.getProductById(req.params.pid);
    res.render('product', { product, cartId: res.locals.cartId });
  } catch (err) { next(err); }
});

/**
 * Carrito (con populate)
 */
router.get('/carts/:cid', async (req, res, next) => {
  try {
    const cart = await cartsSvc.getCartById(req.params.cid);
    res.render('cart', { cart, cartId: res.locals.cartId });
  } catch (err) { next(err); }
});

/**
 * Vista realtime (websockets)
 */
router.get('/realtimeproducts', async (_req, res, next) => {
  try {
    const result = await productsSvc.getAllProducts({ limit: 100 });
    res.render('realTimeProducts', { products: result.payload, cartId: res.locals.cartId });
  } catch (err) { next(err); }
});

module.exports = router;
