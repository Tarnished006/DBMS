export interface ErrorDetail {
  code: string;
  defaultMessage: string;
  status: number;
}

export const ERROR_CODES = {
  // USER
  USER_NOT_FOUND: {
    code: 'USER_NOT_FOUND',
    defaultMessage: 'User not found.',
    status: 404,
  },
  EMAIL_ALREADY_EXISTS: {
    code: 'EMAIL_ALREADY_EXISTS',
    defaultMessage: 'The provided email address cannot be used.',
    status: 409,
  },
  PHONE_ALREADY_EXISTS: {
    code: 'PHONE_ALREADY_EXISTS',
    defaultMessage: 'The provided phone number cannot be used.',
    status: 409,
  },
  USER_NOT_REGISTERED: {
    code: 'USER_NOT_REGISTERED',
    defaultMessage: 'The user is not registered. Please register.',
    status: 404,
  },

  // ADMIN
  ADMIN_USER_NOT_FOUND: {
    code: 'ADMIN_USER_NOT_FOUND',
    defaultMessage: 'Admin user not found.',
    status: 404,
  },
  ADMIN_USER_ALREADY_ACTIVE: {
    code: 'ADMIN_USER_ALREADY_ACTIVE',
    defaultMessage: 'Admin user is already active.',
    status: 409,
  },
  ADMIN_USER_ALREADY_INACTIVE: {
    code: 'ADMIN_USER_ALREADY_INACTIVE',
    defaultMessage: 'Admin user is already inactive.',
    status: 409,
  },
  ADMIN_USER_ALREADY_LOCKED: {
    code: 'ADMIN_USER_ALREADY_LOCKED',
    defaultMessage: 'Admin user is already locked.',
    status: 409,
  },
  ADMIN_USER_ALREADY_UNLOCKED: {
    code: 'ADMIN_USER_ALREADY_UNLOCKED',
    defaultMessage: 'Admin user is already unlocked.',
    status: 409,
  },

  // PASSWORD
  INVALID_CURRENT_PASSWORD: {
    code: 'INVALID_CURRENT_PASSWORD',
    defaultMessage: 'The current password is incorrect.',
    status: 400,
  },
  PASSWORD_MISMATCH: {
    code: 'ERR_PASSWORD_MISMATCH',
    defaultMessage: 'The passwords do not match.',
    status: 400,
  },
  PASSWORD_EXPIRED: {
    code: 'PASSWORD_EXPIRED',
    defaultMessage: 'Your password has expired. Please change your password.',
    status: 401,
  },
  ACCOUNT_LOCKED: {
    code: 'ACCOUNT_LOCKED',
    defaultMessage: 'Your account is temporarily locked due to too many failed login attempts.',
    status: 401,
  },
  TOO_MANY_FAILED_ATTEMPTS: {
    code: 'TOO_MANY_FAILED_ATTEMPTS',
    defaultMessage: 'Too many failed login attempts. Please try again later.',
    status: 401,
  },

  // PASSWORD RESET
  PASSWORD_RESET_TOKEN_EXPIRED: {
    code: 'PASSWORD_RESET_TOKEN_EXPIRED',
    defaultMessage: 'The password reset request has expired.',
    status: 400,
  },
  PASSWORD_RESET_TOKEN_ALREADY_USED: {
    code: 'PASSWORD_RESET_TOKEN_ALREADY_USED',
    defaultMessage: 'The password reset request has already been used.',
    status: 400,
  },
  INVALID_PASSWORD_RESET_TOKEN: {
    code: 'INVALID_PASSWORD_RESET_TOKEN',
    defaultMessage: 'The password reset request is invalid.',
    status: 400,
  },
  PASSWORD_LOGIN_NOT_AVAILABLE: {
    code: 'PASSWORD_LOGIN_NOT_AVAILABLE',
    defaultMessage: 'Password login is not available for this account. Use OAuth login or set a password first.',
    status: 401,
  },
  PASSWORD_ALREADY_SET: {
    code: 'PASSWORD_ALREADY_SET',
    defaultMessage: 'Password is already set for this account. Use change password instead.',
    status: 409,
  },

  // ROLE
  ROLE_NOT_FOUND: {
    code: 'ROLE_NOT_FOUND',
    defaultMessage: 'The requested role was not found.',
    status: 404,
  },

  // AUTHENTICATION
  ERR_USER_DISABLED: {
    code: 'ERR_USER_DISABLED',
    defaultMessage: 'Your account is no longer available. Please contact support.',
    status: 401,
  },
  PERMANENT_ACCOUNT_LOCKED: {
    code: 'PERMANENT_ACCOUNT_LOCKED',
    defaultMessage: 'Your account is permanently locked. Please contact support.',
    status: 401,
  },
  BAD_CREDENTIALS: {
    code: 'BAD_CREDENTIALS',
    defaultMessage: 'Invalid email or password.',
    status: 401,
  },
  INVALID_REFRESH_TOKEN: {
    code: 'INVALID_REFRESH_TOKEN',
    defaultMessage: 'The refresh token is invalid or has expired.',
    status: 401,
  },
  REFRESH_TOKEN_REUSE_DETECTED: {
    code: 'REFRESH_TOKEN_REUSE_DETECTED',
    defaultMessage: 'Refresh token reuse detected',
    status: 401,
  },

  // EMAIL VERIFICATION
  INVALID_VERIFICATION_TOKEN: {
    code: 'INVALID_VERIFICATION_TOKEN',
    defaultMessage: 'The email verification request is invalid.',
    status: 400,
  },
  VERIFICATION_TOKEN_ALREADY_USED: {
    code: 'VERIFICATION_TOKEN_ALREADY_USED',
    defaultMessage: 'The email verification request has already been completed.',
    status: 400,
  },
  VERIFICATION_TOKEN_EXPIRED: {
    code: 'VERIFICATION_TOKEN_EXPIRED',
    defaultMessage: 'The email verification request has expired.',
    status: 400,
  },

  // AUTHORIZATION
  ACCESS_DENIED: {
    code: 'ACCESS_DENIED',
    defaultMessage: 'You do not have permission to perform this operation.',
    status: 403,
  },

  // VALIDATION
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    defaultMessage: 'The request contains invalid data.',
    status: 400,
  },
  MALFORMED_REQUEST: {
    code: 'MALFORMED_REQUEST',
    defaultMessage: 'The request could not be processed.',
    status: 400,
  },

  // DATABASE
  DATA_INTEGRITY_VIOLATION: {
    code: 'DATA_INTEGRITY_VIOLATION',
    defaultMessage: 'The requested operation could not be completed.',
    status: 409,
  },

  // GENERIC
  ERR_INTERNAL_SERVER_ERROR: {
    code: 'ERR_INTERNAL_SERVER_ERROR',
    defaultMessage: 'An unexpected error occurred.',
    status: 500,
  },

  // OAuth
  INVALID_OAUTH_LOGIN_CODE: {
    code: 'INVALID_OAUTH_LOGIN_CODE',
    defaultMessage: 'Invalid OAuth login code',
    status: 400,
  },
  OAUTH_LOGIN_CODE_ALREADY_USED: {
    code: 'OAUTH_LOGIN_CODE_ALREADY_USED',
    defaultMessage: 'OAuth login code has already been used',
    status: 400,
  },
  OAUTH_LOGIN_CODE_EXPIRED: {
    code: 'OAUTH_LOGIN_CODE_EXPIRED',
    defaultMessage: 'OAuth login code has expired',
    status: 400,
  },
  OAUTH_EMAIL_NOT_AVAILABLE: {
    code: 'OAUTH_EMAIL_NOT_AVAILABLE',
    defaultMessage: 'OAuth email is not available',
    status: 400,
  },

  // ADDRESS
  ADDRESS_NOT_FOUND: {
    code: 'ADDRESS_NOT_FOUND',
    defaultMessage: 'Address not found.',
    status: 404,
  },
  ADDRESS_COORDINATES_REQUIRED: {
    code: 'ADDRESS_COORDINATES_REQUIRED',
    defaultMessage: 'Latitude and longitude are required for a map-based address.',
    status: 400,
  },
  ADDRESS_COORDINATES_NOT_ALLOWED: {
    code: 'ADDRESS_COORDINATES_NOT_ALLOWED',
    defaultMessage: 'Latitude and longitude are not allowed for a manually entered address.',
    status: 400,
  },

  // PHONE / OTP
  PHONE_VERIFICATION_REQUIRED: {
    code: 'PHONE_VERIFICATION_REQUIRED',
    defaultMessage: 'Phone number verification is required to perform this operation.',
    status: 401,
  },
  PHONE_NOT_VERIFIED: {
    code: 'PHONE_NOT_VERIFIED',
    defaultMessage: 'The phone number has not been verified.',
    status: 400,
  },
  PHONE_NUMBER_REQUIRED: {
    code: 'PHONE_NUMBER_REQUIRED',
    defaultMessage: 'A phone number is required for this operation.',
    status: 400,
  },
  INVALID_PHONE_NUMBER: {
    code: 'INVALID_PHONE_NUMBER',
    defaultMessage: 'The provided phone number is invalid.',
    status: 400,
  },
  INVALID_PHONE_OTP: {
    code: 'INVALID_PHONE_OTP',
    defaultMessage: 'The provided OTP is invalid.',
    status: 400,
  },
  PHONE_OTP_EXPIRED: {
    code: 'PHONE_OTP_EXPIRED',
    defaultMessage: 'The phone verification OTP has expired. Please request a new OTP.',
    status: 400,
  },
  PHONE_OTP_ALREADY_VERIFIED: {
    code: 'PHONE_OTP_ALREADY_VERIFIED',
    defaultMessage: 'The phone number is already verified.',
    status: 409,
  },
  PHONE_OTP_NOT_REQUESTED: {
    code: 'PHONE_OTP_NOT_REQUESTED',
    defaultMessage: 'No OTP verification request was found for this phone number.',
    status: 400,
  },
  PHONE_OTP_RESEND_NOT_ALLOWED: {
    code: 'PHONE_OTP_RESEND_NOT_ALLOWED',
    defaultMessage: 'A new OTP cannot be requested yet. Please wait before trying again.',
    status: 429,
  },
  SMS_PROVIDER_ERROR: {
    code: 'SMS_PROVIDER_ERROR',
    defaultMessage: 'The SMS service is temporarily unavailable. Please try again later.',
    status: 503,
  },

  // LOCATION
  STATE_NOT_FOUND: {
    code: 'STATE_NOT_FOUND',
    defaultMessage: 'State not found.',
    status: 404,
  },
  DISTRICT_NOT_FOUND: {
    code: 'DISTRICT_NOT_FOUND',
    defaultMessage: 'District not found.',
    status: 404,
  },
  TALUK_NOT_FOUND: {
    code: 'TALUK_NOT_FOUND',
    defaultMessage: 'Taluk not found.',
    status: 404,
  },
  INVALID_COORDINATES: {
    code: 'INVALID_COORDINATES',
    defaultMessage: 'Invalid coordinates provided.',
    status: 400,
  },
  GEOCODING_FAILED: {
    code: 'GEOCODING_FAILED',
    defaultMessage: 'Geocoding request failed.',
    status: 400,
  },
  LOCATION_RESOLUTION_FAILED: {
    code: 'LOCATION_RESOLUTION_FAILED',
    defaultMessage: 'Failed to resolve location from the provided coordinates.',
    status: 400,
  },

  // CATEGORY
  CATEGORY_NOT_FOUND: {
    code: 'CATEGORY_NOT_FOUND',
    defaultMessage: 'Category not found.',
    status: 404,
  },

  // PRODUCT
  PRODUCT_NOT_FOUND: {
    code: 'PRODUCT_NOT_FOUND',
    defaultMessage: 'Product not found.',
    status: 404,
  },
  INVALID_PRODUCT_STATUS: {
    code: 'INVALID_PRODUCT_STATUS',
    defaultMessage: 'Invalid product status provided.',
    status: 400,
  },
  PRODUCT_ACCESS_DENIED: {
    code: 'PRODUCT_ACCESS_DENIED',
    defaultMessage: 'You do not have permission to access this product.',
    status: 403,
  },

  // PRODUCT IMAGE
  INVALID_PRODUCT_IMAGE: {
    code: 'INVALID_PRODUCT_IMAGE',
    defaultMessage: 'Invalid product image provided.',
    status: 400,
  },
  PRODUCT_IMAGE_UPLOAD_FAILED: {
    code: 'PRODUCT_IMAGE_UPLOAD_FAILED',
    defaultMessage: 'Failed to upload product image.',
    status: 500,
  },
  PRODUCT_IMAGE_DELETE_FAILED: {
    code: 'PRODUCT_IMAGE_DELETE_FAILED',
    defaultMessage: 'Failed to delete product image.',
    status: 500,
  },
  PRODUCT_IMAGE_NOT_FOUND: {
    code: 'PRODUCT_IMAGE_NOT_FOUND',
    defaultMessage: 'Product image not found.',
    status: 404,
  },
  INVALID_PRODUCT_IMAGE_ORDER: {
    code: 'INVALID_PRODUCT_IMAGE_ORDER',
    defaultMessage: 'Invalid product image order provided.',
    status: 400,
  },
  PRODUCT_IMAGE_SIZE_EXCEEDED: {
    code: 'PRODUCT_IMAGE_SIZE_EXCEEDED',
    defaultMessage: 'Product image size exceeds the maximum allowed limit.',
    status: 400,
  },
  PROFILE_PICTURE_UPLOAD_FAILED: {
    code: 'PROFILE_PICTURE_UPLOAD_FAILED',
    defaultMessage: 'Failed to upload profile picture.',
    status: 500,
  },
  INVALID_PROFILE_PICTURE: {
    code: 'INVALID_PROFILE_PICTURE',
    defaultMessage: 'Invalid profile picture provided.',
    status: 400,
  },

  // INVENTORY
  INVENTORY_NOT_FOUND: {
    code: 'INVENTORY_NOT_FOUND',
    defaultMessage: 'Inventory not found for the specified product.',
    status: 404,
  },
  INSUFFICIENT_STOCK: {
    code: 'INSUFFICIENT_STOCK',
    defaultMessage: 'Insufficient stock available for the requested operation.',
    status: 400,
  },
  INVENTORY_QUANTITY_LESS_THAN_RESERVED: {
    code: 'INVENTORY_QUANTITY_LESS_THAN_RESERVED',
    defaultMessage: 'The new inventory quantity cannot be less than the reserved quantity.',
    status: 400,
  },
  INVENTORY_INSUFFICIENT_STOCK: {
    code: 'INVENTORY_INSUFFICIENT_STOCK',
    defaultMessage: 'Insufficient stock available for the requested operation.',
    status: 400,
  },

  // WEATHER
  WEATHER_PROVIDER_UNAVAILABLE: {
    code: 'WEATHER_PROVIDER_UNAVAILABLE',
    defaultMessage: 'Weather service is temporarily unavailable. Please try again later.',
    status: 503,
  },
  WEATHER_DATA_UNAVAILABLE: {
    code: 'WEATHER_DATA_UNAVAILABLE',
    defaultMessage: 'Weather data is currently unavailable for the requested location.',
    status: 400,
  },
  WEATHER_INVALID_COORDINATES: {
    code: 'WEATHER_INVALID_COORDINATES',
    defaultMessage: 'The provided coordinates are invalid.',
    status: 400,
  },
  WEATHER_RESPONSE_INVALID: {
    code: 'WEATHER_RESPONSE_INVALID',
    defaultMessage: 'The weather service returned an invalid response.',
    status: 502,
  },

  // MARKET PRICE
  MARKET_PRICE_DATE_RANGE_REQUIRED: {
    code: 'MARKET_PRICE_DATE_RANGE_REQUIRED',
    defaultMessage: 'Both start date and end date are required for date range queries.',
    status: 400,
  },
  MARKET_PRICE_COMMODITY_REQUIRED: {
    code: 'MARKET_PRICE_COMMODITY_REQUIRED',
    defaultMessage: 'Commodity is required for market price queries.',
    status: 400,
  },
  MARKET_PRICE_INVALID_DATE_RANGE: {
    code: 'MARKET_PRICE_INVALID_DATE_RANGE',
    defaultMessage: 'The provided date range is invalid. Start date must be before or equal to end date.',
    status: 400,
  },
  MARKET_PRICE_DATE_RANGE_TOO_LARGE: {
    code: 'MARKET_PRICE_DATE_RANGE_TOO_LARGE',
    defaultMessage: 'The provided date range is too large. Please limit the range to a maximum of 30 days.',
    status: 400,
  },

  // CROP INFO
  EXTERNAL_SERVICE_ERROR: {
    code: 'EXTERNAL_SERVICE_ERROR',
    defaultMessage: 'Failed to fetch crop information from external service.',
    status: 503,
  },
  RESOURCE_NOT_FOUND: {
    code: 'RESOURCE_NOT_FOUND',
    defaultMessage: 'The requested resource was not found.',
    status: 404,
  },
  INVALID_REQUEST: {
    code: 'INVALID_REQUEST',
    defaultMessage: 'The request is invalid or malformed.',
    status: 400,
  },

  // CHECKOUT
  PRODUCT_NOT_AVAILABLE: {
    code: 'PRODUCT_NOT_AVAILABLE',
    defaultMessage: 'The requested product is not available for checkout.',
    status: 400,
  },

  // ORDER
  ORDER_NOT_FOUND: {
    code: 'ORDER_NOT_FOUND',
    defaultMessage: 'The requested order was not found.',
    status: 404,
  },
  ORDER_INVALID_STATUS_TRANSITION: {
    code: 'ORDER_INVALID_STATUS_TRANSITION',
    defaultMessage: 'The requested order status transition is invalid.',
    status: 400,
  },
  ORDER_ACCESS_DENIED: {
    code: 'ORDER_ACCESS_DENIED',
    defaultMessage: 'You do not have permission to modify this order.',
    status: 403,
  },

  // PAYMENT
  PAYMENT_NOT_FOUND: {
    code: 'PAYMENT_NOT_FOUND',
    defaultMessage: 'The requested payment was not found.',
    status: 404,
  },
  PAYMENT_REFUND_FAILED: {
    code: 'PAYMENT_REFUND_FAILED',
    defaultMessage: 'The payment refund process failed.',
    status: 500,
  },
  PAYMENT_ALREADY_EXISTS: {
    code: 'PAYMENT_ALREADY_EXISTS',
    defaultMessage: 'A payment already exists for this order.',
    status: 409,
  },
  PAYMENT_FAILED: {
    code: 'PAYMENT_FAILED',
    defaultMessage: 'The payment process failed.',
    status: 500,
  },
  PAYMENT_REFUND_NOT_ALLOWED: {
    code: 'PAYMENT_REFUND_NOT_ALLOWED',
    defaultMessage: 'Refunds are not allowed for this payment.',
    status: 400,
  },

  // DELIVERY
  DELIVERY_NOT_AVAILABLE: {
    code: 'DELIVERY_NOT_AVAILABLE',
    defaultMessage: 'Delivery is not available for this order.',
    status: 400,
  },
  DELIVERY_OTP_ALREADY_VERIFIED: {
    code: 'DELIVERY_OTP_ALREADY_VERIFIED',
    defaultMessage: 'The delivery OTP has already been verified.',
    status: 400,
  },
  DELIVERY_OTP_NOT_FOUND: {
    code: 'DELIVERY_OTP_NOT_FOUND',
    defaultMessage: 'No delivery OTP was found for this order.',
    status: 400,
  },
  DELIVERY_OTP_EXPIRED: {
    code: 'DELIVERY_OTP_EXPIRED',
    defaultMessage: 'The delivery OTP has expired. Please request a new OTP.',
    status: 400,
  },
  DELIVERY_OTP_INVALID: {
    code: 'DELIVERY_OTP_INVALID',
    defaultMessage: 'The provided delivery OTP is invalid.',
    status: 400,
  },
  DELIVERY_NOT_FOUND: {
    code: 'DELIVERY_NOT_FOUND',
    defaultMessage: 'The requested delivery was not found.',
    status: 404,
  },
  DELIVERY_ALREADY_EXISTS: {
    code: 'DELIVERY_ALREADY_EXISTS',
    defaultMessage: 'A delivery already exists for this order.',
    status: 409,
  },
} as const;

export type ErrorCodeKey = keyof typeof ERROR_CODES;
