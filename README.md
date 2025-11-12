🌿 Canna E-commerce API — Entrega  (Backend 2)

API REST + Vistas con Node.js / Express / Handlebars / Socket.IO / MongoDB Atlas (Mongoose).
Incluye paginación + filtros + orden, carritos con populate, tiempo real, scripts de seed y migración y colección Postman para pruebas.

🚀 Instalación y ejecución
Prerrequisitos

*Node.js 18+ / npm

*Cuenta gratuita en MongoDB Atlas

*(Opcional) Postman para importar la colección

Clonar e instalar
git clone <url-de-tu-repo>
cd canna-ecommerce-api
npm install

Variables de entorno (.env)
# Server
PORT=8080
NODE_ENV=development

# Mongo Atlas
MONGO_URI="mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/canna"

# (Opcional) Forzar un carrito “demo” para el navbar y vistas
DEMO_CART_ID=""


Si dejás DEMO_CART_ID vacío, el servidor crea un carrito al vuelo y lo reutiliza en todas las vistas.

Scripts útiles
# Desarrollo con hot-reload
npm run dev

# Producción
npm start

# Semillas (FS legacy; útil para tests rápidos)
npm run seed
npm run reseed

# Migrar productos desde FS → MongoDB Atlas
npm run migrate


Servidor por defecto: http://localhost:8080
```
📁 Estructura del proyecto
canna-ecommerce-api/
├── app.js
├── index.js
├── package.json
├── nodemon.json
├── .env
├── README.md
├── Cannabis_API.postman_collection.json
│
├── config/
│   ├── config.js
│   └── environment.js
│
├── data/                   # FS legacy (para seeds de prueba)
│   ├── carts.json
│   └── products.json
│
├── public/
│   ├── css/
│   │   └── styles.css      # UI oscura, cards, chips, toasts, etc.
│   └── js/
│       ├── catalog.js
│       └── realtime.js
│
├── scripts/
│   ├── seed.js
│   └── migrate.fs.to.mongo.js
│
└── src/
    ├── controllers/
    │   ├── carts.controller.js       # 400/404/409 “amistosos” donde aplica
    │   └── products.controller.js    # maneja 400 (validación) y 409 (duplicados)
    │
    ├── dao/
    │   ├── mongo.js                  # conexión Mongoose
    │   ├── products.dao.js           # (si conservás compatibilidad FS)
    │   ├── carts.dao.js              # (si conservás compatibilidad FS)
    │   └── models/
    │       ├── product.model.js
    │       └── cart.model.js         # ref a Product + populate
    │
    ├── routes/
    │   ├── products.routes.js        # /api/products
    │   ├── carts.routes.js           # /api/carts (+ endpoints extra)
    │   └── views.router.js           # /, /products, /products/:pid, /carts/:cid, /realtimeproducts
    │
    ├── services/
    │   ├── products.service.js       # paginación, filtros, sort, formato “consigna”
    │   └── carts.service.js          # add, update qty, remove, replace, clear, populate
    │
    └── views/
        ├── layouts/
        │   └── main.handlebars
        ├── partials/
        │   ├── header.handlebars
        │   ├── navbar.handlebars     # ícono de carrito + badge de cantidad
        │   └── footer.handlebars
        ├── home.handlebars
        ├── products.handlebars       # catálogo con paginación/filtros/orden
        ├── product.handlebars        # detalle + “agregar al carrito”
        ├── cart.handlebars           # vista del carrito (populate)
        └── realTimeProducts.handlebars
```
🔌 API — Endpoints
Productos /api/products
Método	Ruta	Descripción
GET	/	Lista paginada con filtros y orden
GET	/:pid	Obtiene un producto por ID
POST	/	Crea producto (400 validación / 409 duplicado code)
PUT	/:pid	Actualiza producto
DELETE	/:pid	Elimina producto

Query de GET /api/products

limit (default 10, máx 50)

page (default 1)

sort=asc|desc (por precio)

query:

category:flowers|extracts|edibles|accessories

status:true|false

Formato de respuesta (consigna):

{
  "status": "success",
  "payload": [ /* productos */ ],
  "totalPages": 5,
  "prevPage": 1,
  "nextPage": 3,
  "page": 2,
  "hasPrevPage": true,
  "hasNextPage": true,
  "prevLink": "http://localhost:8080/api/products?...&page=1",
  "nextLink": "http://localhost:8080/api/products?...&page=3"
}

