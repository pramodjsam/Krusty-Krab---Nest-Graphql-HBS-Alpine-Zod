import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email address'),
    phone: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z
        .string()
        .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
        .optional(),
    ),
    address: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.string().min(5, 'Address is required').optional(),
    ),
    city: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.string().min(2, 'City is required').optional(),
    ),
    province: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z.string().min(1, 'Province is required').optional(),
    ),
    zipCode: z.preprocess(
      (value) => (value === '' ? undefined : value),
      z
        .string()
        .regex(
          /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
          'Invalid Canadian postal code',
        )
        .optional(),
    ),
    password: z.string().min(4, ' Password must be at least 4 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(4, ' Password must be at least 4 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  phone: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z
      .string()
      .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
      .optional(),
  ),
  address: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.string().min(5, 'Address is required').optional(),
  ),
  city: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.string().min(2, 'City is required').optional(),
  ),
  province: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z.string().min(1, 'Province is required').optional(),
  ),
  zipCode: z.preprocess(
    (value) => (value === '' || value === null ? undefined : value),
    z
      .string()
      .regex(
        /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
        'Invalid Canadian postal code',
      )
      .optional(),
  ),
});
