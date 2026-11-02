const { PrismaClient } = require('@prisma/client');
const {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_STORE_CONFIG
} = require('./data/initialData');

let prisma = null;
let dbConnected = false;
let dbError = null;

// Estado en memoria de respaldo en caso de que PostgreSQL local aún no esté levantado o migrado
const memoryStore = {
  categories: structuredClone(INITIAL_CATEGORIES),
  products: structuredClone(INITIAL_PRODUCTS),
  storeConfig: structuredClone(INITIAL_STORE_CONFIG),
  orders: [
    {
      id: 1,
      orderNumber: 'ASBA-1001',
      customerName: 'Valentina Gómez',
      customerEmail: 'valentina.gomez@ejemplo.com',
      customerPhone: '5491155667788',
      shippingMethod: 'ENVIO_DOMICILIO',
      shippingAddress: 'Av. Santa Fe 3240, Piso 4B',
      shippingCity: 'Palermo, CABA',
      shippingPostalCode: '1425',
      notes: 'Es para regalo de cumpleaños, por favor incluir tarjetita dedicada.',
      paymentMethod: 'TRANSFERENCIA',
      paymentStatus: 'APROBADO',
      status: 'EN_PREPARACION',
      subtotal: 40100,
      discount: 4010,
      shippingCost: 0,
      total: 36090,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        {
          id: 1,
          productId: 1,
          productName: INITIAL_PRODUCTS[0].name,
          productImage: INITIAL_PRODUCTS[0].image,
          unitPrice: INITIAL_PRODUCTS[0].price,
          quantity: 1,
          subtotal: INITIAL_PRODUCTS[0].price
        },
        {
          id: 2,
          productId: 2,
          productName: INITIAL_PRODUCTS[1].name,
          productImage: INITIAL_PRODUCTS[1].image,
          unitPrice: INITIAL_PRODUCTS[1].price,
          quantity: 2,
          subtotal: INITIAL_PRODUCTS[1].price * 2
        }
      ]
    }
  ]
};

async function initDatabase() {
  try {
    prisma = new PrismaClient();
    await prisma.$connect();
    // Verificar que las tablas existan haciendo un count simple
    const catCount = await prisma.category.count();
    dbConnected = true;
    dbError = null;
    console.log('✅ Conectado exitosamente a PostgreSQL mediante Prisma ORM.');

    // Auto-seed si las tablas están creadas pero vacías
    if (catCount === 0) {
      console.log('📦 Base de datos PostgreSQL vacía. Cargando catálogo inicial de ASBADECO...');
      await autoSeedPostgres();
    }
  } catch (err) {
    dbConnected = false;
    dbError = err.message;
    console.warn('⚠️ No se pudo conectar a PostgreSQL local o faltan ejecutar las migraciones.');
    console.warn('   Detalle:', err.message.split('\n').pop());
    console.warn('   👉 Para conectar PostgreSQL: configura server/.env y ejecuta "npm run db:setup"');
    console.warn('   ✨ Servidor funcionando en modo Respaldo Activo con el catálogo completo de ASBADECO.');
  }
}

async function autoSeedPostgres() {
  try {
    await prisma.storeConfig.upsert({
      where: { id: 1 },
      update: INITIAL_STORE_CONFIG,
      create: INITIAL_STORE_CONFIG
    });

    const catMap = {};
    for (const c of INITIAL_CATEGORIES) {
      const created = await prisma.category.upsert({
        where: { slug: c.slug },
        update: { name: c.name, description: c.description, image: c.image, icon: c.icon },
        create: { name: c.name, slug: c.slug, description: c.description, image: c.image, icon: c.icon }
      });
      catMap[c.id] = created.id;
    }

    for (const p of INITIAL_PRODUCTS) {
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: {},
        create: {
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          stock: p.stock,
          sku: p.sku,
          image: p.image,
          material: p.material,
          scent: p.scent,
          dimensions: p.dimensions,
          weight: p.weight,
          featured: p.featured,
          isNew: p.isNew,
          active: p.active,
          categoryId: catMap[p.categoryId] || Object.values(catMap)[0]
        }
      });
    }
    console.log('✅ Catálogo inicial insertado en PostgreSQL.');
  } catch (seedErr) {
    console.error('Error en auto-seed:', seedErr.message);
  }
}

function getDbStatus() {
  return {
    connected: dbConnected,
    engine: dbConnected ? 'PostgreSQL (Prisma ORM)' : 'Memoria Local (Pendiente conexión PostgreSQL)',
    error: dbError
  };
}

function getPrisma() {
  return prisma;
}

function isDbConnected() {
  return dbConnected;
}

module.exports = {
  initDatabase,
  getDbStatus,
  getPrisma,
  isDbConnected,
  memoryStore
};

