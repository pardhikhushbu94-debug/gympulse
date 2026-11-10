import { create } from 'zustand';
import {
  FinancialMetric,
  CouponItem,
  GymSettingsConfig,
  AdminAuditEntry,
  AdminMemberRecord,
  RevenuePeriod,
} from '../types/admin';
import {
  initialGymSettings,
  financialMetricsByPeriod,
  initialAdminMembers,
  initialCoupons,
  initialAuditLogs,
} from '../services/adminService';

interface AdminState {
  activeTab: 'overview' | 'members' | 'coupons' | 'settings' | 'audit';
  selectedPeriod: RevenuePeriod;
  members: AdminMemberRecord[];
  coupons: CouponItem[];
  settings: GymSettingsConfig;
  auditLogs: AdminAuditEntry[];
  searchQuery: string;
  memberFilter: 'all' | 'active' | 'expiring' | 'expired' | 'frozen';

  // Actions
  setActiveTab: (tab: AdminState['activeTab']) => void;
  setSelectedPeriod: (period: RevenuePeriod) => void;
  setSearchQuery: (query: string) => void;
  setMemberFilter: (filter: AdminState['memberFilter']) => void;
  addOfflineMember: (record: Omit<AdminMemberRecord, 'id'>) => void;
  addCoupon: (coupon: Omit<CouponItem, 'id' | 'timesUsed'>) => void;
  toggleCouponStatus: (couponId: string) => void;
  updateSettings: (newSettings: Partial<GymSettingsConfig>) => void;
  addAuditLog: (entry: Omit<AdminAuditEntry, 'id' | 'timestamp'>) => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  activeTab: 'overview',
  selectedPeriod: 'month',
  members: initialAdminMembers,
  coupons: initialCoupons,
  settings: initialGymSettings,
  auditLogs: initialAuditLogs,
  searchQuery: '',
  memberFilter: 'all',

  setActiveTab: (activeTab) => set({ activeTab }),

  setSelectedPeriod: (selectedPeriod) => set({ selectedPeriod }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  setMemberFilter: (memberFilter) => set({ memberFilter }),

  addOfflineMember: (record) => {
    const newId = `mem_off_${Date.now()}`;
    const newRecord: AdminMemberRecord = {
      ...record,
      id: newId,
    };

    set((state) => ({
      members: [newRecord, ...state.members],
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          action: 'Offline Member Enrolled',
          details: `Enrolled ${record.name} (${record.phone}) into ${record.planName} via ${record.paymentMethod.toUpperCase()} (₹${record.amountPaidINR.toLocaleString('en-IN')}).`,
          adminName: 'Owner Console',
          timestamp: 'Just now',
          category: 'financial',
        },
        ...state.auditLogs,
      ],
    }));
  },

  addCoupon: (coupon) => {
    const newCoupon: CouponItem = {
      ...coupon,
      id: `cpn_${Date.now()}`,
      timesUsed: 0,
    };

    set((state) => ({
      coupons: [newCoupon, ...state.coupons],
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          action: 'Coupon Code Created',
          details: `Created coupon ${coupon.code}: ${coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`} off.`,
          adminName: 'Owner Console',
          timestamp: 'Just now',
          category: 'promotion',
        },
        ...state.auditLogs,
      ],
    }));
  },

  toggleCouponStatus: (couponId) => {
    set((state) => ({
      coupons: state.coupons.map((c) =>
        c.id === couponId ? { ...c, isActive: !c.isActive } : c
      ),
    }));
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          action: 'Gym Settings Updated',
          details: `Updated gym configuration parameters (GST, GPS geofence, or timings).`,
          adminName: 'Owner Console',
          timestamp: 'Just now',
          category: 'settings',
        },
        ...state.auditLogs,
      ],
    }));
  },

  addAuditLog: (entry) => {
    set((state) => ({
      auditLogs: [
        {
          ...entry,
          id: `aud_${Date.now()}`,
          timestamp: 'Just now',
        },
        ...state.auditLogs,
      ],
    }));
  },
}));
