import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Instagram,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Sparkles,
  Heart
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Footer() {
  const { storeConfig } = useStore();
  const whatsappClean = (storeConfig.whatsappNumber || '5491123456789').replace(/\D/g, '');

  return (
    <footer className="bg-asba-950 text-white border-t border-asba-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Columna 1: Marca */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white text-asba-950 flex items-center justify-center shadow">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-wider text-white block leading-none">
                  ASBADECO
                </span>
                <span className="text-[10px] uppercase tracking-[0.22em] text-asba-300 font-semibold block mt-1">
                  Artesanías & Decoración
                </span>
              </div>
            </div>
            <p className="text-sm text-asba-200/90 leading-relaxed">
              Creamos piezas únicas en yeso cerámico impermeabilizado, velas de cera de soja 100% ecológica, velas esculturales y aromas pensados para llenar de calidez y armonía tus espacios.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={`https://wa.me/${whatsappClean}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-asba-900 hover:bg-asba-800 text-xs font-semibold text-white inline-flex items-center gap-1.5 border border-asba-800 transition"
              >
                <Phone className="w-3.5 h-3.5 text-asba-300" />
                <span>WhatsApp</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-asba-900 hover:bg-asba-800 text-xs font-semibold text-white inline-flex items-center gap-1.5 border border-asba-800 transition"
              >
                <Instagram className="w-3.5 h-3.5 text-asba-300" />
                <span>{storeConfig.instagramHandle || '@asbadeco'}</span>
              </a>
            </div>
          </div>

          {/* Columna 2: Colecciones */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-asba-300" />
              <span>Nuestras Líneas</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-asba-200">
              <li>
                <a href="/#catalogo" className="hover:text-white transition">
                  • Bandejas y Cuencos en Yeso
                </a>
              </li>
              <li>
                <a href="/#catalogo" className="hover:text-white transition">
                  • Velas de Soja en Yeso Reutilizable
                </a>
              </li>
              <li>
                <a href="/#catalogo" className="hover:text-white transition">
                  • Velas Esculturales y de Molde
                </a>
              </li>
              <li>
                <a href="/#catalogo" className="hover:text-white transition">
                  • Difusores de Ratán & Wax Melts
                </a>
              </li>
              <li>
                <a href="/#catalogo" className="hover:text-white transition">
                  • Combos Deco & Souvenirs Personalizados
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Medios de Pago y Envíos */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-asba-300" />
              <span>Pagos y Envíos</span>
            </h4>
            <ul className="space-y-2.5 text-sm text-asba-200">
              <li className="flex items-start gap-2">
                <span className="text-asba-300 font-bold">✓</span>
                <span>
                  <strong className="text-white">{storeConfig.transferDiscountPct || 10}% OFF</strong> abonando por Transferencia Bancaria.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-asba-300 font-bold">✓</span>
                <span>
                  <strong className="text-white">Mercado Pago:</strong> Tarjetas de crédito, débito y dinero en cuenta.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-asba-300 font-bold">✓</span>
                <span>
                  Envío gratis superando los ${(storeConfig.freeShippingThreshold || 45000).toLocaleString('es-AR')}.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-asba-300 font-bold">✓</span>
                <span>Retiro sin cargo por nuestro Taller / Showroom.</span>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <h4 className="font-serif text-lg font-bold text-white mb-4">Contacto Directo</h4>
            <ul className="space-y-3 text-sm text-asba-200">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-asba-300 shrink-0 mt-1" />
                <span>{storeConfig.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-asba-300 shrink-0" />
                <span>+{whatsappClean}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-asba-300 shrink-0" />
                <span>{storeConfig.email}</span>
              </li>
            </ul>

            <div className="mt-5 pt-4 border-t border-asba-900">
              <Link
                to="/admin"
                className="text-xs text-asba-300 hover:text-white underline underline-offset-4"
              >
                Acceso Administración ASBADECO →
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-asba-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-asba-300">
          <p>© {new Date().getFullYear()} ASBADECO. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5">
            <span>Hecho con</span>
            <Heart className="w-3.5 h-3.5 text-asba-400 fill-asba-400" />
            <span>en React, Node.js & PostgreSQL</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

