import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Zap, Sparkles, Tag, ArrowUp, ArrowDown, CornerDownLeft } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { get } from '../../services/api';

const POPULAR_SEARCHES = [
  'Cricket Bat',
  'Varsity Hoodie',
  'Aero Jersey',
  'Running Shoes',
  'Backpack',
  'Smartwatch',
  'Training Shorts',
];

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sports, setSports] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
      setSelectedIndex(-1);
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setProducts([]);
      setCategories([]);
      setSports([]);
      setBrands([]);
      setSelectedIndex(-1);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle keyboard navigation (ArrowDown, ArrowUp, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (products.length > 0 ? (prev + 1) % products.length : -1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (products.length > 0 ? (prev <= 0 ? products.length - 1 : prev - 1) : -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, products, onClose]);

  // Debounced search suggestions query (FEATURE 6)
  useEffect(() => {
    if (!query.trim()) {
      setProducts([]);
      setCategories([]);
      setSports([]);
      setBrands([]);
      setSelectedIndex(-1);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await get('/products/search/suggestions', { q: query.trim() });
        const data = res?.data || res;
        setProducts(data?.products || []);
        setCategories(data?.categories || []);
        setSports(data?.sports || []);
        setBrands(data?.brands || []);
        setSelectedIndex(-1);
      } catch (err) {
        console.warn('Search suggestions error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < products.length) {
      const selected = products[selectedIndex];
      navigate(`/product/${selected.slug}`);
      onClose();
      return;
    }
    if (query.trim()) {
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  const handleSelectProduct = (slug) => {
    navigate(`/product/${slug}`);
    onClose();
  };

  const handleQuickTagClick = (tag) => {
    setQuery(tag);
    navigate(`/shop?search=${encodeURIComponent(tag)}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Input */}
        <form onSubmit={handleSubmit} className="relative flex items-center p-4 sm:p-5 border-b border-slate-100">
          <Search className="w-5 h-5 text-[#2677FF] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sports gear, jerseys, hoodies, backpacks..."
            className="w-full text-sm sm:text-base text-[#172033] placeholder:text-slate-400 focus:outline-none"
            aria-label="Search catalog"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ESC
          </button>
        </form>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Trending Searches when input is empty */}
          {!query && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                Trending Searches on Campus
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleQuickTagClick(tag)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-[#2677FF] border border-slate-200/60 transition-all flex items-center gap-1.5"
                  >
                    <Search className="w-3 h-3 text-slate-400" />
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Structured Category & Brand Suggestions */}
          {query && (categories.length > 0 || sports.length > 0 || brands.length > 0) && (
            <div className="space-y-2 pb-2 border-b border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Suggested Filters
              </p>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c._id || c.name}
                    onClick={() => {
                      navigate(`/shop?category=${encodeURIComponent(c.slug || c.name)}`);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3 text-purple-500" />
                    <span>{c.name}</span>
                  </button>
                ))}
                {sports.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      navigate(`/shop?sport=${encodeURIComponent(s)}`);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3 text-blue-500" />
                    <span>{s}</span>
                  </button>
                ))}
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      navigate(`/shop?brand=${encodeURIComponent(b)}`);
                      onClose();
                    }}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    <span>{b}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results list */}
          {query && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {loading ? 'Searching live catalog...' : `Found ${products.length} product matches`}
                </p>
                {products.length > 0 && (
                  <button
                    onClick={handleSubmit}
                    className="text-xs font-bold text-[#2677FF] hover:underline flex items-center gap-1"
                  >
                    <span>View all matches</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {products.length === 0 && !loading ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No products matched &ldquo;{query}&rdquo;. Press Enter to explore all catalog items.
                </div>
              ) : (
                <div className="space-y-1.5" role="listbox">
                  {products.map((product, idx) => {
                    const imgUrl =
                      (product.images && product.images[0]?.url) ||
                      (product.images && typeof product.images[0] === 'string' && product.images[0]) ||
                      '';
                    const isSelected = selectedIndex === idx;

                    return (
                      <div
                        key={product._id || product.slug}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelectProduct(product.slug)}
                        className={`group flex items-center justify-between p-2.5 rounded-2xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-slate-50 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <Search className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                  product.department === 'PLAY'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-pink-100 text-pink-700'
                                }`}
                              >
                                {product.department}
                              </span>
                              {product.sport && (
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  {product.sport}
                                </span>
                              )}
                            </div>
                            <p className="text-xs sm:text-sm font-heading font-bold text-[#172033] truncate mt-0.5 group-hover:text-[#2677FF] transition-colors">
                              {product.name}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-3">
                          <p className="text-xs sm:text-sm font-heading font-black text-[#172033]">
                            {formatPrice(product.price || (product.priceInPaise ? product.priceInPaise / 100 : 0))}
                          </p>
                          {isSelected && (
                            <span className="text-[10px] text-[#2677FF] font-semibold flex items-center gap-1 justify-end">
                              <CornerDownLeft className="w-2.5 h-2.5" />
                              <span>Select</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-500 font-mono">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-500 font-mono">
                ↓
              </kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] text-slate-500 font-mono">
                Enter
              </kbd>
              <span>to select</span>
            </span>
          </div>
          <span>Press ESC to exit</span>
        </div>
      </div>
    </div>
  );
}
