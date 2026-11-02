import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Menu,
  X,
  Phone,
  Flame
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Navbar({ onSelectCategory }) {
  const {
    storeConfig,
    cartCount,
    setIsCartOpen,
    adminToken
  } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavCategory = (catSlug) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        if (onSelectCategory) onSelectCategory(catSlug);
        const el = document.getElementById('catalogo');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      if (onSelectCategory) onSelectCategory(catSlug);
      const el = document.getElementById('catalogo');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const whatsappClean = (storeConfig.whatsappNumber || '5491123456789').replace(/\D/g, '');

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      {/* Barra superior en Violeta Oscuro */}
      <div className="bg-asba-950 text-white text-xs sm:text-sm py-2.5 px-4 text-center font-medium tracking-wide border-b border-asba-800">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-asba-300 shrink-0 animate-pulse" />
          <span className="truncate">{storeConfig.announcementText}</span>
        </div>
      </div>

      {/* Navbar Principal Blanco y Violeta Oscuro */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-asba-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Botón Menú Móvil */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-asba-950 hover:bg-asba-50 transition"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo ASBADECO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-asba-950 text-white flex items-center justify-center shadow-md shadow-asba-950/20 group-hover:bg-asba-800 transition">
              <Flame className="w-6 h-6 text-asba-200" />
            </div>
            <div>
              <span className="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-asba-950 block leading-none">
                ASBADECO
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-asba-700 font-semibold block mt-1">
                Yeso • Velas • Deco
              </span>
            </div>
          </Link>

          {/* Enlaces de Navegación Desktop */}
          <div className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-700">
            <button
              onClick={() => handleNavCategory('all')}
              className="hover:text-asba-900 transition"
            >
              Catálogo Completo
            </button>
            <button
              onClick={() => handleNavCategory('yeso')}
              className="hover:text-asba-900 transition"
            >
              Piezas en Yeso
            </button>
            <button
              onClick={() => handleNavCategory('velas')}
              className="hover:text-asba-900 transition"
            >
              Velas de Soja
            </button>
            <button
              onClick={() => handleNavCategory('velas-esculturales')}
              className="hover:text-asba-900 transition"
            >
              Velas Esculturales
            </button>
            <button
              onClick={() => handleNavCategory('aromas-difusores')}
              className="hover:text-asba-900 transition"
            >
              Difusores & Aromas
            </button>
            <button
              onClick={() => handleNavCategory('combos-deco')}
              className="hover:text-asba-900 transition"
            >
              Combos Deco
            </button>
          </div>

          {/* Acciones Derecha */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <a
              href={`https://wa.me/${whatsappClean}?text=${encodeURIComponent(
                '¡Hola ASBADECO! Quisiera hacer una consulta sobre sus productos en yeso y velas 💜'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-asba-900 bg-asba-50 hover:bg-asba-100 border border-asba-200 transition"
              title="Consultar por WhatsApp"
            >
              <Phone className="w-3.5 h-3.5 text-asba-700" />
              <span>WhatsApp</span>
            </a>

            <Link
              to="/admin"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                adminToken
                  ? 'bg-asba-900 text-white border-asba-900 hover:bg-asba-800'
                  : 'text-asba-950 bg-white hover:bg-asba-50 border-asba-200'
              }`}
              title="Panel de Administración"
            >
              <ShieldCheck className="w-4 h-4" />
              <span className="hidden md:inline">Admin</span>
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative inline-flex items-center gap-2.5 bg-asba-950 hover:bg-asba-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-asba-950/15 transition"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="w-4 h-4 text-asba-200" />
              <span className="hidden sm:inline">Carrito</span>
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-white text-asba-950 text-xs font-bold">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Menú Desplegable Móvil */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-asba-100 px-4 pt-3 pb-6 space-y-2">
            <button
              onClick={() => handleNavCategory('all')}
              className="block w-full text-left px-3 py-2.5 rounded-xl font-semibold text-asba-950 hover:bg-asba-50"
            >
              ✨ Ver Todo el Catálogo
            </button>
            <button
              onClick={() => handleNavCategory('yeso')}
              className="block w-full text-left px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-asba-50"
            >
              🏺 Piezas en Yeso Artesanal
            </button>
            <button
              onClick={() => handleNavCategory('velas')}
              className="block w-full text-left px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-asba-50"
            >
              🕯️ Velas de Soja en Cuencos
            </button>
            <button
              onClick={() => handleNavCategory('velas-esculturales')}
              className="block w-full text-left px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-asba-50"
            >
              🌸 Velas Esculturales de Molde
            </button>
            <button
              onClick={() => handleNavCategory('aromas-difusores')}
              className="block w-full text-left px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-asba-50"
            >
              🌿 Difusores & Aromas
            </button>
            <button
              onClick={() => handleNavCategory('combos-deco')}
              className="block w-full text-left px-3 py-2.5 rounded-xl font-medium text-slate-700 hover:bg-asba-50"
            >
              🎁 Combos & Sets Deco
            </button>
            <div className="pt-2 border-t border-asba-100 flex items-center justify-between gap-2">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl bg-asba-50 text-asba-950 font-semibold text-sm"
              >
                Panel Admin
              </Link>
              <a
                href={`https://wa.me/${whatsappClean}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center py-2.5 rounded-xl bg-asba-950 text-white font-semibold text-sm"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

