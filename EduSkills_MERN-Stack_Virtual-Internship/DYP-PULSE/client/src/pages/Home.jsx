import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  Sparkles,
  Flame,
  ShieldCheck,
  Truck,
  Layers,
  ShoppingBag,
  Award,
  ChevronRight,
  Tag,
  Clock,
  Compass,
} from 'lucide-react';
import useProducts from '../hooks/useProducts';
import ProductCard from '../components/ui/ProductCard';
import ProductCardSkeleton from '../components/ui/ProductCardSkeleton';
import BrandPillars from '../components/ui/BrandPillars';
import Spinner from '../components/ui/Spinner';

// Shop by sport dataset
const SPORTS_LIST = [
  {
    name: 'Cricket',
    count: 'Bats, Kits & Balls',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
    link: '/shop/play?sport=Cricket',
  },
  {
    name: 'Football',
    count: 'Boots, Balls & Guards',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=600&q=80',
    link: '/shop/play?sport=Football',
  },
  {
    name: 'Basketball',
    count: 'Jerseys, Balls & High-Tops',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=80',
    link: '/shop/play?sport=Basketball',
  },
  {
    name: 'Badminton',
    count: 'Racquets, Shuttles & Grips',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=80',
    link: '/shop/play?sport=Badminton',
  },
  {
    name: 'Running',
    count: 'Speed Footwear & Apparel',
    image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?auto=format&fit=crop&w=600&q=80',
    link: '/shop/play?sport=Running',
  },
  {
    name: 'Fitness',
    count: 'Gym Gear, Bands & Bottles',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=80',
    link: '/shop/play?sport=Fitness',
  },
];

// Campus essentials dataset
const ESSENTIALS_LIST = [
  {
    name: 'Hoodies & Sweats',
    tag: 'Heavyweight 380-450 GSM',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    link: '/shop/campus?category=Hoodies+%26+Sweatshirts',
  },
  {
    name: 'Clothing',
    tag: 'Oversized Boxy Tees & Cargos',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
    link: '/shop/campus?category=Clothing',
  },
  {
    name: 'Sneakers',
    tag: 'Chunky & Retro Soles',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
    link: '/shop/campus?category=Sneakers',
  },
  {
    name: 'Backpacks & Bags',
    tag: 'Padded Laptop Sleeves & Duffels',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    link: '/shop/campus?category=Backpacks+%26+Bags',
  },
  {
    name: 'Tech Accessories',
    tag: 'Wireless Buds & GaN Chargers',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    link: '/shop/campus?category=Tech+Accessories',
  },
  {
    name: 'Stationery & Study',
    tag: 'Hardbound Journals & Pens',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
    link: '/shop/campus?category=Stationery',
  },
];

