/**
 * Format a number as Indian Rupee currency (₹)
 * @param {number|string} amount
 * @returns {string}
 */
export function formatPrice(amount) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0';
  }
  const numeric = Math.round(Number(amount));
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numeric);
}

/**
 * Format date string into human-readable format
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} options
 * @returns {string}
 */
export function formatDate(date, options = {}) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };
  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(d);
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncateText(text, maxLength = 60) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

/**
 * Generate user initials from full name or first/last name
 * @param {string} name
 * @returns {string}
 */
export function generateInitials(name = '') {
  if (!name || typeof name !== 'string') return 'DY';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Calculate percentage discount
 * @param {number} originalPrice
 * @param {number} salePrice
 * @returns {number}
 */
export function calculateDiscount(originalPrice, salePrice) {
  const orig = Number(originalPrice);
  const sale = Number(salePrice);
  if (!orig || !sale || orig <= sale) return 0;
  return Math.round(((orig - sale) / orig) * 100);
}
