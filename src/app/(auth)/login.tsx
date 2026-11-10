import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Dumbbell, ShieldCheck, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import { UserRole } from '../../types';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { switchRole } = useAuthStore();

  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [email, setEmail] = useState('rajesh.kumar@gmail.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = () => {
    if (!phoneNumber || phoneNumber.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: phoneNumber },
      });
    }, 400);
  };

  const handleEmailLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      switchRole('member');
      router.replace('/(tabs)');
    }, 400);
  };

  const handleQuickDemo = (role: UserRole) => {
    switchRole(role);
    if (role === 'admin') router.replace('/(admin)');
    else if (role === 'trainer') router.replace('/(trainer)');
    else router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={[styles.logoBadge, { backgroundColor: theme.colors.primary }]}>
            <Dumbbell size={36} color={theme.colors.primaryContrast} />
          </View>
          <Text style={[styles.brandTitle, { color: theme.colors.text }]}>GYMPULSE</Text>
          <Text style={[styles.brandSubtitle, { color: theme.colors.textSecondary }]}>
            India's Premier Local Gym & Fitness Platform
          </Text>
        </View>

        {/* Method Switcher */}
        <View
          style={[
            styles.tabBar,
            { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
          ]}
        >
          <TouchableOpacity
            onPress={() => setAuthMethod('phone')}
            style={[
              styles.tabBtn,
              authMethod === 'phone' && { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    authMethod === 'phone'
                      ? theme.colors.primaryContrast
                      : theme.colors.textSecondary,
                  fontWeight: authMethod === 'phone' ? '700' : '500',
                },
              ]}
            >
              📱 Mobile OTP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setAuthMethod('email')}
            style={[
              styles.tabBtn,
              authMethod === 'email' && { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    authMethod === 'email'
                      ? theme.colors.primaryContrast
                      : theme.colors.textSecondary,
                  fontWeight: authMethod === 'email' ? '700' : '500',
                },
              ]}
            >
              ✉️ Email & Password
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auth Form Card */}
        <Card elevated style={styles.formCard}>
          {authMethod === 'phone' ? (
            <View>
              <Text style={[styles.formHeading, { color: theme.colors.text }]}>
                Sign In with Mobile
              </Text>
              <Text style={[styles.formSubtext, { color: theme.colors.textSecondary }]}>
                We will send a 6-digit verification code to your Indian phone number.
              </Text>

              <Input
                label="Mobile Number"
                isPhonePrefix
                placeholder="98765 43210"
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />

              <Button
                title="Get Verification OTP"
                onPress={handleSendOTP}
                loading={loading}
                variant="primary"
                style={{ marginTop: 12 }}
              />
            </View>
          ) : (
            <View>
              <Text style={[styles.formHeading, { color: theme.colors.text }]}>
                Sign In with Email
              </Text>
              <Text style={[styles.formSubtext, { color: theme.colors.textSecondary }]}>
                Access your member, trainer, or staff account.
              </Text>

              <Input
                label="Email Address"
                placeholder="rajesh.kumar@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <Input
                label="Password"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <Button
                title="Log In"
                onPress={handleEmailLogin}
                loading={loading}
                variant="primary"
                style={{ marginTop: 12 }}
              />
            </View>
          )}
        </Card>

        {/* Instant Demo Role Switcher */}
        <Card style={styles.demoCard}>
          <View style={styles.demoHeader}>
            <Zap size={16} color={theme.colors.primary} />
            <Text style={[styles.demoTitle, { color: theme.colors.text }]}>
              ONE-TAP PREVIEW (DEMO ROLES)
            </Text>
          </View>
          <Text style={[styles.demoSubtext, { color: theme.colors.textSecondary }]}>
            Jump straight into any role with pre-loaded realistic Indian gym data:
          </Text>

          <View style={styles.demoButtons}>
            <Button
              title="👤 Member: Rajesh Kumar (Gold Plan)"
              variant="secondary"
              size="sm"
              onPress={() => handleQuickDemo('member')}
            />
            <Button
              title="🏋️ Trainer: Vikram Sharma (Coach)"
              variant="secondary"
              size="sm"
              onPress={() => handleQuickDemo('trainer')}
            />
            <Button
              title="👑 Admin: Priya Patel (Gym Owner)"
              variant="secondary"
              size="sm"
              onPress={() => handleQuickDemo('admin')}
            />
          </View>
        </Card>

        {/* Footer info & DPDP Compliance */}
        <View style={styles.footer}>
          <ShieldCheck size={16} color={theme.colors.textMuted} />
          <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
            256-bit encrypted • Compliant with India DPDP Act 2023
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 48,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
  },
  formCard: {
    padding: 20,
  },
  formHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  formSubtext: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  demoCard: {
    marginTop: 16,
    padding: 16,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  demoSubtext: {
    fontSize: 12,
    marginBottom: 12,
  },
  demoButtons: {
    gap: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 11,
  },
});