export default function Home() {
  // Fetch real products for Trending, Budget collections, and New arrivals
  const { products: allProducts, loading } = useProducts({ limit: 40 });
  const [budgetTab, setBudgetTab] = useState('under_999');

  // Trending products (first 4 items with highest popularity or featured)
  const trendingProducts = useMemo(() => {
    return allProducts.slice(0, 4);
  }, [allProducts]);

  // Filter products by selected budget category
  const budgetFilteredProducts = useMemo(() => {
    switch (budgetTab) {
      case 'under_499':
        return allProducts.filter((p) => p.price <= 499).slice(0, 4);
      case 'under_999':
        return allProducts.filter((p) => p.price <= 999).slice(0, 4);
      case 'under_1499':
        return allProducts.filter((p) => p.price <= 1499).slice(0, 4);
      case 'sports_essentials':
        return allProducts.filter((p) => p.department?.toUpperCase() === 'PLAY').slice(0, 4);
      case 'campus_style':
        return allProducts.filter((p) => p.department?.toUpperCase() === 'CAMPUS').slice(0, 4);
      default:
        return allProducts.slice(0, 4);
    }
  }, [budgetTab, allProducts]);

  // New arrivals (sorted by newest, taking up to 4)
  const newArrivals = useMemo(() => {
    return [...allProducts]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 4);
  }, [allProducts]);

  return (
    <div className="flex flex-col flex-1 w-full bg-[#F5F7FA]">
      {/* =========================================================================
          SECTION C: HERO SECTION
          Headline: "YOUR CAMPUS. YOUR GAME. YOUR STYLE."
          Description: "From match-day essentials to everyday campus fits, discover everything that moves your student life forward."
          Buttons: "SHOP SPORTS", "EXPLORE CAMPUS"
         ========================================================================= */}
      <section className="bg-gradient-hero text-white py-20 sm:py-28 relative overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute inset-0 hero-pattern opacity-40 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#2677FF]/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#F044A5]/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Official Brand Logo Showcase Badge */}
          <div className="mb-8 inline-block animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/30 inline-flex items-center justify-center">
              <img
                src="/dypulse-logo.png"
                alt="DYPULSE - Feel the Campus. Live the Game."
                className="h-24 sm:h-32 md:h-40 w-auto object-contain drop-shadow-md"
              />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold uppercase tracking-wider text-white mb-6 border border-white/15">
            <Flame className="w-3.5 h-3.5 text-[#FF7849]" />
            <span>Collegiate Sports & Lifestyle Destination</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-black tracking-tight text-white leading-tight max-w-4xl mx-auto">
            FEEL THE CAMPUS. <br />
            <span className="text-gradient-dypulse">LIVE THE GAME.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            The premier college apparel & athletic destination. From tournament jerseys and high-performance equipment to collegiate streetwear and campus daily carry.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/shop/play"
              className="px-8 py-3.5 rounded-full font-heading font-bold text-sm text-white bg-[#2677FF] hover:bg-[#1b64e0] shadow-lg shadow-blue-500/30 transition-all duration-200 flex items-center gap-2 group active:scale-95"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>SHOP SPORTS</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/shop/campus"
              className="px-8 py-3.5 rounded-full font-heading font-bold text-sm text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm transition-all duration-200 flex items-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-pink-300" />
              <span>EXPLORE CAMPUS</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D: TWO PRIMARY DEPARTMENT CARDS
          DYPULSE PLAY: Sports equipment, jerseys, footwear, and fitness.
          DYPULSE CAMPUS: Fashion, sneakers, backpacks, and everyday essentials.
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DYPULSE PLAY Card */}
          <Link
            to="/shop/play"
            className="group rounded-3xl p-8 sm:p-10 bg-gradient-play text-white relative overflow-hidden shadow-xl border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between min-h-[260px]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/20 text-sky-300 border border-blue-400/30 mb-4">
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                <span>Athletic Department</span>
              </div>
              <h2 className="text-3xl font-heading font-extrabold tracking-tight">
                DYPULSE PLAY
              </h2>
              <p className="text-sm text-slate-300 mt-2 max-w-md leading-relaxed">
                Sports equipment, tournament jerseys, running footwear, and fitness gear engineered for university athletes.
              </p>
            </div>

            <div className="pt-6 relative z-10 flex items-center gap-2 font-heading font-bold text-xs uppercase tracking-wider text-sky-300 group-hover:text-white transition-colors">
              <span>Enter Play Arena</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* DYPULSE CAMPUS Card */}
          <Link
            to="/shop/campus"
            className="group rounded-3xl p-8 sm:p-10 bg-gradient-campus text-white relative overflow-hidden shadow-xl border border-white/10 hover:border-white/30 transition-all duration-300 flex flex-col justify-between min-h-[260px]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-400/30 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Lifestyle Department</span>
              </div>
              <h2 className="text-3xl font-heading font-extrabold tracking-tight">
                DYPULSE CAMPUS
              </h2>
              <p className="text-sm text-slate-300 mt-2 max-w-md leading-relaxed">
                Campus fashion, retro sneakers, laptop backpacks, and everyday essentials curated for collegiate life.
              </p>
            </div>

            <div className="pt-6 relative z-10 flex items-center gap-2 font-heading font-bold text-xs uppercase tracking-wider text-pink-300 group-hover:text-white transition-colors">
              <span>Explore Campus Fits</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* =========================================================================
          SECTION: OFFICIAL BRAND PILLARS (DIRECTLY DERIVED FROM DYPULSE LOGO)
          SPORTS (Mint), FASHION (Pink), ESSENTIALS (Amber), FOR STUDENTS (Purple)
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-200/80 text-slate-700 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#2677FF]" />
            <span>Official Brand Pillars</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-black text-[#0B1730] tracking-tight">
            The 4 Pillars of DYPULSE
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] mt-2 leading-relaxed">
            From tournament championships to daily campus life — authentic collegiate quality across every category.
          </p>
        </div>

        <BrandPillars variant="cards" />
      </section>

      {/* =========================================================================
          SECTION E: SHOP BY SPORT
          Cricket, Football, Basketball, Badminton, Running, Fitness
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2677FF] mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Inter-College Athletics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#172033] tracking-tight">
              Shop by Sport
            </h2>
          </div>
          <Link
            to="/shop/play"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2677FF] hover:text-[#1b64e0] group self-start sm:self-auto"
          >
            <span>All Sports Gear</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {SPORTS_LIST.map((sport) => (
            <Link
              key={sport.name}
              to={sport.link}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-end p-4"
            >
              <img
                src={sport.image}
                alt={sport.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              <div className="relative z-10">
                <h3 className="font-heading font-bold text-white text-base group-hover:text-sky-300 transition-colors">
                  {sport.name}
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5 font-medium">
                  {sport.count}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION F: CAMPUS ESSENTIALS
          Clothing, Sneakers, Backpacks, Stationery, Tech accessories
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F044A5] mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Everyday Student Life</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#172033] tracking-tight">
              Campus Essentials
            </h2>
          </div>
          <Link
            to="/shop/campus"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F044A5] hover:text-[#d93892] group self-start sm:self-auto"
          >
            <span>All Campus Drops</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {ESSENTIALS_LIST.map((item) => (
            <Link
              key={item.name}
              to={item.link}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-900 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-end p-5"
            >
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1730]/90 via-[#0B1730]/40 to-transparent" />
              <div className="relative z-10">
                <h3 className="font-heading font-bold text-white text-lg group-hover:text-pink-300 transition-colors">
                  {item.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  {item.tag}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION G: TRENDING PRODUCTS
          Reusable product cards & real catalog data
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF7849] mb-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Campus Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#172033] tracking-tight">
              Trending Drops
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2677FF] hover:text-[#1b64e0] group self-start sm:self-auto"
          >
            <span>View All Gear</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION H: BUDGET COLLECTIONS
          Under ₹499, Under ₹999, Under ₹1,499, Sports Essentials, Everyday Campus Style
          Filtered by actual prices!
         ========================================================================= */}
      <section className="bg-white border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2677FF] mb-1">
                <Tag className="w-3.5 h-3.5" />
                <span>Student-Friendly Value</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#172033] tracking-tight">
                Budget Collections
              </h2>
              <p className="text-xs text-[#667085] mt-1">
                Real university essentials filtered strictly to fit your pocket money.
              </p>
            </div>

            {/* Budget Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'under_499', label: 'Under ₹499' },
                { id: 'under_999', label: 'Under ₹999' },
                { id: 'under_1499', label: 'Under ₹1,499' },
                { id: 'sports_essentials', label: 'Sports Essentials' },
                { id: 'campus_style', label: 'Everyday Campus Style' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setBudgetTab(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                    budgetTab === tab.id
                      ? 'bg-[#0B1730] text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : budgetFilteredProducts.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-sm font-semibold text-slate-600">No items currently under this price bracket.</p>
              <Link to="/shop" className="text-xs font-bold text-[#2677FF] mt-2 inline-block hover:underline">
                Browse Full Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {budgetFilteredProducts.map((product) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION I: NEW ARRIVALS
          Recently created or explicitly designated new products
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8157F5] mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Just In</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#172033] tracking-tight">
              New Arrivals
            </h2>
            <p className="text-xs text-[#667085] mt-1">
              Fresh tournament releases, new seasonal silhouettes, and updated campus accessories.
            </p>
          </div>
          <Link
            to="/shop?sort=newest"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8157F5] hover:text-[#6f42ec] group self-start sm:self-auto"
          >
            <span>Explore All New</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* =========================================================================
          SECTION J: TEAM KIT STUDIO PROMOTIONAL SECTION
          Headline: "YOUR TEAM. YOUR COLORS."
          Description: "Create your team's identity with customized sports kits and jerseys."
          Button: "BUILD YOUR TEAM KIT"
         ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
        <div className="rounded-3xl bg-gradient-to-r from-[#0B1730] via-[#1a2d59] to-[#2677FF] text-white p-8 sm:p-12 lg:p-16 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-60 h-60 rounded-full bg-[#F044A5]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-sky-200 border border-white/20 mb-6">
              <Award className="w-3.5 h-3.5" />
              <span>Inter-College Team Kit Studio</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white leading-tight">
              YOUR TEAM. <br />
              <span className="text-gradient-dypulse">YOUR COLORS.</span>
            </h2>

            <p className="mt-4 text-sm sm:text-base text-slate-200 leading-relaxed">
              Create your team's identity with customized sports kits and jerseys. Enter your college crest, select tournament colorways, and submit your roster for varsity-grade production.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/team-kit"
                className="px-8 py-4 rounded-full font-heading font-bold text-sm text-[#0B1730] bg-white hover:bg-slate-100 shadow-xl transition-all duration-200 flex items-center gap-2 active:scale-95"
              >
                <span>BUILD YOUR TEAM KIT</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <span className="text-xs text-slate-300 font-medium">
                • Cricket, Football, Basketball & Track
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION K: BENEFITS SECTION
          Truthful, configurable benefits:
          - Secure checkout
          - Convenient order tracking
          - Student-friendly collections
          - Sports and campus essentials in one place
         ========================================================================= */}
      <section className="bg-white border-t border-slate-200/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Benefit 1 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2677FF] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#172033]">Secure Checkout</h3>
                <p className="text-xs text-[#667085] mt-1">
                  Server-side signed cookie sessions and verified student credentials protect every purchase.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#8157F5] flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#172033]">Convenient Order Tracking</h3>
                <p className="text-xs text-[#667085] mt-1">
                  Real-time status updates delivered straight to your account with hostel room drop details.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#F044A5] flex items-center justify-center shrink-0">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#172033]">Student-Friendly Collections</h3>
                <p className="text-xs text-[#667085] mt-1">
                  Transparent pricing with genuine budget filters under ₹499, ₹999, and ₹1,499.
                </p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF7849] flex items-center justify-center shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm text-[#172033]">All in One Campus Store</h3>
                <p className="text-xs text-[#667085] mt-1">
                  Single seamless catalog uniting DYPULSE PLAY athletics and DYPULSE CAMPUS streetwear.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
