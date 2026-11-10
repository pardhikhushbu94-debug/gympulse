import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Switch,
  TextInput,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { Header } from '../../components/common/Header';
import { QuickRoleSwitcher } from '../../components/common/QuickRoleSwitcher';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { mockPlans } from '../../services/mockData';
import {
  financialMetricsByPeriod,
  generateGSTReportCSV,
} from '../../services/adminService';
import { RevenuePeriod, AdminMemberRecord, CouponItem } from '../../types/admin';
import { safeGoBack } from '../../utils/navigation';
import {
  IndianRupee,
  Users,
  CalendarCheck,
  AlertTriangle,
  Download,
  PlusCircle,
  FileSpreadsheet,
  QrCode,
  CheckCircle2,
  Clock,
  X,
  Share2,
  Sliders,
  Tag,
  Settings,
  Shield,
  Search,
  ArrowRight,
  TrendingUp,
  MapPin,
  Building,
  CreditCard,
  MessageSquare,
  Sparkles,
  Percent,
} from 'lucide-react-native';
import { router } from 'expo-router';

export default function AdminDashboardScreen() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const {
    activeTab,
    setActiveTab,
    selectedPeriod,
    setSelectedPeriod,
    members,
    coupons,
    settings,
    auditLogs,
    searchQuery,
    setSearchQuery,
    memberFilter,
    setMemberFilter,
    addOfflineMember,
    addCoupon,
    toggleCouponStatus,
    updateSettings,
  } = useAdminStore();

  // Modals
  const [showAddOfflineModal, setShowAddOfflineModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);

  // Offline member form
  const [offlineName, setOfflineName] = useState('');
  const [offlinePhone, setOfflinePhone] = useState('');
  const [offlineEmail, setOfflineEmail] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('plan_3m');
  const [offlineMethod, setOfflineMethod] = useState<'cash' | 'pos_card' | 'counter_upi' | 'cheque'>('cash');

  // Coupon form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDesc, setNewCouponDesc] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'flat'>('percentage');
  const [newCouponVal, setNewCouponVal] = useState('10');
  const [newCouponMinOrder, setNewCouponMinOrder] = useState('2000');
  const [newCouponMaxUsage, setNewCouponMaxUsage] = useState('100');

  // Settings form states
  const [editBrandName, setEditBrandName] = useState(settings.brandName);
  const [editGstin, setEditGstin] = useState(settings.gstin);
  const [editUpiVpa, setEditUpiVpa] = useState(settings.upiVpa);
  const [editGeofenceRadius, setEditGeofenceRadius] = useState(String(settings.geofenceRadiusMeters));
  const [editQrRotation, setEditQrRotation] = useState(String(settings.qrRotationSeconds));
  const [editMaxFreeze, setEditMaxFreeze] = useState(String(settings.maxFreezeDaysAllowed));

  const financial = financialMetricsByPeriod[selectedPeriod];

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery) ||
      m.planName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (memberFilter === 'active') return m.status === 'active';
    if (memberFilter === 'expiring') return m.status === 'expiring_soon';
    if (memberFilter === 'expired') return m.status === 'expired';
    if (memberFilter === 'frozen') return m.status === 'frozen';
    return true;
  });

  const expiringCount = members.filter((m) => m.status === 'expiring_soon').length;

  const handleExportCSV = () => {
    const csvData = generateGSTReportCSV(members);
    Alert.alert(
      'GST Tax & Member Report Generated',
      `Full accounting report for ${members.length} members ready.\n\nHeaders include SAC 999723, CGST 9%, SGST 9%, Taxable Base, and Razorpay/Offline Settlement details.\n\nSimulated File: gympulse_gst_audit_nov2026.csv (${csvData.length} bytes)`,
      [{ text: 'Download / Share' }, { text: 'Done' }]
    );
  };

  const handleSaveOfflineMember = () => {
    if (!offlineName.trim() || !offlinePhone.trim()) {
      Alert.alert('Missing Details', 'Please provide member full name and mobile number.');
      return;
    }

    const plan = mockPlans.find((p) => p.id === selectedPlanId) || mockPlans[1];
    const durationDays = plan.durationDays;
    const now = new Date();
    const expiry = new Date();
    expiry.setDate(now.getDate() + durationDays);

    addOfflineMember({
      name: offlineName.trim(),
      phone: offlinePhone.startsWith('+91') ? offlinePhone : `+91 ${offlinePhone.trim()}`,
      email: offlineEmail.trim() || `${offlineName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      planName: plan.name,
      planDuration: `${plan.durationMonths || 1} Month${(plan.durationMonths || 1) > 1 ? 's' : ''}`,
      startDate: now.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      daysLeft: durationDays,
      amountPaidINR: plan.basePriceINR,
      paymentMethod: offlineMethod,
      status: 'active',
      assignedTrainer: 'Coach Vikram Sharma',
    });

    setOfflineName('');
    setOfflinePhone('');
    setOfflineEmail('');
    setShowAddOfflineModal(false);

    Alert.alert(
      'Offline Member Added! 🎉',
      `Payment of ₹${plan.basePriceINR.toLocaleString('en-IN')} via ${offlineMethod.toUpperCase()} recorded. Membership activated.`
    );
  };

  const handleSaveCoupon = () => {
    if (!newCouponCode.trim()) {
      Alert.alert('Missing Code', 'Please enter a coupon code name (e.g. SUMMERFIT).');
      return;
    }

    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      description: newCouponDesc.trim() || `${newCouponVal}${newCouponType === 'percentage' ? '%' : '₹'} off on memberships`,
      discountType: newCouponType,
      discountValue: parseFloat(newCouponVal) || 10,
      minOrderINR: parseFloat(newCouponMinOrder) || 2000,
      maxUsage: parseInt(newCouponMaxUsage, 10) || 100,
      validUntil: '2026-12-31',
      isActive: true,
    });

    setNewCouponCode('');
    setNewCouponDesc('');
    setShowAddCouponModal(false);
    Alert.alert('Coupon Issued!', `Code ${newCouponCode.trim().toUpperCase()} is now active for member checkouts.`);
  };

  const handleSaveSettings = () => {
    updateSettings({
      brandName: editBrandName,
      gstin: editGstin,
      upiVpa: editUpiVpa,
      geofenceRadiusMeters: parseInt(editGeofenceRadius, 10) || 50,
      qrRotationSeconds: parseInt(editQrRotation, 10) || 30,
      maxFreezeDaysAllowed: parseInt(editMaxFreeze, 10) || 15,
    });

    Alert.alert('Settings Saved', 'Gym business parameters, GSTIN, and entrance geofence rules updated successfully.');
  };

  const handleSendNudge = (m: AdminMemberRecord) => {
    Alert.alert(
      'WhatsApp Payment Link Sent',
      `Renewal notification with Razorpay UPI payment link dispatched to ${m.name} (${m.phone}) for ${m.planName} expiring in ${m.daysLeft} days.`
    );
  };

  const handleBulkRenewalNudge = () => {
    Alert.alert(
      'Bulk WhatsApp Broadcast',
      `Sent instant UPI renewal payment links to ${expiringCount} members expiring within 7 days.`,
      [{ text: 'Great' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="OWNER CONSOLE" subtitle="GymPulse Enterprise Management" />
      <QuickRoleSwitcher />

      {/* Admin Navigation Sub-Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: theme.colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {[
            { key: 'overview', label: 'Overview & Revenue', icon: TrendingUp },
            { key: 'members', label: `Member Roster (${members.length})`, icon: Users },
            { key: 'coupons', label: `Coupons (${coupons.length})`, icon: Tag },
            { key: 'settings', label: 'Gym & GST Settings', icon: Settings },
            { key: 'audit', label: `Audit Log (${auditLogs.length})`, icon: Shield },
          ].map((tab) => {
            const isCurrent = activeTab === tab.key;
            const Icon = tab.icon;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key as any)}
                style={[
                  styles.tabItem,
                  {
                    borderBottomColor: isCurrent ? theme.colors.primary : 'transparent',
                    borderBottomWidth: isCurrent ? 2 : 0,
                  },
                ]}
              >
                <Icon size={16} color={isCurrent ? theme.colors.primary : theme.colors.textSecondary} />
                <Text
                  style={[
                    styles.tabLabel,
                    {
                      color: isCurrent ? theme.colors.primary : theme.colors.textSecondary,
                      fontWeight: isCurrent ? '700' : '500',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* ===================== TAB 1: OVERVIEW & FINANCIALS ===================== */}
        {activeTab === 'overview' && (
          <View>
            {/* Period Selector Chips */}
            <View style={styles.periodRow}>
              {(['today', 'week', 'month', 'quarter', 'year'] as RevenuePeriod[]).map((period) => {
                const isSelected = selectedPeriod === period;
                return (
                  <TouchableOpacity
                    key={period}
                    onPress={() => setSelectedPeriod(period)}
                    style={[
                      styles.periodChip,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.cardElevated,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.periodChipText,
                        {
                          color: isSelected ? theme.colors.primaryContrast : theme.colors.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {period.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Financial Overview Card */}
            <Card elevated style={styles.mainRevCard}>
              <View style={styles.revTopRow}>
                <View>
                  <Text style={[styles.revPeriodLabel, { color: theme.colors.textSecondary }]}>
                    TOTAL REVENUE • {financial.periodLabel}
                  </Text>
                  <Text style={[styles.revBigAmount, { color: theme.colors.primary }]}>
                    ₹{financial.totalRevenueINR.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={[styles.growthPill, { backgroundColor: '#10B98120' }]}>
                  <TrendingUp size={14} color="#10B981" />
                  <Text style={[styles.growthText, { color: '#10B981' }]}>
                    +{financial.growthPct}% YoY
                  </Text>
                </View>
              </View>

              {/* Revenue Composition Meter */}
              <View style={styles.meterBox}>
                <View style={styles.meterLabels}>
                  <Text style={[styles.meterLabel, { color: theme.colors.textSecondary }]}>
                    Composition: Memberships ({Math.round((financial.membershipsINR / financial.totalRevenueINR) * 100)}%) • PT ({Math.round((financial.ptCommissionsINR / financial.totalRevenueINR) * 100)}%) • Day Pass ({Math.round((financial.dayPassesINR / financial.totalRevenueINR) * 100)}%)
                  </Text>
                </View>
                <View style={styles.meterTrack}>
                  <View
                    style={[
                      styles.meterSeg,
                      {
                        flex: financial.membershipsINR,
                        backgroundColor: theme.colors.primary,
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.meterSeg,
                      {
                        flex: financial.ptCommissionsINR,
                        backgroundColor: '#38BDF8',
                      },
                    ]}
                  />
                  <View
                    style={[
                      styles.meterSeg,
                      {
                        flex: financial.dayPassesINR,
                        backgroundColor: '#FBBF24',
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Revenue Streams Grid */}
              <View style={styles.revStreamsGrid}>
                <View
                  style={[
                    styles.streamBox,
                    { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                  ]}
                >
                  <Text style={[styles.streamLabel, { color: theme.colors.textSecondary }]}>
                    MEMBERSHIPS
                  </Text>
                  <Text style={[styles.streamVal, { color: theme.colors.text }]}>
                    ₹{financial.membershipsINR.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View
                  style={[
                    styles.streamBox,
                    { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                  ]}
                >
                  <Text style={[styles.streamLabel, { color: theme.colors.textSecondary }]}>
                    PT COMMISSIONS
                  </Text>
                  <Text style={[styles.streamVal, { color: '#38BDF8' }]}>
                    ₹{financial.ptCommissionsINR.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View
                  style={[
                    styles.streamBox,
                    { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                  ]}
                >
                  <Text style={[styles.streamLabel, { color: theme.colors.textSecondary }]}>
                    DAY PASSES
                  </Text>
                  <Text style={[styles.streamVal, { color: '#FBBF24' }]}>
                    ₹{financial.dayPassesINR.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View
                  style={[
                    styles.streamBox,
                    { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                  ]}
                >
                  <Text style={[styles.streamLabel, { color: theme.colors.textSecondary }]}>
                    PENDING DUES
                  </Text>
                  <Text style={[styles.streamVal, { color: '#EF4444' }]}>
                    ₹{financial.pendingDuesINR.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Quick Action Buttons */}
            <View style={styles.actionGridRow}>
              <Button
                title="+ Add Offline Member"
                variant="primary"
                size="sm"
                icon={<PlusCircle size={15} color={theme.colors.primaryContrast} />}
                onPress={() => setShowAddOfflineModal(true)}
                style={{ flex: 1 }}
              />
              <Button
                title="GST CSV Export"
                variant="outline"
                size="sm"
                icon={<Download size={15} color={theme.colors.text} />}
                onPress={handleExportCSV}
                style={{ flex: 1 }}
              />
            </View>

            {/* Dues & Expirations Action Alert */}
            {expiringCount > 0 && (
              <Card
                elevated
                style={[
                  styles.expiringAlertCard,
                  { backgroundColor: '#F59E0B15', borderColor: '#F59E0B' },
                ]}
              >
                <View style={styles.alertLeft}>
                  <AlertTriangle size={22} color="#F59E0B" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.alertTitle, { color: '#F59E0B' }]}>
                      {expiringCount} Members Expiring in 7 Days
                    </Text>
                    <Text style={[styles.alertSub, { color: theme.colors.textSecondary }]}>
                      Estimated renewable revenue: ₹10,998. Send 1-click WhatsApp payment links.
                    </Text>
                  </View>
                </View>
                <Button
                  title="WhatsApp Bulk Link"
                  size="sm"
                  variant="primary"
                  onPress={handleBulkRenewalNudge}
                  style={{ marginTop: 10 }}
                />
              </Card>
            )}

            {/* Quick Links to Real-Time Operations */}
            <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
              Gym Floor Operations
            </Text>

            <View style={styles.opsGrid}>
              <TouchableOpacity
                onPress={() => router.push('/attendance/gym-display' as any)}
                style={[
                  styles.opsCard,
                  { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                ]}
              >
                <QrCode size={22} color={theme.colors.primary} />
                <View>
                  <Text style={[styles.opsTitle, { color: theme.colors.text }]}>
                    Entrance Kiosk Display
                  </Text>
                  <Text style={[styles.opsSub, { color: theme.colors.textSecondary }]}>
                    30s Rotating Anti-Fraud QR
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/attendance/live-board' as any)}
                style={[
                  styles.opsCard,
                  { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                ]}
              >
                <Users size={22} color="#38BDF8" />
                <View>
                  <Text style={[styles.opsTitle, { color: theme.colors.text }]}>
                    Live Floor Headcount
                  </Text>
                  <Text style={[styles.opsSub, { color: theme.colors.textSecondary }]}>
                    Real-time workout occupants
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/attendance/absentees' as any)}
                style={[
                  styles.opsCard,
                  { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                ]}
              >
                <AlertTriangle size={22} color="#EF4444" />
                <View>
                  <Text style={[styles.opsTitle, { color: theme.colors.text }]}>
                    Absentees Follow-up
                  </Text>
                  <Text style={[styles.opsSub, { color: theme.colors.textSecondary }]}>
                    5+ Days Inactive Retention
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/plans' as any)}
                style={[
                  styles.opsCard,
                  { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                ]}
              >
                <CreditCard size={22} color="#10B981" />
                <View>
                  <Text style={[styles.opsTitle, { color: theme.colors.text }]}>
                    Membership Plans Store
                  </Text>
                  <Text style={[styles.opsSub, { color: theme.colors.textSecondary }]}>
                    Razorpay & pricing catalog
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ===================== TAB 2: MEMBER ROSTER ===================== */}
        {activeTab === 'members' && (
          <View>
            {/* Search Input */}
            <View style={styles.searchRow}>
              <Input
                placeholder="Search member name, phone or plan..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Status Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPillsScroll}>
              {[
                { key: 'all', label: `All (${members.length})` },
                { key: 'active', label: 'Active' },
                { key: 'expiring', label: `Expiring Soon (${expiringCount})` },
                { key: 'expired', label: 'Expired' },
                { key: 'frozen', label: 'Frozen' },
              ].map((f) => {
                const isSelected = memberFilter === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    onPress={() => setMemberFilter(f.key as any)}
                    style={[
                      styles.filterPillBtn,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.cardElevated,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterPillBtnText,
                        {
                          color: isSelected ? theme.colors.primaryContrast : theme.colors.text,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {f.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Members List */}
            {filteredMembers.map((m) => (
              <Card key={m.id} elevated style={styles.memberCard}>
                <View style={styles.memberHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.memberName, { color: theme.colors.text }]}>
                      {m.name}
                    </Text>
                    <Text style={[styles.memberPhone, { color: theme.colors.textSecondary }]}>
                      {m.phone} • {m.email}
                    </Text>
                  </View>

                  <Badge
                    label={
                      m.status === 'active'
                        ? `${m.daysLeft}d Left`
                        : m.status === 'expiring_soon'
                        ? `Due in ${m.daysLeft}d`
                        : m.status === 'frozen'
                        ? 'Frozen'
                        : 'Expired'
                    }
                    variant={
                      m.status === 'active'
                        ? 'success'
                        : m.status === 'expiring_soon'
                        ? 'warning'
                        : m.status === 'frozen'
                        ? 'neutral'
                        : 'danger'
                    }
                  />
                </View>

                {/* Membership Details Box */}
                <View
                  style={[
                    styles.memberDetailsBox,
                    { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                  ]}
                >
                  <View style={styles.detailCol}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>PLAN</Text>
                    <Text style={[styles.detailVal, { color: theme.colors.text }]}>{m.planName}</Text>
                  </View>

                  <View style={styles.detailCol}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>PAID</Text>
                    <Text style={[styles.detailVal, { color: theme.colors.primary }]}>
                      ₹{m.amountPaidINR.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.detailCol}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>MODE</Text>
                    <Text style={[styles.detailVal, { color: theme.colors.text }]}>
                      {m.paymentMethod.replace('_', ' ').toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.detailCol}>
                    <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>EXPIRY</Text>
                    <Text style={[styles.detailVal, { color: theme.colors.text }]}>{m.expiryDate}</Text>
                  </View>
                </View>

                {/* Action Row */}
                <View style={styles.memberActionRow}>
                  {m.assignedTrainer && (
                    <Text style={[styles.trainerTag, { color: theme.colors.textSecondary }]}>
                      Coach: <Text style={{ color: theme.colors.text }}>{m.assignedTrainer}</Text>
                    </Text>
                  )}

                  <View style={styles.actionBtnsGroup}>
                    {m.status === 'expiring_soon' && (
                      <TouchableOpacity
                        onPress={() => handleSendNudge(m)}
                        style={[styles.smallActionBtn, { backgroundColor: '#10B98120', borderColor: '#10B981' }]}
                      >
                        <MessageSquare size={13} color="#10B981" />
                        <Text style={[styles.smallActionText, { color: '#10B981' }]}>WhatsApp Link</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => router.push(`/invoices/inv_2026_089` as any)}
                      style={[styles.smallActionBtn, { borderColor: theme.colors.border }]}
                    >
                      <FileSpreadsheet size={13} color={theme.colors.text} />
                      <Text style={[styles.smallActionText, { color: theme.colors.text }]}>Invoice</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ===================== TAB 3: COUPONS & DISCOUNTS ===================== */}
        {activeTab === 'coupons' && (
          <View>
            <View style={styles.couponsHeaderRow}>
              <View>
                <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
                  Promo Codes & App Discounts
                </Text>
                <Text style={[styles.sectionSub, { color: theme.colors.textSecondary }]}>
                  Drive mobile signups with automated checkout discounts.
                </Text>
              </View>

              <Button
                title="+ Create Coupon"
                size="sm"
                variant="primary"
                onPress={() => setShowAddCouponModal(true)}
              />
            </View>

            {coupons.map((coupon) => (
              <Card key={coupon.id} elevated style={styles.couponCard}>
                <View style={styles.couponTopRow}>
                  <View style={styles.couponCodeBadge}>
                    <Tag size={16} color={theme.colors.primary} />
                    <Text style={[styles.couponCodeText, { color: theme.colors.primary }]}>
                      {coupon.code}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Badge
                      label={coupon.isActive ? 'ACTIVE' : 'PAUSED'}
                      variant={coupon.isActive ? 'success' : 'neutral'}
                    />
                    <Switch
                      value={coupon.isActive}
                      onValueChange={() => toggleCouponStatus(coupon.id)}
                      thumbColor={coupon.isActive ? theme.colors.primary : '#ccc'}
                    />
                  </View>
                </View>

                <Text style={[styles.couponDesc, { color: theme.colors.text }]}>
                  {coupon.description}
                </Text>

                <View
                  style={[
                    styles.couponMetaBox,
                    { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                  ]}
                >
                  <View style={styles.metaCol}>
                    <Text style={[styles.metaColLabel, { color: theme.colors.textSecondary }]}>DISCOUNT</Text>
                    <Text style={[styles.metaColVal, { color: theme.colors.text }]}>
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% OFF`
                        : `₹${coupon.discountValue} FLAT`}
                    </Text>
                  </View>

                  <View style={styles.metaCol}>
                    <Text style={[styles.metaColLabel, { color: theme.colors.textSecondary }]}>MIN CART</Text>
                    <Text style={[styles.metaColVal, { color: theme.colors.text }]}>
                      ₹{coupon.minOrderINR.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={styles.metaCol}>
                    <Text style={[styles.metaColLabel, { color: theme.colors.textSecondary }]}>USAGE</Text>
                    <Text style={[styles.metaColVal, { color: theme.colors.primary }]}>
                      {coupon.timesUsed} / {coupon.maxUsage}
                    </Text>
                  </View>

                  <View style={styles.metaCol}>
                    <Text style={[styles.metaColLabel, { color: theme.colors.textSecondary }]}>EXPIRY</Text>
                    <Text style={[styles.metaColVal, { color: theme.colors.text }]}>
                      {coupon.validUntil}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ===================== TAB 4: GYM SETTINGS ===================== */}
        {activeTab === 'settings' && (
          <View>
            <Card elevated style={styles.settingsSectionCard}>
              <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
                Legal & Indian GST Identification
              </Text>

              <Input
                label="Gym Brand Name"
                value={editBrandName}
                onChangeText={setEditBrandName}
              />

              <Input
                label="GSTIN (18% Gym Fitness Services)"
                value={editGstin}
                onChangeText={setEditGstin}
              />

              <Input
                label="SAC Classification Code"
                value={settings.sacCode}
                editable={false}
              />

              <Input
                label="UPI Settlement VPA (Merchant ID)"
                value={editUpiVpa}
                onChangeText={setEditUpiVpa}
              />
            </Card>

            <Card elevated style={styles.settingsSectionCard}>
              <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
                Attendance, Geofencing & Anti-Fraud
              </Text>

              <Input
                label="Entrance GPS Geofence Radius (Meters)"
                value={editGeofenceRadius}
                onChangeText={setEditGeofenceRadius}
                keyboardType="numeric"
              />

              <Input
                label="TOTP QR Code Rotation Frequency (Seconds)"
                value={editQrRotation}
                onChangeText={setEditQrRotation}
                keyboardType="numeric"
              />

              <Input
                label="Max Membership Freeze Days (Per Year)"
                value={editMaxFreeze}
                onChangeText={setEditMaxFreeze}
                keyboardType="numeric"
              />

              <Button
                title="Save Gym & GST Configurations"
                variant="primary"
                onPress={handleSaveSettings}
                style={{ marginTop: 8 }}
              />
            </Card>
          </View>
        )}

        {/* ===================== TAB 5: AUDIT LOG ===================== */}
        {activeTab === 'audit' && (
          <View>
            <View style={styles.auditHeader}>
              <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
                Security & Administrative Audit Trail
              </Text>
              <Text style={[styles.sectionSub, { color: theme.colors.textSecondary }]}>
                Immutable log of cashier payments, discount creations, and system changes.
              </Text>
            </View>

            {auditLogs.map((log) => (
              <Card key={log.id} elevated style={styles.auditCard}>
                <View style={styles.auditTopRow}>
                  <View style={styles.auditActionRow}>
                    <Shield size={16} color={theme.colors.primary} />
                    <Text style={[styles.auditAction, { color: theme.colors.text }]}>
                      {log.action}
                    </Text>
                  </View>

                  <Badge label={log.category.toUpperCase()} variant="primary" />
                </View>

                <Text style={[styles.auditDetails, { color: theme.colors.textSecondary }]}>
                  {log.details}
                </Text>

                <View style={styles.auditMetaRow}>
                  <Text style={[styles.auditMetaText, { color: theme.colors.textSecondary }]}>
                    Operator: <Text style={{ color: theme.colors.text }}>{log.adminName}</Text>
                  </Text>
                  <Text style={[styles.auditMetaText, { color: theme.colors.textSecondary }]}>
                    {log.timestamp}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ===================== MODAL: ADD OFFLINE MEMBER ===================== */}
      <Modal visible={showAddOfflineModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Add Offline Member (Walk-in)
              </Text>
              <TouchableOpacity onPress={() => setShowAddOfflineModal(false)}>
                <X size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Input
                label="Full Name"
                placeholder="e.g. Rajesh Sharma"
                value={offlineName}
                onChangeText={setOfflineName}
              />

              <Input
                label="Mobile Number (without +91)"
                placeholder="9876543210"
                keyboardType="phone-pad"
                value={offlinePhone}
                onChangeText={setOfflinePhone}
              />

              <Input
                label="Email Address (Optional)"
                placeholder="rajesh@example.com"
                keyboardType="email-address"
                value={offlineEmail}
                onChangeText={setOfflineEmail}
              />

              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Select Membership Plan
              </Text>

              <View style={styles.modalPlansGrid}>
                {mockPlans.slice(0, 4).map((plan) => {
                  const isChosen = selectedPlanId === plan.id;
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      onPress={() => setSelectedPlanId(plan.id)}
                      style={[
                        styles.modalPlanBtn,
                        {
                          backgroundColor: isChosen ? theme.colors.primary : theme.colors.cardElevated,
                          borderColor: isChosen ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalPlanName,
                          {
                            color: isChosen ? theme.colors.primaryContrast : theme.colors.text,
                            fontWeight: isChosen ? '700' : '500',
                          },
                        ]}
                      >
                        {plan.name}
                      </Text>
                      <Text
                        style={[
                          styles.modalPlanPrice,
                          {
                            color: isChosen ? theme.colors.primaryContrast : theme.colors.primary,
                          },
                        ]}
                      >
                        ₹{plan.basePriceINR.toLocaleString('en-IN')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.inputLabel, { color: theme.colors.text, marginTop: 12 }]}>
                Payment Collection Method
              </Text>

              <View style={styles.modalMethodRow}>
                {(['cash', 'counter_upi', 'pos_card', 'cheque'] as const).map((method) => {
                  const isSelected = offlineMethod === method;
                  return (
                    <TouchableOpacity
                      key={method}
                      onPress={() => setOfflineMethod(method)}
                      style={[
                        styles.methodChip,
                        {
                          backgroundColor: isSelected ? theme.colors.primary : theme.colors.cardElevated,
                          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.methodText,
                          {
                            color: isSelected ? theme.colors.primaryContrast : theme.colors.text,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {method.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={{ marginTop: 14 }}>
              <Button
                title="Save & Activate Pass"
                variant="primary"
                onPress={handleSaveOfflineMember}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* ===================== MODAL: CREATE COUPON ===================== */}
      <Modal visible={showAddCouponModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Create New Promotional Coupon
              </Text>
              <TouchableOpacity onPress={() => setShowAddCouponModal(false)}>
                <X size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }}>
              <Input
                label="Coupon Code (e.g. SUMMERFIT)"
                placeholder="FESTIVE20"
                value={newCouponCode}
                onChangeText={setNewCouponCode}
                autoCapitalize="characters"
              />

              <Input
                label="Offer Description"
                placeholder="Special 20% discount on 6-month and annual passes"
                value={newCouponDesc}
                onChangeText={setNewCouponDesc}
              />

              <View style={styles.couponTypeToggleRow}>
                <TouchableOpacity
                  onPress={() => setNewCouponType('percentage')}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor: newCouponType === 'percentage' ? theme.colors.primary : theme.colors.cardElevated,
                      borderColor: newCouponType === 'percentage' ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <Percent size={16} color={newCouponType === 'percentage' ? theme.colors.primaryContrast : theme.colors.text} />
                  <Text style={{ color: newCouponType === 'percentage' ? theme.colors.primaryContrast : theme.colors.text, fontWeight: '700' }}>
                    Percentage (%)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setNewCouponType('flat')}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor: newCouponType === 'flat' ? theme.colors.primary : theme.colors.cardElevated,
                      borderColor: newCouponType === 'flat' ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                >
                  <IndianRupee size={16} color={newCouponType === 'flat' ? theme.colors.primaryContrast : theme.colors.text} />
                  <Text style={{ color: newCouponType === 'flat' ? theme.colors.primaryContrast : theme.colors.text, fontWeight: '700' }}>
                    Flat Rupees (₹)
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label={newCouponType === 'percentage' ? 'Percent Off (%)' : 'Amount (₹)'}
                    placeholder="15"
                    keyboardType="numeric"
                    value={newCouponVal}
                    onChangeText={setNewCouponVal}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Input
                    label="Min Cart Value (₹)"
                    placeholder="2000"
                    keyboardType="numeric"
                    value={newCouponMinOrder}
                    onChangeText={setNewCouponMinOrder}
                  />
                </View>
              </View>

              <Input
                label="Maximum Total Redemptions"
                placeholder="100"
                keyboardType="numeric"
                value={newCouponMaxUsage}
                onChangeText={setNewCouponMaxUsage}
              />
            </ScrollView>

            <View style={{ marginTop: 14 }}>
              <Button
                title="Publish Coupon Code"
                variant="primary"
                onPress={handleSaveCoupon}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    borderBottomWidth: 1,
  },
  tabScroll: {
    paddingHorizontal: 12,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  tabLabel: {
    fontSize: 13,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  periodChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodChipText: {
    fontSize: 11,
  },
  mainRevCard: {
    marginBottom: 14,
    padding: 18,
  },
  revTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  revPeriodLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  revBigAmount: {
    fontSize: 30,
    fontWeight: '900',
    marginTop: 2,
  },
  growthPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '700',
  },
  meterBox: {
    marginBottom: 16,
  },
  meterLabels: {
    marginBottom: 6,
  },
  meterLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  meterTrack: {
    height: 8,
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
  },
  meterSeg: {
    height: '100%',
  },
  revStreamsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  streamBox: {
    width: '48.5%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  streamLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  streamVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionGridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  expiringAlertCard: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  alertLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  alertSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  sectionSub: {
    fontSize: 12,
    marginBottom: 12,
  },
  opsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  opsCard: {
    width: '48.5%',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  opsTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  opsSub: {
    fontSize: 11,
    marginTop: 2,
  },
  searchRow: {
    marginBottom: 12,
  },
  filterPillsScroll: {
    gap: 8,
    marginBottom: 14,
  },
  filterPillBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterPillBtnText: {
    fontSize: 12,
  },
  memberCard: {
    marginBottom: 12,
    padding: 14,
  },
  memberHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '700',
  },
  memberPhone: {
    fontSize: 12,
    marginTop: 2,
  },
  memberDetailsBox: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  memberActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trainerTag: {
    fontSize: 12,
  },
  actionBtnsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  smallActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  smallActionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  couponsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  couponCard: {
    marginBottom: 12,
    padding: 14,
  },
  couponTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  couponCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  couponCodeText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  couponDesc: {
    fontSize: 13,
    marginBottom: 10,
  },
  couponMetaBox: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  metaCol: {
    flex: 1,
  },
  metaColLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaColVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  settingsSectionCard: {
    marginBottom: 14,
    padding: 16,
  },
  auditHeader: {
    marginBottom: 12,
  },
  auditCard: {
    marginBottom: 10,
    padding: 14,
  },
  auditTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  auditActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  auditAction: {
    fontSize: 14,
    fontWeight: '700',
  },
  auditDetails: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  auditMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  auditMetaText: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalPlansGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  modalPlanBtn: {
    width: '48.5%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalPlanName: {
    fontSize: 12,
    marginBottom: 2,
  },
  modalPlanPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalMethodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  methodChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  methodText: {
    fontSize: 11,
  },
  couponTypeToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
});
