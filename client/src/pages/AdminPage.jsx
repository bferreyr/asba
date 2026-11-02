import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Package,
  ShoppingBag,
  Layers,
  Settings,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Database,
  TrendingUp,
  AlertTriangle,
  Clock,
  MessageCircle,
  X,
  CheckCircle2,
  Sparkles,
  Search
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

const PRESET_IMAGES = [
  {
    label: 'Vela Cuenco Yeso',
    url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=900&q=80'
  },
  {
    label: 'Bandeja Yeso Oval',
    url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=900&q=80'
  },
  {
    label: 'Vela Escultural',
    url: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?auto=format&fit=crop&w=900&q=80'
  },
  {
    label: 'Difusor en Yeso',
    url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80'
  },
  {
    label: 'Set Deco Completo',
    url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80'
  }
];

export default function AdminPage() {
  const {
    adminToken,
    adminUser,
    saveAdminSession,
    logoutAdmin,
    categories,
    storeConfig,
    fetchStoreData,
    showToast
  } = useStore();

  // Login State
  const [email, setEmail] = useState('admin@asbadeco.com');
  const [password, setPassword] = useState('asba2026');
  const [loginError, setLoginError] = useState('');

  // Admin Dashboard State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [adminProducts, setAdminProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productSearch, setProductSearch] = useState('');

  // Modal de Producto
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    description: '',
    price: '',
    compareAtPrice: '',
    stock: 10,
    sku: '',
    image: PRESET_IMAGES[0].url,
    material: 'Yeso Cerámico & Cera de Soja',
    scent: 'Lavanda Francesa & Vainilla',
    dimensions: '10 cm x 8 cm',
    weight: '350g',
    featured: true,
    isNew: true,
    active: true,
    categoryId: ''
  });

  // Formulario de Categoría
  const [catForm, setCatForm] = useState({
    id: null,
    name: '',
    description: '',
    image: PRESET_IMAGES[1].url
  });

  // Formulario Configuración
  const [cfgForm, setCfgForm] = useState(storeConfig);

  useEffect(() => {
    setCfgForm(storeConfig);
  }, [storeConfig]);

  const loadAdminData = useCallback(async () => {
    if (!adminToken) return;
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };
      const [statsRes, prodRes, ordRes] = await Promise.all([
        fetch('/api/admin/stats', { headers }),
        fetch('/api/products?includeInactive=true'),
        fetch('/api/orders', { headers })
      ]);

      if (statsRes.status === 401) {
        logoutAdmin();
        return;
      }

      if (statsRes.ok) setStats(await statsRes.json());
      if (prodRes.ok) setAdminProducts(await prodRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
    } catch (err) {
      console.error('Error cargando panel admin:', err);
    }
  }, [adminToken, logoutAdmin]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');
      saveAdminSession(data.token, data.admin);
      showToast('¡Bienvenido al Panel de Administración de ASBADECO! 💜');
    } catch (err) {
      setLoginError(err.message);
    }
  };

  // Abrir modal para nuevo o editar producto
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      description: '',
      price: '',
      compareAtPrice: '',
      stock: 12,
      sku: `ASBA-${Math.floor(100 + Math.random() * 900)}`,
      image: PRESET_IMAGES[0].url,
      material: 'Yeso Cerámico Impermeabilizado & Cera de Soja',
      scent: 'Lavanda & Violetas',
      dimensions: '10 cm x 8 cm',
      weight: '350g',
      featured: false,
      isNew: true,
      active: true,
      categoryId: categories[0]?.id || 1
    });
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setProdForm({
      name: prod.name,
      description: prod.description || '',
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || '',
      stock: prod.stock,
      sku: prod.sku || '',
      image: prod.image || '',
      material: prod.material || '',
      scent: prod.scent || '',
      dimensions: prod.dimensions || '',
      weight: prod.weight || '',
      featured: Boolean(prod.featured),
      isNew: Boolean(prod.isNew),
      active: prod.active !== false,
      categoryId: prod.categoryId
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(prodForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error guardando producto');

      setProductModalOpen(false);
      await Promise.all([loadAdminData(), fetchStoreData()]);
      showToast(
        editingProduct
          ? 'Producto actualizado correctamente'
          : 'Nuevo producto creado en el catálogo'
      );
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`¿Eliminar el producto "${name}"?`)) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      if (res.ok) {
        await Promise.all([loadAdminData(), fetchStoreData()]);
        showToast('Producto eliminado');
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Guardar Categoría
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const url = catForm.id ? `/api/categories/${catForm.id}` : '/api/categories';
      const method = catForm.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(catForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error guardando categoría');

      setCatForm({ id: null, name: '', description: '', image: PRESET_IMAGES[1].url });
      await Promise.all([loadAdminData(), fetchStoreData()]);
      showToast('Categoría guardada con éxito');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await Promise.all([loadAdminData(), fetchStoreData()]);
      showToast('Categoría eliminada');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Actualizar estado de pedido
  const handleUpdateOrderStatus = async (orderId, updates) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        await loadAdminData();
        showToast('Estado del pedido actualizado');
      }
    } catch (err) {
      showToast('Error actualizando pedido', 'error');
    }
  };

  // Guardar Configuración de la Tienda
  const handleSaveConfig = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(cfgForm)
      });
      if (res.ok) {
        await fetchStoreData();
        showToast('Configuración de ASBADECO actualizada');
      }
    } catch (err) {
      showToast('Error al guardar configuración', 'error');
    }
  };

  // Pantalla de Login si no hay token
  if (!adminToken) {
    return (
      <div className="min-h-[80vh] bg-asba-50/50 flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-3xl border border-asba-100 shadow-xl max-w-md w-full p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-asba-950 text-white flex items-center justify-center mx-auto shadow-lg">
              <ShieldCheck className="w-7 h-7 text-asba-200" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-asba-950">
              Administración ASBADECO
            </h1>
            <p className="text-xs text-slate-500">
              Gestiona productos en yeso, velas, stock, precios y pedidos.
            </p>
          </div>

          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-xl">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email de Administrador
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-asba-200 text-sm focus:outline-none focus:ring-2 focus:ring-asba-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-asba-200 text-sm focus:outline-none focus:ring-2 focus:ring-asba-800"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-asba-950 hover:bg-asba-800 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-sm"
            >
              Ingresar al Panel
            </button>
          </form>

          <div className="bg-asba-50 rounded-xl p-3.5 text-xs text-asba-900 border border-asba-100">
            <p className="font-bold mb-1">🔑 Credenciales por defecto (configurables en .env):</p>
            <p>
              Usuario: <code>admin@asbadeco.com</code> | Clave: <code>asba2026</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  const filteredAdminProducts = adminProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-asba-50/40 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Encabezado Admin */}
        <div className="bg-asba-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-asba-300">
              Panel de Control
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              Gestión de Tienda ASBADECO
            </h1>
            <p className="text-xs text-asba-200 mt-1">
              Sesión activa: {adminUser?.email || 'admin@asbadeco.com'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openNewProductModal}
              className="bg-white text-asba-950 hover:bg-asba-100 font-bold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shadow transition"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Producto</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="bg-asba-900 hover:bg-asba-800 text-asba-200 hover:text-white font-semibold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 border border-asba-800 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'dashboard', label: 'Resumen & Base de Datos', icon: TrendingUp },
            { id: 'products', label: `Productos (${adminProducts.length})`, icon: Package },
            { id: 'orders', label: `Pedidos (${orders.length})`, icon: ShoppingBag },
            { id: 'categories', label: `Categorías (${categories.length})`, icon: Layers },
            { id: 'config', label: 'Configuración Tienda', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-2xl text-xs font-bold inline-flex items-center gap-2 whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-asba-950 text-white shadow-md'
                    : 'bg-white text-slate-700 hover:bg-asba-100 border border-asba-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ==========================================
            TAB 1: DASHBOARD & ESTADO DE POSTGRESQL
           ========================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-asba-100 shadow-sm">
                <div className="flex items-center justify-between text-asba-800 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Ingresos Totales</span>
                  <TrendingUp className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-asba-950">
                  ${(stats?.totalRevenue || 0).toLocaleString('es-AR')}
                </p>
                <p className="text-xs text-slate-500 mt-1">Pedidos activos acumulados</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-asba-100 shadow-sm">
                <div className="flex items-center justify-between text-asba-800 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Pedidos Recibidos</span>
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-asba-950">{stats?.totalOrders || 0}</p>
                <p className="text-xs text-amber-700 font-semibold mt-1">
                  {stats?.pendingOrders || 0} pendientes de procesar
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-asba-100 shadow-sm">
                <div className="flex items-center justify-between text-asba-800 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Catálogo Activo</span>
                  <Package className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-asba-950">{stats?.totalProducts || 0}</p>
                <p className="text-xs text-slate-500 mt-1">
                  En {stats?.totalCategories || 0} categorías de ASBADECO
                </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-asba-100 shadow-sm">
                <div className="flex items-center justify-between text-amber-600 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Alerta Bajo Stock</span>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <p className="text-3xl font-bold text-asba-950">{stats?.lowStockProducts || 0}</p>
                <p className="text-xs text-slate-500 mt-1">Productos con 5 o menos unidades</p>
              </div>
            </div>

            {/* Estado de Conexión PostgreSQL */}
            <div className="bg-white rounded-3xl border border-asba-100 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-asba-950 text-white flex items-center justify-center">
                    <Database className="w-6 h-6 text-asba-200" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-asba-950">
                      Motor de Base de Datos PostgreSQL & Prisma ORM
                    </h3>
                    <p className="text-xs text-slate-500">
                      Estado actual: <strong>{stats?.database?.engine}</strong>
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold ${
                    stats?.database?.connected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {stats?.database?.connected ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Conectado a PostgreSQL</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4" />
                      <span>Modo Respaldo Activo (Configura server/.env)</span>
                    </>
                  )}
                </span>
              </div>

              <div className="mt-5 text-xs text-slate-600 space-y-2 leading-relaxed">
                <p>
                  Para vincular o migrar tu instancia local de <strong>PostgreSQL</strong>:
                </p>
                <ol className="list-decimal list-inside space-y-1 font-medium text-slate-700">
                  <li>
                    Edita <code>server/.env</code> con tu usuario y clave de PostgreSQL:{' '}
                    <code>DATABASE_URL="postgresql://postgres:TU_CLAVE@localhost:5432/asbadeco?schema=public"</code>
                  </li>
                  <li>
                    Ejecuta en la raíz del proyecto: <code>npm run db:setup</code> (crea todas las tablas e inserta el catálogo inicial de ASBADECO).
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: GESTIÓN DE PRODUCTOS (CRUD)
           ========================================== */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl border border-asba-100 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-asba-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Buscar producto por nombre o SKU..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-asba-200 text-xs focus:outline-none focus:ring-2 focus:ring-asba-800"
                />
              </div>

              <button
                onClick={openNewProductModal}
                className="bg-asba-950 hover:bg-asba-800 text-white font-bold text-xs px-5 py-3 rounded-xl inline-flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Producto</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-asba-100 text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Producto</th>
                    <th className="py-3 px-3">Categoría</th>
                    <th className="py-3 px-3">Precio</th>
                    <th className="py-3 px-3">Stock</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAdminProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-asba-50/40">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-asba-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-asba-950 text-sm line-clamp-1">
                              {prod.name}
                            </p>
                            <p className="text-slate-400">
                              SKU: {prod.sku || '-'} • {prod.scent || 'Sin aroma'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="bg-asba-50 text-asba-900 font-semibold px-2.5 py-1 rounded-lg border border-asba-100">
                          {prod.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-sm text-asba-950">
                          ${Number(prod.price).toLocaleString('es-AR')}
                        </span>
                        {prod.compareAtPrice && (
                          <span className="block text-[11px] text-slate-400 line-through">
                            ${Number(prod.compareAtPrice).toLocaleString('es-AR')}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`font-bold px-2.5 py-1 rounded-full ${
                            prod.stock <= 5
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {prod.stock} u.
                        </span>
                      </td>
                      <td className="py-3.5 px-3 space-x-1">
                        {prod.featured && (
                          <span className="bg-asba-950 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                            Destacado
                          </span>
                        )}
                        {prod.active === false && (
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">
                            Oculto
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-2">
                        <button
                          onClick={() => openEditProductModal(prod)}
                          className="p-2 rounded-lg bg-asba-50 hover:bg-asba-100 text-asba-900 transition"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: GESTIÓN DE PEDIDOS
           ========================================== */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-asba-100 p-12 text-center">
                <p className="text-slate-500 text-sm">Aún no se registraron pedidos.</p>
              </div>
            ) : (
              orders.map((ord) => {
                const customerWa = (ord.customerPhone || '').replace(/\D/g, '');
                return (
                  <div
                    key={ord.id}
                    className="bg-white rounded-3xl border border-asba-100 p-6 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-base text-asba-950">
                            #{ord.orderNumber}
                          </span>
                          <span className="text-xs text-slate-400">
                            • {new Date(ord.createdAt).toLocaleString('es-AR')}
                          </span>
                          <span className="text-xs font-bold bg-asba-100 text-asba-900 px-2.5 py-0.5 rounded-full">
                            {ord.paymentMethod}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 mt-1">
                          {ord.customerName} ({ord.customerEmail} • Tel: {ord.customerPhone})
                        </p>
                        <p className="text-xs text-slate-500">
                          Entrega:{' '}
                          {ord.shippingMethod === 'RETIRO_TALLER'
                            ? 'Retiro por Showroom / Taller'
                            : `${ord.shippingAddress}, ${ord.shippingCity} (${ord.shippingPostalCode || ''})`}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400">
                            Estado Pago
                          </label>
                          <select
                            value={ord.paymentStatus}
                            onChange={(e) =>
                              handleUpdateOrderStatus(ord.id, { paymentStatus: e.target.value })
                            }
                            className="mt-0.5 text-xs font-bold border border-asba-200 rounded-xl px-3 py-2 bg-asba-50 text-asba-950"
                          >
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="APROBADO">APROBADO</option>
                            <option value="RECHAZADO">RECHAZADO</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400">
                            Estado Pedido
                          </label>
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleUpdateOrderStatus(ord.id, { status: e.target.value })
                            }
                            className="mt-0.5 text-xs font-bold border border-asba-200 rounded-xl px-3 py-2 bg-asba-950 text-white"
                          >
                            <option value="PENDIENTE">PENDIENTE</option>
                            <option value="CONFIRMADO">CONFIRMADO</option>
                            <option value="EN_PREPARACION">EN PREPARACIÓN</option>
                            <option value="ENVIADO">ENVIADO</option>
                            <option value="ENTREGADO">ENTREGADO</option>
                            <option value="CANCELADO">CANCELADO</option>
                          </select>
                        </div>

                        {customerWa && (
                          <a
                            href={`https://wa.me/${customerWa}?text=${encodeURIComponent(
                              `¡Hola ${ord.customerName}! Te escribimos de ASBADECO por tu pedido #${ord.orderNumber} 💜`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Contactar Cliente</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Items del pedido */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      {ord.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2.5 bg-asba-50/50 p-2.5 rounded-xl border border-asba-100"
                        >
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-asba-950 truncate">{item.productName}</p>
                            <p className="text-slate-500">
                              {item.quantity}x ${Number(item.unitPrice).toLocaleString('es-AR')} ={' '}
                              <strong>${Number(item.subtotal).toLocaleString('es-AR')}</strong>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 text-sm">
                      <span className="text-xs text-slate-500">
                        {ord.notes ? `📝 Nota: "${ord.notes}"` : 'Sin notas adicionales'}
                      </span>
                      <span className="font-bold text-base text-asba-950">
                        Total: ${Number(ord.total).toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ==========================================
            TAB 4: GESTIÓN DE CATEGORÍAS
           ========================================== */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white rounded-3xl border border-asba-100 p-6 shadow-sm space-y-4 h-fit">
              <h3 className="font-serif text-xl font-bold text-asba-950">
                {catForm.id ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Nombre de Categoría *
                  </label>
                  <input
                    type="text"
                    required
                    value={catForm.name}
                    onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ej: Souvenirs en Yeso"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    value={catForm.description}
                    onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Descripción breve de la línea..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    URL de Imagen
                  </label>
                  <input
                    type="url"
                    value={catForm.image}
                    onChange={(e) => setCatForm((p) => ({ ...p, image: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-asba-950 hover:bg-asba-800 text-white font-bold py-3 rounded-xl"
                  >
                    {catForm.id ? 'Actualizar Categoría' : 'Crear Categoría'}
                  </button>
                  {catForm.id && (
                    <button
                      type="button"
                      onClick={() =>
                        setCatForm({ id: null, name: '', description: '', image: PRESET_IMAGES[1].url })
                      }
                      className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="lg:col-span-7 space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-asba-100 p-4 flex items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-14 h-14 rounded-xl object-cover border border-asba-100"
                    />
                    <div>
                      <h4 className="font-serif font-bold text-base text-asba-950">{cat.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{cat.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCatForm({
                          id: cat.id,
                          name: cat.name,
                          description: cat.description || '',
                          image: cat.image || ''
                        })
                      }
                      className="p-2 rounded-lg bg-asba-50 text-asba-900 hover:bg-asba-100"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: CONFIGURACIÓN DE TIENDA
           ========================================== */}
        {activeTab === 'config' && (
          <form
            onSubmit={handleSaveConfig}
            className="bg-white rounded-3xl border border-asba-100 p-6 sm:p-8 shadow-sm space-y-6 max-w-3xl"
          >
            <h3 className="font-serif text-2xl font-bold text-asba-950">
              Configuración de Pagos, Envíos y Contacto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Número de WhatsApp (con código de país)
                </label>
                <input
                  type="text"
                  value={cfgForm.whatsappNumber || ''}
                  onChange={(e) => setCfgForm((p) => ({ ...p, whatsappNumber: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  value={cfgForm.instagramHandle || ''}
                  onChange={(e) => setCfgForm((p) => ({ ...p, instagramHandle: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Alias Bancario / Mercado Pago
                </label>
                <input
                  type="text"
                  value={cfgForm.bankAlias || ''}
                  onChange={(e) => setCfgForm((p) => ({ ...p, bankAlias: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  CBU / CVU
                </label>
                <input
                  type="text"
                  value={cfgForm.bankCbu || ''}
                  onChange={(e) => setCfgForm((p) => ({ ...p, bankCbu: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  % Descuento por Transferencia
                </label>
                <input
                  type="number"
                  value={cfgForm.transferDiscountPct ?? 10}
                  onChange={(e) =>
                    setCfgForm((p) => ({ ...p, transferDiscountPct: Number(e.target.value) }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Monto Mínimo para Envío Gratis ($)
                </label>
                <input
                  type="number"
                  value={cfgForm.freeShippingThreshold ?? 45000}
                  onChange={(e) =>
                    setCfgForm((p) => ({ ...p, freeShippingThreshold: Number(e.target.value) }))
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold uppercase text-slate-700 mb-1">
                  Texto de Barra Superior de Anuncios
                </label>
                <input
                  type="text"
                  value={cfgForm.announcementText || ''}
                  onChange={(e) => setCfgForm((p) => ({ ...p, announcementText: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-asba-950 hover:bg-asba-800 text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow transition"
            >
              Guardar Configuración
            </button>
          </form>
        )}
      </div>

      {/* ==========================================
          MODAL CREAR / EDITAR PRODUCTO
         ========================================== */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div
            onClick={() => setProductModalOpen(false)}
            className="fixed inset-0 bg-asba-950/70 backdrop-blur-sm"
          />
          <div className="relative z-10 bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-asba-100 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-asba-950">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto ASBADECO'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="p-2 rounded-full hover:bg-asba-50 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Ej: Vela de Soja en Cuenco de Yeso Marmolado Violeta"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={prodForm.categoryId}
                    onChange={(e) => setProdForm((p) => ({ ...p, categoryId: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Código SKU
                  </label>
                  <input
                    type="text"
                    value={prodForm.sku}
                    onChange={(e) => setProdForm((p) => ({ ...p, sku: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Precio de Venta ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodForm.price}
                    onChange={(e) => setProdForm((p) => ({ ...p, price: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Precio Anterior Tachado ($ Opcional)
                  </label>
                  <input
                    type="number"
                    value={prodForm.compareAtPrice}
                    onChange={(e) => setProdForm((p) => ({ ...p, compareAtPrice: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Stock Disponible *
                  </label>
                  <input
                    type="number"
                    required
                    value={prodForm.stock}
                    onChange={(e) => setProdForm((p) => ({ ...p, stock: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Material
                  </label>
                  <input
                    type="text"
                    value={prodForm.material}
                    onChange={(e) => setProdForm((p) => ({ ...p, material: e.target.value }))}
                    placeholder="Yeso Cerámico + Cera de Soja"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Aroma / Fragancia
                  </label>
                  <input
                    type="text"
                    value={prodForm.scent}
                    onChange={(e) => setProdForm((p) => ({ ...p, scent: e.target.value }))}
                    placeholder="Lavanda, Vainilla & Violetas"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Dimensiones
                  </label>
                  <input
                    type="text"
                    value={prodForm.dimensions}
                    onChange={(e) => setProdForm((p) => ({ ...p, dimensions: e.target.value }))}
                    placeholder="10 cm x 8 cm"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    URL de Imagen (o elige una foto rápida debajo)
                  </label>
                  <input
                    type="url"
                    value={prodForm.image}
                    onChange={(e) => setProdForm((p) => ({ ...p, image: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm mb-2"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        key={img.label}
                        type="button"
                        onClick={() => setProdForm((p) => ({ ...p, image: img.url }))}
                        className="px-2.5 py-1 rounded-lg bg-asba-50 hover:bg-asba-100 text-asba-900 font-semibold border border-asba-200"
                      >
                        📷 {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold uppercase text-slate-700 mb-1">
                    Descripción Artesanal
                  </label>
                  <textarea
                    rows={3}
                    value={prodForm.description}
                    onChange={(e) => setProdForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-asba-200 text-sm"
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap items-center gap-5 pt-2">
                  <label className="inline-flex items-center gap-2 font-bold text-asba-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodForm.featured}
                      onChange={(e) => setProdForm((p) => ({ ...p, featured: e.target.checked }))}
                      className="rounded text-asba-900"
                    />
                    <span>⭐ Producto Destacado</span>
                  </label>

                  <label className="inline-flex items-center gap-2 font-bold text-asba-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodForm.isNew}
                      onChange={(e) => setProdForm((p) => ({ ...p, isNew: e.target.checked }))}
                      className="rounded text-asba-900"
                    />
                    <span>✨ Etiqueta "Nuevo"</span>
                  </label>

                  <label className="inline-flex items-center gap-2 font-bold text-asba-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodForm.active}
                      onChange={(e) => setProdForm((p) => ({ ...p, active: e.target.checked }))}
                      className="rounded text-asba-900"
                    />
                    <span>Visible en la tienda</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-asba-950 hover:bg-asba-800 text-white font-bold shadow"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

