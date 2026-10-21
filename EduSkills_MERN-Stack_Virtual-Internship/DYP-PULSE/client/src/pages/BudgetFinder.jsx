import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Wallet,
  Tag,
  Filter,
  Sparkles,
  Zap,
  ShoppingBag,
  SlidersHorizontal,
  ArrowRight,
  Check,
  ChevronDown,
  Layers,
  Flame,
  Search
} from 'lucide-react';
import { get } from '../services/api';
import { formatPrice } from '../utils/formatters';
import Spinner from '../components/ui/Spinner';
import ProductCard from '../components/ui/ProductCard';

const BUDGET_TIERS = [
  {
    id: 499,
    label: 'Under ₹499',
    maxPrice: 499,
    description: 'Student essentials, sports socks, gym shakers, wristbands & stationery',
    tag: 'Campus Steals',
    color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-600',
    icon: '🏷️'
  },
  {
    id: 999,
    label: 'Under ₹999',
    maxPrice: 999,
    description: 'Training tees, cricket balls, gym straps, casual caps & tech accessories',
    tag: 'Daily Fits',
    color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-[#2677FF]',
    icon: '⚡'
  },
  {
    id: 1499,
    label: 'Under ₹1,499',
    maxPrice: 1499,
    description: 'Oversized hoodies, badminton racquets, track pants & campus duffel bags',
    tag: 'Best Value',
    color: 'from-purple-500/10 to-pink-500/10 border-purple-500/30 text-[#8157F5]',
    icon: '✨'
  },
  {
    id: 1999,
    label: 'Under ₹1,999',
    maxPrice: 1999,
    description: 'Varsity bombers, turf shoes, English willow bats & tournament kits',
    tag: 'Varsity Grade',
    color: 'from-orange-500/10 to-amber-500/10 border-orange-500/30 text-[#FF7849]',
    icon: '🔥'
  }
];

export default function BudgetFinder() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial budget from query param or default to 999
  const initialMax = parseInt(searchParams.get('max'), 10) || 999;
  const initialDept = searchParams.get('dept') || 'ALL';

  const [selectedBudget, setSelectedBudget] = useState(initialMax);
  const [department, setDepartment] = useState(initialDept);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState('price_asc');
  const [searchQuery, setSearchQuery] = useState('');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await get('/categories');
        const cats = res?.data?.categories || res?.categories || [];
        const canonicalSlugs = [
          'cricket', 'football', 'basketball', 'badminton', 'running', 'fitness-gym', 'sports-footwear', 'sports-jerseys',
          'clothing', 'hoodies-sweatshirts', 'sneakers', 'backpacks', 'stationery', 'tech-accessories', 'everyday-essentials'
        ];
        const validCats = cats.filter((c) => canonicalSlugs.includes(c.slug));
        setCategories(validCats);
      } catch (err) {
        console.warn('Failed to load categories for budget finder:', err);
      }
    }
    loadCategories();
  }, []);

  // Sync state to URL search params
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('max', selectedBudget.toString());
    if (department !== 'ALL') params.set('dept', department);
    setSearchParams(params, { replace: true });
  }, [selectedBudget, department, setSearchParams]);

  // Fetch products matching budget
  useEffect(() => {
    let isMounted = true;
    async function fetchBudgetProducts() {
      setLoading(true);
      setError(null);
      try {
        const queryParams = {
          maxPrice: selectedBudget,
          sort: sortBy,
          limit: 36
        };

        if (department !== 'ALL') {
          queryParams.department = department;
        }

        if (selectedCategory !== 'ALL') {
          queryParams.category = selectedCategory;
        }

        if (searchQuery.trim()) {
          queryParams.search = searchQuery.trim();
        }

        const res = await get('/products', queryParams);
        const fetched = res?.data?.products || res?.products || [];

        if (isMounted) {
          // Strictly verify client-side as well: exclude any product where lowest starting price exceeds budget
          const verified = fetched.filter((p) => {
            const basePrice = p.price || (p.priceInPaise ? p.priceInPaise / 100 : 0);
            if (basePrice <= selectedBudget) return true;

            // Check variant overrides
            if (p.variants && p.variants.length > 0) {
              return p.variants.some((v) => {
                const vPrice = v.priceOverride || (v.priceOverrideInPaise ? v.priceOverrideInPaise / 100 : basePrice);
                return vPrice <= selectedBudget;
              });
            }
            return false;
          });

          setProducts(verified);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch affordable products.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchBudgetProducts();
    return () => {
      isMounted = false;
    };
  }, [selectedBudget, department, selectedCategory, sortBy, searchQuery]);

  // Active budget tier object (if matches preset)
  const activeTier = BUDGET_TIERS.find((t) => t.maxPrice === selectedBudget);

  return (
    <div className="min-h-screen bg-[#F5F7FA] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#0B1730] via-[#162446] to-[#2677FF] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/3 w-48 h-48 rounded-full bg-[#F044A5]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-wider text-sky-200 mb-4">
              <Wallet className="w-3.5 h-3.5 text-[#FF7849]" />
              <span>Campus Pocket Saver</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black tracking-tight leading-tight mb-3">
              CAMPUS BUDGET FINDER
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Find match-ready athletic gear and trending collegiate streetwear without breaking the student wallet. Filter by your exact allowance.
            </p>
          </div>
        </div>

        {/* Budget Tier Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BUDGET_TIERS.map((tier) => {
            const isSelected = selectedBudget === tier.maxPrice;
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => setSelectedBudget(tier.maxPrice)}
                className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 group bg-white shadow-sm hover:shadow-md ${
                  isSelected
                    ? 'border-[#2677FF] ring-2 ring-blue-500/20 bg-blue-50/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{tier.icon}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-[#2677FF] text-white'
                        : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}
                  >
                    {tier.tag}
                  </span>
                </div>

                <h3 className="text-lg font-heading font-black text-[#172033] mb-1">
                  {tier.label}
                </h3>
                <p className="text-xs text-[#667085] line-clamp-2 leading-relaxed">
                  {tier.description}
                </p>

                {isSelected && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-[#2677FF]">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active Filter</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Budget Slider Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2677FF]">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Custom Budget Ceiling
              </p>
              <p className="text-lg font-heading font-black text-[#172033]">
                Up to {formatPrice(selectedBudget)}
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-md flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-400">₹299</span>
            <input
              type="range"
              min="299"
              max="2999"
              step="100"
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2677FF]"
            />
            <span className="text-xs font-semibold text-slate-400">₹2,999</span>
          </div>
        </div>

        {/* Department & Category Filter Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Department Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Dept:</span>
              </span>

              <button
                type="button"
                onClick={() => setDepartment('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  department === 'ALL'
                    ? 'bg-[#0B1730] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Departments
              </button>

              <button
                type="button"
                onClick={() => setDepartment('PLAY')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  department === 'PLAY'
                    ? 'bg-[#2677FF] text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-sky-300" />
                <span>DYPULSE PLAY (Sports)</span>
              </button>

              <button
                type="button"
                onClick={() => setDepartment('CAMPUS')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  department === 'CAMPUS'
                    ? 'bg-[#F044A5] text-white shadow-md shadow-pink-500/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-200" />
                <span>DYPULSE CAMPUS (Lifestyle)</span>
              </button>
            </div>

            {/* Sorting & Search */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 border-none cursor-pointer focus:outline-none"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest Drops</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Category Chips */}
          {categories.length > 0 && (
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
                Category:
              </span>
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {categories
                .filter((cat) => department === 'ALL' || cat.department === department)
                .map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug || cat._id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === (cat.slug || cat._id)
                        ? 'bg-[#2677FF] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-heading font-black text-[#172033]">
              Available Within Budget
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">
              Showing authentic products priced at or below {formatPrice(selectedBudget)}.
            </p>
          </div>
          <span className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-full shadow-xs">
            {products.length} Products Found
          </span>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner label="Filtering catalog items within your budget..." />
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-red-200 shadow-sm text-rose-600 text-xs">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="text-base font-heading font-bold text-[#172033]">
              No products found under {formatPrice(selectedBudget)}
            </h3>
            <p className="text-xs text-[#667085] max-w-md mx-auto">
              Try increasing your budget ceiling or selecting another campus department.
            </p>
            <button
              onClick={() => {
                setSelectedBudget(1499);
                setDepartment('ALL');
                setSelectedCategory('ALL');
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-[#2677FF] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-600 transition-colors"
            >
              <span>Expand to ₹1,499 Collection</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
