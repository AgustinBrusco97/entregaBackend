const { Router } = require('express');
const ProductsService = require('../services/products.service');

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const svc = new ProductsService();
    const method = typeof svc.getAll === 'function' ? 'getAll' : 'getAllProducts';
    const raw = await svc[method]();
    const products =
      Array.isArray(raw) ? raw :
      Array.isArray(raw?.products) ? raw.products :
      Array.isArray(raw?.data?.products) ? raw.data.products : [];
    res.render('home', { products });
  } catch (err) {
    next(err);
  }
});

router.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts');
});

module.exports = router;
