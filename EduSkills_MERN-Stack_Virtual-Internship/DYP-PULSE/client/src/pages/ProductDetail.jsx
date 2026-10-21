import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowLeft,
  Truck,
  RotateCcw,
  ShieldCheck,
  Star,
  Zap,
  Sparkles,
  Check,
  CheckCircle2,
  Heart,
  ChevronRight,
  AlertCircle,
  MessageSquare,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { get, post } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FALLBACK_PRODUCTS } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import useProducts from '../hooks/useProducts';
import { formatPrice, calculateDiscount } from '../utils/formatters';
import Spinner from '../components/ui/Spinner';
import Badge from '../components/ui/Badge';
import ProductCard from '../components/ui/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [sizeError, setSizeError] = useState('');

  // Reviews state (FEATURE 3)
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Recommendations state (FEATURE 4)
  const [recommendations, setRecommendations] = useState([]);

  // Recently viewed state (FEATURE 5)
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      setSizeError('');
      try {
        let p = null;

        // Try /products/slug/:slug first, then fallback to /products/:slug
        try {
          const res1 = await get(`/products/slug/${encodeURIComponent(slug)}`);
          p = res1?.data?.product || res1?.product || (res1 && typeof res1 === 'object' && res1.name ? res1 : null);
        } catch {
          try {
            const res2 = await get(`/products/${encodeURIComponent(slug)}`);
            p = res2?.data?.product || res2?.product || (res2 && typeof res2 === 'object' && res2.name ? res2 : null);
          } catch {
            p = null;
          }
        }

        if (!p || !p.name) {
          throw new Error('Product not returned by API');
        }

        if (isMounted) {
          setProduct(p);

          const firstImg =
            p.images && p.images.length > 0
              ? typeof p.images[0] === 'string'
                ? p.images[0]
                : p.images[0].url
              : p.image || '';
          setSelectedImage(firstImg);

          const availableSizes =
            p.sizes && p.sizes.length > 0
              ? p.sizes.map((s) => (typeof s === 'string' ? s : s.size))
              : p.variants && p.variants.length > 0
              ? [...new Set(p.variants.map((v) => v.size).filter(Boolean))]
              : [];
          setSelectedSize(availableSizes[0] || '');

          const availableColors =
            p.colors && p.colors.length > 0
              ? p.colors.map((c) => (typeof c === 'string' ? c : c.name))
              : p.variants && p.variants.length > 0
              ? [...new Set(p.variants.map((v) => v.color).filter(Boolean))]
              : [];
          setSelectedColor(availableColors[0] || '');

          // 1. Fetch real approved reviews from backend (FEATURE 3)
          try {
            const revRes = await get(`/products/${p._id || p.id}/reviews`);
            const fetched = revRes?.data?.reviews || revRes?.reviews || [];
            if (fetched.length > 0) {
              setReviews(
                fetched.map((r) => ({
                  id: r._id,
                  userName: `${r.user?.firstName || 'Collegiate'} ${r.user?.lastName || 'Athlete'}`,
                  rating: r.rating,
                  title: r.title,
                  comment: r.reviewText,
                  verifiedPurchase: r.verifiedPurchase,
                  date: new Date(r.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })
                }))
              );
            } else {
              setReviews([]);
            }
          } catch (revErr) {
            console.warn('Reviews fetch error:', revErr);
          }

          // 2. Fetch explainable product recommendations (FEATURE 4)
          try {
            const recRes = await get(`/products/${p._id || p.id}/recommendations`);
            setRecommendations(recRes?.data?.recommendations || []);
          } catch (recErr) {
            console.warn('Recommendations fetch error:', recErr);
          }

          // 3. Record recently viewed and fetch history (FEATURE 5)
          try {
            const targetId = p._id || p.id;
            post(`/products/${targetId}/recently-viewed`).catch(() => {});

            const storedStr = localStorage.getItem('dypulse_recently_viewed');
            let stored = [];
            try {
              stored = JSON.parse(storedStr) || [];
            } catch {}

            const updatedStored = [targetId, ...stored.filter((id) => id !== targetId)].slice(0, 10);
            localStorage.setItem('dypulse_recently_viewed', JSON.stringify(updatedStored));

            const otherIds = updatedStored.filter((id) => id !== targetId);
            if (otherIds.length > 0) {
              const rvRes = await get('/products/recently-viewed', { ids: otherIds.join(',') });
              setRecentlyViewed(rvRes?.data?.products || []);
            }
          } catch (rvErr) {
            console.warn('Recently viewed fetch error:', rvErr);
          }
        }
      } catch (err) {
        // Fallback to local catalog
        const cleanSlug = (slug || '').toLowerCase().trim();
        const fallback = FALLBACK_PRODUCTS.find(
          (item) =>
            (item.slug && item.slug.toLowerCase() === cleanSlug) ||
            item._id === slug ||
            item.id === slug
        );

        if (isMounted) {
          if (fallback) {
            setProduct(fallback);
            const firstImg =
              fallback.images && fallback.images.length > 0
                ? typeof fallback.images[0] === 'string'
                  ? fallback.images[0]
                  : fallback.images[0].url
                : fallback.image || '';
            setSelectedImage(firstImg);

            const fallbackSizes =
              fallback.sizes && fallback.sizes.length > 0
                ? fallback.sizes.map((s) => (typeof s === 'string' ? s : s.size))
                : (fallback.variants || []).map((v) => v.size).filter(Boolean);
            setSelectedSize(fallbackSizes[0] || '');

            const fallbackColors =
              fallback.colors && fallback.colors.length > 0
                ? fallback.colors.map((c) => (typeof c === 'string' ? c : c.name))
                : (fallback.variants || []).map((v) => v.color).filter(Boolean);
            setSelectedColor(fallbackColors[0] || '');
          } else {
            setError('Product not found in current catalog.');
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProduct();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Fetch related products
  const { products: relatedProducts } = useProducts({
    department: product?.department,
    category: product?.category,
    limit: 4,
  });

  const filteredRelated = useMemo(() => {
    return relatedProducts.filter((p) => p.slug !== slug).slice(0, 4);
  }, [relatedProducts, slug]);

  if (loading) {
    return <Spinner fullPage label="Loading product specifications..." />;
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center w-full">
        <h2 className="text-2xl font-heading font-extrabold text-[#172033]">
          Product Not Found
        </h2>
        <p className="text-xs text-[#667085] mt-2 mb-6">
          The requested product may be sold out or moved.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold text-white bg-[#2677FF]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </Link>
      </div>
    );
  }

  const isPlay = product.department?.toUpperCase() === 'PLAY';
  const resolvedPrice =
    typeof product.price === 'number' && product.price > 0
      ? product.price
      : typeof product.priceInPaise === 'number'
      ? product.priceInPaise / 100
      : 0;

  const originalPrice =
    product.compareAtPrice ||
    product.originalPrice ||
    (typeof product.compareAtPriceInPaise === 'number'
      ? product.compareAtPriceInPaise / 100
      : resolvedPrice);

  const discount =
    product.discountPercent ||
    product.discountPercentage ||
    calculateDiscount(originalPrice, resolvedPrice);

  const imagesList =
    product.images && product.images.length > 0
      ? product.images.map((img) => (typeof img === 'string' ? img : img.url))
      : [product.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80'];

  const sizesList =
    product.sizes && product.sizes.length > 0
      ? product.sizes.map((s) => (typeof s === 'string' ? s : s.size))
      : product.variants && product.variants.length > 0
      ? [...new Set(product.variants.map((v) => v.size).filter(Boolean))]
      : [];

  const colorsList =
    product.colors && product.colors.length > 0
      ? product.colors.map((c) => (typeof c === 'string' ? c : c.name))
      : product.variants && product.variants.length > 0
      ? [...new Set(product.variants.map((v) => v.color).filter(Boolean))]
      : [];

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

  const inWishlist = isInWishlist(product._id || product.id || product.slug);

  const handleAddToCart = async () => {
    // Validate size selection if sizes exist
    if (sizesList.length > 0 && !selectedSize) {
      setSizeError('Please select a size before adding to bag');
      return;
    }
    setSizeError('');

    if (isOutOfStock) {
      toast.error('This product is currently out of stock.');
      return;
    }

    setIsAdding(true);
    const added = await addToCart(product, quantity, selectedSize, selectedColor);
    setIsAdding(false);
    if (added) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to submit a student review.');
      return;
    }
    if (!newComment.trim() || newComment.trim().length < 5) {
      toast.error('Please enter review remarks (at least 5 characters).');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await post(`/products/${product._id}/reviews`, {
        rating: newRating,
        title: newTitle.trim(),
        reviewText: newComment.trim()
      });

      const created = res?.data?.review;
      toast.success('Your verified student review has been published! ⭐');
      setNewComment('');
      setNewTitle('');

      if (created) {
        setReviews((prev) => [
          {
            id: created._id,
            userName: `${user?.firstName || 'Collegiate'} ${user?.lastName || 'Athlete'}`,
            rating: created.rating,
            title: created.title,
            comment: created.reviewText,
            verifiedPurchase: true,
            date: 'Just now'
          },
          ...prev
        ]);
      }
    } catch (err) {
      toast.error(err.message || 'Only verified customers with a delivered purchase can review this product.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=800&q=80';

  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs" aria-label="Breadcrumb">
        <div className="flex items-center gap-2 text-slate-500">
          <Link to="/" className="hover:text-[#2677FF] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to="/shop" className="hover:text-[#2677FF] transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link
            to={isPlay ? '/shop/play' : '/shop/campus'}
            className="hover:text-[#2677FF] transition-colors font-medium"
          >
            {isPlay ? 'DYPULSE PLAY' : 'DYPULSE CAMPUS'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#172033] font-semibold truncate max-w-[200px]">
            {product.name}
          </span>
        </div>

        <Badge variant={isPlay ? 'play' : 'campus'} size="sm">
          DYPULSE {isPlay ? 'PLAY' : 'CAMPUS'}
        </Badge>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-inner">
            <img
              src={selectedImage || imagesList[0]}
              alt={product.name}
              onError={handleImageError}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {discount > 0 && (
              <span className="absolute top-4 right-4 bg-[#FF7849] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                {discount}% OFF
              </span>
            )}
            <div className="absolute top-4 left-4 bg-[#0B1730]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              {isPlay ? <Zap className="w-3.5 h-3.5 text-sky-400" /> : <Sparkles className="w-3.5 h-3.5 text-pink-400" />}
              <span>{(typeof product.category === 'object' ? product.category?.name : product.category) || 'Official Drop'}</span>
            </div>
          </div>

          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-[#2677FF] shadow-md ring-2 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 opacity-80'
                  }`}
                >
                  <img src={img} alt="" onError={handleImageError} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Controls */}
        <div className="flex flex-col justify-between">
          <div>
            {/* Brand & Stock Status */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2677FF]">
                {product.brand || (isPlay ? 'DYPULSE PLAY' : 'DYPULSE CAMPUS')}
              </span>
              <span className="text-slate-300">•</span>
              {isOutOfStock ? (
                <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Sold Out
                </span>
              ) : isLowStock ? (
                <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Low Stock ({stock} units remaining)
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock for Hostel Delivery
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#172033] tracking-tight">
              {product.name}
            </h1>

            {/* Rating display (only if real ratings exist) */}
            {(product.ratings?.count > 0 || reviews.length > 0) && (
              <div className="flex items-center gap-2 mt-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.ratings?.average || 5)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {product.ratings?.average ? Number(product.ratings.average).toFixed(1) : '5.0'}
                </span>
                <span className="text-xs text-slate-400">
                  ({reviews.length > 0 ? reviews.length : product.ratings?.count} verified student reviews)
                </span>
              </div>
            )}

            {/* Pricing */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-heading font-black text-[#172033]">
                {formatPrice(resolvedPrice)}
              </span>
              {originalPrice > resolvedPrice && (
                <span className="text-base text-slate-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-pink-100 text-[#F044A5]">
                  Save {discount}%
                </span>
              )}
            </div>

            <p className="mt-4 text-xs text-[#667085] leading-relaxed">
              {product.description}
            </p>

            {/* Size Selector */}
            {sizesList.length > 0 && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                    Select Size <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] text-[#2677FF] cursor-pointer hover:underline font-medium">
                    Varsity Size Guide
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizesList.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError('');
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedSize === size
                          ? 'bg-[#0B1730] text-white shadow-md'
                          : 'bg-[#F5F7FA] text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {sizeError && (
                  <p className="text-xs text-rose-600 font-medium mt-1.5">{sizeError}</p>
                )}
              </div>
            )}

            {/* Color Selector */}
            {colorsList.length > 0 && (
              <div className="mt-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#172033] block mb-2">
                  Colorway: <span className="font-normal text-slate-600">{selectedColor || 'Standard'}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {colorsList.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedColor === color
                          ? 'border-[#2677FF] bg-blue-50 text-[#2677FF] font-semibold ring-1 ring-blue-300'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="mt-6 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#172033]">
                  Quantity:
                </span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-[#F5F7FA]">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-l-xl"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-bold text-[#172033]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    className="px-3 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-r-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                className={`flex-1 py-4 px-6 rounded-xl font-heading font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isOutOfStock
                    ? 'bg-slate-400 cursor-not-allowed'
                    : justAdded
                    ? 'bg-emerald-600 shadow-emerald-500/25'
                    : 'bg-[#2677FF] hover:bg-[#1b64e0] active:scale-[0.99] shadow-blue-500/25'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Shopping Bag!</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Currently Sold Out</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag — {formatPrice(resolvedPrice * quantity)}</span>
                  </>
                )}
              </button>

              {/* Wishlist Toggle Button */}
              <button
                onClick={() => toggleWishlist(product)}
                type="button"
                className={`p-4 rounded-xl border transition-all flex items-center justify-center shadow-xs active:scale-95 ${
                  inWishlist
                    ? 'bg-pink-50 border-pink-200 text-[#F044A5]'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                aria-label="Wishlist toggle"
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-[#F044A5]' : ''}`} />
              </button>
            </div>

            {/* Delivery & Assurance Guarantees */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <Truck className="w-4 h-4 text-[#2677FF] mb-1" />
                <span className="text-[10px] font-semibold text-slate-700">Hostel Delivery</span>
              </div>
              <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <RotateCcw className="w-4 h-4 text-[#8157F5] mb-1" />
                <span className="text-[10px] font-semibold text-slate-700">7-Day Swap</span>
              </div>
              <div className="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                <span className="text-[10px] font-semibold text-slate-700">100% Genuine</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Details Tabs */}
      {product.specifications && Object.keys(product.specifications).length > 0 && (
        <div className="mt-10 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-heading font-bold text-[#172033] mb-4">
            Technical & Material Specifications
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(product.specifications).map(([key, val]) => (
              <div key={key} className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{key}</p>
                <p className="font-semibold text-slate-800 text-xs mt-1">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-10 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4 mb-6">
          <div>
            <h2 className="text-xl font-heading font-bold text-[#172033]">
              Student Athlete Reviews
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Verified campus feedback on durability, comfort, and performance.
            </p>
          </div>
          <span className="px-3 py-1 bg-blue-50 text-[#2677FF] text-xs font-bold rounded-full self-start sm:self-auto">
            {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-heading font-bold text-sm text-[#172033]">No student reviews yet</p>
                <p className="text-xs text-[#667085] mt-1">
                  Be the first collegiate athlete to share feedback on this gear!
                </p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-xs text-[#172033]">{rev.userName}</span>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Box */}
          <div className="lg:col-span-1 bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <h3 className="font-heading font-bold text-sm text-[#172033] mb-3">
              Write a Review
            </h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Your Remarks
                </label>
                <textarea
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="How is the fit and tournament durability?"
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#2677FF]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2.5 rounded-xl bg-[#0B1730] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Student Review</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Recommendations Section (FEATURE 4) */}
      {recommendations.length > 0 ? (
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#8157F5]" />
                <h2 className="text-xl font-heading font-bold text-[#172033]">
                  Recommended For You
                </h2>
              </div>
              <p className="text-xs text-[#667085] mt-1">
                Contextual campus recommendations based on sport affinity, department style, and complementary gear.
              </p>
            </div>
            <Link
              to={isPlay ? '/shop/play' : '/shop/campus'}
              className="text-xs font-bold text-[#2677FF] hover:underline self-start sm:self-auto"
            >
              Explore {isPlay ? 'DYPULSE PLAY' : 'DYPULSE CAMPUS'} →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <div key={rec._id || rec.id} className="flex flex-col">
                {rec.recommendationReason && (
                  <div className="mb-2 inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-purple-50 text-[#8157F5] border border-purple-200">
                    <Sparkles className="w-3 h-3" />
                    <span>{rec.recommendationReason}</span>
                  </div>
                )}
                <ProductCard product={rec} />
              </div>
            ))}
          </div>
        </div>
      ) : filteredRelated.length > 0 ? (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-bold text-[#172033]">
              Related Campus Gear
            </h2>
            <Link
              to={isPlay ? '/shop/play' : '/shop/campus'}
              className="text-xs font-bold text-[#2677FF] hover:underline"
            >
              View More in Category →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRelated.map((rel) => (
              <ProductCard key={rel.id || rel._id} product={rel} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Recently Viewed Products Section (FEATURE 5) */}
      {recentlyViewed.length > 0 && (
        <div className="mt-14 pt-10 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-heading font-bold text-[#172033]">
                Recently Viewed Campus Gear
              </h2>
              <p className="text-xs text-[#667085] mt-1">
                Products you explored during this campus shopping session.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {recentlyViewed.length} {recentlyViewed.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyViewed.map((rv) => (
              <ProductCard key={rv._id || rv.id} product={rv} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
