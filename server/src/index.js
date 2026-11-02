require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const {
  initDatabase,
  getDbStatus,
  getPrisma,
  isDbConnected,
  memoryStore
} = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'asbadeco_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Helper para crear slugs limpios
function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Middleware de autenticación para rutas de Admin
function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Inicia sesión como administrador.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesión expirada o token inválido.' });
  }
}

// ==========================================
// 1. HEALTH & CONFIGURACIÓN DE LA TIENDA
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    store: 'ASBADECO Online Store API',
    database: getDbStatus(),
    mercadoPagoConfigured: Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_ACCESS_TOKEN.trim() !== '')
  });
});

app.get('/api/config', async (req, res) => {
  try {
    if (isDbConnected()) {
      const prisma = getPrisma();
      let config = await prisma.storeConfig.findUnique({ where: { id: 1 } });
      if (!config) {
        config = await prisma.storeConfig.create({ data: memoryStore.storeConfig });
      }
      return res.json({
        ...config,
        mercadoPagoConfigured: Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_ACCESS_TOKEN.trim() !== '')
      });
    }
    res.json({
      ...memoryStore.storeConfig,
      mercadoPagoConfigured: Boolean(process.env.MP_ACCESS_TOKEN && process.env.MP_ACCESS_TOKEN.trim() !== '')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/config', requireAdmin, async (req, res) => {
  try {
    const {
      storeName,
      whatsappNumber,
      instagramHandle,
      email,
      address,
      bankAlias,
      bankCbu,
      bankHolder,
      transferDiscountPct,
      freeShippingThreshold,
      flatShippingCost,
      announcementText
    } = req.body;

    const updateData = {
      storeName: storeName || 'ASBADECO',
      whatsappNumber: whatsappNumber || '5491123456789',
      instagramHandle: instagramHandle || '@asbadeco',
      email: email || 'hola@asbadeco.com',
      address: address || 'Showroom & Taller - Buenos Aires, Argentina',
      bankAlias: bankAlias || 'ASBADECO.TIENDA.MP',
      bankCbu: bankCbu || '',
      bankHolder: bankHolder || 'ASBADECO Artesanías',
      transferDiscountPct: Number(transferDiscountPct ?? 10),
      freeShippingThreshold: Number(freeShippingThreshold ?? 45000),
      flatShippingCost: Number(flatShippingCost ?? 4500),
      announcementText: announcementText || ''
    };

    if (isDbConnected()) {
      const prisma = getPrisma();
      const updated = await prisma.storeConfig.upsert({
        where: { id: 1 },
        update: updateData,
        create: { id: 1, ...updateData }
      });
      return res.json(updated);
    }

    memoryStore.storeConfig = { ...memoryStore.storeConfig, ...updateData };
    res.json(memoryStore.storeConfig);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. AUTENTICACIÓN DE ADMINISTRADOR
// ==========================================
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@asbadeco.com';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'asba2026';

    if (isDbConnected()) {
      const prisma = getPrisma();
      const admin = await prisma.adminUser.findUnique({ where: { email } });
      if (admin) {
        const valid = await bcrypt.compare(password, admin.passwordHash);
        if (valid) {
          const token = jwt.sign(
            { id: admin.id, email: admin.email, name: admin.name },
            JWT_SECRET,
            { expiresIn: '7d' }
          );
          return res.json({
            token,
            admin: { id: admin.id, email: admin.email, name: admin.name }
          });
        }
      }
    }

    // Verificación por variables de entorno / credenciales por defecto
    if (email === defaultEmail && password === defaultPassword) {
      const token = jwt.sign(
        { id: 1, email: defaultEmail, name: 'Admin ASBADECO' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        token,
        admin: { id: 1, email: defaultEmail, name: 'Admin ASBADECO' }
      });
    }

    return res.status(401).json({ error: 'Credenciales incorrectas. Verifica tu email y contraseña.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

// ==========================================
// 3. CATEGORÍAS (YESO, VELAS, DIFUSORES, ETC.)
// ==========================================
app.get('/api/categories', async (req, res) => {
  try {
    if (isDbConnected()) {
      const prisma = getPrisma();
      const categories = await prisma.category.findMany({
        orderBy: { id: 'asc' },
        include: {
          _count: { select: { products: true } }
        }
      });
      return res.json(categories);
    }

    const categories = memoryStore.categories.map((cat) => ({
      ...cat,
      _count: {
        products: memoryStore.products.filter((p) => p.categoryId === cat.id).length
      }
    }));
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', requireAdmin, async (req, res) => {
  try {
    const { name, description, image, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
    const slug = slugify(req.body.slug || name);

    if (isDbConnected()) {
      const prisma = getPrisma();
      const created = await prisma.category.create({
        data: { name, slug, description, image, icon: icon || 'Sparkles' }
      });
      return res.status(201).json(created);
    }

    const newCat = {
      id: Date.now(),
      name,
      slug,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=800&q=80',
      icon: icon || 'Sparkles'
    };
    memoryStore.categories.push(newCat);
    res.status(201).json(newCat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/categories/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, image, icon } = req.body;
    const slug = slugify(req.body.slug || name);

    if (isDbConnected()) {
      const prisma = getPrisma();
      const updated = await prisma.category.update({
        where: { id },
        data: { name, slug, description, image, icon }
      });
      return res.json(updated);
    }

    const idx = memoryStore.categories.findIndex((c) => c.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Categoría no encontrada' });
    memoryStore.categories[idx] = {
      ...memoryStore.categories[idx],
      name,
      slug,
      description,
      image,
      icon
    };
    res.json(memoryStore.categories[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/categories/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isDbConnected()) {
      const prisma = getPrisma();
      const count = await prisma.product.count({ where: { categoryId: id } });
      if (count > 0) {
        return res.status(400).json({
          error: `No se puede eliminar la categoría porque tiene ${count} producto(s) asociados.`
        });
      }
      await prisma.category.delete({ where: { id } });
      return res.json({ success: true });
    }

    const hasProducts = memoryStore.products.some((p) => p.categoryId === id);
    if (hasProducts) {
      return res.status(400).json({
        error: 'No se puede eliminar la categoría porque tiene productos asociados.'
      });
    }
    memoryStore.categories = memoryStore.categories.filter((c) => c.id !== id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. PRODUCTOS (CATÁLOGO Y CRUD ADMIN)
// ==========================================
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, featured, includeInactive, sort } = req.query;

    if (isDbConnected()) {
      const prisma = getPrisma();
      const where = {};

      if (includeInactive !== 'true') {
        where.active = true;
      }
      if (featured === 'true') {
        where.featured = true;
      }
      if (category && category !== 'all') {
        where.category = { slug: category };
      }
      if (search && search.trim() !== '') {
        where.OR = [
          { name: { contains: search.trim(), mode: 'insensitive' } },
          { description: { contains: search.trim(), mode: 'insensitive' } },
          { material: { contains: search.trim(), mode: 'insensitive' } },
          { scent: { contains: search.trim(), mode: 'insensitive' } }
        ];
      }

      let orderBy = { featured: 'desc' };
      if (sort === 'price-asc') orderBy = { price: 'asc' };
      else if (sort === 'price-desc') orderBy = { price: 'desc' };
      else if (sort === 'newest') orderBy = { id: 'desc' };
      else if (sort === 'name') orderBy = { name: 'asc' };

      const products = await prisma.product.findMany({
        where,
        include: { category: true },
        orderBy
      });
      return res.json(products);
    }

    // Fallback en memoria
    let list = memoryStore.products.map((p) => ({
      ...p,
      category: memoryStore.categories.find((c) => c.id === p.categoryId) || null
    }));

    if (includeInactive !== 'true') {
      list = list.filter((p) => p.active !== false);
    }
    if (featured === 'true') {
      list = list.filter((p) => p.featured);
    }
    if (category && category !== 'all') {
      list = list.filter((p) => p.category && p.category.slug === category);
    }
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.material && p.material.toLowerCase().includes(q)) ||
          (p.scent && p.scent.toLowerCase().includes(q))
      );
    }

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'newest') list.sort((a, b) => b.id - a.id);
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => Number(b.featured) - Number(a.featured));

    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const isNumeric = /^\d+$/.test(slugOrId);

    if (isDbConnected()) {
      const prisma = getPrisma();
      const product = await prisma.product.findFirst({
        where: isNumeric ? { id: Number(slugOrId) } : { slug: slugOrId },
        include: { category: true }
      });
      if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
      return res.json(product);
    }

    const product = memoryStore.products.find((p) =>
      isNumeric ? p.id === Number(slugOrId) : p.slug === slugOrId
    );
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({
      ...product,
      category: memoryStore.categories.find((c) => c.id === product.categoryId) || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      stock,
      sku,
      image,
      material,
      scent,
      dimensions,
      weight,
      featured,
      isNew,
      active,
      categoryId
    } = req.body;

    if (!name || price === undefined || !categoryId) {
      return res.status(400).json({ error: 'Nombre, precio y categoría son obligatorios.' });
    }

    const baseSlug = slugify(req.body.slug || name);
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const productData = {
      name,
      slug,
      description: description || '',
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      stock: Number(stock ?? 10),
      sku: sku || `ASBA-${Date.now().toString().slice(-4)}`,
      image:
        image ||
        'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80',
      material: material || 'Yeso Cerámico & Cera de Soja',
      scent: scent || 'Sin aroma',
      dimensions: dimensions || '',
      weight: weight || '',
      featured: Boolean(featured),
      isNew: Boolean(isNew),
      active: active !== undefined ? Boolean(active) : true,
      categoryId: Number(categoryId)
    };

    if (isDbConnected()) {
      const prisma = getPrisma();
      const created = await prisma.product.create({
        data: productData,
        include: { category: true }
      });
      return res.status(201).json(created);
    }

    const newProduct = { id: Date.now(), ...productData };
    memoryStore.products.unshift(newProduct);
    res.status(201).json({
      ...newProduct,
      category: memoryStore.categories.find((c) => c.id === newProduct.categoryId) || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      name,
      description,
      price,
      compareAtPrice,
      stock,
      sku,
      image,
      material,
      scent,
      dimensions,
      weight,
      featured,
      isNew,
      active,
      categoryId
    } = req.body;

    const updateData = {
      name,
      description: description || '',
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      stock: Number(stock ?? 0),
      sku: sku || '',
      image: image || '',
      material: material || '',
      scent: scent || '',
      dimensions: dimensions || '',
      weight: weight || '',
      featured: Boolean(featured),
      isNew: Boolean(isNew),
      active: active !== undefined ? Boolean(active) : true,
      categoryId: Number(categoryId)
    };

    if (isDbConnected()) {
      const prisma = getPrisma();
      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
        include: { category: true }
      });
      return res.json(updated);
    }

    const idx = memoryStore.products.findIndex((p) => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });
    memoryStore.products[idx] = { ...memoryStore.products[idx], ...updateData };
    res.json({
      ...memoryStore.products[idx],
      category:
        memoryStore.categories.find((c) => c.id === memoryStore.products[idx].categoryId) || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isDbConnected()) {
      const prisma = getPrisma();
      await prisma.product.delete({ where: { id } });
      return res.json({ success: true });
    }

    memoryStore.products = memoryStore.products.filter((p) => p.id !== id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. PEDIDOS (CHECKOUT, WHATSAPP Y GESTIÓN)
// ==========================================
function buildWhatsAppMessage(order, config) {
  const lines = [
    `✨ *¡Hola ${config.storeName || 'ASBADECO'}!* ✨`,
    `Acabo de realizar el pedido *#${order.orderNumber}* en la tienda online.`,
    ``,
    `👤 *Datos del Cliente:*`,
    `• Nombre: ${order.customerName}`,
    `• Teléfono: ${order.customerPhone}`,
    `• Email: ${order.customerEmail}`,
    `• Entrega: ${
      order.shippingMethod === 'RETIRO_TALLER'
        ? 'Retiro por Showroom / Taller'
        : `Envío a domicilio (${order.shippingAddress || ''}, ${order.shippingCity || ''})`
    }`,
    ``,
    `🛍️ *Detalle del Pedido:*`
  ];

  for (const item of order.items) {
    lines.push(
      `• ${item.quantity}x ${item.productName} ($${Number(item.unitPrice).toLocaleString('es-AR')} c/u) = *$${Number(item.subtotal).toLocaleString('es-AR')}*`
    );
  }

  lines.push(``);
  lines.push(`💵 *Resumen de Pago:*`);
  lines.push(`• Subtotal: $${Number(order.subtotal).toLocaleString('es-AR')}`);
  if (order.discount > 0) {
    lines.push(`• Descuento por Transferencia: -$${Number(order.discount).toLocaleString('es-AR')}`);
  }
  lines.push(
    `• Costo de envío: ${
      order.shippingCost === 0 ? '¡GRATIS!' : `$${Number(order.shippingCost).toLocaleString('es-AR')}`
    }`
  );
  lines.push(`• *TOTAL A ABONAR: $${Number(order.total).toLocaleString('es-AR')}*`);
  lines.push(`• Método de pago elegido: *${order.paymentMethod}*`);

  if (order.notes) {
    lines.push(``);
    lines.push(`📝 *Notas:* ${order.notes}`);
  }

  lines.push(``);
  lines.push(`¡Muchas gracias! Quedo a la espera para coordinar 💜`);

  const phone = (config.whatsappNumber || '5491123456789').replace(/\D/g, '');
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

app.post('/api/orders', async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingMethod,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      notes,
      paymentMethod,
      items
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Completa tus datos de contacto y asegúrate de tener productos en el carrito.'
      });
    }

    const orderNumber = `ASBA-${Math.floor(1000 + Math.random() * 9000)}`;

    if (isDbConnected()) {
      const prisma = getPrisma();
      const config =
        (await prisma.storeConfig.findUnique({ where: { id: 1 } })) || memoryStore.storeConfig;

      let subtotal = 0;
      const orderItemsData = [];

      for (const cartItem of items) {
        const product = await prisma.product.findUnique({ where: { id: Number(cartItem.productId) } });
        if (!product) {
          return res.status(400).json({ error: `El producto "${cartItem.name}" ya no existe.` });
        }
        const qty = Math.max(1, Number(cartItem.quantity || 1));
        if (product.stock < qty) {
          return res.status(400).json({
            error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock} unidad(es).`
          });
        }
        const itemSub = product.price * qty;
        subtotal += itemSub;
        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          productImage: product.image,
          unitPrice: product.price,
          quantity: qty,
          subtotal: itemSub
        });
      }

      const discount =
        paymentMethod === 'TRANSFERENCIA'
          ? Math.round(subtotal * ((config.transferDiscountPct || 10) / 100))
          : 0;

      const shippingCost =
        shippingMethod === 'RETIRO_TALLER' || subtotal >= (config.freeShippingThreshold || 45000)
          ? 0
          : config.flatShippingCost || 4500;

      const total = subtotal - discount + shippingCost;

      const createdOrder = await prisma.$transaction(async (tx) => {
        for (const item of orderItemsData) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }

        return tx.order.create({
          data: {
            orderNumber,
            customerName,
            customerEmail,
            customerPhone,
            shippingMethod: shippingMethod || 'ENVIO_DOMICILIO',
            shippingAddress: shippingAddress || '',
            shippingCity: shippingCity || '',
            shippingPostalCode: shippingPostalCode || '',
            notes: notes || '',
            paymentMethod: paymentMethod || 'WHATSAPP',
            paymentStatus: 'PENDIENTE',
            status: 'PENDIENTE',
            subtotal,
            discount,
            shippingCost,
            total,
            items: {
              create: orderItemsData
            }
          },
          include: { items: true }
        });
      });

      const whatsappUrl = buildWhatsAppMessage(createdOrder, config);
      return res.status(201).json({ order: createdOrder, whatsappUrl });
    }

    // Fallback en memoria
    const config = memoryStore.storeConfig;
    let subtotal = 0;
    const orderItemsData = [];

    for (const cartItem of items) {
      const product = memoryStore.products.find((p) => p.id === Number(cartItem.productId));
      if (!product) {
        return res.status(400).json({ error: `El producto solicitado no existe.` });
      }
      const qty = Math.max(1, Number(cartItem.quantity || 1));
      if (product.stock < qty) {
        return res.status(400).json({
          error: `Stock insuficiente para "${product.name}". Disponible: ${product.stock} u.`
        });
      }
      product.stock -= qty;
      const itemSub = product.price * qty;
      subtotal += itemSub;
      orderItemsData.push({
        id: Date.now() + Math.random(),
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        unitPrice: product.price,
        quantity: qty,
        subtotal: itemSub
      });
    }

    const discount =
      paymentMethod === 'TRANSFERENCIA'
        ? Math.round(subtotal * ((config.transferDiscountPct || 10) / 100))
        : 0;

    const shippingCost =
      shippingMethod === 'RETIRO_TALLER' || subtotal >= (config.freeShippingThreshold || 45000)
        ? 0
        : config.flatShippingCost || 4500;

    const total = subtotal - discount + shippingCost;

    const newOrder = {
      id: Date.now(),
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      shippingMethod: shippingMethod || 'ENVIO_DOMICILIO',
      shippingAddress: shippingAddress || '',
      shippingCity: shippingCity || '',
      shippingPostalCode: shippingPostalCode || '',
      notes: notes || '',
      paymentMethod: paymentMethod || 'WHATSAPP',
      paymentStatus: 'PENDIENTE',
      status: 'PENDIENTE',
      subtotal,
      discount,
      shippingCost,
      total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: orderItemsData
    };

    memoryStore.orders.unshift(newOrder);
    const whatsappUrl = buildWhatsAppMessage(newOrder, config);
    res.status(201).json({ order: newOrder, whatsappUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders', requireAdmin, async (req, res) => {
  try {
    if (isDbConnected()) {
      const prisma = getPrisma();
      const orders = await prisma.order.findMany({
        include: { items: true },
        orderBy: { createdAt: 'desc' }
      });
      return res.json(orders);
    }
    res.json(memoryStore.orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    if (isDbConnected()) {
      const prisma = getPrisma();
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true }
      });
      if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
      const config =
        (await prisma.storeConfig.findUnique({ where: { id: 1 } })) || memoryStore.storeConfig;
      return res.json({ order, whatsappUrl: buildWhatsAppMessage(order, config) });
    }

    const order = memoryStore.orders.find((o) => o.orderNumber === orderNumber);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json({ order, whatsappUrl: buildWhatsAppMessage(order, memoryStore.storeConfig) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, paymentStatus } = req.body;

    if (isDbConnected()) {
      const prisma = getPrisma();
      const updated = await prisma.order.update({
        where: { id },
        data: {
          ...(status ? { status } : {}),
          ...(paymentStatus ? { paymentStatus } : {})
        },
        include: { items: true }
      });
      return res.json(updated);
    }

    const idx = memoryStore.orders.findIndex((o) => o.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Pedido no encontrado' });
    if (status) memoryStore.orders[idx].status = status;
    if (paymentStatus) memoryStore.orders[idx].paymentStatus = paymentStatus;
    memoryStore.orders[idx].updatedAt = new Date().toISOString();
    res.json(memoryStore.orders[idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. PASARELA DE PAGOS (MERCADO PAGO SDK)
// ==========================================
app.post('/api/payments/create-preference', async (req, res) => {
  try {
    const { orderNumber } = req.body;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    let order = null;
    if (isDbConnected()) {
      const prisma = getPrisma();
      order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { items: true }
      });
    } else {
      order = memoryStore.orders.find((o) => o.orderNumber === orderNumber);
    }

    if (!order) {
      return res.status(404).json({ error: 'Pedido no encontrado para generar el pago.' });
    }

    const mpToken = process.env.MP_ACCESS_TOKEN ? process.env.MP_ACCESS_TOKEN.trim() : '';

    // Si el usuario configuró su MP_ACCESS_TOKEN real en server/.env, usamos el SDK oficial de Mercado Pago
    if (mpToken) {
      const client = new MercadoPagoConfig({ accessToken: mpToken });
      const preference = new Preference(client);

      const mpItems = order.items.map((item) => ({
        id: String(item.productId || item.id),
        title: item.productName,
        quantity: Number(item.quantity),
        unit_price: Number(item.unitPrice),
        currency_id: 'ARS'
      }));

      if (order.shippingCost > 0) {
        mpItems.push({
          id: 'ENVIO',
          title: 'Costo de Envío a Domicilio',
          quantity: 1,
          unit_price: Number(order.shippingCost),
          currency_id: 'ARS'
        });
      }

      const result = await preference.create({
        body: {
          items: mpItems,
          payer: {
            name: order.customerName,
            email: order.customerEmail
          },
          external_reference: order.orderNumber,
          back_urls: {
            success: `${frontendUrl}/pedido/${order.orderNumber}?mp_status=approved`,
            failure: `${frontendUrl}/pedido/${order.orderNumber}?mp_status=rejected`,
            pending: `${frontendUrl}/pedido/${order.orderNumber}?mp_status=pending`
          },
          auto_return: 'approved'
        }
      });

      if (isDbConnected()) {
        const prisma = getPrisma();
        await prisma.order.update({
          where: { id: order.id },
          data: { mpPreferenceId: result.id }
        });
      } else {
        order.mpPreferenceId = result.id;
      }

      return res.json({
        mode: 'live',
        preferenceId: result.id,
        initPoint: result.init_point,
        sandboxInitPoint: result.sandbox_init_point
      });
    }

    // Modo Sandbox Interactivo integrado si MP_ACCESS_TOKEN aún está vacío en .env
    const mockPrefId = `MP-PREF-${order.orderNumber}-${Date.now().toString().slice(-4)}`;
    return res.json({
      mode: 'sandbox_simulator',
      preferenceId: mockPrefId,
      orderNumber: order.orderNumber,
      total: order.total,
      message:
        'Modo Simulador Mercado Pago activo (Configura MP_ACCESS_TOKEN en server/.env para cobros reales).'
    });
  } catch (err) {
    res.status(500).json({ error: `Error al crear preferencia de Mercado Pago: ${err.message}` });
  }
});

// Confirmación de pago desde Simulador o Retorno de Mercado Pago
app.post('/api/payments/confirm', async (req, res) => {
  try {
    const { orderNumber, paymentStatus, mpPaymentId } = req.body;
    const newPaymentStatus = paymentStatus || 'APROBADO';
    const newOrderStatus = newPaymentStatus === 'APROBADO' ? 'CONFIRMADO' : 'PENDIENTE';

    if (isDbConnected()) {
      const prisma = getPrisma();
      const updated = await prisma.order.update({
        where: { orderNumber },
        data: {
          paymentStatus: newPaymentStatus,
          status: newOrderStatus,
          mpPaymentId: mpPaymentId || `MP-${Date.now()}`
        },
        include: { items: true }
      });
      return res.json({ order: updated });
    }

    const order = memoryStore.orders.find((o) => o.orderNumber === orderNumber);
    if (!order) return res.status(404).json({ error: 'Pedido no encontrado' });
    order.paymentStatus = newPaymentStatus;
    order.status = newOrderStatus;
    order.mpPaymentId = mpPaymentId || `MP-${Date.now()}`;
    order.updatedAt = new Date().toISOString();
    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. ESTADÍSTICAS DEL PANEL DE ADMINISTRACIÓN
// ==========================================
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    let products = [];
    let orders = [];
    let categories = [];

    if (isDbConnected()) {
      const prisma = getPrisma();
      [products, orders, categories] = await Promise.all([
        prisma.product.findMany(),
        prisma.order.findMany({ include: { items: true } }),
        prisma.category.findMany()
      ]);
    } else {
      products = memoryStore.products;
      orders = memoryStore.orders;
      categories = memoryStore.categories;
    }

    const totalRevenue = orders
      .filter((o) => o.status !== 'CANCELADO')
      .reduce((acc, o) => acc + Number(o.total || 0), 0);

    const pendingOrders = orders.filter((o) => o.status === 'PENDIENTE').length;
    const lowStockProducts = products.filter((p) => p.stock <= 5).length;

    res.json({
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders,
      totalProducts: products.length,
      lowStockProducts,
      totalCategories: categories.length,
      database: getDbStatus()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inicializar servidor y base de datos
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend de ASBADECO corriendo en http://localhost:${PORT}`);
  });
}

startServer();

