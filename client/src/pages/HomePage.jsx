import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  ShoppingBag,
  Eye,
  Flame,
  ShieldCheck,
  Truck,
  CreditCard,
  SlidersHorizontal,
  Wind,
  Layers,
  ArrowRight,
  MessageCircle,
  X
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function HomePage({ activeCategory, setActiveCategory }) {
  const {
    categories,
    products,
    loading,
    addToCart,
    setSelectedProduct,
    transferDiscountPct,
    storeConfig
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [onlyOffers, setOnlyOffers] = useState(false);

  const selectedCat = activeCategory || 'all';
  const setSelectedCat = setActiveCategory || (() => {});

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (selectedCat !== 'all') {
      list = list.filter((p) => p.category?.slug === selectedCat);
    }

    if (onlyFeatured) {
      list = list.filter((p) => p.featured);
    }

    if (onlyOffers) {
      list = list.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.scent && p.scent.toLowerCase().includes(q)) ||
          (p.material && p.material.toLowerCase().includes(q)) ||
          (p.category?.name && p.category.name.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.id - a.id);
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return list;
  }, [products, selectedCat, onlyFeatured, onlyOffers, searchQuery, sortBy]);

  const whatsappClean = (storeConfig.whatsappNumber || '5491123456789').replace(/\D/g, '');

  return (
    <div className="min-h-screen bg-white">
      {/* ==========================================
          HERO SECTION: VIOLETA OSCURO Y BLANCO
         ========================================== */}
      <section className="relative bg-asba-950 text-white overflow-hidden">
        {/* Decoración de fondo sutil */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-asba-800/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-asba-700/25 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-22 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Texto Principal */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-asba-900/90 border border-asba-700 text-asba-200 text-xs font-semibold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-asba-300" />
                <span>Artesanías hechas a mano con amor</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] tracking-tight text-white">
                Arte en <span className="text-asba-300 italic">Yeso</span>,{' '}
                <span className="text-asba-200">Velas de Soja</span> y Deco para tu Hogar.
              </h1>

              <p className="text-base sm:text-lg text-asba-100/90 max-w-2xl leading-relaxed">
                En <strong>ASBADECO</strong> diseñamos y moldeamos cada pieza artesanalmente: cuencos y bandejas en yeso cerámico impermeabilizado, velas aromáticas de cera de soja 100% natural, velas esculturales y difusores que transforman cada rincón.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#catalogo"
                  className="bg-white hover:bg-asba-50 text-asba-950 font-bold px-7 py-4 rounded-2xl shadow-xl shadow-black/20 inline-flex items-center gap-2.5 text-sm transition transform hover:-translate-y-0.5"
                >
                  <span>Explorar Catálogo</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  onClick={() => {
                    setSelectedCat('combos-deco');
                    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-asba-900/80 hover:bg-asba-800 text-white border border-asba-700 font-semibold px-6 py-4 rounded-2xl text-sm transition"
                >
                  Ver Combos & Regalos
                </button>
              </div>

              {/* Estadísticas Rápidas */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-asba-800/80 max-w-lg">
                <div>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-white">100%</p>
                  <p className="text-xs text-asba-300">Cera de Soja & Yeso Cerámico</p>
                </div>
                <div>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    {transferDiscountPct}% OFF
                  </p>
                  <p className="text-xs text-asba-300">Por Transferencia Bancaria</p>
                </div>
                <div>
                  <p className="font-serif text-2xl sm:text-3xl font-bold text-white">Reutilizable</p>
                  <p className="text-xs text-asba-300">Envases de yeso sellados</p>
                </div>
              </div>
            </div>

            {/* Collage Visual Derecho */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="rounded-3xl overflow-hidden border-2 border-asba-800 shadow-2xl bg-asba-900 aspect-[4/5] relative">
                  <img
                    src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80"
                    alt="Velas de Soja y Cuencos en Yeso ASBADECO"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-asba-950/90 via-asba-950/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md text-asba-950 p-5 rounded-2xl shadow-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-asba-700">
                        Colección Destacada
                      </span>
                      <span className="text-xs font-bold bg-asba-100 text-asba-900 px-2.5 py-0.5 rounded-full">
                        Hecho a mano
                      </span>
                    </div>
                    <p className="font-serif text-lg font-bold leading-snug">
                      Cuencos de Yeso + Velas Aromáticas de Soja
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Aromas de Lavanda Francesa, Vainilla, Peonías & Higo Negro.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          FRANJA DE BENEFICIOS
         ========================================== */}
      <section className="bg-asba-50 border-b border-asba-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="flex items-center gap-3.5 bg-white p-4 rounded-2xl border border-asba-100 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-asba-950 text-white flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 text-asba-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-asba-950">100% Artesanal</h3>
              <p className="text-xs text-slate-500">Yeso cerámico sellado y soja natural</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white p-4 rounded-2xl border border-asba-100 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-asba-950 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-asba-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-asba-950">{transferDiscountPct}% de Descuento</h3>
              <p className="text-xs text-slate-500">Abonando por Transferencia Bancaria</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white p-4 rounded-2xl border border-asba-100 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-asba-950 text-white flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5 text-asba-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-asba-950">Mercado Pago</h3>
              <p className="text-xs text-slate-500">Tarjetas de crédito, débito y cuenta MP</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-white p-4 rounded-2xl border border-asba-100 shadow-sm">
            <div className="w-11 h-11 rounded-xl bg-asba-950 text-white flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-asba-200" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-asba-950">Envíos Protegidos</h3>
              <p className="text-xs text-slate-500">Embalaje anti-impacto a todo el país</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          CATEGORÍAS DESTACADAS
         ========================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-asba-700 block mb-1">
              Nuestras Creaciones
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-asba-950">
              Explora por Categoría
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-md">
            Selecciona una línea para filtrar el catálogo de piezas en yeso, velas aromáticas y sets decorativos.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const isSelected = selectedCat === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCat(isSelected ? 'all' : cat.slug);
                  document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group relative rounded-2xl overflow-hidden text-left transition-all h-44 border-2 ${
                  isSelected
                    ? 'border-asba-950 ring-4 ring-asba-200 shadow-xl'
                    : 'border-transparent hover:border-asba-300 shadow-md'
                }`}
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-asba-950/95 via-asba-950/45 to-transparent" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                  <span className="text-[11px] font-semibold text-asba-200">
                    {cat._count?.products ?? ''} productos
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold leading-snug">
                    {cat.name}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          CATÁLOGO PRINCIPAL CON FILTROS Y BUSCADOR
         ========================================== */}
      <section id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-asba-50/70 border border-asba-100 rounded-3xl p-5 sm:p-7 mb-10 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Buscador */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-5 h-5 text-asba-700 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar velas de soja, bandeja en yeso, cuenco, lavanda, difusor..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-asba-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-asba-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-asba-950"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Ordenamiento y Filtros Rápidos */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setOnlyFeatured(!onlyFeatured)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
                  onlyFeatured
                    ? 'bg-asba-950 text-white border-asba-950'
                    : 'bg-white text-asba-950 border-asba-200 hover:bg-asba-100'
                }`}
              >
                ⭐ Destacados
              </button>

              <button
                onClick={() => setOnlyOffers(!onlyOffers)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition ${
                  onlyOffers
                    ? 'bg-asba-950 text-white border-asba-950'
                    : 'bg-white text-asba-950 border-asba-200 hover:bg-asba-100'
                }`}
              >
                🔥 En Oferta
              </button>

              <div className="flex items-center gap-2 bg-white border border-asba-200 rounded-xl px-3 py-2">
                <SlidersHorizontal className="w-4 h-4 text-asba-700" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-semibold text-asba-950 bg-transparent focus:outline-none"
                >
                  <option value="featured">Ordenar: Destacados</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                  <option value="newest">Más Nuevos</option>
                  <option value="name">Nombre (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Píldoras de Categorías */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCat === 'all'
                  ? 'bg-asba-950 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-asba-100 border border-asba-100'
              }`}
            >
              Todos ({products.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCat === cat.slug
                    ? 'bg-asba-950 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-asba-100 border border-asba-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grilla de Productos */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="rounded-3xl border border-asba-100 p-4 space-y-4 animate-pulse bg-asba-50/40"
              >
                <div className="h-64 bg-asba-100 rounded-2xl" />
                <div className="h-4 bg-asba-100 rounded w-1/3" />
                <div className="h-6 bg-asba-100 rounded w-3/4" />
                <div className="h-10 bg-asba-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-asba-50/40 rounded-3xl border border-asba-100 p-8">
            <Sparkles className="w-12 h-12 text-asba-700 mx-auto mb-3" />
            <h3 className="font-serif text-2xl font-bold text-asba-950 mb-2">
              No encontramos productos con esos filtros
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Prueba limpiando la búsqueda o seleccionando otra categoría de ASBADECO.
            </p>
            <button
              onClick={() => {
                setSelectedCat('all');
                setSearchQuery('');
                setOnlyFeatured(false);
                setOnlyOffers(false);
              }}
              className="bg-asba-950 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-asba-800 transition"
            >
              Ver Todos los Productos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
            {filteredProducts.map((product) => {
              const transferPrice = Math.round(
                product.price * (1 - (transferDiscountPct || 10) / 100)
              );
              const discountPct =
                product.compareAtPrice && product.compareAtPrice > product.price
                  ? Math.round(
                      ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
                    )
                  : null;

              return (
                <article
                  key={product.id}
                  className="group bg-white rounded-3xl border border-asba-100 hover:border-asba-300 shadow-sm hover:shadow-xl hover:shadow-asba-950/5 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Imagen y Badges */}
                  <div className="relative h-64 bg-asba-50 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      onClick={() => setSelectedProduct(product)}
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition duration-500"
                    />

                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {discountPct && (
                        <span className="bg-asba-950 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                          -{discountPct}% OFF
                        </span>
                      )}
                      {product.isNew && (
                        <span className="bg-white/95 text-asba-950 text-[11px] font-bold px-2.5 py-1 rounded-full shadow border border-asba-200">
                          ✨ NUEVO
                        </span>
                      )}
                    </div>

                    {/* Botón Vista Rápida */}
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 hover:bg-asba-950 text-asba-950 hover:text-white shadow-md transition"
                      title="Ver detalle del producto"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Categoría en esquina inferior */}
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-asba-950/85 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg">
                        {product.category?.name || 'Artesanía'}
                      </span>
                    </div>
                  </div>

                  {/* Cuerpo de la Tarjeta */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3
                        onClick={() => setSelectedProduct(product)}
                        className="font-serif text-lg font-bold text-asba-950 hover:text-asba-700 cursor-pointer line-clamp-2 leading-snug mb-2"
                      >
                        {product.name}
                      </h3>

                      {/* Chips de Material y Aroma */}
                      <div className="space-y-1 text-xs text-slate-500">
                        {product.material && (
                          <p className="flex items-center gap-1.5 truncate">
                            <Layers className="w-3.5 h-3.5 text-asba-700 shrink-0" />
                            <span className="truncate">{product.material}</span>
                          </p>
                        )}
                        {product.scent && product.scent !== 'Sin aroma' && (
                          <p className="flex items-center gap-1.5 truncate text-asba-800 font-medium">
                            <Wind className="w-3.5 h-3.5 text-asba-700 shrink-0" />
                            <span className="truncate">{product.scent}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-asba-50 space-y-3">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-asba-950">
                            ${product.price.toLocaleString('es-AR')}
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-xs text-slate-400 line-through">
                              ${product.compareAtPrice.toLocaleString('es-AR')}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-semibold text-asba-800 bg-asba-50 inline-block px-2 py-0.5 rounded-md mt-1">
                          ${transferPrice.toLocaleString('es-AR')} con Transferencia ({transferDiscountPct}% OFF)
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToCart(product, 1)}
                          disabled={product.stock <= 0}
                          className={`w-full py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition shadow-sm ${
                            product.stock > 0
                              ? 'bg-asba-950 hover:bg-asba-800 text-white shadow-asba-950/15'
                              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span>
                            {product.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ==========================================
          SECCIÓN PROCESO ARTESANAL & SOUVENIRS
         ========================================== */}
      <section className="bg-asba-950 text-white py-16 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-asba-300">
                El Sello de Nuestro Taller
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold leading-tight">
                ¿Por qué elegir las piezas de Yeso y Velas de ASBADECO?
              </h2>
              <p className="text-sm sm:text-base text-asba-100/90 leading-relaxed">
                Cada bandeja, cuenco y vela pasa por un proceso artesanal de varios días. Moldeamos yeso cerámico de alta pureza, lo lijamos al agua a mano para lograr un tacto sedoso y lo impermeabilizamos con laca protectora para que puedas reutilizar tus envases por años.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-asba-900/90 border border-asba-800 p-4 rounded-2xl">
                  <h4 className="font-serif font-bold text-white text-base mb-1">
                    🏺 Yeso Cerámico Sellado
                  </h4>
                  <p className="text-xs text-asba-200 leading-relaxed">
                    Resistente a la humedad, con efecto marmolado o terrazo único en cada colada y base antideslizante.
                  </p>
                </div>
                <div className="bg-asba-900/90 border border-asba-800 p-4 rounded-2xl">
                  <h4 className="font-serif font-bold text-white text-base mb-1">
                    🕯️ Cera de Soja 100% Natural
                  </h4>
                  <p className="text-xs text-asba-200 leading-relaxed">
                    Ecológica, libre de parafina, dura hasta el doble de tiempo y perfuma incluso apagada.
                  </p>
                </div>
              </div>
            </div>

            {/* Banner de Souvenirs y Pedidos Personalizados */}
            <div className="bg-white text-asba-950 rounded-3xl p-8 shadow-2xl space-y-5 border border-asba-200">
              <div className="inline-flex items-center gap-2 bg-asba-100 text-asba-900 text-xs font-bold px-3.5 py-1.5 rounded-full">
                <Sparkles className="w-4 h-4 text-asba-700" />
                <span>Eventos, Souvenirs & Mayoristas</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-asba-950">
                ¿Buscas Souvenirs personalizados o venta por mayor?
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Realizamos velas en cuencos de yeso, bombones aromáticos y bandejas personalizadas con elección de color (blanco, lila, violeta marmolado, natural), fragancia y etiqueta diseñada para casamientos, cumpleaños, bautismos o regalos empresariales.
              </p>
              <a
                href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent(
                  '¡Hola ASBADECO! Quisiera consultar por pedidos personalizados / souvenirs en yeso y velas 💜'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-asba-950 hover:bg-asba-800 text-white font-bold px-6 py-4 rounded-2xl text-sm shadow-lg shadow-asba-950/20 transition"
              >
                <MessageCircle className="w-4 h-4 text-asba-300" />
                <span>Pedir Presupuesto por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

