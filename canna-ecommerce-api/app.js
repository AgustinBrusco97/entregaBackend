// app.js
const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');

const productsRouter = require('./src/routes/products.routes');
const cartsRouter = require('./src/routes/carts.routes');
const viewsRouter = require('./src/routes/views.router');

// 👇 servicio para crear/lembrar un carrito demo
const CartsService = require('./src/services/carts.service');
const cartsSvc = new CartsService();

const app = express();

// Middlewares básicos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger simple
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars (con layouts, partials y helpers)
app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'src', 'views', 'layouts'),
  partialsDir: path.join(__dirname, 'src', 'views', 'partials'),
  helpers: {
    eq: (a, b) => a === b,
    year: () => new Date().getFullYear()
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src', 'views'));

// 👇 Middleware: asegura un cartId disponible para las vistas
async function ensureDemoCart(req, res, next) {
  try {
    // Usa uno ya cacheado
    if (req.app.locals.demoCartId) {
      res.locals.cartId = req.app.locals.demoCartId;
      return next();
    }
    // Usa uno provisto por .env si existe
    if (process.env.DEMO_CART_ID) {
      req.app.locals.demoCartId = process.env.DEMO_CART_ID;
      res.locals.cartId = process.env.DEMO_CART_ID;
      return next();
    }
    // Crea uno nuevo y cachea el id
    const created = await cartsSvc.createCart();
    const id = (created && (created._id?.toString?.() || created.id)) || null;
    req.app.locals.demoCartId = id;
    res.locals.cartId = id;
    return next();
  } catch (e) {
    // si falla seguimos sin cartId (el link quedará sin /:cid)
    return next();
  }
}
// Aplicar a rutas de vistas (antes de montarlas)
app.use(ensureDemoCart);

// Rutas API
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Canna E-commerce API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Info API
app.get('/api', (req, res) => {
  res.json({
    message: 'Bienvenido a Canna E-commerce API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      carts: '/api/carts',
      health: '/health'
    },
    documentation: 'Importar Cannabis_API.postman_collection.json en Postman para ver ejemplos'
  });
});

// Vistas
app.use('/', viewsRouter);

// 404
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Ruta ${req.originalUrl} no encontrada`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api',
      'GET /api/products',
      'POST /api/products',
      'GET /api/products/:pid',
      'PUT /api/products/:pid',
      'DELETE /api/products/:pid',
      'POST /api/carts',
      'GET /api/carts/:cid',
      'PUT /api/carts/:cid',
      'PUT /api/carts/:cid/product/:pid',
      'POST /api/carts/:cid/product/:pid',
      'DELETE /api/carts/:cid/product/:pid',
      'DELETE /api/carts/:cid'
    ]
  });
});

// Manejo de errores
app.use((error, req, res, next) => {
  console.error(`❌ Error: ${error.message}`);
  console.error(error.stack);

  let statusCode = 500;
  let message = 'Error interno del servidor';

  if (error.message?.toLowerCase().includes('no encontrado')) {
    statusCode = 404;
    message = error.message;
  } else if (
    /validación|requerido|debe ser|ya existe|stock insuficiente|inactivos/i.test(error.message || '')
  ) {
    statusCode = 400;
    message = error.message;
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = app;
