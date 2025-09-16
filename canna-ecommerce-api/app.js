const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');

const productsRouter = require('./src/routes/products.routes');
const cartsRouter = require('./src/routes/carts.routes');
const viewsRouter = require('./src/routes/views.router'); 

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});


app.use(express.static(path.join(__dirname, 'public')));


app.engine('handlebars', exphbs.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'src', 'views', 'layouts'),
  helpers: {
  }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'src', 'views'));
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);


app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Canna E-commerce API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});


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


app.use('/', viewsRouter);


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
      'POST /api/carts/:cid/product/:pid'
    ]
  });
});


app.use((error, req, res, next) => {
  console.error(`❌ Error: ${error.message}`);
  console.error(error.stack);

  let statusCode = 500;
  let message = 'Error interno del servidor';


  if (error.message.includes('no encontrado')) {
    statusCode = 404;
    message = error.message;
  } else if (
    error.message.includes('validación') ||
    error.message.includes('requerido') ||
    error.message.includes('debe ser') ||
    error.message.includes('ya existe') ||
    error.message.includes('Stock insuficiente') ||
    error.message.includes('inactivos')
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
