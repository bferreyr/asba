import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Copy,
  MessageCircle,
  CreditCard,
  Landmark,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { storeConfig, showToast } = useStore();

  const [order, setOrder] = useState(location.state?.order || null);
  const [whatsappUrl, setWhatsappUrl] = useState(location.state?.whatsappUrl || '');
  const [loading, setLoading] = useState(!location.state?.order);

  // Estado del Checkout de Mercado Pago
  const [mpLoading, setMpLoading] = useState(false);
  const [mpSimulatorOpen, setMpSimulatorOpen] = useState(false);
  const [mpPreference, setMpPreference] = useState(null);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${orderNumber}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        setWhatsappUrl(data.whatsappUrl);
      }
    } catch (err) {
      console.error('Error cargando pedido:', err);
    } finally {
      setLoading(false);
    }
  }, [orderNumber]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Si vuelve desde Mercado Pago con ?mp_status=approved
  useEffect(() => {
    const mpStatus = searchParams.get('mp_status');
    if (mpStatus === 'approved' && order && order.paymentStatus !== 'APROBADO') {
      fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          paymentStatus: 'APROBADO',
          mpPaymentId: searchParams.get('payment_id') || `MP-${Date.now()}`
        })
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.order) setOrder(d.order);
          showToast('¡Pago de Mercado Pago acreditado con éxito! 💜');
        })
        .catch(console.error);
    }
  }, [searchParams, order, orderNumber, showToast]);

  const handleInitMercadoPago = async () => {
    try {
      setMpLoading(true);
      const res = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar Mercado Pago');

      setMpPreference(data);
      if (data.mode === 'live' && data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        setMpSimulatorOpen(true);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setMpLoading(false);
    }
  };

  const handleConfirmSimulatedPayment = async () => {
    try {
      setMpLoading(true);
      const res = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          paymentStatus: 'APROBADO',
          mpPaymentId: `MP-SIM-${Math.floor(100000 + Math.random() * 900000)}`
        })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
        setMpSimulatorOpen(false);
        showToast('¡Pago con Mercado Pago aprobado exitosamente! 🎉');
      }
    } catch (err) {
      showToast('Error al confirmar el pago', 'error');
    } finally {
      setMpLoading(false);
    }
  };

  const copyText = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copiado al portapapeles`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-asba-800 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-3xl font-bold text-asba-950 mb-3">
          Pedido no encontrado
        </h2>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-asba-950 text-white px-6 py-3 rounded-xl text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a la tienda</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-asba-50/40 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Encabezado de Éxito */}
        <div className="bg-asba-950 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-asba-800 text-asba-200 text-xs font-bold px-3.5 py-1 rounded-full">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Pedido Registrado en ASBADECO</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold">
                ¡Gracias por tu compra, {order.customerName.split(' ')[0]}!
              </h1>
              <p className="text-sm text-asba-200">
                Número de orden:{' '}
                <strong className="text-white font-mono text-base">#{order.orderNumber}</strong>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 text-right">
              <span className="text-xs uppercase tracking-wider text-asba-200 block">
                Estado del Pago
              </span>
              <span
                className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold ${
                  order.paymentStatus === 'APROBADO'
                    ? 'bg-emerald-400 text-emerald-950'
                    : 'bg-amber-300 text-amber-950'
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Bloque de Acción según Medio de Pago */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pasarela Mercado Pago */}
          {order.paymentMethod === 'MERCADOPAGO' && (
            <div className="bg-white rounded-3xl border-2 border-sky-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-6 h-6 text-sky-600" />
                  <h3 className="font-serif text-xl font-bold text-asba-950">
                    Pago con Mercado Pago
                  </h3>
                </div>
                <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full">
                  Checkout Pro
                </span>
              </div>

              {order.paymentStatus === 'APROBADO' ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 text-sm font-medium flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">¡Tu pago fue acreditado!</p>
                    <p className="text-xs">ID Comprobante: {order.mpPaymentId || 'Aprobado'}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Haz clic en el siguiente botón para abonar tu pedido de{' '}
                    <strong>${order.total.toLocaleString('es-AR')}</strong> con tarjeta de crédito, débito o dinero en cuenta de Mercado Pago.
                  </p>
                  <button
                    onClick={handleInitMercadoPago}
                    disabled={mpLoading}
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-5 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition"
                  >
                    {mpLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    <span>Pagar ${order.total.toLocaleString('es-AR')} con Mercado Pago</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* Datos de Transferencia Bancaria */}
          {order.paymentMethod === 'TRANSFERENCIA' && (
            <div className="bg-white rounded-3xl border-2 border-asba-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Landmark className="w-6 h-6 text-asba-800" />
                  <h3 className="font-serif text-xl font-bold text-asba-950">
                    Datos para Transferir
                  </h3>
                </div>
                <span className="text-xs font-bold bg-asba-100 text-asba-900 px-2.5 py-1 rounded-full">
                  {storeConfig.transferDiscountPct}% OFF Aplicado
                </span>
              </div>

              <div className="bg-asba-50 rounded-2xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Alias:</span>
                  <div className="flex items-center gap-2">
                    <strong className="text-asba-950 font-mono text-sm">
                      {storeConfig.bankAlias}
                    </strong>
                    <button
                      onClick={() => copyText(storeConfig.bankAlias, 'Alias')}
                      className="p-1 rounded bg-white border border-asba-200 hover:bg-asba-100"
                      title="Copiar Alias"
                    >
                      <Copy className="w-3.5 h-3.5 text-asba-800" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">CBU / CVU:</span>
                  <div className="flex items-center gap-2">
                    <strong className="text-asba-950 font-mono">
                      {storeConfig.bankCbu}
                    </strong>
                    <button
                      onClick={() => copyText(storeConfig.bankCbu, 'CBU')}
                      className="p-1 rounded bg-white border border-asba-200 hover:bg-asba-100"
                      title="Copiar CBU"
                    >
                      <Copy className="w-3.5 h-3.5 text-asba-800" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Titular:</span>
                  <strong className="text-asba-950">{storeConfig.bankHolder}</strong>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-asba-200">
                  <span className="font-bold text-asba-950">Total con Descuento:</span>
                  <strong className="text-base text-asba-950">
                    ${order.total.toLocaleString('es-AR')}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Tarjeta WhatsApp (Siempre visible para enviar pedido o comprobante) */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-6 h-6 text-emerald-600" />
                <h3 className="font-serif text-xl font-bold text-asba-950">
                  Confirmar por WhatsApp
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Envía el resumen detallado de tu pedido <strong>#{order.orderNumber}</strong> a nuestro WhatsApp oficial para coordinar la entrega o adjuntar el comprobante de pago.
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-5 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Enviar Pedido #{order.orderNumber} por WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Detalle Completo del Pedido */}
        <div className="bg-white rounded-3xl border border-asba-100 p-6 sm:p-8 shadow-sm space-y-6">
          <h3 className="font-serif text-2xl font-bold text-asba-950">
            Detalle de Productos Comprados
          </h3>

          <div className="divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  {item.productImage && (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-14 h-14 rounded-xl object-cover border border-asba-100"
                    />
                  )}
                  <div>
                    <p className="text-sm font-bold text-asba-950">{item.productName}</p>
                    <p className="text-xs text-slate-500">
                      {item.quantity} unidad(es) × ${Number(item.unitPrice).toLocaleString('es-AR')}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-asba-950">
                  ${Number(item.subtotal).toLocaleString('es-AR')}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-asba-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toLocaleString('es-AR')}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Descuento por Transferencia</span>
                <span>-${Number(order.discount).toLocaleString('es-AR')}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Envío ({order.shippingMethod === 'RETIRO_TALLER' ? 'Retiro por Taller' : 'A domicilio'})</span>
              <span>
                {order.shippingCost === 0
                  ? '¡GRATIS!'
                  : `$${Number(order.shippingCost).toLocaleString('es-AR')}`}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold text-asba-950 pt-2 border-t border-slate-100">
              <span>Total</span>
              <span>${Number(order.total).toLocaleString('es-AR')}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-asba-900 hover:text-asba-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Seguir comprando en ASBADECO</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ==========================================
          MODAL SIMULADOR INTERACTIVO MERCADO PAGO
         ========================================== */}
      {mpSimulatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setMpSimulatorOpen(false)}
            className="fixed inset-0 bg-asba-950/70 backdrop-blur-sm"
          />
          <div className="relative z-10 bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-sky-200">
            <div className="bg-sky-600 text-white p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider bg-sky-700 px-2.5 py-1 rounded-full">
                  Mercado Pago Checkout Pro
                </span>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-2xl font-bold">ASBADECO Tienda Oficial</h3>
              <p className="text-xs text-sky-100 mt-1">
                Orden #{order.orderNumber} • Preferencia: {mpPreference?.preferenceId}
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-600">Total a abonar</span>
                <span className="text-2xl font-bold text-slate-900">
                  ${Number(order.total).toLocaleString('es-AR')}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 bg-sky-50/70 border border-sky-100 p-3.5 rounded-xl">
                <p className="font-bold text-sky-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>Pasarela Lista para Pruebas y Producción</span>
                </p>
                <p>
                  Cuando agregues tu <code>MP_ACCESS_TOKEN</code> en <code>server/.env</code>, este botón redirigirá directamente a Mercado Pago real. En este entorno de prueba puedes simular la aprobación instantánea del pago:
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={handleConfirmSimulatedPayment}
                  disabled={mpLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 px-5 rounded-xl shadow flex items-center justify-center gap-2 text-sm transition"
                >
                  {mpLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Simular Pago Aprobado Ahora</span>
                </button>

                <button
                  onClick={() => setMpSimulatorOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 px-4 rounded-xl text-xs transition"
                >
                  Cancelar / Volver al pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

