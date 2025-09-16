const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const config = require('./config/config');
const { seedDatabase } = require('./scripts/seed');

async function startServer() {
  try {
    if (config.SEED_ON_START) {
      console.log('🌱 Ejecutando seed inicial...');
      await seedDatabase(false);
    }

    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: '*' } });
    app.set('io', io);

    let online = 0;

    io.on('connection', (socket) => {
      online++; io.emit('users:count', online);

      socket.on('disconnect', () => {
        online--; io.emit('users:count', online);
      });

      socket.on('ws:createProduct', async (payload, ack) => {
        try {
          const ProductsService = require('./src/services/products.service');
          const svc = new ProductsService();
          const created = await svc.createProduct(payload);
          io.emit('products:changed');
          if (typeof ack === 'function') ack({ ok: true, action: 'create', id: created?.id || created?._id || null });
        } catch (err) {
          console.error('ws:createProduct error:', err);
          if (typeof ack === 'function') ack({ ok: false, error: err.message || 'Error creando producto' });
          socket.emit('ws:error', err.message || 'Error creando producto');
        }
      });

      socket.on('ws:deleteProduct', async (id, ack) => {
        try {
          const ProductsService = require('./src/services/products.service');
          const svc = new ProductsService();
          await svc.deleteProduct(id);
          io.emit('products:changed');
          if (typeof ack === 'function') ack({ ok: true, action: 'delete', id });
        } catch (err) {
          console.error('ws:deleteProduct error:', err);
          if (typeof ack === 'function') ack({ ok: false, error: err.message || 'Error eliminando producto' });
          socket.emit('ws:error', err.message || 'Error eliminando producto');
        }
      });
    });

    server.listen(config.PORT, () => {
      console.log('\n🚀 Servidor iniciado exitosamente!');
      console.log(`📡 Puerto: ${config.PORT}`);
      console.log(`🌍 URL: http://localhost:${config.PORT}`);
      console.log(`💚 Modo Demo: ${config.DEMO_MODE ? 'Activado' : 'Desactivado'}`);
      console.log(`🌱 Seed automático: ${config.SEED_ON_START ? 'Activado' : 'Desactivado'}`);
      console.log('\n📚 Endpoints disponibles:');
      console.log('  GET    http://localhost:' + config.PORT + '/');
      console.log('  GET    http://localhost:' + config.PORT + '/health');
      console.log('  GET    http://localhost:' + config.PORT + '/api/products');
      console.log('  POST   http://localhost:' + config.PORT + '/api/products');
      console.log('  GET    http://localhost:' + config.PORT + '/api/products/:pid');
      console.log('  PUT    http://localhost:' + config.PORT + '/api/products/:pid');
      console.log('  DELETE http://localhost:' + config.PORT + '/api/products/:pid');
      console.log('  POST   http://localhost:' + config.PORT + '/api/carts');
      console.log('  GET    http://localhost:' + config.PORT + '/api/carts/:cid');
      console.log('  POST   http://localhost:' + config.PORT + '/api/carts/:cid/product/:pid');
      console.log('\n💡 Importa Cannabis_API.postman_collection.json para ver ejemplos');
      console.log('🧩 Socket.IO activo en el mismo puerto');
      console.log('⚡ API lista para recibir peticiones!');
    });

    const shutdown = (signal) => {
      console.log(`\n📴 (${signal}) Cerrando servidor...`);
      io.close(() => {
        console.log('🧩 Socket.IO cerrado');
        server.close(() => {
          console.log('✅ Servidor cerrado exitosamente');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
