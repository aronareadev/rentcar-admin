// Base types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vehicle types
export interface Vehicle extends BaseEntity {
  vehicleNumber: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  fuelType: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
  passengers: number;
  transmission: 'manual' | 'automatic';
  displacement?: number;
  mileage: number;
  status: 'available' | 'rented' | 'maintenance' | 'inactive';
  location: string;
  lastInspectionDate?: Date;
  totalRentals: number;
  totalRevenue: number;
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  images: VehicleImage[];
  features: VehicleFeature[];
  insurance: VehicleInsurance;
  category: string;
}

export interface VehicleImage {
  id: string;
  url: string;
  type: 'main' | 'detail' | 'interior';
  alt?: string;
  order: number;
}

export interface VehicleFeature {
  id: string;
  name: string;
  included: boolean;
}

export interface VehicleInsurance {
  provider: string;
  policyNumber: string;
  startDate: Date;
  endDate: Date;
  contactPerson: string;
  contactPhone: string;
}

// Customer types
export interface Customer extends BaseEntity {
  name: string;
  phone: string;
  email?: string;
  licenseNumber: string;
  licenseExpiryDate: Date;
  address?: string;
  dateOfBirth?: Date;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalRentals: number;
  totalSpent: number;
  lastRentalDate?: Date;
  isBlacklisted: boolean;
  blacklistReason?: string;
  notes?: string;
}

// Reservation types
export interface Reservation extends BaseEntity {
  reservationNumber: string;
  customerId: string;
  customer: Customer;
  vehicleId: string;
  vehicle: Vehicle;
  startDate: Date;
  endDate: Date;
  pickupLocation: string;
  returnLocation: string;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  paymentMethod?: 'card' | 'bank_transfer' | 'cash';
  additionalServices: AdditionalService[];
  notes?: string;
  adminNotes?: string;
  cancelReason?: string;
  cancelledBy?: string;
  cancelledAt?: Date;
}

export interface AdditionalService {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

// Consultation types
export interface Consultation extends BaseEntity {
  consultationNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  type: 'general' | 'booking' | 'insurance' | 'accident' | 'complaint' | 'other';
  subject: string;
  content: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'on_hold';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTo?: string;
  responses: ConsultationResponse[];
  resolvedAt?: Date;
  tags?: string[];
}

export interface ConsultationResponse extends BaseEntity {
  consultationId: string;
  content: string;
  respondedBy: string;
  isInternal: boolean;
  attachments?: string[];
}

// Admin user types
export interface AdminUser extends BaseEntity {
  username: string;
  email: string;
  name: string;
  role: 'super_admin' | 'manager' | 'staff';
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  passwordChangedAt: Date;
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

// Dashboard types
export interface DashboardStats {
  todayStats: {
    newReservations: number;
    activeRentals: number;
    returnsToday: number;
    pendingConsultations: number;
  };
  vehicleStats: {
    available: number;
    rented: number;
    maintenance: number;
    inactive: number;
  };
  revenueStats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    growth: number;
  };
  recentReservations: Reservation[];
  pendingConsultations: Consultation[];
}

// Search and filter types
export interface SearchFilters {
  query?: string;
  status?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  category?: string;
  assignedTo?: string;
  priority?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

// Form types
export interface FormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'date' | 'number' | 'checkbox' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | undefined;
  };
}

// System settings types
export interface SystemSettings {
  siteName: string;
  logo?: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    businessHours: string;
  };
  pricing: {
    baseDailyRate: number;
    peakSeasonMultiplier: number;
    weeklyDiscount: number;
    monthlyDiscount: number;
  };
  notifications: {
    sms: {
      enabled: boolean;
      provider: string;
      apiKey: string;
    };
    email: {
      enabled: boolean;
      smtp: {
        host: string;
        port: number;
        username: string;
        password: string;
      };
    };
  };
  features: {
    autoAssignConsultations: boolean;
    requireDepositForReservations: boolean;
    allowOnlinePayment: boolean;
  };
}
