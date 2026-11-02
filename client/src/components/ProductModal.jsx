import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Sparkles,
  Layers,
  Wind,
  Ruler,
  Scale,
  CheckCircle2,
  Plus,
  Minus
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function ProductModal() {
  const {
    selectedProduct,
    setSelectedProduct,
    addToCart,
    transferDiscountPct,
    setIsCartOpen
  } = useStore();

  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(1);
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const p = selectedProduct;
  const transferPrice = Math.round(p.price * (1 - (transferDiscountPct || 10) / 100));
  const discountPct =
    p.compareAtPrice && p.compareAtPrice > p.price
      ? Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100)
      : null;

  const handleAdd = (openDrawer = false) => {
    addToCart(p, qty);
    setSelectedProduct(null);
    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        onClick={() => setSelectedProduct(null)}
        className="fixed inset-0 bg-asba-950/70 backdrop-blur-sm"
      />

      <div className="relative bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-asba-100 z-10 grid grid-cols-1 md:grid-cols-2">
        {/* Botón Cerrar */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-asba-950 text-asba-950 hover:text-white shadow-md transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Imagen del Producto */}
        <div className="relative bg-asba-50 min-h-[300px] md:min-h-[480px]">
          <img
            src={p.image}
            alt={p.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {discountPct && (
              <span className="bg-asba-950 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                -{discountPct}% OFF
              </span>
            )}
            {p.isNew && (
              <span className="bg-white text-asba-950 text-xs font-bold px-3 py-1 rounded-full shadow border border-asba-200">
                ✨ NUEVO
              </span>
            )}
          </div>
        </div>

        {/* Información del Producto */}
        <div className="p-6 sm:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-asba-700 bg-asba-50 px-3 py-1 rounded-full border border-asba-200">
                {p.category?.name || 'Artesanía ASBADECO'}
              </span>
              {p.sku && (
                <span className="text-xs text-slate-400 font-mono">SKU: {p.sku}</span>
              )}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-asba-950 leading-tight mb-3">
              {p.name}
            </h2>

            {/* Precios */}
            <div className="bg-asba-50/80 border border-asba-100 rounded-2xl p-4 mb-5">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-asba-950">
                  ${p.price.toLocaleString('es-AR')}
                </span>
                {p.compareAtPrice && p.compareAtPrice > p.price && (
                  <span className="text-sm text-slate-400 line-through font-medium">
                    ${p.compareAtPrice.toLocaleString('es-AR')}
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-asba-800">
                <Sparkles className="w-3.5 h-3.5 text-asba-700" />
                <span>
                  ${transferPrice.toLocaleString('es-AR')} abonando por Transferencia ({transferDiscountPct}% OFF)
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              {p.description}
            </p>

            {/* Especificaciones Artesanales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 text-xs">
              {p.material && (
                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Layers className="w-4 h-4 text-asba-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Material</span>
                    <span className="text-slate-600">{p.material}</span>
                  </div>
                </div>
              )}
              {p.scent && (
                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Wind className="w-4 h-4 text-asba-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Aroma / Fragancia</span>
                    <span className="text-slate-600">{p.scent}</span>
                  </div>
                </div>
              )}
              {p.dimensions && (
                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Ruler className="w-4 h-4 text-asba-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Medidas</span>
                    <span className="text-slate-600">{p.dimensions}</span>
                  </div>
                </div>
              )}
              {p.weight && (
                <div className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <Scale className="w-4 h-4 text-asba-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 block">Peso aprox.</span>
                    <span className="text-slate-600">{p.weight}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controles de Compra */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                {p.stock > 0
                  ? `Stock disponible (${p.stock} unidades)`
                  : 'Sin stock momentáneamente'}
              </span>
              <span className="text-slate-400">Pieza moldeada a mano</span>
            </div>

            {p.stock > 0 && (
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center border border-asba-200 rounded-xl bg-white px-1 py-1">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="p-2 text-asba-950 hover:bg-asba-50 rounded-lg transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-bold text-sm text-asba-950">{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(p.stock, q + 1))}
                    className="p-2 text-asba-950 hover:bg-asba-50 rounded-lg transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleAdd(true)}
                  className="flex-1 bg-asba-950 hover:bg-asba-800 text-white font-semibold py-3.5 px-5 rounded-xl shadow-lg shadow-asba-950/20 flex items-center justify-center gap-2 transition text-sm"
                >
                  <ShoppingBag className="w-4 h-4 text-asba-200" />
                  <span>Agregar al Carrito</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

