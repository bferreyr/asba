import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider, useStore } from './context/StoreContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import ProductModal from './components/ProductModal';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AdminPage from './pages/AdminPage';
import { Sparkles, AlertCircle } from 'lucide-react';

function AppShell() {
  const [activeCategory, setActiveCategory] = useState('all');
  const { toast } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <Navbar onSelectCategory={setActiveCategory} />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
              />
            }
          />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/pedido/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </main>

      <CartDrawer />
      <ProductModal />
      <Footer />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-bounce">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-bold ${
              toast.type === 'error'
                ? 'bg-red-900 text-white border-red-700'
                : 'bg-asba-950 text-white border-asba-700'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-asba-300 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppShell />
      </StoreProvider>
    </BrowserRouter>
  );
}

