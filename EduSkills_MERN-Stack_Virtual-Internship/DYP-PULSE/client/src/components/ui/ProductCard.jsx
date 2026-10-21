import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Check, Heart } from 'lucide-react';
import { formatPrice, calculateDiscount } from '../../utils/formatters';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import Badge from './Badge';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const isPlay = product.department?.toUpperCase() === 'PLAY';
  const originalPrice = product.compareAtPrice || product.originalPrice || product.price;
  const discount =
    product.discountPercent ||
    product.discountPercentage ||
    calculateDiscount(originalPrice, product.price);

  const mainImage =
    (product.images && product.images.length > 0
      ? typeof product.images[0] === 'string'
        ? product.images[0]
        : product.images[0].url
      : null) ||
    product.image ||
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';

  const productSlug = product.slug || product._id || product.id;
  const productUrl = `/product/${productSlug}`;
  const inWishlist = isInWishlist(product._id || product.id || productSlug);

  const variantStock =
    product.variants && product.variants.length > 0
      ? product.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
      : 0;

  const stock =
    typeof product.stock === 'number' && product.stock > 0
      ? product.stock
      : variantStock > 0
      ? variantStock
      : typeof product.stock === 'number'
      ? product.stock
      : 25;

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  // Real review validation: only show rating if review count or average is positive
  const reviewCount = product.ratings?.count || product.numReviews || 0;
  const ratingAverage = product.ratings?.average || (reviewCount > 0 ? product.rating : null);

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    setIsAdding(true);
    const defaultSize =
      product.sizes && product.sizes.length > 0
        ? typeof product.sizes[0] === 'string'
          ? product.sizes[0]
          : product.sizes[0].size
        : undefined;

    const defaultColor =
      product.colors && product.colors.length > 0
        ? typeof product.colors[0] === 'string'
          ? product.colors[0]
          : product.colors[0].name
        : undefined;

    await addToCart(product, 1, defaultSize, defaultColor);
    setIsAdding(false);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';

  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300">
      {/* Product Image & Badges */}
      <Link
        to={productUrl}
        className="relative block aspect-[4/5] overflow-hidden bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2677FF]"
      >
        <img
          src={mainImage}
          alt={product.name}
          loading="lazy"
          onError={handleImageError}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient Overlay for subtle contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Department & Discount Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none">
          <Badge variant={isPlay ? 'play' : 'campus'} size="sm">
            {isPlay ? 'PLAY' : 'CAMPUS'}
          </Badge>
          {discount > 0 && (
            <span className="inline-block bg-[#FF7849] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wide">
              {discount}% OFF
            </span>
          )}
          {isOutOfStock && (
            <span className="inline-block bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              SOLD OUT
            </span>
          )}
          {isLowStock && (
            <span className="inline-block bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              Low Stock ({stock})
            </span>
          )}
        </div>

        {/* Wishlist Button (Top Right) */}
        <button
          onClick={handleWishlistToggle}
          type="button"
          aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute top-2.5 right-2.5 z-10 w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center bg-white/90 backdrop-blur-xs text-slate-600 hover:text-[#F044A5] hover:bg-white shadow-md transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-[#F044A5]"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              inWishlist ? 'fill-[#F044A5] text-[#F044A5]' : 'stroke-[2]'
            }`}
          />
        </button>

        {/* Quick Add Floating Button (Desktop) */}
        {!isOutOfStock && (
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            type="button"
            className={`absolute bottom-2.5 right-2.5 z-10 w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-[#2677FF] ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-white/95 text-slate-800 hover:bg-[#2677FF] hover:text-white backdrop-blur-xs'
            }`}
            title="Quick add to bag"
            aria-label="Quick add"
          >
            {justAdded ? (
              <Check className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <ShoppingBag className="w-4 h-4 stroke-[2]" />
            )}
          </button>
        )}
      </Link>

      {/* Product Details */}
      <div className="flex flex-col flex-1 p-4">
        {/* Brand & Real Rating */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span className="font-semibold tracking-wider text-slate-400 uppercase text-[11px] truncate max-w-[140px]">
            {product.brand || (isPlay ? 'DYPULSE PLAY' : 'DYPULSE CAMPUS')}
          </span>
          {ratingAverage && ratingAverage > 0 && reviewCount > 0 ? (
            <div className="flex items-center gap-1 text-amber-500 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium text-slate-700 text-xs">
                {Number(ratingAverage).toFixed(1)}
              </span>
              <span className="text-slate-400 text-[11px]">({reviewCount})</span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">New Drop</span>
          )}
        </div>

        {/* Name */}
        <Link to={productUrl} className="block mt-0.5 mb-2 focus:outline-none">
          <h3 className="font-heading font-medium text-slate-900 group-hover:text-[#2677FF] transition-colors text-sm line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Category Label */}
        <p className="text-[11px] text-slate-400 mb-3 truncate">
          {(typeof product.category === 'object' ? product.category?.name : product.category) || (isPlay ? 'Athletic Gear' : 'Campus Apparel')}
        </p>

        {/* Price & Action */}
        <div className="mt-auto pt-2 flex items-baseline gap-2 border-t border-slate-100">
          <span className="text-base font-bold text-slate-900">
            {formatPrice(product.price)}
          </span>
          {originalPrice && originalPrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
