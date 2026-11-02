import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Truck,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQty,
    removeFromCart,
    cartSubtotal,
    transferDiscountPct,
    transferDiscountAmount,
    freeShippingThreshold,
    qualifiesForFreeShipping,
    storeConfig
  } = useStore();

  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const missingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const progressPct = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  const handleGoToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleQuickWhatsApp = () => {
    const phone = (storeConfig.whatsappNumber || '5491123456789').replace(/\D/g, '');
    const itemsText = cart
      .map(
        (item) =>
          `• ${item.quantity}x ${item.name} ($${(item.price * item.quantity).toLocaleString('es-AR')})`
      )
      .join('\n');
    const msg = `✨ *¡Hola ASBADECO!* ✨\nTengo estos productos en mi carrito y quería consultar disponibilidad:\n\n${itemsText}\n\n*Subtotal:* $${cartSubtotal.toLocaleString('es-AR')}\n*Con Transferencia (${transferDiscountPct}% OFF):* $${(
      cartSubtotal - transferDiscountAmount
    ).toLocaleString('es-AR')}`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-asba-950/60 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header del Carrito */}
          <div>
            <div className="bg-asba-950 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-asba-300" />
                <h2 className="font-serif text-xl font-bold tracking-wide">Tu Carrito ASBADECO</h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-asba-200 hover:text-white hover:bg-asba-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Envío Gratis */}
            {cart.length > 0 && (
              <div className="bg-asba-50 px-6 py-3 border-b border-asba-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-asba-900 mb-1.5">
                  <Truck className="w-4 h-4 text-asba-700 shrink-0" />
                  {qualifiesForFreeShipping ? (
                    <span>🎉 ¡Felicitaciones! Tienes ENVÍO GRATIS en tu compra</span>
                  ) : (
                    <span>
                      Te faltan{' '}
                      <strong className="text-asba-800">
                        ${missingForFreeShipping.toLocaleString('es-AR')}
                      </strong>{' '}
                      para tener <strong>ENVÍO GRATIS</strong>
                    </span>
                  )}
                </div>
                <div className="w-full h-2 bg-asba-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-asba-800 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Lista de Productos */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-20 h-20 rounded-full bg-asba-50 text-asba-800 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-xl font-bold text-asba-950 mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-sm text-slate-500 max-w-xs mb-6">
                  Descubre nuestras piezas artesanales en yeso cerámico, velas de soja y aromas para tu hogar.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-asba-950 hover:bg-asba-800 text-white font-semibold text-sm px-6 py-3 rounded-xl transition"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-4 flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover border border-asba-100 shrink-0 bg-asba-50"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-asba-700">
                      {item.categoryName}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
                      {item.name}
                    </h4>
                    {item.scent && item.scent !== 'Sin aroma' && (
                      <p className="text-xs text-slate-500 mt-0.5 truncate">Aroma: {item.scent}</p>
                    )}

                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="inline-flex items-center border border-asba-200 rounded-lg bg-white">
                        <button
                          onClick={() => updateCartQty(item.id, item.quantity - 1)}
                          className="p-1.5 text-asba-900 hover:bg-asba-50 rounded-l-lg transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-asba-950">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.id, item.quantity + 1)}
                          className="p-1.5 text-asba-900 hover:bg-asba-50 rounded-r-lg transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-asba-950">
                          ${(item.price * item.quantity).toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-600 self-start p-1 transition"
                    title="Quitar del carrito"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Resumen y Acciones */}
          {cart.length > 0 && (
            <div className="border-t border-asba-100 bg-asba-50/60 px-6 py-5 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    ${cartSubtotal.toLocaleString('es-AR')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-asba-800 bg-asba-100/80 px-3 py-2 rounded-xl">
                  <span className="flex items-center gap-1.5 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    Abonando por Transferencia ({transferDiscountPct}% OFF)
                  </span>
                  <span className="font-bold text-sm">
                    ${(cartSubtotal - transferDiscountAmount).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleGoToCheckout}
                  className="w-full bg-asba-950 hover:bg-asba-800 text-white font-semibold py-3.5 px-5 rounded-xl shadow-lg shadow-asba-950/20 flex items-center justify-center gap-2 transition"
                >
                  <span>Iniciar Compra (Mercado Pago / Transferencia / WA)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleQuickWhatsApp}
                  className="w-full bg-white hover:bg-asba-50 text-asba-950 border border-asba-200 font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Consultar este carrito por WhatsApp</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