Carritos /api/carts
Método	Ruta	Descripción
POST	/	Crea carrito
GET	/:cid	Obtiene carrito con populate
POST	/:cid/product/:pid	Agrega un producto
PUT	/:cid/products/:pid	Actualiza SOLO cantidad
PUT	/:cid	Reemplaza todo el arreglo de productos
DELETE	/:cid/products/:pid	Elimina un producto
DELETE	/:cid	Vacía el carrito

El populate devuelve cada entrada como { product: {…}, quantity: n } con los datos completos del producto.

🖥️ Vistas (Handlebars)

/products: grilla con chips de categoría, buscador simple, orden por precio y paginación.

/products/:pid: detalle del producto + botón “agregar al carrito” (usa cartId inyectado).

/carts/:cid: lista solo los productos de ese carrito (populate) con subtotales y total.

/realtimeproducts: alta/baja en tiempo real vía Socket.IO.

El navbar muestra un badge con la cantidad del carrito y enlaza a /carts/{{cartId}}. Si faltara un cartId, el servidor crea uno y lo expone en res.locals.cartId.

📦 Validaciones y manejo de errores

Productos

409 si code está duplicado (índice único Mongoose).

400 por errores de validación (title, code, price, category, etc.).

Carritos

404 si :cid o :pid no existen.

400 si quantity inválida u operación no permitida.

El middleware global devuelve JSON consistente:

{ "status": "error", "message": "..." }

🔁 Tiempo real (Socket.IO)

Canal de creación y eliminación de productos en vivo.

Indicador de usuarios conectados.

Auto-refresh del catálogo en /realtimeproducts sin recargar la página.

🧪 Testing rápido
Postman

Importá la colección:

Canna_Ecommerce_Postman_Entrega_Final.json (incluye variables baseUrl, CID, PID1, etc.)

Requests para: productos (CRUD + filtros), carritos (CRUD + extra), vistas (GET /products, /carts/:cid, /realtimeproducts).

Curl (ejemplos)
# Listado paginado y filtrado
curl "http://localhost:8080/api/products?limit=5&page=1&sort=asc&query=category:flowers"

# Crear producto (usar code único)
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{"title":"OG Kush Premium","description":"...", "code":"OGK-POST-001","price":4500,"category":"flowers","stock":25,"status":true}'

🧰 Scripts de datos

npm run seed / npm run reseed: escribe FS legacy (/data/*.json).

npm run migrate: toma los productos del seed y los inserta en MongoDB Atlas con pequeñas transformaciones (genera code si falta, limpia duplicados, etc.).

✅ Checklist de la consigna

Mongo Atlas como persistencia principal ✔️

Productos con filtros (categoría/estado), paginación, orden por precio y formato de respuesta especificado ✔️

Carritos: endpoints extra (PUT cantidad, DELETE item, PUT replace, DELETE clear) ✔️

Populate al traer un carrito ✔️

Vistas:

/products con paginación/filtros/orden ✔️

/products/:pid o “agregar directo” ✔️

/carts/:cid con productos del carrito ✔️

/realtimeproducts con websockets ✔️

Colección Postman ✔️

🧠 Notas técnicas

.lean() en queries para compatibilidad con Handlebars y mejor rendimiento.

Helpers Handlebars: eq, year.

CSS: tema oscuro, chips, cards, toasts y badge del carrito.

Estructura en capas: routes → controllers → services → dao/models.

Logs mínimos en consola + middleware de errores consistente.

🤝 Desarrollo

Scripts NPM

dev, start, seed, reseed, migrate

Dependencias clave

express, express-handlebars, mongoose, socket.io, dotenv, nodemon

Convenciones

feat:, fix:, docs:, refactor:, chore: en commits

📎 Anexos

Colección Postman: Canna_Ecommerce_Postman_Entrega_Final.json

Archivo de estilos: public/css/styles.css

Vistas: src/views/*

Modelos: src/dao/models/*

Canna E-commerce — Backend I (Coderhouse)
Entrega Final: API REST + Vistas + WebSockets + MongoDB Atlas + Carritos con populate.

CRÉDITOS

Proyecto desarrollado por: Agustín Brusco.
