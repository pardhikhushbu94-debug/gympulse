import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { safeGoBack } from '@/utils/navigation';

export default function OTPScreen() {
  const { theme } = useTheme();
  const { switchRole } = useAuthStore();
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = params.phone || '9876543210';

  const [otp, setOtp] = useState('123456');
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      switchRole('member');
      router.replace('/(auth)/onboarding');
    }, 400);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity
        onPress={() => safeGoBack('/(auth)/login')}
        style={[styles.backBtn, { borderColor: theme.colors.border }]}
      >
        <ArrowLeft size={18} color={theme.colors.text} />
        <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Back</Text>
      </TouchableOpacity>

      <Card elevated style={styles.card}>
        <View style={[styles.iconBox, { backgroundColor: theme.colors.primary }]}>
          <CheckCircle2 size={32} color={theme.colors.primaryContrast} />
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          Verify Mobile Number
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Enter the 6-digit code sent via SMS to{' '}
          <Text style={{ color: theme.colors.text, fontWeight: '700' }}>
            +91 {phone}
          </Text>
        </Text>

        <Input
          label="Verification Code (OTP)"
          placeholder="123456"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          style={styles.otpInput}
        />

        <Button
          title="Verify & Continue"
          onPress={handleVerify}
          loading={loading}
          variant="primary"
          style={{ marginTop: 12 }}
        />

        <View style={styles.resendContainer}>
          {timer > 0 ? (
            <Text style={[styles.timerText, { color: theme.colors.textMuted }]}>
              Resend code in {timer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={() => setTimer(30)}>
              <Text style={[styles.resendBtnText, { color: theme.colors.primary }]}>
                Resend OTP
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 56,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 24,
    gap: 6,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    padding: 24,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  otpInput: {
    fontSize: 20,
    letterSpacing: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  timerText: {
    fontSize: 13,
  },
  resendBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
