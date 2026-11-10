import { CouponCode, PaymentBreakdown } from '../types/payment';

export const availableCoupons: CouponCode[] = [
  {
    code: 'FITFIRST',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValueINR: 3000,
    description: '20% OFF for first-time app users (min. ₹3,000)',
    timesUsed: 14,
    expiresAt: '2027-12-31',
  },
  {
    code: 'DIWALI1000',
    discountType: 'flat',
    discountValue: 1000,
    minOrderValueINR: 5000,
    applicablePlanIds: ['plan_6m', 'plan_12m'],
    description: 'Flat ₹1,000 OFF on 6-Month and 1-Year Transformation Packs',
    timesUsed: 42,
    expiresAt: '2027-12-31',
  },
  {
    code: 'SUMMER500',
    discountType: 'flat',
    discountValue: 500,
    minOrderValueINR: 2000,
    description: 'Flat ₹500 OFF on any membership plan',
    timesUsed: 89,
    expiresAt: '2027-06-30',
  },
  {
    code: 'CULT25',
    discountType: 'percentage',
    discountValue: 25,
    minOrderValueINR: 8000,
    applicablePlanIds: ['plan_6m', 'plan_12m'],
    description: '25% Mega Fitness Recomp Pack Discount',
    timesUsed: 10,
    expiresAt: '2027-12-31',
  },
];

export function validateCoupon(
  code: string,
  planId: string,
  planPriceINR: number
): { valid: boolean; coupon?: CouponCode; error?: string } {
  const cleanCode = code.trim().toUpperCase();
  const coupon = availableCoupons.find((c) => c.code === cleanCode);

  if (!coupon) {
    return { valid: false, error: `Invalid coupon code '${cleanCode}'` };
  }

  const now = new Date();
  if (new Date(coupon.expiresAt) < now) {
    return { valid: false, error: `Coupon '${cleanCode}' has expired` };
  }

  if (coupon.minOrderValueINR && planPriceINR < coupon.minOrderValueINR) {
    return {
      valid: false,
      error: `Coupon applies only on orders above ₹${coupon.minOrderValueINR.toLocaleString('en-IN')}`,
    };
  }

  if (coupon.applicablePlanIds && !coupon.applicablePlanIds.includes(planId)) {
    return {
      valid: false,
      error: `Coupon '${cleanCode}' is valid only on 6-Month & 1-Year plans`,
    };
  }

  return { valid: true, coupon };
}

export function calculatePaymentBreakdown(
  baseWalkInPrice: number,
  appDiscountPrice: number,
  addOnPrice: number = 0,
  coupon?: CouponCode
): PaymentBreakdown {
  const appDiscountINR = Math.max(0, baseWalkInPrice - appDiscountPrice);
  const subtotalBeforeCoupon = appDiscountPrice + addOnPrice;

  let couponDiscountINR = 0;
  if (coupon) {
    if (coupon.discountType === 'flat') {
      couponDiscountINR = Math.min(coupon.discountValue, subtotalBeforeCoupon);
    } else if (coupon.discountType === 'percentage') {
      couponDiscountINR = Math.round((subtotalBeforeCoupon * coupon.discountValue) / 100);
    }
  }

  // Pricing in India for gyms is GST inclusive or exclusive:
  // Here we calculate the 18% GST transparently (Taxable amount + 9% CGST + 9% SGST = Total)
  const netPayable = Math.max(0, subtotalBeforeCoupon - couponDiscountINR);
  
  // Taxable base = netPayable / 1.18 (inclusive breakdown)
  const taxableAmountINR = Math.round((netPayable / 1.18) * 100) / 100;
  const totalGSTINR = Math.round((netPayable - taxableAmountINR) * 100) / 100;
  const cgstINR = Math.round((totalGSTINR / 2) * 100) / 100;
  const sgstINR = Math.round((totalGSTINR - cgstINR) * 100) / 100;

  return {
    basePriceINR: baseWalkInPrice,
    appDiscountINR,
    planPriceINR: appDiscountPrice,
    addOnsTotalINR: addOnPrice,
    couponDiscountINR,
    taxableAmountINR,
    cgstINR,
    sgstINR,
    totalGSTINR,
    finalPayableINR: netPayable,
  };
}
