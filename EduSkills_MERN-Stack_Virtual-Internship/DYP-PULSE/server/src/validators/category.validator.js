import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string({ required_error: 'Category name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  slug: z.string().trim().optional(),
  description: z.string().trim().max(500).optional().default(''),
  department: z.enum(['PLAY', 'CAMPUS'], {
    errorMap: () => ({ message: 'Department must be either PLAY or CAMPUS' })
  }),
  parent: z.string().nullable().optional(),
  image: z.string().trim().optional().default(''),
  isActive: z.boolean().optional().default(true)
});

export const updateCategorySchema = createCategorySchema.partial();
