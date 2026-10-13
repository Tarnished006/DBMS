import { z } from 'zod';

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail',
  '20minutemail',
  '33mail',
  '5ymail',
  'anonbox',
  'guerrillamail',
  'mailinator',
  'maildrop',
  'mailnesia',
  'moakt',
  'my10minutemail',
  'throwawaymail',
  'trashmail',
  'temp-mail',
  'tempmail',
  'truemail',
  'yopmail',
]);

export function isDisposableEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domainPart = email.split('@')[1].toLowerCase();
  const domainName = domainPart.split('.')[0];
  return DISPOSABLE_EMAIL_DOMAINS.has(domainName) || DISPOSABLE_EMAIL_DOMAINS.has(domainPart);
}

export const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W).*$/;

export const RegistrationSchema = z
  .object({
    fullName: z
      .string({ required_error: 'Full name is required' })
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must not exceed 100 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address')
      .max(254, 'Email must not exceed 254 characters')
      .refine((val) => !isDisposableEmail(val), {
        message: 'Disposable email addresses are not permitted',
      }),
    password: z
      .string({ required_error: 'Password is required' })
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must not exceed 72 characters')
      .regex(
        passwordRegex,
        'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
      ),
    confirmPassword: z
      .string({ required_error: 'Confirm password is required' })
      .min(8)
      .max(72),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const LoginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const UpdateFullNameSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
});

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must not exceed 72 characters')
      .regex(passwordRegex, 'Password must meet complexity requirements'),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const SetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must not exceed 72 characters')
      .regex(passwordRegex, 'Password must meet complexity requirements'),
    confirmPassword: z.string().min(8).max(72),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const SendOtpSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, 'Phone number must be a valid 10-digit number'),
});

export const VerifyOtpSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, 'Phone number must be a valid 10-digit number'),
  otp: z
    .string()
    .trim()
    .length(6, 'OTP must be 6 digits'),
});

export const AddressCreateSchema = z.object({
  addressLine1: z.string().trim().min(3, 'Address line 1 is required'),
  addressLine2: z.string().trim().optional().nullable(),
  landmark: z.string().trim().optional().nullable(),
  talukId: z.string().trim().min(1, 'Taluk ID is required'),
  pinCode: z.string().trim().regex(/^[0-9]{6}$/, 'PIN code must be 6 digits'),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  isDefault: z.boolean().optional().default(false),
});

export const AddressUpdateSchema = z.object({
  addressLine1: z.string().trim().min(3).optional(),
  addressLine2: z.string().trim().optional().nullable(),
  landmark: z.string().trim().optional().nullable(),
  talukId: z.string().trim().optional(),
  pinCode: z.string().trim().regex(/^[0-9]{6}$/, 'PIN code must be 6 digits').optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  isDefault: z.boolean().optional(),
});

export const ProductCreateSchema = z.object({
  categoryId: z.string().trim().min(1, 'Category is required'),
  name: z.string().trim().min(2, 'Product name is required').max(150),
  description: z.string().trim().optional().nullable(),
  pricePerUnit: z.number().positive('Price must be greater than 0'),
  unit: z.string().trim().min(1, 'Unit is required'),
  quantity: z.number().min(0, 'Quantity cannot be negative').default(0),
  talukId: z.string().trim().min(1, 'Taluk is required for product origin'),
  villageOrTown: z.string().trim().optional().nullable(),
  pinCode: z.string().trim().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

export const ProductUpdateSchema = z.object({
  categoryId: z.string().trim().optional(),
  name: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().optional().nullable(),
  pricePerUnit: z.number().positive().optional(),
  unit: z.string().trim().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

export const OrderCreateSchema = z.object({
  addressId: z.string().trim().optional(),
  shippingAddress: z
    .object({
      addressLine1: z.string().trim().min(3),
      addressLine2: z.string().trim().optional().nullable(),
      landmark: z.string().trim().optional().nullable(),
      talukId: z.string().trim().min(1),
      pinCode: z.string().trim().regex(/^[0-9]{6}$/),
      latitude: z.number().optional().nullable(),
      longitude: z.number().optional().nullable(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().positive('Quantity must be greater than 0'),
      })
    )
    .min(1, 'Order must contain at least one item'),
});
