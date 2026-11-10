export interface AddOnOption {
  id: string;
  name: string;
  description: string;
  priceINR: number;
  durationDays?: number;
}

export interface CouponCode {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number; // e.g. 20 for 20% or 1000 for ₹1000
  minOrderValueINR?: number;
  applicablePlanIds?: string[];
  maxUsageLimit?: number;
  timesUsed: number;
  expiresAt: string;
  description: string;
}

export interface PaymentBreakdown {
  basePriceINR: number;
  appDiscountINR: number;
  planPriceINR: number; // base - appDiscount
  addOnsTotalINR: number;
  couponDiscountINR: number;
  taxableAmountINR: number;
  cgstINR: number; // 9%
  sgstINR: number; // 9%
  totalGSTINR: number; // 18%
  finalPayableINR: number;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amountInPaise: number;
  currency: 'INR';
  keyId: string;
  receipt: string;
}

export interface GSTInvoice {
  invoiceNumber: string;
  date: string;
  gymDetails: {
    name: string;
    legalName: string;
    address: string;
    gstin: string;
    sacCode: string; // 999723 for Fitness Services
    phone: string;
    email: string;
  };
  customerDetails: {
    userId: string;
    name: string;
    phone: string;
    email: string;
  };
  items: Array<{
    description: string;
    sacCode: string;
    quantity: number;
    amountINR: number;
  }>;
  taxableAmountINR: number;
  cgstAmountINR: number;
  sgstAmountINR: number;
  totalAmountINR: number;
  paymentMethod: string;
  razorpayPaymentId: string;
  status: 'paid' | 'refunded';
}
