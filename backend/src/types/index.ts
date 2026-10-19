export type UserRole = 'ROLE_USER' | 'ROLE_ADMIN' | 'USER' | 'ADMIN';

export interface UserEntity {
  id: string;
  email: string;
  password: string | null;
  full_name: string;
  phone_number: string | null;
  profile_picture_url: string | null;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_account_non_locked: boolean;
  failed_login_attempts: number;
  temporary_locked_until: Date | null;
  created_date: Date;
  last_modified_date: Date;
  created_by?: string | null;
  last_modified_by?: string | null;
  password_updated_at?: Date | null;
  roles?: string[];
}

export interface UserProfileDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  profilePictureUrl: string | null;
  addresses?: AddressDto[];
}

export interface AddressDto {
  id: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  talukId: string;
  taluk?: string;
  district?: string;
  state?: string;
  pinCode: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
}

export interface CategoryDto {
  id: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
}

export interface ProductImageDto {
  id: string;
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface ProductLocationDto {
  id: string;
  productId: string;
  talukId: string;
  taluk?: string;
  district?: string;
  state?: string;
  villageOrTown?: string | null;
  pinCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface InventoryDto {
  id: string;
  productId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastRestockedAt?: Date | null;
}

export interface ProductDto {
  id: string;
  categoryId: string;
  category_id?: string;
  categoryName?: string;
  category_name?: string;
  sellerId: string;
  seller_id?: string;
  farmerId?: string;
  farmer_id?: string;
  sellerName?: string;
  farmerName?: string;
  name: string;
  description?: string | null;
  price?: number;
  pricePerUnit: number;
  price_per_unit?: number;
  unit: string;
  quantity?: number;
  availableQuantity?: number;
  totalQuantity?: number;
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  images: (ProductImageDto & { primary?: boolean })[];
  imageUrl?: string;
  inventory?: InventoryDto;
  location?: string | ProductLocationDto | any;
  locationDetails?: ProductLocationDto;
  createdDate: string | Date;
  lastModifiedDate: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  [key: string]: any;
}

export interface OrderItemDto {
  id: string;
  orderId: string;
  productId: string;
  productName?: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderAddressSnapshotDto {
  id: string;
  orderId: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  talukId: string;
  taluk?: string;
  district?: string;
  state?: string;
  pinCode: string;
  latitude?: number | null;
  longitude?: number | null;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderDto {
  id: string;
  buyerId: string;
  buyerName?: string;
  buyerEmail?: string;
  status: OrderStatus;
  createdDate: string | Date;
  lastModifiedDate: string | Date;
  items: OrderItemDto[];
  totalAmount: number;
  deliveryFee: number;
  addressSnapshot?: OrderAddressSnapshotDto;
  payment?: PaymentDto;
  delivery?: DeliveryDto;
}

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type PaymentProvider = 'MOCK' | 'RAZORPAY' | 'STRIPE';

export interface PaymentDto {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: PaymentProvider;
  status: PaymentStatus;
  createdDate: string | Date;
  lastModifiedDate: string | Date;
  transactions?: PaymentTransactionDto[];
}

export interface PaymentTransactionDto {
  id: string;
  paymentId: string;
  externalTransactionId?: string | null;
  transactionType: 'PAYMENT' | 'REFUND';
  amount: number;
  status: PaymentStatus;
  failureReason?: string | null;
  createdDate: string | Date;
}

export type DeliveryStatus = 'PENDING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface DeliveryDto {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  trackingNumber?: string | null;
  carrierName?: string | null;
  otpVerified: boolean;
  estimatedDeliveryDate?: string | null;
  actualDeliveryDate?: string | null;
  createdDate: string | Date;
  lastModifiedDate: string | Date;
}

export interface CropInfoDto {
  id: string;
  cropName: string;
  scientificName?: string;
  family?: string;
  category?: string;
  description?: string | null;
  imageUrl?: string | null;
  optimalTemperatureMin?: number;
  optimalTemperatureMax?: number;
  rainfallMin?: number;
  rainfallMax?: number;
  soilType?: string;
  waterRequirement?: string;
  growthDurationDays?: number;
  lifeCycle?: string;
  harvestSeason?: string;
  sowingSeason?: string;
  commonDiseases: string[];
  uses: string[];
  [key: string]: any;
}

export interface MarketPriceDto {
  id: string;
  commodity: string;
  commodityName: string;
  commodityCode?: string;
  variety?: string;
  grade?: string;
  market: string;
  marketName: string;
  state?: string;
  district?: string;
  minimum_price: number;
  minimumPrice: number;
  minPrice: number;
  maximum_price: number;
  maximumPrice: number;
  maxPrice: number;
  modal_price: number;
  modalPrice: number;
  unit: string;
  currency: string;
  arrival_date: string;
  arrivalDate: string;
  priceDate: string;
  source?: string;
}

export interface MarketPriceResponseDto {
  message: string;
  prices: MarketPriceDto[];
}

export interface HistoricalPricePointDto {
  date: string;
  commodity: string;
  state?: string;
  district?: string;
  market?: string;
  modal_price: number;
  modalPrice: number;
  minimum_price?: number;
  minPrice?: number;
  maximum_price?: number;
  maxPrice?: number;
  unit?: string;
}

export interface MarketPriceTrendDto {
  commodity: string;
  state?: string;
  district?: string;
  market?: string;
  prices: HistoricalPricePointDto[];
  trendAdvisory?: {
    recommendation: 'HOLD' | 'SELL_NOW' | 'STABLE';
    changePercentage: number;
    title: string;
    reasoning: string;
    suggestedAction: string;
  };
}

export type NegotiationStatus = 'PENDING' | 'COUNTERED' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED_TO_ORDER';

export interface NegotiationDto {
  id: string;
  produceId: string;
  produceName?: string;
  producePrice?: number;
  buyerId: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string | null;
  farmerId: string;
  farmerName?: string;
  farmerPhone?: string | null;
  quantity: number;
  unit: string;
  proposedPrice: number;
  counterPrice?: number | null;
  finalPrice?: number | null;
  status: NegotiationStatus;
  buyerNotes?: string | null;
  farmerNotes?: string | null;
  createdDate: string | Date;
  lastModifiedDate: string | Date;
}

export type QualityGrade = 'GRADE_A' | 'GRADE_B' | 'GRADE_C';
export type DemandStatus = 'OPEN' | 'FULFILLED' | 'CLOSED' | 'EXPIRED';

export interface BuyerDemandDto {
  id: string;
  buyerId: string;
  buyerName?: string;
  cropName: string;
  categoryId?: string;
  quantityNeeded: number;
  unit: string;
  targetPricePerUnit: number;
  qualityGrade: QualityGrade;
  requiredByDate: string;
  deliveryTalukId?: string;
  deliveryCity?: string;
  deliveryState?: string;
  description?: string | null;
  status: DemandStatus;
  bidsCount?: number;
  createdDate: string | Date;
}

export interface DemandBidDto {
  id: string;
  demandId: string;
  farmerId: string;
  farmerName?: string;
  offeredQuantity: number;
  offeredPricePerUnit: number;
  notes?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdDate: string | Date;
}

export interface ProducePoolDto {
  id: string;
  cropName: string;
  talukId?: string;
  talukName?: string;
  districtName?: string;
  totalQuantity: number;
  unit: string;
  avgPricePerUnit: number;
  participatingFarmersCount: number;
  targetCapacity?: number;
  vehicleType?: string;
  pickupHub?: string;
  departureTime?: string;
  destinationMandi?: string;
  products: ProductDto[];
  estimatedFreightSavingsPercentage: number;
}

export interface NotificationDto {
  id: string;
  userId: string;
  type: 'NEGOTIATION' | 'ORDER' | 'LOGISTICS' | 'PRICE_ALERT' | 'SYSTEM';
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  metadata?: any;
  createdDate: string | Date;
}


