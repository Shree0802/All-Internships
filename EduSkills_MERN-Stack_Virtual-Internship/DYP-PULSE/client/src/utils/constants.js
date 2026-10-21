export const DEPARTMENTS = {
  play: {
    id: 'play',
    slug: 'play',
    name: 'DYPULSE PLAY',
    shortName: 'PLAY',
    tagline: 'High-Performance Sports & Athletics',
    description: 'Pro-grade sportswear, college tournament kits, training apparel, and athletic essentials engineered for the court, field, and gym.',
    primaryColor: '#2677FF',
    secondaryColor: '#8157F5',
    accentClass: 'text-[#2677FF]',
    bgClass: 'bg-[#2677FF]',
    borderClass: 'border-[#2677FF]',
    badgeBg: 'bg-blue-50 text-[#2677FF] border border-blue-200',
    categories: [
      'Jerseys & Kits',
      'Performance Tees',
      'Track Pants & Shorts',
      'Training Jackets',
      'Athletic Footwear',
      'Sports Gear & Bags',
    ],
  },
  campus: {
    id: 'campus',
    slug: 'campus',
    name: 'DYPULSE CAMPUS',
    shortName: 'CAMPUS',
    tagline: 'Everyday College Lifestyle & Streetwear',
    description: 'Oversized hoodies, statement graphic tees, varsity jackets, utility bags, and urban campus streetwear crafted for everyday life.',
    primaryColor: '#F044A5',
    secondaryColor: '#FF7849',
    accentClass: 'text-[#F044A5]',
    bgClass: 'bg-[#F044A5]',
    borderClass: 'border-[#F044A5]',
    badgeBg: 'bg-pink-50 text-[#F044A5] border border-pink-200',
    categories: [
      'Oversized Tees',
      'Hoodies & Sweatshirts',
      'Varsity Jackets',
      'Cargo & Street Pants',
      'Campus Backpacks',
      'Caps & Lifestyle Accessories',
    ],
  },
};

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'DYPULSE PLAY', path: '/shop/play' },
  { label: 'DYPULSE CAMPUS', path: '/shop/campus' },
  { label: 'Shop All', path: '/shop' },
];

export const SORT_OPTIONS = [
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Popularity', value: 'popularity' },
];

export const PAGE_SIZE = 12;

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const BRAND_INFO = {
  name: 'DYPULSE',
  tagline: 'Feel the Campus. Live the Game.',
  supportEmail: 'support@dypulse.in',
  phone: '+91 98765 43210',
  address: 'DYPULSE Campus HQ, Sector 7, Innovation Hub, Pune, India',
};
