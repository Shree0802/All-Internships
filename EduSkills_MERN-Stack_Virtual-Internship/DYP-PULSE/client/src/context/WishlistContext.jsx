import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { get, post, del } from '../services/api';
import AuthContext from './AuthContext';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'dypulse_wishlist_items';

export function WishlistProvider({ children }) {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated || false;
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to sync wishlist to localStorage:', err);
    }
  }, [items]);

  // Fetch from server when user is authenticated
  const fetchServerWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await get('/wishlist');
      const serverList = res?.data?.wishlist || [];
      if (Array.isArray(serverList)) {
        setItems(serverList);
      }
    } catch (err) {
      console.warn('Could not load server wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchServerWishlist();
  }, [fetchServerWishlist]);

  const isInWishlist = (productId) => {
    if (!productId) return false;
    return items.some((item) => (item.productId || item._id || item.id) === productId);
  };

  const toggleWishlist = async (product) => {
    if (!product) return;
    const prodId = product._id || product.id || product.productId;

    if (isInWishlist(prodId)) {
      // Remove
      setItems((prev) =>
        prev.filter((item) => (item.productId || item._id || item.id) !== prodId)
      );

      if (isAuthenticated) {
        await del(`/wishlist/${prodId}`).catch(() => null);
      }

      toast('Removed from saved wishlist', {
        icon: '🤍',
        style: {
          borderRadius: '12px',
          background: '#0B1730',
          color: '#fff',
          fontSize: '13px'
        }
      });
    } else {
      // Add
      const wishlistItem = {
        _id: prodId,
        productId: prodId,
        id: prodId,
        slug: product.slug,
        name: product.name,
        brand: product.brand,
        department: product.department,
        category: product.category,
        price: product.price,
        compareAtPrice: product.compareAtPrice || product.originalPrice || product.price,
        image:
          (product.images && product.images.length > 0
            ? typeof product.images[0] === 'string'
              ? product.images[0]
              : product.images[0].url
            : product.image) || '',
        inStock: product.stock !== undefined ? product.stock > 0 : true,
        isActive: product.isActive !== undefined ? product.isActive : true
      };

      setItems((prev) => [wishlistItem, ...prev]);

      if (isAuthenticated) {
        try {
          await post('/wishlist', { productId: prodId });
        } catch {
          // Keep local state
        }
      }

      toast.success(`${product.name} saved to wishlist!`, {
        icon: '💖',
        style: {
          borderRadius: '12px',
          background: '#0B1730',
          color: '#fff',
          fontSize: '13px'
        }
      });
    }
  };

  const removeFromWishlist = async (productId) => {
    setItems((prev) =>
      prev.filter((item) => (item.productId || item._id || item.id) !== productId)
    );

    if (isAuthenticated) {
      await del(`/wishlist/${productId}`).catch(() => null);
    }

    toast('Item removed from wishlist', { icon: '🗑️' });
  };

  const clearWishlist = async () => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);

    if (isAuthenticated) {
      await del('/wishlist/clear').catch(() => null);
    }

    toast('Wishlist cleared');
  };

  const value = {
    wishlist: items,
    items,
    loading,
    wishlistCount: items.length,
    isInWishlist,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    refreshWishlist: fetchServerWishlist
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export default WishlistContext;
