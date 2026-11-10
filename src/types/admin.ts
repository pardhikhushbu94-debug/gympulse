export type RevenuePeriod = 'today' | 'week' | 'month' | 'quarter' | 'year';

export interface FinancialMetric {
  period: RevenuePeriod;
  periodLabel: string;
  totalRevenueINR: number;
  membershipsINR: number;
  ptCommissionsINR: number;
  dayPassesINR: number;
  pendingDuesINR: number;
  transactionCount: number;
  growthPct: number;
}

export interface CouponItem {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number; // e.g. 10 for 10% or 500 for ₹500
  minOrderINR: number;
  maxUsage: number;
  timesUsed: number;
  validUntil: string;
  isActive: boolean;
}

export interface GymSettingsConfig {
  gymLegalName: string;
  brandName: string;
  gstin: string;
  sacCode: string; // 999723
  upiVpa: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  qrRotationSeconds: number;
  morningTimings: string;
  eveningTimings: string;
  maxFreezeDaysAllowed: number;
  appUserDiscountPct: number;
}

export interface AdminAuditEntry {
  id: string;
  action: string;
  details: string;
  adminName: string;
  timestamp: string;
  category: 'financial' | 'membership' | 'security' | 'promotion' | 'settings';
}

export interface AdminMemberRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  planName: string;
  planDuration: string;
  startDate: string;
  expiryDate: string;
  daysLeft: number;
  amountPaidINR: number;
  paymentMethod: 'razorpay_upi' | 'cash' | 'pos_card' | 'counter_upi' | 'cheque';
  status: 'active' | 'expiring_soon' | 'expired' | 'frozen';
  assignedTrainer?: string;
}
