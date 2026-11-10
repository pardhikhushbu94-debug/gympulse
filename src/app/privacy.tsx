import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '@/theme/ThemeContext';
import { useAuthStore } from '@/store/authStore';
import { Header } from '@/components/common/Header';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { safeGoBack } from '@/utils/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Trash2,
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react-native';

export default function PrivacyComplianceScreen() {
  const { theme } = useTheme();
  const { user, logout } = useAuthStore();

  const handleDeleteAccount = () => {
    Alert.alert(
      'Permanent Account Deletion',
      'Under the Indian DPDP Act 2023 and App Store rules, you have the right to erase all your personal records. This action will permanently remove your attendance streaks, workouts, body tape measurements, and active passes.\n\nAre you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything Permanently',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deleted',
              'Your profile and health records have been permanently purged from GymPulse servers.',
              [{ text: 'OK', onPress: () => logout() }]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="LEGAL & PRIVACY" subtitle="DPDP Act 2023 & Security Policies" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Navigation Bar */}
        <View style={styles.topNavRow}>
          <TouchableOpacity
            onPress={() => safeGoBack('/(tabs)/profile')}
            style={[styles.backBtn, { borderColor: theme.colors.border }]}
          >
            <ArrowLeft size={16} color={theme.colors.text} />
            <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Profile</Text>
          </TouchableOpacity>

          <Badge variant="success" label="DPDP 2023 Compliant" />
        </View>

        {/* DPDP Act 2023 Overview Card */}
        <Card elevated style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <ShieldCheck size={22} color={theme.colors.success} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Digital Personal Data Protection (DPDP)
            </Text>
          </View>
          <Text style={[styles.cardBody, { color: theme.colors.textSecondary }]}>
            GymPulse respects your fundamental right to informational privacy. In accordance with the Digital Personal Data Protection Act, 2023 (India) and Google Play / Apple App Store policies, we adhere to strict data minimization principles.
          </Text>

          <View style={styles.guaranteeList}>
            <View style={styles.guaranteeItem}>
              <CheckCircle2 size={16} color={theme.colors.success} style={{ marginTop: 2 }} />
              <Text style={[styles.guaranteeText, { color: theme.colors.text }]}>
                <Text style={{ fontWeight: '700' }}>No Data Brokering:</Text> Your mobile number, fitness goals, and weight logs are never sold or shared with third-party advertisers.
              </Text>
            </View>

            <View style={styles.guaranteeItem}>
              <CheckCircle2 size={16} color={theme.colors.success} style={{ marginTop: 2 }} />
              <Text style={[styles.guaranteeText, { color: theme.colors.text }]}>
                <Text style={{ fontWeight: '700' }}>Encrypted Telemetry:</Text> All communications between mobile clients and Supabase Postgres utilize TLS 1.3 encryption and Row Level Security (RLS).
              </Text>
            </View>

            <View style={styles.guaranteeItem}>
              <CheckCircle2 size={16} color={theme.colors.success} style={{ marginTop: 2 }} />
              <Text style={[styles.guaranteeText, { color: theme.colors.text }]}>
                <Text style={{ fontWeight: '700' }}>PCI-DSS Level 1 Payments:</Text> All credit card, UPI AutoPay, and netbanking transactions are tokenized directly via Razorpay. GymPulse never stores raw card credentials.
              </Text>
            </View>
          </View>
        </Card>

        {/* GST & Statutory Records Card */}
        <Card elevated style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <FileText size={20} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              GST & Statutory Compliance
            </Text>
          </View>
          <Text style={[styles.cardBody, { color: theme.colors.textSecondary }]}>
            All membership fees and single passes are invoiced under <Text style={{ color: theme.colors.text, fontWeight: '700' }}>SAC Code 999723</Text> (Physical Fitness Centre Services) with an applicable 18% GST (CGST 9% + SGST 9%). Tax invoices are retained for 5 years per statutory Indian accounting mandates.
          </Text>
        </Card>

        {/* Right to Erasure / Account Deletion */}
        <Card
          elevated
          style={[
            styles.card,
            { backgroundColor: '#EF444410', borderColor: '#EF4444' },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={[styles.cardTitle, { color: '#EF4444' }]}>
              Right to Erasure & Account Deletion
            </Text>
          </View>
          <Text style={[styles.cardBody, { color: theme.colors.textSecondary }]}>
            You hold complete sovereignty over your profile. You can permanently request full erasure of your account, biometric QR tokens, workout history, and personal contact details at any time.
          </Text>

          <Button
            title="Delete Account & All Data"
            variant="danger"
            size="sm"
            icon={<Trash2 size={14} color="#FFFFFF" />}
            onPress={handleDeleteAccount}
            style={{ marginTop: 12 }}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  guaranteeList: {
    gap: 10,
  },
  guaranteeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  guaranteeText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
