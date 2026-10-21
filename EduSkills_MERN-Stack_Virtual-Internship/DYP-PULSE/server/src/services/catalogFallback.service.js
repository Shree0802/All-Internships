import { seedProducts } from '../seeds/products.js';
import { seedCategories } from '../seeds/categories.js';

// Pre-hydrate in-memory catalog with persistent virtual IDs, stock values, and timestamps
let cachedProducts = seedProducts.map((p, idx) => {
  const hexId = (idx + 1).toString(16).padStart(24, '0');
  const totalStock = (p.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
  return {
    _id: hexId,
    id: hexId,
    ...p,
    stock: totalStock > 0 ? totalStock : 50,
    ratings: {
      average: 4.8,
      count: 24 + (idx % 15)
    },
    reviewsCount: 24 + (idx % 15),
    createdAt: new Date(Date.now() - (idx * 3600000)).toISOString(),
    updatedAt: new Date().toISOString()
  };
});

let cachedCategories = seedCategories.map((c, idx) => {
  const hexId = (idx + 100).toString(16).padStart(24, '0');
  return {
    _id: hexId,
    id: hexId,
    ...c,
    productCount: cachedProducts.filter((p) => p.categorySlug === c.slug).length
  };
});

/**
 * Filter, sort, and paginate products in memory when database is offline
 */
export const getFallbackProducts = ({
  department,
  category,
  subcategory,
  sport,
  brand,
  minPrice,
  maxPrice,
  size,
  color,
  search,
  sort = 'newest',
  page = 1,
  limit = 12,
  featured,
  newArrivals
}) => {
  let list = [...cachedProducts];

  if (department) {
    list = list.filter((p) => p.department && p.department.toUpperCase() === department.toUpperCase());
  }

  if (category) {
    list = list.filter((p) => p.categorySlug && p.categorySlug.toLowerCase() === category.toLowerCase());
  }

  if (subcategory) {
    list = list.filter((p) => p.subcategory && p.subcategory.toLowerCase() === subcategory.toLowerCase());
  }

  if (sport) {
    list = list.filter((p) => p.sport && p.sport.toLowerCase() === sport.toLowerCase());
  }

  if (brand) {
    list = list.filter((p) => p.brand && p.brand.toLowerCase() === brand.toLowerCase());
  }

  if (featured === 'true' || featured === true) {
    list = list.filter((p) => p.isFeatured);
  }

  if (minPrice) {
    const minPaise = parseInt(minPrice, 10) * 100;
    list = list.filter((p) => p.priceInPaise >= minPaise);
  }

  if (maxPrice) {
    const maxPaise = parseInt(maxPrice, 10) * 100;
    list = list.filter((p) => p.priceInPaise <= maxPaise);
  }

  if (size) {
    list = list.filter((p) =>
      (p.variants || []).some((v) => v.size && v.size.toLowerCase() === size.toLowerCase())
    );
  }

  if (color) {
    list = list.filter((p) =>
      (p.variants || []).some((v) => v.color && v.color.toLowerCase() === color.toLowerCase())
    );
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter((p) =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q)) ||
      (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
    );
  }

  // Sorting
  switch (sort) {
    case 'price-asc':
    case 'price_asc':
      list.sort((a, b) => a.priceInPaise - b.priceInPaise);
      break;
    case 'price-desc':
    case 'price_desc':
      list.sort((a, b) => b.priceInPaise - a.priceInPaise);
      break;
    case 'rating':
      list.sort((a, b) => (b.ratings?.average || 0) - (a.ratings?.average || 0));
      break;
    case 'popular':
      list.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
      break;
    case 'newest':
    default:
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }

  const total = list.length;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 12));
  const pages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = list.slice(startIndex, startIndex + limitNum);

  return {
    products: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages,
      hasMore: pageNum < pages
    }
  };
};

/**
 * Find single product by slug or id
 */
export const getFallbackProductBySlug = (identifier) => {
  if (!identifier) return null;
  const clean = identifier.toLowerCase().trim();
  return cachedProducts.find((p) => p.slug === clean || p._id === identifier || p.id === identifier) || null;
};

export const getFallbackProductById = (identifier) => getFallbackProductBySlug(identifier);

/**
 * Return all categories
 */
export const getFallbackCategories = (department) => {
  if (department) {
    return cachedCategories.filter(
      (c) => c.department && c.department.toUpperCase() === department.toUpperCase()
    );
  }
  return cachedCategories;
};
