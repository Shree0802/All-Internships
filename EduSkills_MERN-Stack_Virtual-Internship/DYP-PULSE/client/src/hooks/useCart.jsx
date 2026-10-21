import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { get, post, put, del } from '../services/api';
import AuthContext from '../context/AuthContext';

const CartContext = createContext(null);
const STORAGE_KEY = 'dypulse_cart_items';

export function CartProvider({ children }) {
  const auth = useContext(AuthContext);
  const isAuthenticated = auth?.isAuthenticated || false;
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [summary, setSummary] = useState({
    itemCount: 0,
    subtotal: 0,
    shippingCharge: 0,
    discount: 0,
    total: 0,
    appliedCoupon: null
  });
  const [loading, setLoading] = useState(false);

  // Sync to local storage for guest/offline backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to sync cart to localStorage:', err);
    }
  }, [items]);

  // Load cart from backend session
  const fetchServerCart = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const res = await get('/cart');
      const cartData = res?.data?.cart;
      const summaryData = res?.data?.summary;

      if (cartData && Array.isArray(cartData.items)) {
        const mappedItems = cartData.items.map((it) => {
          const prod = it.product || {};
          const size = it.size || '';
          const color = it.color || '';
          const sku = it.sku || '';
          const cartItemId = `${prod._id || it.product}-${size}-${color}-${sku}`;

          return {
            _id: it._id,
            cartItemId,
            productId: prod._id || it.product,
            sku,
            name: prod.name || it.name || 'Campus Item',
            brand: prod.brand || 'DYPULSE',
            department: prod.department || 'CAMPUS',
            price: it.price !== undefined ? it.price : (it.priceInPaise ? it.priceInPaise / 100 : prod.price || 0),
            priceInPaise: it.priceInPaise || (it.price ? Math.round(it.price * 100) : 0),
            originalPrice: prod.compareAtPrice || prod.price,
            image:
              (prod.images && prod.images.length > 0 ? prod.images[0].url : null) ||
              it.image ||
              '',
            size,
            color,
            quantity: it.quantity || 1,
            stock: prod.stock
          };
        });

        setItems(mappedItems);
      }

      if (summaryData) {
        setSummary(summaryData);
      }
    } catch {
      // Silently fall back to guest local cart
    }
  }, [isAuthenticated]);

  // When auth state changes to true, sync any local items to server
  useEffect(() => {
    if (isAuthenticated) {
      const localSaved = (() => {
        try {
          const s = localStorage.getItem(STORAGE_KEY);
          return s ? JSON.parse(s) : [];
        } catch {
          return [];
        }
      })();

      if (localSaved.length > 0) {
        post('/cart/sync', { items: localSaved })
          .then(() => fetchServerCart())
          .catch(() => fetchServerCart());
      } else {
        fetchServerCart();
      }
    }
  }, [isAuthenticated, fetchServerCart]);

  /**
   * Add item to cart
   */
  const addToCart = async (product, quantity = 1, size = null, color = null, sku = null) => {
    setLoading(true);
    const chosenSize = size || (product.variants?.[0]?.size) || (product.sizes?.[0]) || 'M';
    const chosenColor = color || (product.variants?.[0]?.color) || (product.colors?.[0]) || 'Standard';
    const chosenSku = sku || (product.variants?.[0]?.sku) || '';

    const cartItemId = `${product._id || product.id}-${chosenSize}-${chosenColor}-${chosenSku}`;

    try {
      let addedViaServer = false;
      if (isAuthenticated) {
        try {
          const res = await post('/cart/add', {
            productId: product._id || product.id,
            quantity,
            size: chosenSize,
            color: chosenColor,
            sku: chosenSku
          });

          if (res?.data?.summary) {
            setSummary(res.data.summary);
          }
          await fetchServerCart();
          addedViaServer = true;
        } catch (serverErr) {
          console.warn('[Cart] Server add failed, using resilient local storage:', serverErr.message);
        }
      }

      if (!addedViaServer) {
        // Optimistic state (guest mode or offline server fallback)
        setItems((prevItems) => {
          const existingIndex = prevItems.findIndex((item) => item.cartItemId === cartItemId);
          if (existingIndex > -1) {
            const updated = [...prevItems];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + quantity
            };
            return updated;
          } else {
            return [
              ...prevItems,
              {
                cartItemId,
                productId: product._id || product.id,
                sku: chosenSku,
                name: product.name,
                brand: product.brand,
                department: product.department,
                price: product.price,
                originalPrice: product.compareAtPrice || product.price,
                image: (product.images && product.images[0]?.url) || product.image || '',
                size: chosenSize,
                color: chosenColor,
                quantity,
                stock: product.stock
              }
            ];
          }
        });
      }

      toast.success(`${product.name} added to bag!`, {
        icon: '🛍️',
        style: {
          borderRadius: '10px',
          background: '#0B1730',
          color: '#fff'
        }
      });
      return true;
    } catch (err) {
      toast.error(err.message || 'Could not add product to cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update item quantity
   */
  const updateItem = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeItem(cartItemId);
      return;
    }

    const item = items.find((i) => i.cartItemId === cartItemId || i._id === cartItemId);
    if (!item) return;

    setItems((prev) =>
      prev.map((it) => (it.cartItemId === cartItemId || it._id === cartItemId ? { ...it, quantity: newQuantity } : it))
    );

    if (isAuthenticated) {
      try {
        const targetId = item._id || item.cartItemId;
        const res = await put(`/cart/${targetId}`, { quantity: newQuantity });
        if (res?.data?.summary) {
          setSummary(res.data.summary);
        }
        await fetchServerCart();
      } catch (err) {
        // Silently retain local optimistic state
      }
    }
  };

  /**
   * Remove item from cart
   */
  const removeItem = async (cartItemId) => {
    const item = items.find((i) => i.cartItemId === cartItemId || i._id === cartItemId);
    const targetId = item?._id || cartItemId;

    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId && i._id !== cartItemId));
    toast('Item removed from bag', { icon: '🗑️' });

    if (isAuthenticated) {
      try {
        const res = await del(`/cart/${targetId}`);
        if (res?.data?.summary) {
          setSummary(res.data.summary);
        }
        await fetchServerCart();
      } catch {
        // Fallback
      }
    }
  };

  /**
   * Clear entire cart
   */
  const clearCart = async () => {
    setItems([]);
    setSummary({
      itemCount: 0,
      subtotal: 0,
      shippingCharge: 0,
      discount: 0,
      total: 0,
      appliedCoupon: null
    });
    localStorage.removeItem(STORAGE_KEY);

    if (isAuthenticated) {
      await del('/cart/clear').catch(() => null);
    }
  };

  /**
   * Apply coupon
   */
  const applyCoupon = async (code) => {
    if (!code) return false;
    const cleanCode = code.trim().toUpperCase();

    if (isAuthenticated) {
      try {
        const res = await post('/cart/coupon', { code: cleanCode });
        if (res?.data?.summary) {
          setSummary(res.data.summary);
        }
        toast.success(res.message || 'Coupon applied! 🎉');
        return true;
      } catch {
        // Fall back to client coupon calculation
      }
    }

    if (cleanCode === 'CAMPUS10') {
      const disc = Math.round(cartSubtotal * 0.10);
      setSummary((prev) => ({
        ...prev,
        appliedCoupon: { code: 'CAMPUS10', discount: disc },
        discount: disc,
        total: Math.max(0, cartSubtotal + shippingCharge - disc)
      }));
      toast.success('CAMPUS10 applied! 10% student discount 🎉');
      return true;
    } else if (cleanCode === 'VARSITY20') {
      const disc = Math.round(cartSubtotal * 0.20);
      setSummary((prev) => ({
        ...prev,
        appliedCoupon: { code: 'VARSITY20', discount: disc },
        discount: disc,
        total: Math.max(0, cartSubtotal + shippingCharge - disc)
      }));
      toast.success('VARSITY20 applied! 20% varsity discount 🎉');
      return true;
    }

    toast.error('Invalid coupon code. Try CAMPUS10 or VARSITY20');
    return false;
  };

  /**
   * Remove coupon
   */
  const removeCoupon = async () => {
    if (isAuthenticated) {
      try {
        const res = await del('/cart/coupon');
        if (res?.data?.summary) {
          setSummary(res.data.summary);
        }
        toast('Coupon removed');
      } catch {
        // Fallback
      }
    }
  };

  const cartCount = summary.itemCount || items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const cartSubtotal =
    summary.subtotal ||
    items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);

  const shippingCharge = summary.shippingCharge !== undefined
    ? summary.shippingCharge
    : cartSubtotal >= 1000 || cartSubtotal === 0 ? 0 : 99;

  const discount = summary.discount || 0;

  const cartTotal =
    summary.total !== undefined
      ? summary.total
      : Math.max(0, cartSubtotal + shippingCharge - discount);

  const originalTotal = items.reduce(
    (sum, item) => sum + (item.originalPrice || item.price || 0) * (item.quantity || 1),
    0
  );
  const cartSavings = Math.max(0, originalTotal - cartTotal);

  const value = {
    cart: { items },
    items,
    loading,
    summary,
    addToCart,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    refreshCart: fetchServerCart,
    cartCount,
    cartTotal,
    cartSubtotal,
    shippingCharge,
    discount,
    cartSavings
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default useCart;
