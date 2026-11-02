import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Landmark,
  MessageCircle,
  Truck,
  Store,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function CheckoutPage() {
  const {
    cart,
    cartSubtotal,
    transferDiscountPct,
    transferDiscountAmount,
    freeShippingThreshold,
    flatShippingCost,
    qualifiesForFreeShipping,
    storeConfig,
    clearCart,
    fetchStoreData,
    showToast
  } = useStore();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingMethod: 'ENVIO_DOMICILIO',
    shippingAddress: '',
    shippingCity: '',
    shippingPostalCode: '',
    notes: '',
    paymentMethod: 'MERCADOPAGO'
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-asba-50 border border-asba-100 rounded-3xl p-10 space-y-4">
          <h2 className="font-serif text-3xl font-bold text-asba-950">
            Tu carrito está vacío
          </h2>
          <p className="text-sm text-slate-600">
            Agrega tus artesanías en yeso o velas de soja favoritas antes de finalizar la compra.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-asba-950 text-white font-semibold px-6 py-3.5 rounded-xl text-sm hover:bg-asba-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </Link>
        </div>
      </div>
    );
  }

  const discount =
    formData.paymentMethod === 'TRANSFERENCIA' ? transferDiscountAmount : 0;
  const shippingCost =
    formData.shippingMethod === 'RETIRO_TALLER' || qualifiesForFreeShipping
      ? 0
      : flatShippingCost;
  const finalTotal = cartSubtotal - discount + shippingCost;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (
      formData.shippingMethod === 'ENVIO_DOMICILIO' &&
      (!formData.shippingAddress.trim() || !formData.shippingCity.trim())
    ) {
      setErrorMsg('Por favor ingresa tu dirección y localidad para el envío a domicilio.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: cart.map((item) => ({
            productId: item.id,
            name: item.name,
            quantity: item.quantity
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo procesar el pedido.');
      }

      await fetchStoreData();
      clearCart();
      showToast(`¡Pedido #${data.order.orderNumber} registrado con éxito!`);

      // Navegar a la pantalla de confirmación y pago del pedido
      navigate(`/pedido/${data.order.orderNumber}`, {
        state: {
          order: data.order,
          whatsappUrl: data.whatsappUrl,
          autoOpenMp: formData.paymentMethod === 'MERCADOPAGO'
        }
      });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-asba-50/40 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-asba-800 hover:text-asba-950 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la tienda</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-asba-950">
            Finalizar Compra en ASBADECO
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Completa tus datos para registrar tu pedido en nuestra base de datos y coordinar el pago o envío.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Columna Izquierda: Datos y Método de Pago */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Datos de Contacto */}
            <div className="bg-white rounded-3xl border border-asba-100 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-asba-950 text-white font-bold text-sm flex items-center justify-center">
                  1
                </span>
                <h2 className="font-serif text-xl font-bold text-asba-950">
                  Datos de Contacto
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Ej: Camila Fernández"
                    className="w-full px-4 py-3 rounded-xl border border-asba-200 text-sm focus:outline-none focus:ring-2 focus:ring-asba-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    required
                    value={formData.customerEmail}
                    onChange={handleChange}
                    placeholder="camila@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-asba-200 text-sm focus:outline-none focus:ring-2 focus:ring-asba-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    required
                    value={formData.customerPhone}
                    onChange={handleChange}
                    placeholder="Ej: 11 2345 6789"
                    className="w-full px-4 py-3 rounded-xl border border-asba-200 text-sm focus:outline-none focus:ring-2 focus:ring-asba-800"
                  />
                </div>
              </div>
            </div>

            {/* 2. Forma de Entrega */}
            <div className="bg-white rounded-3xl border border-asba-100 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-asba-950 text-white font-bold text-sm flex items-center justify-center">
                  2
                </span>
                <h2 className="font-serif text-xl font-bold text-asba-950">
                  Método de Entrega
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, shippingMethod: 'ENVIO_DOMICILIO' }))
                  }
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-start gap-3 ${
                    formData.shippingMethod === 'ENVIO_DOMICILIO'
                      ? 'border-asba-950 bg-asba-50/70'
                      : 'border-slate-200 hover:border-asba-200'
                  }`}
                >
                  <Truck className="w-5 h-5 text-asba-800 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-asba-950">Envío a Domicilio</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {qualifiesForFreeShipping
                        ? '¡Envío GRATIS bonificado!'
                        : `Costo fijo $${flatShippingCost.toLocaleString('es-AR')} (Gratis desde $${freeShippingThreshold.toLocaleString('es-AR')})`}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, shippingMethod: 'RETIRO_TALLER' }))
                  }
                  className={`p-4 rounded-2xl border-2 text-left transition flex items-start gap-3 ${
                    formData.shippingMethod === 'RETIRO_TALLER'
                      ? 'border-asba-950 bg-asba-50/70'
                      : 'border-slate-200 hover:border-asba-200'
                  }`}
                >
                  <Store className="w-5 h-5 text-asba-800 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm text-asba-950">Retiro por Showroom / Taller</p>
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                      SIN CARGO • Coordinamos horario por WhatsApp
                    </p>
                  </div>
                </button>
              </div>

              {formData.shippingMethod === 'ENVIO_DOMICILIO' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Dirección (Calle, Altura, Piso/Depto) *
                    </label>
                    <input
                      type="text"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleChange}
                      placeholder="Av. Corrientes 1850, 3B"
                      className="w-full px-4 py-3 rounded-xl border border-asba-200 text-sm focus:outline-none focus:ring-2 focus:ring-asba-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="shippingPostalCode"
                      value={formData.shippingPostalCode}
                      onChange={handleChange}
                      placeholder="1414"
                      className="w-full px-4 py-3 rounded-xl border border-asba-200 text-sm focus:outline-none focus:ring-2 focus:ring-asba-800"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Localidad y Provincia *
                    </label>
                    <input
                      type="text"
                      name="shippingCity"
                      value={formData.shippingCity}
                      onChange={handleChange}
                      placeholder="Ej: Palermo, CABA / Córdoba Capital"
                      className="w-full px-4 py-3 rounded-xl border border-asba-200 text-sm focus:outline-none focus:ring-2 focus:ring-asba-800"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Notas del Pedido (Opcional: dedicatoria para regalo, preferencia de color/aroma)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Ej: Es para un regalo, me gustaría que el marmolado tenga detalles en violeta..."
                  className="w-full px-4 py-3 rounded-xl border border-asba-200 text-sm focus:outline-none focus:ring-2 focus:ring-asba-800"
                />
              </div>
            </div>

            {/* 3. Pasarela de Pago */}
            <div className="bg-white rounded-3xl border border-asba-100 p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-asba-950 text-white font-bold text-sm flex items-center justify-center">
                  3
                </span>
                <h2 className="font-serif text-xl font-bold text-asba-950">
                  Medio de Pago
                </h2>
              </div>

              <div className="space-y-3">
                {/* Opción 1: Mercado Pago */}
                <label
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, paymentMethod: 'MERCADOPAGO' }))
                  }
                  className={`block p-4 rounded-2xl border-2 cursor-pointer transition ${
                    formData.paymentMethod === 'MERCADOPAGO'
                      ? 'border-asba-950 bg-asba-50/70'
                      : 'border-slate-200 hover:border-asba-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-sky-600" />
                      <div>
                        <p className="font-bold text-sm text-asba-950">
                          Mercado Pago (Pago Online Seguro)
                        </p>
                        <p className="text-xs text-slate-500">
                          Tarjetas de crédito, débito y dinero en cuenta de Mercado Pago
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full">
                      Checkout Pro
                    </span>
                  </div>
                </label>

                {/* Opción 2: Transferencia Bancaria */}
                <label
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, paymentMethod: 'TRANSFERENCIA' }))
                  }
                  className={`block p-4 rounded-2xl border-2 cursor-pointer transition ${
                    formData.paymentMethod === 'TRANSFERENCIA'
                      ? 'border-asba-950 bg-asba-50/70'
                      : 'border-slate-200 hover:border-asba-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Landmark className="w-5 h-5 text-asba-800" />
                      <div>
                        <p className="font-bold text-sm text-asba-950">
                          Transferencia Bancaria / Alias
                        </p>
                        <p className="text-xs text-slate-500">
                          Alias: <strong>{storeConfig.bankAlias}</strong> • Ahorras $
                          {transferDiscountAmount.toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-asba-950 text-white px-2.5 py-1 rounded-full">
                      {transferDiscountPct}% OFF
                    </span>
                  </div>
                </label>

                {/* Opción 3: Coordinar por WhatsApp */}
                <label
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, paymentMethod: 'WHATSAPP' }))
                  }
                  className={`block p-4 rounded-2xl border-2 cursor-pointer transition ${
                    formData.paymentMethod === 'WHATSAPP'
                      ? 'border-asba-950 bg-asba-50/70'
                      : 'border-slate-200 hover:border-asba-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-emerald-600" />
                      <div>
                        <p className="font-bold text-sm text-asba-950">
                          Coordinar Pago por WhatsApp
                        </p>
                        <p className="text-xs text-slate-500">
                          Registra tu pedido y envíalo con un clic a nuestro WhatsApp
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                      Directo
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resumen del Pedido */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-asba-100 p-6 sm:p-8 shadow-sm sticky top-28 space-y-6">
              <h2 className="font-serif text-2xl font-bold text-asba-950">
                Resumen de tu Compra
              </h2>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover border border-asba-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Cantidad: {item.quantity} × ${item.price.toLocaleString('es-AR')}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-asba-950">
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-asba-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} productos)</span>
                  <span className="font-semibold text-slate-900">
                    ${cartSubtotal.toLocaleString('es-AR')}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Descuento Transferencia ({transferDiscountPct}% OFF)
                    </span>
                    <span>-${discount.toLocaleString('es-AR')}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Costo de Entrega</span>
                  <span className="font-semibold text-slate-900">
                    {shippingCost === 0 ? (
                      <span className="text-emerald-700 font-bold">¡GRATIS!</span>
                    ) : (
                      `$${shippingCost.toLocaleString('es-AR')}`
                    )}
                  </span>
                </div>

                <div className="border-t border-asba-100 pt-3 flex justify-between items-baseline">
                  <span className="font-serif text-lg font-bold text-asba-950">Total a Pagar</span>
                  <span className="text-2xl font-bold text-asba-950">
                    ${finalTotal.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-asba-950 hover:bg-asba-800 disabled:bg-asba-400 text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-asba-950/20 flex items-center justify-center gap-2.5 transition text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Registrando Pedido...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-asba-200" />
                    <span>
                      {formData.paymentMethod === 'MERCADOPAGO'
                        ? 'Confirmar y Pagar con Mercado Pago'
                        : formData.paymentMethod === 'TRANSFERENCIA'
                        ? 'Confirmar Pedido con Transferencia'
                        : 'Confirmar y Enviar por WhatsApp'}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-asba-700" />
                <span>Tus datos y tu pedido quedan registrados de forma segura</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

