import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const StoreContext = createContext(null);

const DEFAULT_CONFIG = {
  storeName: 'ASBADECO',
  whatsappNumber: '5491123456789',
  instagramHandle: '@asbadeco',
  email: 'hola@asbadeco.com',
  address: 'Showroom & Taller - Buenos Aires, Argentina',
  bankAlias: 'ASBADECO.TIENDA.MP',
  bankCbu: '0000003100012345678901',
  bankHolder: 'ASBADECO Artesanías',
  transferDiscountPct: 10,
  freeShippingThreshold: 45000,
  flatShippingCost: 4500,
  announcementText:
    '✨ 10% OFF abonando por Transferencia Bancaria | Envíos gratis en compras superiores a $45.000 | Artesanías en Yeso & Velas de Soja 100% hechas a mano'
};

export function StoreProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [storeConfig, setStoreConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  // Carrito persistente en localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('asbadeco_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [toast, setToast] = useState(null);

  // Estado de Administrador
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('asbadeco_admin_token') || '');
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const saved = localStorage.getItem('asbadeco_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 3200);
  }, []);

  const fetchStoreData = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, prodRes, cfgRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/config')
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }
      if (cfgRes.ok) {
        const cfgData = await cfgRes.json();
        setStoreConfig((prev) => ({ ...prev, ...cfgData }));
      }
    } catch (err) {
      console.error('Error cargando datos de la tienda:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  useEffect(() => {
    try {
      localStorage.setItem('asbadeco_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Error guardando carrito:', e);
    }
  }, [cart]);

  // Operaciones del carrito
  const addToCart = (product, quantity = 1) => {
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const nextQty = Math.min(product.stock || 99, existing.quantity + quantity);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: nextQty } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.image,
          stock: product.stock,
          categoryName: product.category?.name || 'Artesanía',
          scent: product.scent,
          material: product.material,
          quantity: Math.min(product.stock || 99, quantity)
        }
      ];
    });
    showToast(`"${product.name}" agregado al carrito 💜`);
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.min(item.stock || 99, newQty) }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const transferDiscountPct = storeConfig.transferDiscountPct ?? 10;
  const transferDiscountAmount = Math.round(cartSubtotal * (transferDiscountPct / 100));
  const freeShippingThreshold = storeConfig.freeShippingThreshold ?? 45000;
  const flatShippingCost = storeConfig.flatShippingCost ?? 4500;
  const qualifiesForFreeShipping = cartSubtotal >= freeShippingThreshold;

  // Admin Login / Logout
  const saveAdminSession = (token, user) => {
    setAdminToken(token);
    setAdminUser(user);
    localStorage.setItem('asbadeco_admin_token', token);
    localStorage.setItem('asbadeco_admin_user', JSON.stringify(user));
  };

  const logoutAdmin = () => {
    setAdminToken('');
    setAdminUser(null);
    localStorage.removeItem('asbadeco_admin_token');
    localStorage.removeItem('asbadeco_admin_user');
    showToast('Sesión de administrador cerrada');
  };

  return (
    <StoreContext.Provider
      value={{
        categories,
        products,
        storeConfig,
        loading,
        fetchStoreData,
        cart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        transferDiscountPct,
        transferDiscountAmount,
        freeShippingThreshold,
        flatShippingCost,
        qualifiesForFreeShipping,
        isCartOpen,
        setIsCartOpen,
        selectedProduct,
        setSelectedProduct,
        toast,
        showToast,
        adminToken,
        adminUser,
        saveAdminSession,
        logoutAdmin
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider');
  return ctx;
}

