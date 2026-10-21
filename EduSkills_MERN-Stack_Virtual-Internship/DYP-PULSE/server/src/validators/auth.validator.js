import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name cannot exceed 50 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  phone: z.string().trim().optional()
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
});

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please enter a valid email address')
});

export const resetPasswordSchema = z.object({
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
});

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(2, 'First name must be at least 2 characters').max(50).optional(),
  lastName: z.string().trim().min(1, 'Last name is required').max(50).optional(),
  phone: z.string().trim().optional(),
  avatar: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
  bio: z.string().trim().max(200, 'Bio cannot exceed 200 characters').optional()
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ required_error: 'Current password is required' })
    .min(1, 'Current password is required'),
  newPassword: z
    .string({ required_error: 'New password is required' })
    .min(8, 'New password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'New password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
});

export const addressSchema = z.object({
  label: z.string().trim().max(50).optional().default('Home'),
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').optional(),
  street: z.string({ required_error: 'Street is required' }).trim().min(3, 'Street must be at least 3 characters'),
  apartment: z.string().trim().optional(),
  city: z.string({ required_error: 'City is required' }).trim().min(2, 'City is required'),
  state: z.string({ required_error: 'State is required' }).trim().min(2, 'State is required'),
  pincode: z.string({ required_error: 'Pincode is required' }).trim().min(4, 'Valid pincode required').max(10),
  zipCode: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  isDefault: z.boolean().optional().default(false)
});
