require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_STORE_CONFIG
} = require('../src/data/initialData');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos PostgreSQL para ASBADECO...');

  // 1. Configuración de la tienda
  await prisma.storeConfig.upsert({
    where: { id: 1 },
    update: INITIAL_STORE_CONFIG,
    create: INITIAL_STORE_CONFIG
  });
  console.log('✅ Configuración de tienda creada/actualizada.');

  // 2. Usuario Administrador
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@asbadeco.com';
  const adminPass = process.env.ADMIN_PASSWORD || 'asba2026';
  const passwordHash = await bcrypt.hash(adminPass, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash, name: 'Admin ASBADECO' },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Admin ASBADECO'
    }
  });
  console.log(`✅ Usuario administrador listo (${adminEmail}).`);

  // 3. Categorías
  const categoryMap = {};
  for (const cat of INITIAL_CATEGORIES) {
    const savedCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        image: cat.image,
        icon: cat.icon
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        icon: cat.icon
      }
    });
    categoryMap[cat.id] = savedCat.id;
  }
  console.log(`✅ ${INITIAL_CATEGORIES.length} categorías sincronizadas.`);

  // 4. Productos
  for (const prod of INITIAL_PRODUCTS) {
    const realCategoryId = categoryMap[prod.categoryId] || Object.values(categoryMap)[0];
    await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        description: prod.description,
        price: prod.price,
        compareAtPrice: prod.compareAtPrice,
        stock: prod.stock,
        sku: prod.sku,
        image: prod.image,
        material: prod.material,
        scent: prod.scent,
        dimensions: prod.dimensions,
        weight: prod.weight,
        featured: prod.featured,
        isNew: prod.isNew,
        active: prod.active,
        categoryId: realCategoryId
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        compareAtPrice: prod.compareAtPrice,
        stock: prod.stock,
        sku: prod.sku,
        image: prod.image,
        material: prod.material,
        scent: prod.scent,
        dimensions: prod.dimensions,
        weight: prod.weight,
        featured: prod.featured,
        isNew: prod.isNew,
        active: prod.active,
        categoryId: realCategoryId
      }
    });
  }
  console.log(`✅ ${INITIAL_PRODUCTS.length} productos artesanales cargados.`);

  // 5. Pedido de ejemplo si no existen pedidos aún
  const orderCount = await prisma.order.count();
  if (orderCount === 0) {
    const firstProducts = await prisma.product.findMany({ take: 2 });
    if (firstProducts.length >= 2) {
      const subtotal = firstProducts[0].price + firstProducts[1].price * 2;
      const discount = Math.round(subtotal * 0.1);
      const total = subtotal - discount;

      await prisma.order.create({
        data: {
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
          subtotal,
          discount,
          shippingCost: 0,
          total,
          items: {
            create: [
              {
                productId: firstProducts[0].id,
                productName: firstProducts[0].name,
                productImage: firstProducts[0].image,
                unitPrice: firstProducts[0].price,
                quantity: 1,
                subtotal: firstProducts[0].price
              },
              {
                productId: firstProducts[1].id,
                productName: firstProducts[1].name,
                productImage: firstProducts[1].image,
                unitPrice: firstProducts[1].price,
                quantity: 2,
                subtotal: firstProducts[1].price * 2
              }
            ]
          }
        }
      });
      console.log('✅ Pedido de ejemplo #ASBA-1001 creado.');
    }
  }

  console.log('🎉 Seed finalizado con éxito en PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

