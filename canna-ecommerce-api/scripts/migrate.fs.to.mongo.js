/**
 * Migrar productos del seed (FS legacy) a MongoDB Atlas
 * Ejecutar con: npm run migrate
 */

require('dotenv').config();
const mongoose = require('mongoose');

// ✅ tomamos los productos de tu seed actual
const { seedProducts: SEED_PRODUCTS } = require('./seed'); // << usa tu scripts/seed.js
const { ProductModel } = require('../src/dao/models/product.model'); // modelo Mongoose

// -------- helpers --------
function generateCodeFrom(product, index) {
  const categoryPrefix = (product.category || 'PRD').substring(0, 3).toUpperCase();
  const titlePart = (product.title || '').substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${categoryPrefix}-${titlePart}-${String(index + 1).padStart(3, '0')}`;
}

function transformSeedProduct(product, index) {
  return {
    title: product.title,
    description: product.description || '',
    code: product.code || generateCodeFrom(product, index),
    price: Number(product.price) || 0,
    category: product.category || 'misc',
    stock: Number(product.stock) || 0,
    status: product.status === true || product.status === 'active',
    thumbnails: Array.isArray(product.thumbnails) ? product.thumbnails : [],
    specs: product.specs || {}
  };
}

(async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('Falta MONGO_URI en .env');
    }

    console.log('🌐 Conectando a MongoDB Atlas…');
    const conn = await mongoose.connect(process.env.MONGO_URI, { dbName: 'canna_ecommerce' });
    console.log(`✅ Conectado a: ${conn.connection.host}/${conn.connection.name}`);

    // ⚠️ limpiar colección (opcional). Si querés conservar, comentá la siguiente línea.
    const del = await ProductModel.deleteMany({});
    console.log(`🧹 Productos eliminados previamente: ${del.deletedCount}`);

    if (!SEED_PRODUCTS || SEED_PRODUCTS.length === 0) {
      console.log('⚠️ No hay productos en el seed para migrar.');
      process.exit(0);
    }

    console.log(`📦 Preparando ${SEED_PRODUCTS.length} productos…`);
    const transformed = SEED_PRODUCTS.map((p, i) => transformSeedProduct(p, i));

    // Verificar códigos únicos
    const seen = new Set();
    const dups = new Set();
    transformed.forEach(p => {
      if (seen.has(p.code)) dups.add(p.code);
      seen.add(p.code);
    });

    if (dups.size > 0) {
      console.log(`⚠️ Códigos duplicados detectados: ${Array.from(dups).join(', ')}`);
      transformed.forEach((p, idx) => {
        if (dups.has(p.code)) {
          p.code = `${p.code}-${Date.now()}-${idx}`;
        }
      });
      console.log('🔧 Duplicados resueltos agregando sufijo único.');
    }

    console.log('💾 Insertando en MongoDB (ordered:false)…');
    const result = await ProductModel.insertMany(transformed, { ordered: false });
    console.log(`✅ Migración completa: ${result.length} productos insertados.`);

    // Resumen por categoría
    const counts = {};
    result.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
    console.log('\n📊 Resumen por categoría:');
    Object.entries(counts).forEach(([cat, n]) => console.log(`   • ${cat}: ${n}`));

    // Ejemplos
    console.log('\n📝 Primeros 3 productos:');
    result.slice(0, 3).forEach((p, i) => {
      console.log(`   ${i + 1}. ${String(p.title).substring(0, 40)}…`);
      console.log(`      Code: ${p.code} | Precio: $${p.price} | Stock: ${p.stock}`);
    });

    console.log('\n🎯 Productos listos en MongoDB Atlas.\n');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error durante la migración:', err.message);

    if (err.name === 'ValidationError') {
      console.error('\n📋 Detalles de validación:');
      for (const field of Object.keys(err.errors)) {
        console.error(`   • ${field}: ${err.errors[field].message}`);
      }
    }

    if (err.code === 11000) {
      console.error('\n⚠️ Error de duplicado (índice único):', err.keyValue);
      console.error('   Podés reintentar: ya se resolvieron duplicados en memoria.');
    }

    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
})();
