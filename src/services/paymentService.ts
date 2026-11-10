import { GSTInvoice, RazorpayOrderResponse } from '../types/payment';
import { UserProfile, MembershipPlan } from '../types';

export const RAZORPAY_CONFIG = {
  keyId: 'rzp_test_51GymPulse2026',
  gymLegalName: 'IronCore Fitness Private Limited',
  brandName: 'GymPulse / IronCore Fitness',
  gstin: '27AAAAA0000A1Z5',
  sacCode: '999723', // Gym & Fitness Centre Services
  address: 'Plot 42, Link Road, Andheri West, Mumbai, Maharashtra 400053',
  phone: '+91 22 2673 8900',
  email: 'billing@ironcoregym.in',
  upiVpa: 'ironcoregym@okaxis',
};

// In-memory invoice storage
export const invoiceStore: Record<string, GSTInvoice> = {
  'INV-2026-89412': {
    invoiceNumber: 'INV-2026-89412',
    date: '2026-08-01',
    gymDetails: {
      name: RAZORPAY_CONFIG.brandName,
      legalName: RAZORPAY_CONFIG.gymLegalName,
      address: RAZORPAY_CONFIG.address,
      gstin: RAZORPAY_CONFIG.gstin,
      sacCode: RAZORPAY_CONFIG.sacCode,
      phone: RAZORPAY_CONFIG.phone,
      email: RAZORPAY_CONFIG.email,
    },
    customerDetails: {
      userId: 'usr_member_101',
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      email: 'rajesh.kumar@gmail.com',
    },
    items: [
      {
        description: '6 Months Gold Transformation Plan (Gym & Cardio Floor Access)',
        sacCode: '999723',
        quantity: 1,
        amountINR: 7626.27,
      },
    ],
    taxableAmountINR: 7626.27,
    cgstAmountINR: 686.36, // 9%
    sgstAmountINR: 686.37, // 9%
    totalAmountINR: 8999.0,
    paymentMethod: 'UPI (Google Pay)',
    razorpayPaymentId: 'pay_Nz9K4L1aO8Q2',
    status: 'paid',
  },
};

export async function createRazorpayOrder(
  amountINR: number,
  planName: string,
  user: UserProfile
): Promise<RazorpayOrderResponse> {
  // Simulate server-side Razorpay Order API call
  await new Promise((res) => setTimeout(res, 500));
  const orderId = `order_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

  return {
    orderId,
    amountInPaise: Math.round(amountINR * 100),
    currency: 'INR',
    keyId: RAZORPAY_CONFIG.keyId,
    receipt: `rcpt_${Date.now()}`,
  };
}

export async function verifyPaymentSignature(
  orderId: string,
  paymentId: string
): Promise<{ success: boolean; signature: string }> {
  // Simulate server-side HMAC-SHA256 signature verification
  await new Promise((res) => setTimeout(res, 400));
  return {
    success: true,
    signature: `sig_${Math.random().toString(36).substring(2, 14)}`,
  };
}

export function generateUPIIntentUri(amountINR: number, orderId: string): string {
  const params = new URLSearchParams({
    pa: RAZORPAY_CONFIG.upiVpa,
    pn: 'IronCore Fitness',
    am: amountINR.toFixed(2),
    cu: 'INR',
    tn: `Gym Membership ${orderId}`,
  });
  return `upi://pay?${params.toString()}`;
}

export function generateGSTInvoice(
  user: UserProfile,
  plan: MembershipPlan,
  amountPaidINR: number,
  paymentMethod: string,
  razorpayPaymentId: string,
  addOnDescription?: string,
  addOnPriceINR?: number
): GSTInvoice {
  const invoiceNumber = `INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const taxable = Math.round((amountPaidINR / 1.18) * 100) / 100;
  const totalTax = Math.round((amountPaidINR - taxable) * 100) / 100;
  const cgst = Math.round((totalTax / 2) * 100) / 100;
  const sgst = Math.round((totalTax - cgst) * 100) / 100;

  const items = [
    {
      description: `${plan.name} (${plan.durationMonths > 0 ? `${plan.durationMonths} Months` : '1 Day'} Full Gym Floor Access)`,
      sacCode: RAZORPAY_CONFIG.sacCode,
      quantity: 1,
      amountINR: taxable - (addOnPriceINR ? Math.round((addOnPriceINR / 1.18) * 100) / 100 : 0),
    },
  ];

  if (addOnDescription && addOnPriceINR) {
    items.push({
      description: addOnDescription,
      sacCode: RAZORPAY_CONFIG.sacCode,
      quantity: 1,
      amountINR: Math.round((addOnPriceINR / 1.18) * 100) / 100,
    });
  }

  const invoice: GSTInvoice = {
    invoiceNumber,
    date: new Date().toISOString().split('T')[0],
    gymDetails: {
      name: RAZORPAY_CONFIG.brandName,
      legalName: RAZORPAY_CONFIG.gymLegalName,
      address: RAZORPAY_CONFIG.address,
      gstin: RAZORPAY_CONFIG.gstin,
      sacCode: RAZORPAY_CONFIG.sacCode,
      phone: RAZORPAY_CONFIG.phone,
      email: RAZORPAY_CONFIG.email,
    },
    customerDetails: {
      userId: user.id,
      name: user.fullName,
      phone: user.phone,
      email: user.email,
    },
    items,
    taxableAmountINR: taxable,
    cgstAmountINR: cgst,
    sgstAmountINR: sgst,
    totalAmountINR: amountPaidINR,
    paymentMethod,
    razorpayPaymentId,
    status: 'paid',
  };

  invoiceStore[invoiceNumber] = invoice;
  return invoice;
}
