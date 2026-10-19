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
    .transform((val) => val.replace(/[^0-9]/g, '').slice(-10))
    .refine((val) => /^[0-9]{10}$/.test(val), {
      message: 'Phone number must be a valid 10-digit number',
    }),
});

export const VerifyOtpSchema = z.object({
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val ? val.replace(/[^0-9]/g, '').slice(-10) : undefined)),
  otp: z
    .string()
    .trim()
    .min(4, 'OTP must be at least 4 digits')
    .max(8, 'OTP must be at most 8 digits'),
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

export const ProductCreateSchema = z
  .object({
    categoryId: z.string().trim().optional(),
    category_id: z.string().trim().optional(),
    name: z
      .string({ required_error: 'Product name is required' })
      .trim()
      .min(2, 'Product name must be at least 2 characters')
      .max(150, 'Product name cannot exceed 150 characters'),
    description: z.string().trim().optional().nullable(),
    price: z.coerce.number().positive('Price must be greater than 0').optional(),
    pricePerUnit: z.coerce.number().positive('Price must be greater than 0').optional(),
    price_per_unit: z.coerce.number().positive('Price must be greater than 0').optional(),
    unit: z.string({ required_error: 'Unit is required' }).trim().min(1, 'Unit is required'),
    quantity: z.coerce.number().min(0, 'Quantity cannot be negative').default(0),
    talukId: z.string().trim().optional().nullable(),
    taluk_id: z.string().trim().optional().nullable(),
    savedAddressId: z.string().trim().optional().nullable(),
    saved_address_id: z.string().trim().optional().nullable(),
    newLocation: z.any().optional().nullable(),
    new_location: z.any().optional().nullable(),
    villageOrTown: z.string().trim().optional().nullable(),
    village: z.string().trim().optional().nullable(),
    addressLine1: z.string().trim().optional().nullable(),
    address_line1: z.string().trim().optional().nullable(),
    addressLine2: z.string().trim().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    district: z.string().trim().optional().nullable(),
    state: z.string().trim().optional().nullable(),
    pinCode: z.string().trim().optional().nullable(),
    pincode: z.string().trim().optional().nullable(),
    latitude: z.coerce.number().optional().nullable(),
    longitude: z.coerce.number().optional().nullable(),
    locationType: z.string().trim().optional().nullable(),
    addressType: z.string().trim().optional().nullable(),
    harvestStatus: z.string().trim().optional().nullable(),
    harvest_status: z.string().trim().optional().nullable(),
    expectedHarvestDate: z.string().trim().optional().nullable(),
    expected_harvest_date: z.string().trim().optional().nullable(),
  })
  .refine((data) => Boolean(data.categoryId || data.category_id), {
    message: 'Category is required',
    path: ['categoryId'],
  })
  .refine(
    (data) =>
      (data.price !== undefined && data.price > 0) ||
      (data.pricePerUnit !== undefined && data.pricePerUnit > 0) ||
      (data.price_per_unit !== undefined && data.price_per_unit > 0),
    {
      message: 'Price must be greater than 0',
      path: ['price'],
    }
  );

export const ProductUpdateSchema = z.object({
  categoryId: z.string().trim().optional(),
  category_id: z.string().trim().optional(),
  name: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().optional().nullable(),
  pricePerUnit: z.coerce.number().positive().optional(),
  price: z.coerce.number().positive().optional(),
  price_per_unit: z.coerce.number().positive().optional(),
  unit: z.string().trim().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
  harvestStatus: z.string().trim().optional().nullable(),
  harvest_status: z.string().trim().optional().nullable(),
  expectedHarvestDate: z.string().trim().optional().nullable(),
  expected_harvest_date: z.string().trim().optional().nullable(),
});

export const OrderCreateSchema = z
  .object({
    addressId: z.string().trim().optional(),
    address_id: z.string().trim().optional(),
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
          productId: z.string().trim().optional(),
          product_id: z.string().trim().optional(),
          quantity: z.number().positive('Quantity must be greater than 0'),
          negotiationId: z.string().trim().optional(),
          negotiation_id: z.string().trim().optional(),
        })
      )
      .optional(),
    productId: z.string().trim().optional(),
    product_id: z.string().trim().optional(),
    quantity: z.number().positive().optional(),
    negotiationId: z.string().trim().optional(),
    negotiation_id: z.string().trim().optional(),
  })
  .refine(
    (data) => (data.items && data.items.length > 0) || Boolean(data.productId || data.product_id),
    {
      message: 'Order must contain at least one item',
      path: ['items'],
    }
  );
