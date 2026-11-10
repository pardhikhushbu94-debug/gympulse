import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { safeGoBack } from '../../utils/navigation';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { mockPlans } from '../../services/mockData';
import {
  validateCoupon,
  calculatePaymentBreakdown,
} from '../../services/discountService';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  generateGSTInvoice,
  RAZORPAY_CONFIG,
} from '../../services/paymentService';
import { CouponCode } from '../../types/payment';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Tag,
  CreditCard,
  QrCode,
  Smartphone,
  Landmark,
  Sparkles,
  UserCheck,
  Clock,
} from 'lucide-react-native';

export default function CheckoutScreen() {
  const { theme } = useTheme();
  const { user, updateMembership } = useAuthStore();
  const params = useLocalSearchParams<{ planId: string }>();

  const selectedPlan =
    mockPlans.find((p) => p.id === params.planId) || mockPlans[2]; // Default to 6M Gold

  // States
  const [includePTAddOn, setIncludePTAddOn] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<CouponCode | undefined>(undefined);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'upi_intent' | 'upi_qr' | 'card' | 'netbanking'>('upi_intent');
  const [autoRenew, setAutoRenew] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [razorpayStep, setRazorpayStep] = useState<'authenticating' | 'capturing' | 'success'>('authenticating');

  const PT_PRICE = 2999;
  const breakdown = calculatePaymentBreakdown(
    selectedPlan.basePriceINR,
    selectedPlan.appDiscountPriceINR,
    includePTAddOn ? PT_PRICE : 0,
    appliedCoupon
  );

  const handleApplyCoupon = () => {
    setCouponError(null);
    if (!couponInput.trim()) return;

    const result = validateCoupon(
      couponInput,
      selectedPlan.id,
      selectedPlan.appDiscountPriceINR
    );

    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
    } else {
      setCouponError(result.error || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(undefined);
    setCouponInput('');
    setCouponError(null);
  };

  const handleStartPayment = async () => {
    if (!user) return;
    setProcessing(true);
    setShowRazorpayModal(true);
    setRazorpayStep('authenticating');

    try {
      // Step 1: Create Order
      const order = await createRazorpayOrder(
        breakdown.finalPayableINR,
        selectedPlan.name,
        user
      );

      // Step 2: Processing Payment
      setTimeout(() => {
        setRazorpayStep('capturing');
      }, 1200);

      // Step 3: Server Signature Verification
      setTimeout(async () => {
        const paymentId = `pay_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
        await verifyPaymentSignature(order.orderId, paymentId);
        setRazorpayStep('success');

        // Step 4: Generate GST Invoice
        const invoice = generateGSTInvoice(
          user,
          selectedPlan,
          breakdown.finalPayableINR,
          selectedMethod === 'upi_intent'
            ? 'UPI Intent (Google Pay)'
            : selectedMethod === 'upi_qr'
            ? 'Dynamic UPI QR'
            : selectedMethod === 'card'
            ? 'Credit Card'
            : 'Netbanking',
          paymentId,
          includePTAddOn ? '4 Personal Training Sessions (Coach Vikram Sharma)' : undefined,
          includePTAddOn ? PT_PRICE : undefined
        );

        // Step 5: Update active membership
        const durationDays = selectedPlan.durationDays;
        const now = new Date();
        const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        updateMembership({
          id: `mem_${Date.now()}`,
          userId: user.id,
          planId: selectedPlan.id,
          planName: selectedPlan.name,
          startDate: now.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          status: 'active',
          daysRemaining: durationDays,
          amountPaidINR: breakdown.finalPayableINR,
          isAutoRenew: autoRenew,
          freezeDaysRemaining: selectedPlan.durationMonths >= 12 ? 30 : 15,
          isFrozen: false,
        });

        // Redirect to Invoice after 1 second
        setTimeout(() => {
          setShowRazorpayModal(false);
          setProcessing(false);
          router.replace(`/invoices/${invoice.invoiceNumber}`);
        }, 1200);
      }, 2400);
    } catch (e) {
      setProcessing(false);
      setShowRazorpayModal(false);
      Alert.alert('Payment Error', 'Unable to process transaction. Please retry.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="CHECKOUT & PAYMENT" subtitle="Secure Razorpay Gateway • 18% GST" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          onPress={() => safeGoBack('/plans')}
          style={[styles.backBtn, { borderColor: theme.colors.border }]}
        >
          <ArrowLeft size={16} color={theme.colors.text} />
          <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Change Plan</Text>
        </TouchableOpacity>

        {/* Selected Plan Summary */}
        <Card elevated style={styles.card}>
          <View style={styles.planHeader}>
            <View>
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                {selectedPlan.name}
              </Text>
              <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
                {selectedPlan.durationMonths > 0
                  ? `${selectedPlan.durationMonths} Months Unlimited Gym Floor Access`
                  : 'Single Day All-Access Pass'}
              </Text>
            </View>
            <Badge label="APP DISCOUNTED" variant="primary" />
          </View>

          <View style={[styles.strikethroughBox, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
            <View>
              <Text style={[styles.strikeText, { color: theme.colors.textMuted }]}>
                Walk-in Counter Rate: ₹{selectedPlan.basePriceINR.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.appPriceText, { color: theme.colors.primary }]}>
                App Exclusive Rate: ₹{selectedPlan.appDiscountPriceINR.toLocaleString('en-IN')}
              </Text>
            </View>
            <Badge
              label={`Save ₹${(selectedPlan.basePriceINR - selectedPlan.appDiscountPriceINR).toLocaleString('en-IN')}`}
              variant="success"
            />
          </View>
        </Card>

        {/* Personal Training Add-on Option */}
        <Card style={styles.card}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIncludePTAddOn(!includePTAddOn)}
            style={styles.addOnRow}
          >
            <View style={styles.addOnLeft}>
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: includePTAddOn ? theme.colors.primary : 'transparent',
                    borderColor: includePTAddOn ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                {includePTAddOn && <CheckCircle2 size={16} color={theme.colors.primaryContrast} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.addOnTitle, { color: theme.colors.text }]}>
                  Add 4 Personal Training Sessions (+₹2,999)
                </Text>
                <Text style={[styles.addOnSub, { color: theme.colors.textSecondary }]}>
                  Dedicated 1-on-1 coaching with Head Coach Vikram Sharma (Form checks, PR prep).
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Promo Coupon Card */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text, marginBottom: 8 }]}>
            Promo Coupons & Referral Code
          </Text>

          {appliedCoupon ? (
            <View style={[styles.appliedCouponBox, { backgroundColor: theme.isDark ? '#062B1D' : '#D1FAE5', borderColor: theme.colors.success }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.appliedCouponText, { color: theme.colors.success }]}>
                  ✓ Coupon '{appliedCoupon.code}' Applied!
                </Text>
                <Text style={[styles.appliedCouponSub, { color: theme.isDark ? '#A7F3D0' : '#065F46' }]}>
                  {appliedCoupon.description}
                </Text>
              </View>
              <TouchableOpacity onPress={handleRemoveCoupon}>
                <Text style={[styles.removeCouponText, { color: theme.colors.danger }]}>
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View style={styles.couponInputRow}>
                <TextInput
                  placeholder="e.g. FITFIRST or DIWALI1000"
                  placeholderTextColor={theme.colors.textMuted}
                  autoCapitalize="characters"
                  value={couponInput}
                  onChangeText={(val) => {
                    setCouponInput(val);
                    setCouponError(null);
                  }}
                  style={[
                    styles.couponInput,
                    {
                      backgroundColor: theme.colors.cardElevated,
                      borderColor: couponError ? theme.colors.danger : theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                />
                <Button
                  title="Apply"
                  size="md"
                  variant="primary"
                  onPress={handleApplyCoupon}
                />
              </View>

              {couponError && (
                <Text style={[styles.couponErrorText, { color: theme.colors.danger }]}>
                  {couponError}
                </Text>
              )}

              {/* Suggestions */}
              <View style={styles.suggestedPills}>
                <Text style={[styles.suggestedLabel, { color: theme.colors.textMuted }]}>
                  Try:
                </Text>
                {['FITFIRST', 'DIWALI1000', 'SUMMER500'].map((code) => (
                  <TouchableOpacity
                    key={code}
                    onPress={() => setCouponInput(code)}
                    style={[styles.suggestPill, { borderColor: theme.colors.border }]}
                  >
                    <Text style={[styles.suggestPillText, { color: theme.colors.primary }]}>
                      {code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </Card>

        {/* GST & Total Breakdown */}
        <Card elevated style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text, marginBottom: 12 }]}>
            Price & Tax Breakdown (INR)
          </Text>

          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: theme.colors.textSecondary }]}>
              Plan Base Price:
            </Text>
            <Text style={[styles.calcVal, { color: theme.colors.text }]}>
              ₹{breakdown.planPriceINR.toLocaleString('en-IN')}
            </Text>
          </View>

          {includePTAddOn && (
            <View style={styles.calcRow}>
              <Text style={[styles.calcLabel, { color: theme.colors.textSecondary }]}>
                4 PT Sessions Add-on:
              </Text>
              <Text style={[styles.calcVal, { color: theme.colors.text }]}>
                +₹{PT_PRICE.toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          {breakdown.couponDiscountINR > 0 && (
            <View style={styles.calcRow}>
              <Text style={[styles.calcLabel, { color: theme.colors.success }]}>
                Coupon Discount:
              </Text>
              <Text style={[styles.calcVal, { color: theme.colors.success }]}>
                -₹{breakdown.couponDiscountINR.toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: theme.colors.textMuted }]}>
              Taxable Amount:
            </Text>
            <Text style={[styles.calcVal, { color: theme.colors.textMuted }]}>
              ₹{breakdown.taxableAmountINR.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={[styles.calcLabel, { color: theme.colors.textMuted }]}>
              CGST (9%) + SGST (9%) [SAC 999723]:
            </Text>
            <Text style={[styles.calcVal, { color: theme.colors.textMuted }]}>
              ₹{breakdown.totalGSTINR.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

          <View style={styles.finalRow}>
            <View>
              <Text style={[styles.finalLabel, { color: theme.colors.text }]}>
                Total Payable (incl. 18% GST)
              </Text>
              <Text style={[styles.gstSub, { color: theme.colors.textSecondary }]}>
                GSTIN: {RAZORPAY_CONFIG.gstin}
              </Text>
            </View>
            <Text style={[styles.finalPrice, { color: theme.colors.primary }]}>
              ₹{breakdown.finalPayableINR.toLocaleString('en-IN')}
            </Text>
          </View>
        </Card>

        {/* Payment Method Selector */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text, marginBottom: 12 }]}>
            Select Payment Method (India UPI First)
          </Text>

          {[
            {
              id: 'upi_intent',
              title: '⚡ UPI Direct (GPay, PhonePe, Paytm, CRED)',
              sub: 'Fastest 1-tap checkout via UPI app',
              icon: <Smartphone size={18} color={theme.colors.primary} />,
            },
            {
              id: 'upi_qr',
              title: '📱 Dynamic UPI QR Code',
              sub: 'Scan with any UPI app on phone or desktop',
              icon: <QrCode size={18} color="#FF6B00" />,
            },
            {
              id: 'card',
              title: '💳 Credit / Debit Card (Visa, RuPay, Mastercard)',
              sub: 'Domestic & International cards supported',
              icon: <CreditCard size={18} color="#3B82F6" />,
            },
            {
              id: 'netbanking',
              title: '🏦 Netbanking (All Major Indian Banks)',
              sub: 'HDFC, ICICI, SBI, Axis, Kotak',
              icon: <Landmark size={18} color="#10B981" />,
            },
          ].map((m) => {
            const isSelected = selectedMethod === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                onPress={() => setSelectedMethod(m.id as any)}
                style={[
                  styles.methodRow,
                  {
                    backgroundColor: isSelected ? theme.colors.cardElevated : theme.colors.card,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
              >
                {m.icon}
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.methodTitle,
                      { color: isSelected ? theme.colors.primary : theme.colors.text },
                    ]}
                  >
                    {m.title}
                  </Text>
                  <Text style={[styles.methodSub, { color: theme.colors.textSecondary }]}>
                    {m.sub}
                  </Text>
                </View>
                {isSelected && <CheckCircle2 size={18} color={theme.colors.primary} />}
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Pay Button */}
        <Button
          title={`Pay ₹${breakdown.finalPayableINR.toLocaleString('en-IN')} via Razorpay`}
          variant="primary"
          size="lg"
          icon={<ShieldCheck size={20} color={theme.colors.primaryContrast} />}
          onPress={handleStartPayment}
          loading={processing}
          style={{ marginVertical: 12 }}
        />

        <View style={styles.securityFooter}>
          <ShieldCheck size={16} color={theme.colors.textMuted} />
          <Text style={[styles.securityText, { color: theme.colors.textMuted }]}>
            Secured by Razorpay • PCI-DSS Compliant • 256-Bit SSL
          </Text>
        </View>
      </ScrollView>

      {/* Razorpay Simulation Modal */}
      <Modal visible={showRazorpayModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.modalTop}>
              <View style={[styles.modalLogo, { backgroundColor: '#0C2340' }]}>
                <Text style={styles.razorpayText}>RAZORPAY</Text>
              </View>
              <Badge label="TEST MODE" variant="warning" />
            </View>

            <Text style={[styles.modalAmount, { color: theme.colors.text }]}>
              ₹{breakdown.finalPayableINR.toLocaleString('en-IN')}
            </Text>
            <Text style={[styles.modalMerchant, { color: theme.colors.textSecondary }]}>
              IronCore Fitness Gym (UPI SAC 999723)
            </Text>

            <View style={styles.statusBox}>
              {razorpayStep === 'authenticating' && (
                <View style={styles.stepState}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={[styles.stepText, { color: theme.colors.text }]}>
                    Connecting to UPI Network & Bank Gateway...
                  </Text>
                </View>
              )}

              {razorpayStep === 'capturing' && (
                <View style={styles.stepState}>
                  <ActivityIndicator size="large" color="#10B981" />
                  <Text style={[styles.stepText, { color: theme.colors.text }]}>
                    Capturing Payment & Verifying Server HMAC Signature...
                  </Text>
                </View>
              )}

              {razorpayStep === 'success' && (
                <View style={styles.stepState}>
                  <CheckCircle2 size={48} color="#10B981" />
                  <Text style={[styles.stepText, { color: '#10B981', fontWeight: '800' }]}>
                    Payment Captured Successfully!
                  </Text>
                  <Text style={[styles.stepSub, { color: theme.colors.textSecondary }]}>
                    Generating GST Tax Invoice...
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 48,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    padding: 18,
    marginBottom: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  cardSub: {
    fontSize: 12,
    marginTop: 2,
  },
  strikethroughBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
  },
  strikeText: {
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  appPriceText: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  addOnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addOnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOnTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  addOnSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  appliedCouponBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  appliedCouponText: {
    fontSize: 14,
    fontWeight: '800',
  },
  appliedCouponSub: {
    fontSize: 11,
    marginTop: 2,
  },
  removeCouponText: {
    fontSize: 12,
    fontWeight: '700',
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  couponErrorText: {
    fontSize: 12,
    marginTop: 6,
  },
  suggestedPills: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  suggestedLabel: {
    fontSize: 12,
  },
  suggestPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  suggestPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  calcLabel: {
    fontSize: 13,
  },
  calcVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  finalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  finalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  gstSub: {
    fontSize: 11,
    marginTop: 2,
  },
  finalPrice: {
    fontSize: 24,
    fontWeight: '900',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 8,
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  methodSub: {
    fontSize: 11,
    marginTop: 2,
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 6,
  },
  securityText: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  modalLogo: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  razorpayText: {
    color: '#3395FF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1,
  },
  modalAmount: {
    fontSize: 32,
    fontWeight: '900',
  },
  modalMerchant: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 20,
  },
  statusBox: {
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepState: {
    alignItems: 'center',
    gap: 12,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  stepSub: {
    fontSize: 12,
    textAlign: 'center',
  },
});
