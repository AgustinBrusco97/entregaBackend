const crypto = require('crypto');
const ProductsDAO = require('../src/dao/products.dao');
const CartsDAO = require('../src/dao/carts.dao');

const seedProducts = [
  {
    id: crypto.randomUUID(),
    title: "OG Kush Premium",
    description: "Flor indoor curada 3 semanas, aroma terroso y cítrico. Variedad híbrida con efectos relajantes.",
    code: "OGK-001",
    price: 4500,
    stock: 25,
    category: "flowers",
    status: true,
    thumbnails: ["https://example.com/ogkush1.jpg", "https://example.com/ogkush2.jpg"],
    specs: {
      strain: "OG Kush",
      thc: 22,
      cbd: 0.3,
      aroma: "cítrico",
      weight: 3.5
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Wax Lemon Haze",
    description: "Extracto de calidad premium, extracción por BHO de la variedad Lemon Haze",
    code: "WLH-001",
    price: 8500,
    stock: 15,
    category: "extracts",
    status: true,
    thumbnails: ["https://example.com/wax1.jpg"],
    specs: {
      type: "BHO",
      thc: 85,
      cbd: 1.2,
      quantity: 1
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Brownie THC 50mg",
    description: "Brownie de chocolate artesanal infusionado con 50mg de THC. Ideal para usuarios experimentados.",
    code: "BRW-050",
    price: 1200,
    stock: 30,
    category: "edibles",
    status: true,
    thumbnails: ["https://example.com/brownie1.jpg"],
    specs: {
      format: "brownie",
      thcMg: 50,
      units: 1
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Grinder Metálico 4 Partes",
    description: "Grinder de aluminio anodizado de 4 partes con malla fina para recolección de tricomas",
    code: "GRD-ALU-4",
    price: 2800,
    stock: 50,
    category: "accessories",
    status: true,
    thumbnails: ["https://example.com/grinder1.jpg"],
    specs: {
      type: "grinder",
      material: "aluminio",
      compatibility: "universal"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "White Widow Indoor",
    description: "Flor de interior de la legendaria White Widow, conocida por su potencia y cristales blancos",
    code: "WW-IND-001",
    price: 5200,
    stock: 18,
    category: "flowers",
    status: true,
    thumbnails: ["https://example.com/whitewidow1.jpg"],
    specs: {
      strain: "White Widow",
      thc: 25,
      cbd: 0.8,
      aroma: "dulce",
      weight: 3.5
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Aceite CBD Full Spectrum",
    description: "Aceite de CBD de espectro completo, ideal para uso medicinal y relajación",
    code: "CBD-FS-30",
    price: 6800,
    stock: 22,
    category: "extracts",
    status: true,
    thumbnails: ["https://example.com/cbdoil1.jpg"],
    specs: {
      type: "aceite",
      thc: 0.3,
      cbd: 30,
      quantity: 30
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Gummies de Frutas 10mg",
    description: "Gomitas de frutas sabor mixto, cada una con 10mg de THC. Presentación de 10 unidades.",
    code: "GUM-FRT-10",
    price: 3500,
    stock: 40,
    category: "edibles",
    status: true,
    thumbnails: ["https://example.com/gummies1.jpg"],
    specs: {
      format: "gummies",
      thcMg: 10,
      units: 10
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    title: "Pipa de Cristal Borosilicato",
    description: "Pipa artesanal de cristal borosilicato resistente al calor, diseño elegante",
    code: "PIP-CRI-BOR",
    price: 3200,
    stock: 12,
    category: "accessories",
    status: true,
    thumbnails: ["https://example.com/pipe1.jpg"],
    specs: {
      type: "pipe",
      material: "borosilicato",
      compatibility: "flores"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const seedCarts = [
  {
    id: crypto.randomUUID(),
    products: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

async function seedDatabase(force = false) {
  const productsDAO = new ProductsDAO();
  const cartsDAO = new CartsDAO();

  try {
    // Verificar si ya existen datos
    const existingProducts = await productsDAO.getAll();
    const existingCarts = await cartsDAO.getAll();

    if (!force && (existingProducts.length > 0 || existingCarts.length > 0)) {
      console.log('⚠️  La base de datos ya contiene datos. Use --force para sobrescribir.');
      return;
    }

    console.log('🌱 Iniciando seed de la base de datos...');

    // Crear productos
    await productsDAO.writeProducts(seedProducts);
    console.log(`✅ Creados ${seedProducts.length} productos de ejemplo`);

    // Crear carritos
    await cartsDAO.writeCarts(seedCarts);
    console.log(`✅ Creados ${seedCarts.length} carritos de ejemplo`);

    console.log('🎉 Seed completado exitosamente!');
    console.log('\n📦 Productos creados:');
    seedProducts.forEach(product => {
      console.log(`  - ${product.title} (${product.category}) - $${product.price}`);
    });

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const force = process.argv.includes('--force');
  seedDatabase(force).then(() => {
    console.log('\n🚀 Listo para usar! Ejecute npm start para iniciar el servidor.');
    process.exit(0);
  });
}

module.exports = { seedDatabase, seedProducts, seedCarts };
