import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Header } from '../../components/common/Header';
import { QuickRoleSwitcher } from '../../components/common/QuickRoleSwitcher';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  User,
  CreditCard,
  Moon,
  Sun,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  PhoneCall,
  Trash2,
  Palette,
  Calendar,
} from 'lucide-react-native';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, membership, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Data',
      'As per India DPDP Act and App Store guidelines, this permanently deletes your fitness data, attendance history, and profile. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="MY ACCOUNT" subtitle="Settings & Membership" />
      <QuickRoleSwitcher />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* User Card */}
        <Card elevated style={styles.userCard}>
          <View style={styles.avatarRow}>
            <View style={[styles.avatarBox, { backgroundColor: theme.colors.primary }]}>
              <User size={36} color={theme.colors.primaryContrast} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {user?.fullName || 'Rajesh Kumar'}
              </Text>
              <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
                {user?.email || 'rajesh.kumar@gmail.com'}
              </Text>
              <Text style={[styles.userPhone, { color: theme.colors.textSecondary }]}>
                {user?.phone || '+91 98765 43210'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Membership Details & Invoices */}
        <Card style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <CreditCard size={18} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Active Subscription
            </Text>
          </View>

          <View style={styles.membershipRow}>
            <View>
              <Text style={[styles.planTitle, { color: theme.colors.text }]}>
                {membership?.planName || '6 Months Gold Plan'}
              </Text>
              <Text style={[styles.planDates, { color: theme.colors.textSecondary }]}>
                Valid till Jan 28, 2027 • 42 Days Remaining
              </Text>
            </View>
            <Badge label="ACTIVE" variant="success" />
          </View>

          <TouchableOpacity
            style={[styles.actionRow, { borderTopColor: theme.colors.border }]}
            onPress={() => router.push('/invoices/inv_2026_089' as any)}
          >
            <View style={styles.actionLeft}>
              <FileText size={18} color={theme.colors.primary} />
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                Download GST Invoice / Tax Receipt (PDF)
              </Text>
            </View>
            <ChevronRight size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Preferences */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text, marginBottom: 12 }]}>
            App Preferences & Tools
          </Text>

          {/* Dark / Light Toggle */}
          <View style={[styles.prefRow, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.actionLeft}>
              {isDark ? (
                <Moon size={18} color={theme.colors.primary} />
              ) : (
                <Sun size={18} color={theme.colors.primary} />
              )}
              <View>
                <Text style={[styles.actionText, { color: theme.colors.text }]}>
                  Dark Mode (Carbon & Volt)
                </Text>
                <Text style={[styles.subActionText, { color: theme.colors.textSecondary }]}>
                  {isDark ? 'Athletic high-contrast dark theme' : 'Crisp high-contrast light theme'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.colors.primary }}
              thumbColor={isDark ? theme.colors.primaryContrast : '#f4f3f4'}
            />
          </View>

          {/* Group Classes Navigator */}
          <TouchableOpacity
            style={[styles.prefRow, { borderBottomColor: theme.colors.border }]}
            onPress={() => router.push('/classes' as any)}
          >
            <View style={styles.actionLeft}>
              <Calendar size={18} color={theme.colors.primary} />
              <View>
                <Text style={[styles.actionText, { color: theme.colors.text }]}>
                  Group Studio Classes
                </Text>
                <Text style={[styles.subActionText, { color: theme.colors.textSecondary }]}>
                  Book Yoga, Zumba, HIIT & Crossfit slots
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* Design System Navigator */}
          <TouchableOpacity
            style={[styles.prefRow, { borderBottomColor: theme.colors.border }]}
            onPress={() => router.push('/design-system')}
          >
            <View style={styles.actionLeft}>
              <Palette size={18} color={theme.colors.primary} />
              <View>
                <Text style={[styles.actionText, { color: theme.colors.text }]}>
                  Design System Showcase
                </Text>
                <Text style={[styles.subActionText, { color: theme.colors.textSecondary }]}>
                  Inspect colors, tokens, buttons & inputs
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>

          {/* Emergency Contact */}
          <View style={styles.prefRow}>
            <View style={styles.actionLeft}>
              <PhoneCall size={18} color={theme.colors.primary} />
              <View>
                <Text style={[styles.actionText, { color: theme.colors.text }]}>
                  Emergency Contact
                </Text>
                <Text style={[styles.subActionText, { color: theme.colors.textSecondary }]}>
                  Sunita Kumar (Spouse) • +91 98765 43211
                </Text>
              </View>
            </View>
            <Badge label="VERIFIED" variant="neutral" />
          </View>
        </Card>

        {/* Legal & Compliance */}
        <Card style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text, marginBottom: 8 }]}>
            Legal & Privacy (India DPDP Act)
          </Text>

          <TouchableOpacity
            style={styles.legalItem}
            onPress={() => router.push('/privacy' as any)}
          >
            <Text style={[styles.legalText, { color: theme.colors.textSecondary }]}>
              • Privacy Policy & Health Data Protection →
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.legalItem}
            onPress={() => router.push('/privacy' as any)}
          >
            <Text style={[styles.legalText, { color: theme.colors.textSecondary }]}>
              • Terms of Service & SAC 999723 GST Policy →
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.legalItem}
            onPress={handleDeleteAccount}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Trash2 size={14} color={theme.colors.danger} />
              <Text style={[styles.legalText, { color: theme.colors.danger, fontWeight: '600' }]}>
                Request Account & Data Deletion
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Logout */}
        <Button
          title="Sign Out"
          variant="outline"
          icon={<LogOut size={16} color={theme.colors.primary} />}
          onPress={handleLogout}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
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
  userCard: {
    padding: 16,
    marginBottom: 12,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  card: {
    padding: 16,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  membershipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  planDates: {
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subActionText: {
    fontSize: 11,
    marginTop: 2,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  legalItem: {
    paddingVertical: 6,
  },
  legalText: {
    fontSize: 13,
  },
});
