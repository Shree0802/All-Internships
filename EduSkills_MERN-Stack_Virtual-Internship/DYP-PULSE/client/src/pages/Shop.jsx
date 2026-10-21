import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Zap,
  Sparkles,
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronRight,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronDown,
} from 'lucide-react';
import useProducts from '../hooks/useProducts';
import ProductCard from '../components/ui/ProductCard';
import ProductCardSkeleton from '../components/ui/ProductCardSkeleton';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { get } from '../services/api';

const PLAY_CATEGORIES = [
  'All',
  'Cricket',
  'Football',
  'Basketball',
  'Badminton',
  'Running',
  'Fitness & Gym',
  'Sports Footwear',
  'Sports Jerseys',
];

const CAMPUS_CATEGORIES = [
  'All',
  'Clothing',
  'Hoodies & Sweatshirts',
  'Sneakers',
  'Backpacks & Bags',
  'Stationery',
  'Tech Accessories',
  'Everyday Essentials',
];

const SPORTS_LIST = [
  'All Sports',
  'Cricket',
  'Football',
  'Basketball',
  'Badminton',
  'Running',
  'Fitness',
];

const BRANDS_LIST = [
  'All Brands',
  'DYPULSE PLAY',
  'DYPULSE CAMPUS',
  'SS',
  'SG',
  'Cosco',
  'Yonex',
  'Nivia',
  'Puma',
  'Asics',
  'Wilson',
  'Li-Ning',
  'Wildcraft',
  'Classmate',
  'Uniball',
  'Casio',
  'Boat',
  'Portronics',
  'Boldfit',
  'Red Tape',
  'Converse',
  'Noise',
];

const PRICE_PRESETS = [
  { label: 'All Prices', min: undefined, max: undefined },
  { label: 'Under ₹499', min: 0, max: 499 },
  { label: '₹500 - ₹999', min: 500, max: 999 },
  { label: '₹1,000 - ₹1,499', min: 1000, max: 1499 },
  { label: '₹1,500 and Above', min: 1500, max: undefined },
];

