Canna E-commerce API — Handlebars + WebSockets (Tiempo Real)

Plataforma educativa de e-commerce con Express, Handlebars y Socket.IO.
Incluye vistas server-side render, una vista en tiempo real que refleja creación/eliminación de productos al instante, y una API REST para Products y Carts.

✨ Features

Motor de plantillas: express-handlebars (SSR).

Socket.IO: actualización automática en /realtimeproducts ante altas/bajas.

Emit desde HTTP: los endpoints POST/PUT/DELETE notifican products:changed.

Vista catálogo con tarjetas, imágenes, precio, stock, descripción.

Filtros por categoría y buscador con debounce.

Toasts de éxito/error en realtime.

Seed de datos (opcional) y modo demo.

Logging y manejo de errores global.

🧱 Stack

Node.js, Express

Socket.IO

express-handlebars

(Opcional) morgan/helmet/compression/rate-limit

📁 Estructura
canna-ecommerce-api/
├─ app.js
├─ index.js
├─ package.json
├─ config/
│  ├─ config.js
│  └─ environment.js
├─ data/
│  ├─ products.json
│  └─ carts.json
├─ public/
│  ├─ css/
│  │  └─ styles.css
│  └─ js/
│     ├─ catalog.js
│     └─ realtime.js
├─ scripts/
│  └─ seed.js
└─ src/
   ├─ routes/
   │  ├─ products.routes.js
   │  ├─ carts.routes.js
   │  └─ views.router.js
   ├─ controllers/
   │  └─ products.controller.js
   ├─ services/
   │  ├─ products.service.js
   │  └─ carts.service.js
   ├─ managers/
   │  └─ ProductManager.js (opcional)
   └─ views/
      ├─ layouts/
      │  └─ main.handlebars
      ├─ home.handlebars
      └─ realTimeProducts.handlebars

⚙️ Requisitos

Node.js 18+ (recomendado 20+)

npm

🚀 Instalación y ejecución
# 1) Instalar dependencias
npm install

# 2) (Opcional) Sembrar datos
npm run seed            # crea datos si no existen
npm run seed:force      # sobrescribe datos

# 3) Iniciar
npm run dev             # con nodemon (si está configurado)
# o
npm start               # node index.js


Variables de entorno (en config/environment.js):

require('dotenv').config();

module.exports = {
  PORT: Number(process.env.PORT) || 8080,
  DEMO_MODE: process.env.DEMO_MODE === 'true',
  SEED_ON_START: process.env.SEED_ON_START === 'true'
};


Sugerencia: para desarrollo, podés dejar SEED_ON_START=true al principio y luego ponerlo en false.

🧪 Rutas principales
Vistas (SSR)

GET / → Catálogo (Handlebars, con filtros y buscador).

GET /realtimeproducts → Vista en tiempo real (Socket.IO).

Salud

GET /health

API Products

GET /api/products

GET /api/products/:pid

POST /api/products

PUT /api/products/:pid

DELETE /api/products/:pid

API Carts

POST /api/carts

GET /api/carts/:cid

POST /api/carts/:cid/product/:pid

🔌 WebSockets (eventos)

Servidor (Socket.IO montado en index.js):

Emisiones de sistema

users:count — total de conexiones activas

products:changed — notifica a todos que la lista cambió

Eventos de cliente

ws:createProduct — payload de producto; ack { ok, error?, id? }

ws:deleteProduct — id de producto; ack { ok, error?, id? }

Errores

ws:error — mensaje de error legible

Cliente (public/js/realtime.js):

Escucha products:changed y refresca la grilla.

Muestra toasts en create/delete con ack.

🛠️ Emit desde HTTP (consigna)

Los endpoints HTTP de productos emiten products:changed tras crear/actualizar/eliminar:

// dentro del controller
const io = req.app.get('io'); .
io.emit('products:changed');


index.js agrega app.set('io', io) al montar Socket.IO para leerlo desde los handlers HTTP.

🧪 Ejemplos (curl)

Crear producto:

curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Galleta loca",
    "description": "Cookie con extracto de THC",
    "code": "EDB-COOKIE-002",
    "price": 1200,
    "stock": 50,
    "category": "edibles",
    "status": true,
    "specs": { "thcMg": 10, "units": 1 },
    "thumbnails": ["https://picsum.photos/seed/cookie/640/480"]
  }'


Eliminar producto:

curl -X DELETE http://localhost:8080/api/products/<ID>


Abrí dos pestañas en http://localhost:8080/realtimeproducts: al crear/eliminar, ambas se actualizan automáticamente.

📦 Seed de datos

Correr manual:

npm run seed
npm run seed:force


Automático al iniciar: SEED_ON_START=true en .env (o en config/environment.js).

Archivos por defecto: data/products.json y data/carts.json.

🧩 Configuración

config/config.js expone rutas y opciones:

productsFile, cartsFile

validCategories: ['flowers', 'extracts', 'edibles', 'accessories']

pagination: { defaultLimit, maxLimit }

Recomendado: calcular rutas absolutas con path.join para evitar problemas de cwd.

🧯 Errores y logs

Logger simple por request (fecha, método, url).

Middleware de errores global: mapea mensajes comunes a 400/404/500 y en development incluye stack.

🎨 UI (resumen)

Catálogo (/): tarjetas con imagen/fallback, badge de categoría, precio con gradiente, stock, SKU, filtros por categoría + buscador (debounce).

Tiempo real (/realtimeproducts): grilla + formularios de crear/eliminar, contador de conectados, toasts de feedback.

CSS en public/css/styles.css. JS de catálogo en public/js/catalog.js. JS de realtime en public/js/realtime.js.

🔐 Producción (sugerencias)
npm i helmet compression express-rate-limit morgan


helmet() y compression() en prod.

rateLimit para /api/*.

morgan('combined') para logs en prod.

CORS restringido a tu dominio.

✅ Checklist de la consigna

 Handlebars configurado y funcionando.

 Vista home.handlebars con lista de productos.

 Vista realTimeProducts.handlebars con WebSockets.

 Server Socket.IO montado en index.js.

 Emit en POST/PUT/DELETE → products:changed.

 Actualización automática en tiempo real.

 Bonus: contador de conectados, toasts, filtros + búsqueda.

🤝 Contribuir

PRs y sugerencias bienvenidas. Asegurate de:

Ejecutar npm test (si hay tests).

Mantener estilos y linting.

Describir claramente el cambio.