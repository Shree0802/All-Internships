import { useState, useEffect, useCallback } from 'react';
import { get } from '../services/api';

// Curated catalog fallback for seamless UI development & offline demo
export const FALLBACK_PRODUCTS = [
  {
    _id: 'prod-play-1',
    id: 'prod-play-1',
    slug: 'pulse-pro-aero-football-jersey',
    name: 'Pulse Pro Aero Team Jersey',
    brand: 'DYPULSE PLAY',
    department: 'play',
    category: 'Jerseys & Kits',
    price: 1899,
    originalPrice: 2499,
    discountPercentage: 24,
    rating: 4.8,
    numReviews: 42,
    isFeatured: true,
    inStock: true,
    colors: ['Electric Blue', 'Navy Onyx', 'Pulse White'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Engineered for tournament champions. Ultra-breathable AeroMesh moisture-wicking fabric with athletic ergonomic seams and anti-chafing trim.',
    specs: {
      Material: '100% Recycled AeroMesh Polyester',
      Fit: 'Athletic Performance Fit',
      Technology: 'Dri-Pulse Moisture Evaporation',
      Care: 'Machine wash cold with like colors',
    },
  },
  {
    _id: 'prod-campus-1',
    id: 'prod-campus-1',
    slug: 'varsity-heavyweight-oversized-hoodie',
    name: 'Varsity 450GSM Oversized Hoodie',
    brand: 'DYPULSE CAMPUS',
    department: 'campus',
    category: 'Hoodies & Sweatshirts',
    price: 2499,
    originalPrice: 3299,
    discountPercentage: 24,
    rating: 4.9,
    numReviews: 68,
    isFeatured: true,
    inStock: true,
    colors: ['Vintage Charcoal', 'College Navy', 'Washed Rose'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'The definitive campus staple. Custom-milled 450GSM french terry fleece with high-density puff print typography and drop-shoulder silhouette.',
    specs: {
      Material: '100% Heavyweight Organic French Terry Cotton',
      Weight: '450 GSM',
      Fit: 'Relaxed Drop-Shoulder Boxy',
      Details: 'Double-lined thermal hood, ribbed cuffs',
    },
  },
  {
    _id: 'prod-play-2',
    id: 'prod-play-2',
    slug: 'pulse-velocity-running-shorts',
    name: 'Velocity 5" Lined Training Shorts',
    brand: 'DYPULSE PLAY',
    department: 'play',
    category: 'Track Pants & Shorts',
    price: 1299,
    originalPrice: 1799,
    discountPercentage: 28,
    rating: 4.7,
    numReviews: 31,
    isFeatured: true,
    inStock: true,
    colors: ['Onyx Black', 'Cobalt Blue', 'Cadet Grey'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Engineered for relentless sprints and high-intensity campus track meets. Built with an ultra-soft compression liner and secure zipper phone pocket.',
    specs: {
      Inseam: '5 Inches',
      Liner: 'Anti-odor built-in compression liner',
      Pockets: 'Zippered moisture-shield pocket',
    },
  },
  {
    _id: 'prod-campus-2',
    id: 'prod-campus-2',
    slug: 'dypulse-signature-box-tee',
    name: 'DYPULSE Archetype Boxy Graphic Tee',
    brand: 'DYPULSE CAMPUS',
    department: 'campus',
    category: 'Oversized Tees',
    price: 1199,
    originalPrice: 1599,
    discountPercentage: 25,
    rating: 4.6,
    numReviews: 54,
    isFeatured: true,
    inStock: true,
    colors: ['Oatmeal Heather', 'Deep Navy', 'Acid Coral'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Everyday campus confidence. 260GSM combed compact cotton with silk-screen back graphic celebrating collegiate sports heritage.',
    specs: {
      Material: '100% Combed Compact Cotton',
      Weight: '260 GSM',
      Collar: 'Reinforced 1.25" rib-knit collar',
    },
  },
  {
    _id: 'prod-play-3',
    id: 'prod-play-3',
    slug: 'pulse-kinetic-basketball-crewneck',
    name: 'Kinetic Pro Warmup Shooting Shirt',
    brand: 'DYPULSE PLAY',
    department: 'play',
    category: 'Training Jackets',
    price: 2199,
    originalPrice: 2899,
    discountPercentage: 24,
    rating: 4.8,
    numReviews: 19,
    isFeatured: true,
    inStock: true,
    colors: ['Electric Blue', 'Signal White'],
    sizes: ['M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Designed for pre-game shootarounds and outdoor courts. 4-way stretch flex fabric allows unrestricted shooting motion.',
    specs: {
      Stretch: '4-Way Mechanical Flex',
      Ventilation: 'Underarm laser-perforated zones',
    },
  },
  {
    _id: 'prod-campus-3',
    id: 'prod-campus-3',
    slug: 'campus-heritage-varsity-bomber',
    name: 'Heritage Wool Varsity Bomber Jacket',
    brand: 'DYPULSE CAMPUS',
    department: 'campus',
    category: 'Varsity Jackets',
    price: 3899,
    originalPrice: 4999,
    discountPercentage: 22,
    rating: 4.9,
    numReviews: 39,
    isFeatured: true,
    inStock: true,
    colors: ['Midnight Navy & Cream', 'Forest & Bone'],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'The crown jewel of college streetwear. Premium melton wool blend torso, vegan leather sleeves, and custom chenille DYPULSE emblems.',
    specs: {
      Shell: 'Heavy Melton Wool Blend & Vegan Leather',
      Lining: 'Diamond-quilted satin thermal lining',
      Closure: 'Custom antique matte snap buttons',
    },
  },
  {
    _id: 'prod-play-4',
    id: 'prod-play-4',
    slug: 'pulse-apex-all-weather-duffle',
    name: 'Apex 40L Modular Sports Duffle',
    brand: 'DYPULSE PLAY',
    department: 'play',
    category: 'Sports Gear & Bags',
    price: 2199,
    originalPrice: 2799,
    discountPercentage: 21,
    rating: 4.7,
    numReviews: 28,
    isFeatured: true,
    inStock: true,
    colors: ['Matte Black', 'Electric Blue Accent'],
    sizes: ['One Size (40L)'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Water-resistant ripstop gym duffle with ventilated shoe compartment, padded shoulder strap, and waterproof valuables sleeve.',
    specs: {
      Capacity: '40 Litres',
      Material: '900D Ballistic Cordura TPU coated',
      Compartments: 'Separate wet/dry vented boot cave',
    },
  },
  {
    _id: 'prod-campus-4',
    id: 'prod-campus-4',
    slug: 'campus-utility-cargo-trousers',
    name: 'Campus Technical Cargo Pants',
    brand: 'DYPULSE CAMPUS',
    department: 'campus',
    category: 'Cargo & Street Pants',
    price: 2299,
    originalPrice: 2999,
    discountPercentage: 23,
    rating: 4.6,
    numReviews: 45,
    isFeatured: true,
    inStock: true,
    colors: ['Desert Sand', 'Tactical Black', 'Olive Drab'],
    sizes: ['28', '30', '32', '34', '36'],
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
    ],
    description: 'Engineered for campus commutes. 6 ergonomic utility pockets, adjustable ankle bungee toggles, and reinforced ripstop knee panels.',
    specs: {
      Fabric: 'Cotton-Nylon Weather-proof blend',
      Pockets: '6 multi-utility cargo pockets',
      Hem: 'Adjustable cord locks at ankles',
    },
  },
  {
    _id: 'prod-play-cricket-1',
    id: 'prod-play-cricket-1',
    slug: 'ss-ton-english-willow-cricket-bat',
    name: 'SS Ton English Willow Cricket Bat',
    brand: 'SS',
    department: 'play',
    category: 'Cricket',
    sport: 'cricket',
    price: 4999,
    originalPrice: 6999,
    discountPercentage: 29,
    rating: 4.9,
    numReviews: 24,
    isFeatured: true,
    inStock: true,
    colors: ['Natural Wood'],
    sizes: ['Short Handle', 'Long Handle'],
    images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80'],
    description: 'Handcrafted Grade 1 English Willow cricket bat with massive edges, light pickup, and optimal balance for modern power hitting.',
    specs: { 'Willow Type': 'Grade 1 English Willow', Handle: '12-piece cane', Weight: '1190g' }
  },
  {
    _id: 'prod-play-football-1',
    id: 'prod-play-football-1',
    slug: 'nike-strike-premier-team-football',
    name: 'Nike Strike Premier Team Match Football',
    brand: 'Nike',
    department: 'play',
    category: 'Football',
    sport: 'football',
    price: 1799,
    originalPrice: 2299,
    discountPercentage: 22,
    rating: 4.8,
    numReviews: 38,
    isFeatured: true,
    inStock: true,
    colors: ['White / Volt / Blue', 'Hi-Vis Yellow'],
    sizes: ['Size 5 (Standard Match)', 'Size 4 (Youth / Training)'],
    images: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80'],
    description: 'FIFA Basic certified match ball with textured casing and Nike Aerowsculpt grooves for consistent, true flight.',
    specs: { Construction: 'Machine-stitched 12-panel', Bladder: 'Reinforced rubber bladder' }
  },
  {
    _id: 'prod-play-basketball-1',
    id: 'prod-play-basketball-1',
    slug: 'wilson-evolution-indoor-game-basketball',
    name: 'Wilson Evolution Indoor Game Basketball',
    brand: 'Wilson',
    department: 'play',
    category: 'Basketball',
    sport: 'basketball',
    price: 3499,
    originalPrice: 4499,
    discountPercentage: 22,
    rating: 4.9,
    numReviews: 52,
    isFeatured: true,
    inStock: true,
    colors: ['Signature Amber Orange'],
    sizes: ['Size 7 (Official Mens 29.5")'],
    images: ['https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=800&q=80'],
    description: 'The preferred collegiate basketball with Evo microfiber composite feel and laid-in composite channels for supreme grip.',
    specs: { Cover: 'Evo Microfiber Composite', Channels: 'Laid-in composite leather channels' }
  },
  {
    _id: 'prod-play-badminton-1',
    id: 'prod-play-badminton-1',
    slug: 'yonex-astrox-99-pro-badminton-racquet',
    name: 'Yonex Astrox 99 Pro Badminton Racquet',
    brand: 'Yonex',
    department: 'play',
    category: 'Badminton',
    sport: 'badminton',
    price: 6499,
    originalPrice: 8999,
    discountPercentage: 28,
    rating: 4.9,
    numReviews: 29,
    isFeatured: true,
    inStock: true,
    colors: ['Cherry Sunburst', 'White Tiger'],
    sizes: ['4U (Avg. 83g) - G5 Grip'],
    images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=800&q=80'],
    description: 'Head-heavy offensive power racquet built with Namd graphite and Rotational Generator System for steep smashes.',
    specs: { Frame: 'HM Graphite + Namd + Volume Cut Resin', Shaft: 'Extra Slim Shaft' }
  },
  {
    _id: 'prod-play-running-1',
    id: 'prod-play-running-1',
    slug: 'nike-air-zoom-pegasus-40-running-shoes',
    name: 'Nike Air Zoom Pegasus 40 Running Shoes',
    brand: 'Nike',
    department: 'play',
    category: 'Running',
    sport: 'running',
    price: 8499,
    originalPrice: 10995,
    discountPercentage: 23,
    rating: 4.9,
    numReviews: 61,
    isFeatured: true,
    inStock: true,
    colors: ['Black / White', 'Pure Platinum / Hyper Cobalt'],
    sizes: ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'],
    description: 'A responsive workhorse with dual Zoom Air units and React foam for all campus distances and collegiate cross-country runs.',
    specs: { Cushioning: 'Nike React Foam + Dual Zoom Air', Weight: '288g (Men UK 9)' }
  },
  {
    _id: 'prod-campus-sneakers-1',
    id: 'prod-campus-sneakers-1',
    slug: 'dypulse-retro-campus-court-sneakers',
    name: 'DYPULSE Retro Campus Court Sneakers',
    brand: 'DYPULSE CAMPUS',
    department: 'campus',
    category: 'Sneakers',
    price: 2999,
    originalPrice: 3999,
    discountPercentage: 25,
    rating: 4.8,
    numReviews: 43,
    isFeatured: true,
    inStock: true,
    colors: ['Vintage White / Varsity Green', 'Chalk / College Navy'],
    sizes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'],
    images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=800&q=80'],
    description: 'Low-top retro tennis silhouette with leather upper, gum rubber cupsole, and vintage terry cloth collar lining.',
    specs: { Upper: 'Full-grain Action Leather', Sole: 'Textured Gum Rubber Cupsole' }
  },
  {
    _id: 'prod-campus-backpack-1',
    id: 'prod-campus-backpack-1',
    slug: 'dypulse-waterproof-commuter-laptop-backpack-28l',
    name: 'DYPULSE Waterproof Commuter Laptop Backpack (28L)',
    brand: 'DYPULSE CAMPUS',
    department: 'campus',
    category: 'Backpacks & Bags',
    price: 1899,
    originalPrice: 2499,
    discountPercentage: 24,
    rating: 4.7,
    numReviews: 76,
    isFeatured: true,
    inStock: true,
    colors: ['Matte Stealth Black', 'Slate Grey / Electric Blue'],
    sizes: ['28 Litres (Fits up to 16" Laptop)'],
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80'],
    description: 'Engineered for all-weather campus commutes. Dedicated 16" velvet laptop sleeve, water-repellent zippers, and luggage pass-through.',
    specs: { Material: 'Hydro-Shield 900D Matte Oxford Polyester', Capacity: '28L' }
  },
  {
    _id: 'prod-campus-tech-1',
    id: 'prod-campus-tech-1',
    slug: 'dypulse-sonic-blast-wireless-earbuds-anc',
    name: 'DYPULSE Sonic Blast Wireless Earbuds with Hybrid ANC',
    brand: 'DYPULSE CAMPUS',
    department: 'campus',
    category: 'Tech Accessories',
    price: 2499,
    originalPrice: 3499,
    discountPercentage: 29,
    rating: 4.8,
    numReviews: 58,
    isFeatured: true,
    inStock: true,
    colors: ['Midnight Matte Black', 'Frost White'],
    sizes: ['Standard Case + S/M/L Tips'],
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
    description: '35dB active noise cancellation for deep library focus and workout drills, with low-latency Bluetooth 5.3 and 32 hours total playtime.',
    specs: { 'Noise Cancellation': '35dB Hybrid ANC + Quad ENC Mics', Battery: '32h with case' }
  },
  {
    _id: 'prod-campus-stationery-1',
    id: 'prod-campus-stationery-1',
    slug: 'dypulse-campus-hardbound-dot-grid-journal-set',
    name: 'DYPULSE Hardbound Dot-Grid Academic Journal Set (Pack of 2)',
    brand: 'DYPULSE CAMPUS',
    department: 'campus',
    category: 'Stationery',
    price: 499,
    originalPrice: 699,
    discountPercentage: 29,
    rating: 4.9,
    numReviews: 82,
    isFeatured: true,
    inStock: true,
    colors: ['Midnight Navy & Matte Charcoal'],
    sizes: ['A5 (148 x 210 mm) - 192 Pages Each'],
    images: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80'],
    description: '100GSM bleed-resistant acid-free dot-grid paper with elastic closure, pen holder, and dual ribbon bookmarks for semester notes.',
    specs: { Paper: '100 GSM Ivory Acid-Free Dot-Grid', Binding: 'Lay-flat Thread-Sewn Hardcover' }
  }
];

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query string params
      const params = {};
      if (filters.department && filters.department !== 'all') {
        params.department = filters.department.toLowerCase();
      }
      if (filters.category && filters.category !== 'all') {
        params.category = filters.category;
      }
      if (filters.sport && filters.sport !== 'all' && filters.sport !== 'All Sports') {
        params.sport = filters.sport.toLowerCase();
      }
      if (filters.brand && filters.brand !== 'all' && filters.brand !== 'All Brands') {
        params.brand = filters.brand;
      }
      if (filters.size && filters.size !== 'all' && filters.size !== 'All Sizes') {
        params.size = filters.size;
      }
      if (filters.sort) params.sort = filters.sort;
      if (filters.search) params.search = filters.search;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      const data = await get('/products', params);
      const payload = data?.data || data;
      const rawProducts = payload?.products || (Array.isArray(payload) ? payload : null);

      if (rawProducts && Array.isArray(rawProducts)) {
        const normalized = rawProducts.map((p) => {
          const firstImage = (p.images && p.images.length > 0)
            ? (typeof p.images[0] === 'string' ? p.images[0] : p.images[0].url)
            : p.image || '';
          const resolvedPrice = typeof p.price === 'number' && p.price > 0
            ? p.price
            : typeof p.priceInPaise === 'number'
            ? p.priceInPaise / 100
            : 0;
          const resolvedOriginalPrice = typeof p.compareAtPrice === 'number' && p.compareAtPrice > 0
            ? p.compareAtPrice
            : typeof p.compareAtPriceInPaise === 'number'
            ? p.compareAtPriceInPaise / 100
            : p.originalPrice || resolvedPrice;

          return {
            ...p,
            id: p._id || p.id,
            slug: p.slug || p._id || p.id,
            price: resolvedPrice,
            image: firstImage,
            originalPrice: resolvedOriginalPrice,
            rating: p.ratings?.average || p.rating || 4.8,
            numReviews: p.ratings?.count || p.numReviews || 24,
            tag: p.isFeatured ? 'Featured' : p.department,
          };
        });

        setProducts(normalized);
        const pag = payload.pagination || {};
        setPagination({
          page: pag.page || data.page || filters.page || 1,
          limit: pag.limit || data.limit || filters.limit || 12,
          total: pag.total || data.total || normalized.length,
          totalPages: pag.pages || pag.totalPages || Math.ceil((pag.total || normalized.length) / (pag.limit || 12)) || 1,
        });
      } else {
        throw new Error('Invalid products payload received');
      }
    } catch (err) {
      // Fallback to local catalog when backend is not running or endpoint returns error
      console.info('Using local catalog fallback for products view');
      let filtered = [...FALLBACK_PRODUCTS];

      if (filters.department && filters.department !== 'all') {
        filtered = filtered.filter(
          (p) => p.department.toLowerCase() === filters.department.toLowerCase()
        );
      }
      if (filters.sport && filters.sport !== 'all' && filters.sport !== 'All Sports') {
        const sportLower = filters.sport.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.sport?.toLowerCase() === sportLower ||
            p.tags?.some((t) => t.toLowerCase().includes(sportLower)) ||
            (typeof p.category === 'string' && p.category.toLowerCase().includes(sportLower)) ||
            p.name?.toLowerCase().includes(sportLower)
        );
      }
      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter((p) => p.category === filters.category);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.brand.toLowerCase().includes(query) ||
            (typeof p.category === 'string' && p.category.toLowerCase().includes(query))
        );
      }
      if (filters.minPrice) {
        filtered = filtered.filter((p) => p.price >= Number(filters.minPrice));
      }
      if (filters.maxPrice) {
        filtered = filtered.filter((p) => p.price <= Number(filters.maxPrice));
      }

      // Sort logic
      if (filters.sort === 'price_asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (filters.sort === 'price_desc') {
        filtered.sort((a, b) => b.price - a.price);
      } else if (filters.sort === 'rating') {
        filtered.sort((a, b) => b.rating - a.rating);
      }

      setProducts(filtered);
      setPagination({
        page: 1,
        limit: 12,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / 12) || 1,
      });
      // Do not set hard error in UI so experience stays fluid
    } finally {
      setLoading(false);
    }
  }, [
    filters.department,
    filters.category,
    filters.sport,
    filters.brand,
    filters.size,
    filters.sort,
    filters.search,
    filters.minPrice,
    filters.maxPrice,
    filters.page,
    filters.limit,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts,
  };
}

export default useProducts;