const SIZES_LIST = ['All Sizes', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Standard'];

export default function Shop() {
  const { department } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mobile Filter Drawer State
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // URL Query Synced States: prioritize route path if /shop/:department
  const urlDepartment = department ? department.toUpperCase() : searchParams.get('dept')?.toUpperCase() || 'ALL';
  const urlCategory = searchParams.get('category') || 'All';
  const urlSport = searchParams.get('sport') || 'All Sports';
  const urlBrand = searchParams.get('brand') || 'All Brands';
  const urlMinPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
  const urlMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
  const urlSize = searchParams.get('size') || 'All Sizes';
  const urlSearch = searchParams.get('search') || '';
  const urlSort = searchParams.get('sort') || 'newest';
  const urlPage = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(urlSearch);

  // Keep search input in sync if URL changes externally
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // Clean up any stale '?dept=...' query parameter if already on /shop/:department path
  useEffect(() => {
    if (department && searchParams.has('dept')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('dept');
      setSearchParams(newParams, { replace: true });
    }
  }, [department, searchParams, setSearchParams]);

  // Determine query parameters for API call
  const queryParams = useMemo(() => {
    const params = {
      page: urlPage,
      limit: 12,
      sort: urlSort,
    };

    if (urlDepartment && urlDepartment !== 'ALL') {
      params.department = urlDepartment;
    }
    if (urlCategory && urlCategory !== 'All') {
      params.category = urlCategory;
    }
    if (urlBrand && urlBrand !== 'All Brands') {
      params.brand = urlBrand;
    }
    if (urlSport && urlSport !== 'All Sports') {
      params.sport = urlSport.toLowerCase();
    }
    if (urlSize && urlSize !== 'All Sizes') {
      params.size = urlSize;
    }
    if (urlMinPrice !== undefined) {
      params.minPrice = urlMinPrice;
    }
    if (urlMaxPrice !== undefined) {
      params.maxPrice = urlMaxPrice;
    }
    if (urlSearch.trim()) {
      params.search = urlSearch.trim();
    }

    return params;
  }, [urlDepartment, urlCategory, urlBrand, urlSport, urlSize, urlMinPrice, urlMaxPrice, urlSearch, urlSort, urlPage]);

  const { products: rawProducts, loading, error, pagination } = useProducts(queryParams);

  // Client-side filtering fallback for size and sport
  const products = useMemo(() => {
    let result = rawProducts || [];

    if (urlSport && urlSport !== 'All Sports') {
      const sportLower = urlSport.toLowerCase();
      result = result.filter(
        (p) =>
          p.sport?.toLowerCase() === sportLower ||
          p.tags?.some((t) => t.toLowerCase().includes(sportLower)) ||
          (typeof p.category === 'string'
            ? p.category.toLowerCase().includes(sportLower)
            : (p.category?.name?.toLowerCase().includes(sportLower) || p.category?.slug?.toLowerCase().includes(sportLower))) ||
          p.name?.toLowerCase().includes(sportLower) ||
          p.description?.toLowerCase().includes(sportLower)
      );
    }

    if (urlSize && urlSize !== 'All Sizes') {
      result = result.filter((p) => {
        if (!p.sizes || p.sizes.length === 0) return true;
        return p.sizes.some((s) => {
          const sizeName = typeof s === 'string' ? s : s.size;
          return sizeName?.toLowerCase() === urlSize.toLowerCase();
        });
      });
    }

    return result;
  }, [rawProducts, urlSport, urlSize]);

  // Dynamic categories from API with fallback
  const [dbCategories, setDbCategories] = useState([]);
  useEffect(() => {
    get('/categories')
      .then((res) => {
        const cats = res?.data?.categories || res?.categories || [];
        if (cats.length > 0) setDbCategories(cats);
      })
      .catch(() => {});
  }, []);

  const availableCategories = useMemo(() => {
    if (dbCategories.length > 0) {
      const canonicalSlugs = [
        'cricket', 'football', 'basketball', 'badminton', 'running', 'fitness-gym', 'sports-footwear', 'sports-jerseys',
        'clothing', 'hoodies-sweatshirts', 'sneakers', 'backpacks', 'stationery', 'tech-accessories', 'everyday-essentials'
      ];
      let filtered = dbCategories.filter((c) => canonicalSlugs.includes(c.slug));
      if (urlDepartment && urlDepartment !== 'ALL') {
        filtered = filtered.filter((c) => c.department === urlDepartment);
      }
      return ['All', ...filtered.map((c) => c.name)];
    }
    if (urlDepartment === 'PLAY') return PLAY_CATEGORIES;
    if (urlDepartment === 'CAMPUS') return CAMPUS_CATEGORIES;
    return ['All', ...new Set([...PLAY_CATEGORIES.slice(1), ...CAMPUS_CATEGORIES.slice(1)])];
  }, [urlDepartment, dbCategories]);

  // Department navigation handler
  const handleDepartmentChange = (dept) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('dept');
    newParams.delete('page');
    // If selecting CAMPUS, clear sports filter since sports belong to PLAY
    if (dept === 'CAMPUS') {
      newParams.delete('sport');
    }
    const queryStr = newParams.toString();
    const targetPath = dept === 'ALL' ? '/shop' : `/shop/${dept.toLowerCase()}`;
    navigate(queryStr ? `${targetPath}?${queryStr}` : targetPath);
  };

  // Sport selection handler
  const handleSportChange = (sport) => {
    const newParams = new URLSearchParams(searchParams);
    if (!sport || sport === 'All Sports') {
      newParams.delete('sport');
    } else {
      newParams.set('sport', sport);
      // All sports belong to the PLAY department
      if (urlDepartment === 'CAMPUS') {
        newParams.delete('category'); // Clear campus category
        const queryStr = newParams.toString();
        navigate(`/shop/play?${queryStr}`);
        return;
      }
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  // Update URL helper for standard query params
  const updateQuery = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'All' || value === 'All Sports' || value === 'All Brands' || value === 'All Sizes') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    // Reset page to 1 on filter change
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const handlePricePreset = (min, max) => {
    const newParams = new URLSearchParams(searchParams);
    if (min !== undefined) newParams.set('minPrice', String(min));
    else newParams.delete('minPrice');

    if (max !== undefined) newParams.set('maxPrice', String(max));
    else newParams.delete('maxPrice');

    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQuery('search', searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    urlCategory !== 'All' ||
    urlSport !== 'All Sports' ||
    urlBrand !== 'All Brands' ||
    urlMinPrice !== undefined ||
    urlMaxPrice !== undefined ||
    urlSize !== 'All Sizes' ||
    Boolean(urlSearch);

  // Active filter count for badge
  const activeFilterCount = [
    urlCategory !== 'All',
    urlSport !== 'All Sports',
    urlBrand !== 'All Brands',
    urlMinPrice !== undefined || urlMaxPrice !== undefined,
    urlSize !== 'All Sizes',
    Boolean(urlSearch),
  ].filter(Boolean).length;

  return (
    <div className="flex-1 w-full bg-[#F5F7FA]">
      {/* Breadcrumb Navigation & Header */}
      <div className="bg-[#0B1730] text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#2677FF]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-[#F044A5]/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-4" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <Link to="/shop" className="hover:text-white transition-colors">
              Shop All
            </Link>
            {urlDepartment !== 'ALL' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-white font-medium">
                  {urlDepartment === 'PLAY' ? 'DYPULSE PLAY' : 'DYPULSE CAMPUS'}
                </span>
              </>
            )}
            {urlCategory !== 'All' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-sky-300 font-medium">{urlCategory}</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {urlDepartment === 'PLAY' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-[#2677FF] border border-blue-500/30">
                    <Zap className="w-3.5 h-3.5" /> Performance Arena
                  </span>
                )}
                {urlDepartment === 'CAMPUS' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-500/20 text-[#F044A5] border border-pink-500/30">
                    <Sparkles className="w-3.5 h-3.5" /> Campus Lifestyle
                  </span>
                )}
                {urlDepartment === 'ALL' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-[#8157F5] border border-purple-500/30">
                    <Zap className="w-3.5 h-3.5" /> Official Full Catalog
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-heading font-black tracking-tight text-white">
                {urlDepartment === 'PLAY'
                  ? 'DYPULSE PLAY Collection'
                  : urlDepartment === 'CAMPUS'
                  ? 'DYPULSE CAMPUS Collection'
                  : 'All Campus & Athletic Gear'}
              </h1>
              <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {urlDepartment === 'PLAY'
                  ? 'Professional varsity cricket equipment, football kits, badminton racquets, and training shoes.'
                  : urlDepartment === 'CAMPUS'
                  ? 'Collegiate hoodies, oversized tees, daily sneakers, waterproof laptop bags, and desk essentials.'
                  : 'The unified campus store for tournament champions and everyday student lifestyle.'}
              </p>
            </div>

            {/* Department Switcher Tabs */}
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-full border border-white/10 self-start md:self-auto shrink-0">
              <Link
                to="/shop"
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  urlDepartment === 'ALL'
                    ? 'bg-white text-[#0B1730] shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                All Gear
              </Link>
              <Link
                to="/shop/play"
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  urlDepartment === 'PLAY'
                    ? 'bg-[#2677FF] text-white shadow-md shadow-blue-500/25 font-bold'
                    : 'text-slate-300 hover:text-[#2677FF] hover:bg-white/10'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>PLAY</span>
              </Link>
              <Link
                to="/shop/campus"
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  urlDepartment === 'CAMPUS'
                    ? 'bg-[#F044A5] text-white shadow-md shadow-pink-500/25 font-bold'
                    : 'text-slate-300 hover:text-[#F044A5] hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>CAMPUS</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search bats, jerseys, hoodies, backpacks..."
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#172033] placeholder:text-slate-400 focus:outline-none focus:border-[#2677FF] focus:bg-white transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    updateQuery('search', '');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Controls: Filter Button (Mobile), Result Count, Sort */}
            <div className="flex items-center justify-between sm:justify-end gap-3">
              {/* Mobile Filter Toggle */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#2677FF] text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <span className="text-xs text-[#667085] font-medium">
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </span>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">Sort:</span>
                <select
                  value={urlSort}
                  onChange={(e) => updateQuery('sort', e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-semibold text-[#172033] rounded-xl px-3 py-2 focus:outline-none focus:border-[#2677FF] cursor-pointer"
                >
                  <option value="newest">Newest Drops</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Sidebar + Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Category Chips Strip */}
        <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            type="button"
            onClick={() => updateQuery('category', 'All')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              urlCategory === 'All'
                ? 'bg-[#0B1730] text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            All {urlDepartment !== 'ALL' ? urlDepartment : 'Categories'}
          </button>
          {availableCategories.filter((c) => c !== 'All').map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => updateQuery('category', cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                urlCategory === cat
                  ? 'bg-[#2677FF] text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-8">
          {/* =========================================================================
              DESKTOP FILTERS SIDEBAR
             ========================================================================= */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-heading font-bold text-sm text-[#172033] flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#2677FF]" />
                  <span>Filter Products</span>
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Department Filter */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#172033] block mb-2.5">
                  Department
                </label>
                <div className="space-y-1.5 text-xs">
                  {['ALL', 'PLAY', 'CAMPUS'].map((dept) => (
                    <button
                      key={dept}
                      onClick={() => handleDepartmentChange(dept)}
                      className={`w-full text-left px-3 py-2 rounded-xl transition-all font-medium flex items-center justify-between ${
                        urlDepartment === dept
                          ? 'bg-[#0B1730] text-white font-semibold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{dept === 'ALL' ? 'All Departments' : `DYPULSE ${dept}`}</span>
                      {urlDepartment === dept && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sport Filter */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#172033] block mb-2.5">
                  Sport Focus
                </label>
                <div className="space-y-1 text-xs max-h-40 overflow-y-auto pr-1">
                  {SPORTS_LIST.map((sp) => (
                    <button
                      key={sp}
                      onClick={() => handleSportChange(sp)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all ${
                        urlSport === sp
                          ? 'bg-blue-50 text-[#2677FF] font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {sp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#172033] block mb-2.5">
                  Category
                </label>
                <div className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1">
                  {availableCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => updateQuery('category', cat)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all ${
                        urlCategory === cat
                          ? 'bg-blue-50 text-[#2677FF] font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Preset Filter */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#172033] block mb-2.5">
                  Price Range
                </label>
                <div className="space-y-1.5 text-xs">
                  {PRICE_PRESETS.map((preset) => {
                    const isSelected =
                      urlMinPrice === preset.min && urlMaxPrice === preset.max;
                    return (
                      <button
                        key={preset.label}
                        onClick={() => handlePricePreset(preset.min, preset.max)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-[#2677FF] text-white font-semibold shadow-xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Filter */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#172033] block mb-2.5">
                  Size
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SIZES_LIST.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => updateQuery('size', sz)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                        urlSize === sz
                          ? 'bg-[#0B1730] text-white border-[#0B1730]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#172033] block mb-2.5">
                  Brand
                </label>
                <div className="space-y-1 text-xs max-h-36 overflow-y-auto pr-1">
                  {BRANDS_LIST.map((br) => (
                    <button
                      key={br}
                      onClick={() => updateQuery('brand', br)}
                      className={`w-full text-left px-2.5 py-1 rounded-lg transition-all ${
                        urlBrand === br
                          ? 'bg-blue-50 text-[#2677FF] font-semibold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {br}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* =========================================================================
              MOBILE FILTER DRAWER
             ========================================================================= */}
          {mobileFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
                onClick={() => setMobileFilterOpen(false)}
              />
              <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h3 className="font-heading font-bold text-base text-[#172033]">
                      Filters ({activeFilterCount})
                    </h3>
                    <button
                      onClick={() => setMobileFilterOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Department */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#172033] block mb-2">
                      Department
                    </span>
                    <div className="space-y-1 text-xs">
                      {['ALL', 'PLAY', 'CAMPUS'].map((dept) => (
                        <button
                          key={dept}
                          onClick={() => {
                            handleDepartmentChange(dept);
                            setMobileFilterOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl font-medium ${
                            urlDepartment === dept
                              ? 'bg-[#0B1730] text-white'
                              : 'text-slate-600 bg-slate-50'
                          }`}
                        >
                          {dept === 'ALL' ? 'All Departments' : `DYPULSE ${dept}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#172033] block mb-2">
                      Price Bracket
                    </span>
                    <div className="space-y-1 text-xs">
                      {PRICE_PRESETS.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => handlePricePreset(preset.min, preset.max)}
                          className={`w-full text-left px-3 py-2 rounded-xl ${
                            urlMinPrice === preset.min && urlMaxPrice === preset.max
                              ? 'bg-[#2677FF] text-white font-bold'
                              : 'text-slate-600 bg-slate-50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#172033] block mb-2">
                      Category
                    </span>
                    <div className="space-y-1 text-xs max-h-40 overflow-y-auto pr-1">
                      {availableCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => updateQuery('category', cat)}
                          className={`w-full text-left px-3 py-1.5 rounded-lg ${
                            urlCategory === cat
                              ? 'bg-blue-50 text-[#2677FF] font-bold'
                              : 'text-slate-600'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex gap-3">
                  <button
                    onClick={handleClearFilters}
                    className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="flex-1 py-3 rounded-xl bg-[#2677FF] text-xs font-bold text-white shadow-md shadow-blue-500/20"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              PRODUCTS GRID & PAGINATION
             ========================================================================= */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                title="No items found"
                description={
                  urlSearch
                    ? `No products match your keyword "${urlSearch}". Try checking your spelling or adjusting filters.`
                    : 'No products in this specific category or price range. Check back soon for the next drop.'
                }
                actionText="Reset All Filters"
                onAction={handleClearFilters}
              />
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id || product._id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.pages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    <button
                      onClick={() => updateQuery('page', String(pagination.page - 1))}
                      disabled={!pagination.hasPrevPage}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Prev</span>
                    </button>

                    {[...Array(pagination.pages)].map((_, idx) => {
                      const pageNum = idx + 1;
                      const isCurrent = pageNum === pagination.page;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => updateQuery('page', String(pageNum))}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-[#0B1730] text-white shadow-sm'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => updateQuery('page', String(pagination.page + 1))}
                      disabled={!pagination.hasNextPage}
                      className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50 transition-colors flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
