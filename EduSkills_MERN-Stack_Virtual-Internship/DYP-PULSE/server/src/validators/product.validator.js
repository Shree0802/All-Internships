import { z } from 'zod';

const imageObjectSchema = z.object({
  url: z.string().url('Image must be a valid URL'),
  publicId: z.string().optional().default(''),
  alt: z.string().optional().default('')
});

export const variantInputSchema = z.object({
  sku: z.string({ required_error: 'SKU is required' }).trim().min(2, 'SKU must be at least 2 characters'),
  size: z.string().trim().optional().default(''),
  color: z.string().trim().optional().default(''),
  priceOverride: z.number().min(0, 'Price override must be non-negative').nullable().optional(),
  priceOverrideInPaise: z.number().int().min(0).nullable().optional(),
  stock: z.number({ required_error: 'Variant stock is required' }).int().min(0, 'Stock must be a non-negative integer').default(0),
  image: z.string().trim().optional().default('')
});

const sizeObjectSchema = z.object({
  size: z.string().trim().min(1, 'Size label is required'),
  stock: z.number().int().min(0, 'Stock must be non-negative').default(0)
});

const colorObjectSchema = z.object({
  name: z.string().trim().min(1, 'Color name is required'),
  hex: z.string().trim().optional().default(''),
  stock: z.number().int().min(0, 'Stock must be non-negative').default(0)
});

export const createProductSchema = z.object({
  name: z
    .string({ required_error: 'Product name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(150, 'Name cannot exceed 150 characters'),
  description: z
    .string({ required_error: 'Description is required' })
    .trim()
    .min(5, 'Description must be at least 5 characters'),
  department: z.enum(['PLAY', 'CAMPUS'], {
    errorMap: () => ({ message: 'Department must be either PLAY or CAMPUS' })
  }),
  category: z.string({ required_error: 'Category is required' }).trim().min(1, 'Category is required'),
  subcategory: z.string().trim().optional().default(''),
  brand: z.string({ required_error: 'Brand is required' }).trim().min(1, 'Brand is required'),
  sport: z.string().trim().optional().nullable(),
  price: z.number({ required_error: 'Price is required' }).min(0, 'Price must be non-negative'),
  priceInPaise: z.number().int().min(0, 'Price in paise must be an integer').optional(),
  compareAtPrice: z.number().min(0, 'Compare price must be non-negative').nullable().optional(),
  compareAtPriceInPaise: z.number().int().min(0).nullable().optional(),
  images: z.array(imageObjectSchema).optional().default([]),
  variants: z.array(variantInputSchema).optional().default([]),
  sizes: z.array(sizeObjectSchema).optional().default([]),
  colors: z.array(colorObjectSchema).optional().default([]),
  stock: z.number().int().min(0, 'Stock must be non-negative').optional().default(0),
  lowStockThreshold: z.number().int().min(0).optional().default(5),
  specifications: z.record(z.string()).optional().default({}),
  tags: z.array(z.string().trim()).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true)
});

export const updateProductSchema = createProductSchema.partial();

export const inventoryUpdateSchema = z.object({
  variantId: z.string().trim().optional(),
  sku: z.string().trim().optional(),
  stock: z.number({ required_error: 'Stock count is required' }).int().min(0, 'Stock must be non-negative integer')
});

export const productQuerySchema = z.object({
  department: z.enum(['PLAY', 'CAMPUS', 'play', 'campus']).optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  sport: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  size: z.string().optional(),
  color: z.string().optional(),
  search: z.string().optional(),
  sort: z
    .enum(['price_asc', 'price_desc', 'newest', 'rating', 'popular', 'name_asc', 'name_desc'])
    .optional()
    .default('newest'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  featured: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
  newArrivals: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return undefined;
    }, z.boolean().optional())
    .optional()
});
