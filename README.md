# 🕯️ ASBADECO — Tienda Online de Artesanías en Yeso, Velas de Soja & Decoración

Tienda e-commerce Full-Stack desarrollada para **ASBADECO** con identidad visual en **Blanco y Violeta Oscuro**, pensada para la venta de piezas artesanales en yeso cerámico impermeabilizado, velas de cera de soja, velas esculturales, difusores y combos deco.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend (`/client`)**: React 18, Vite, Tailwind CSS, React Router DOM, Lucide Icons.
- **Backend (`/server`)**: Node.js, Express, JWT Auth, SDK Oficial de **Mercado Pago** (`mercadopago`).
- **Base de Datos**: **PostgreSQL** gestionada con **Prisma ORM** (`server/prisma/schema.prisma`).
- **Gestor de paquetes**: `npm`.

---

## ✨ Funcionalidades Incluidas

1. **Catálogo Interactivo & Buscador en Tiempo Real**:
   - Filtros por categoría (*Piezas en Yeso*, *Velas de Soja*, *Velas Esculturales*, *Aromas & Difusores*, *Combos & Sets Deco*).
   - Buscador por nombre, aroma, material o descripción.
   - Ordenamiento por precio, novedad o destacados, y filtros rápidos de ofertas.
   - Vista detallada del producto con especificaciones artesanales (material, aroma, medidas, peso, stock).
2. **Carrito de Compras Persistente + WhatsApp + Guardado en PostgreSQL**:
   - Barra de progreso para envío gratis y cálculo automático de descuento por transferencia.
   - Registro del pedido en PostgreSQL con descuento automático de stock.
   - Generación de link directo de **WhatsApp** con el resumen completo del pedido `#ASBA-XXXX`.
3. **Pasarela de Pagos (Mercado Pago, Transferencia Bancaria y WhatsApp)**:
   - Integración con **Mercado Pago Checkout Pro** (`/api/payments/create-preference`) más **Simulador Sandbox Interactivo** integrado para pruebas locales.
   - Opción de **Transferencia Bancaria** con descuento configurable (10% OFF por defecto) y copiado rápido de Alias/CBU.
4. **Panel de Administración Completo (`/admin`)**:
   - Dashboard con métricas de ingresos, pedidos pendientes, bajo stock y estado de conexión a PostgreSQL.
   - CRUD completo de **Productos** (crear, editar, stock, precios, fotos, aromas, materiales).
   - CRUD de **Categorías**.
   - Gestión de **Pedidos** (actualización de estado de orden y pago + botón directo al WhatsApp del cliente).
   - **Configuración de Tienda** (WhatsApp, Alias/CBU, % descuento transferencia, envío gratis).

---

## 🚀 Instalación y Puesta en Marcha

### 1. Instalar dependencias
Desde la raíz del proyecto ejecuta:

```bash
npm run install:all
```

### 2. Configurar PostgreSQL Local
1. Crea una base de datos llamada `asbadeco` en tu servidor local de PostgreSQL (por ejemplo desde pgAdmin o `psql`: `CREATE DATABASE asbadeco;`).
2. Revisa el archivo `server/.env` (puedes guiarte con `server/.env.example`) y ajusta tu usuario y contraseña de PostgreSQL:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/asbadeco?schema=public"
```

3. Sincroniza las tablas de Prisma y carga el catálogo inicial de **ASBADECO**:

```bash
npm run db:setup
```

*(Nota: Si inicias el servidor antes de configurar PostgreSQL, el backend activará automáticamente el modo de respaldo con todo el catálogo de ASBADECO precargado para que puedas usar y probar la tienda de inmediato).*

### 3. Iniciar Servidor Backend y Cliente React
Ejecuta en la raíz:

```bash
npm run dev
```

- **Tienda Online (React)**: http://localhost:5173
- **Panel de Administración**: http://localhost:5173/admin
  - **Email**: `admin@asbadeco.com`
  - **Contraseña**: `asba2026`
- **API Backend (Express)**: http://localhost:4000/api/health

