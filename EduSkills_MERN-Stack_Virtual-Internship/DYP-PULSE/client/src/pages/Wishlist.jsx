import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, AlertTriangle, ArrowRight } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { formatPrice } from '../utils/formatters';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';

export default function Wishlist() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToBag = async (product) => {
    const success = await addToCart(product, 1);
    if (success) {
      removeFromWishlist(product.productId || product._id || product.id || product.slug);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F044A5] mb-1">
            <Heart className="w-3.5 h-3.5 fill-[#F044A5]" />
            <span>Saved Collegiate Gear</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#172033]">
            My Wishlist ({wishlist.length})
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Keep track of items you plan to grab for the upcoming sports tournament or campus semester.
          </p>
        </div>

        {wishlist.length > 0 && (
          <button
            onClick={clearWishlist}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Wishlist</span>
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="You haven’t saved any varsity gear or campus fits yet. Start exploring the catalog to save your favorites!"
          actionText="Explore Campus Drops"
          actionHref="/shop"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item) => {
            const isPlay = item.department?.toUpperCase() === 'PLAY';
            const img =
              item.image ||
              (item.images && item.images.length > 0
                ? typeof item.images[0] === 'string'
                  ? item.images[0]
                  : item.images[0].url
                : 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80');

            const slug = item.slug || item.productId || item._id || item.id;
            const isAvailable = item.isActive !== false;
            const inStock = item.inStock !== false && (item.stock === undefined || item.stock > 0);

            return (
              <div
                key={slug}
                className="group relative flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all"
              >
                <Link to={`/product/${slug}`} className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
                  <img
                    src={img}
                    alt={item.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      !isAvailable || !inStock ? 'grayscale opacity-75' : ''
                    }`}
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    <Badge variant={isPlay ? 'play' : 'campus'} size="sm">
                      {isPlay ? 'PLAY' : 'CAMPUS'}
                    </Badge>
                    {!isAvailable && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-white uppercase tracking-wider">
                        Unavailable
                      </span>
                    )}
                    {isAvailable && !inStock && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase tracking-wider">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </Link>

                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {item.brand || (isPlay ? 'DYPULSE PLAY' : 'DYPULSE CAMPUS')}
                  </span>
                  <Link
                    to={`/product/${slug}`}
                    className="font-heading font-medium text-sm text-[#172033] hover:text-[#2677FF] mt-1 line-clamp-1"
                  >
                    {item.name}
                  </Link>

                  <div className="mt-2 text-base font-bold text-[#172033]">
                    {formatPrice(item.price)}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleMoveToBag(item)}
                      disabled={!isAvailable || !inStock}
                      className="flex-1 py-2 px-3 bg-[#2677FF] hover:bg-[#1b64e0] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{inStock ? 'Move to Bag' : 'Out of Stock'}</span>
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.productId || item._id || item.id || slug)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Remove item"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
