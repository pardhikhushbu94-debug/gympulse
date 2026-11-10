import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Input } from '../components/common/Input';
import { Header } from '../components/common/Header';
import { ArrowLeft, Check, Flame, ShieldAlert, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { safeGoBack } from '@/utils/navigation';

export default function DesignSystemScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const [testInput, setTestInput] = useState('');

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="DESIGN SYSTEM" subtitle="Tokens & Component Specifications" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          onPress={() => safeGoBack('/(tabs)')}
          style={[styles.backBtn, { borderColor: theme.colors.border }]}
        >
          <ArrowLeft size={16} color={theme.colors.text} />
          <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Back</Text>
        </TouchableOpacity>

        {/* 1. Theme Status & Toggle */}
        <Card elevated>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>1. Theming Engine</Text>
          <Text style={[styles.sectionDesc, { color: theme.colors.textSecondary }]}>
            Active Mode: <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>{isDark ? 'DARK (Carbon & Volt)' : 'LIGHT (Crisp Slate)'}</Text>
          </Text>
          <Button
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            onPress={toggleTheme}
            variant="secondary"
            style={{ marginTop: 12 }}
          />
        </Card>

        {/* 2. Color Palette */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>2. Brand Color Tokens</Text>
          <View style={styles.colorGrid}>
            {[
              { name: 'Primary (Volt)', hex: theme.colors.primary, textColor: theme.colors.primaryContrast },
              { name: 'Secondary (Heat)', hex: theme.colors.secondary, textColor: '#FFF' },
              { name: 'Background', hex: theme.colors.background, textColor: theme.colors.text },
              { name: 'Card Surface', hex: theme.colors.card, textColor: theme.colors.text },
              { name: 'Border', hex: theme.colors.border, textColor: theme.colors.text },
              { name: 'Success', hex: theme.colors.success, textColor: '#FFF' },
              { name: 'Warning', hex: theme.colors.warning, textColor: '#000' },
              { name: 'Danger', hex: theme.colors.danger, textColor: '#FFF' },
            ].map((c) => (
              <View
                key={c.name}
                style={[
                  styles.colorChip,
                  { backgroundColor: c.hex, borderColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.colorName, { color: c.textColor }]}>{c.name}</Text>
                <Text style={[styles.colorHex, { color: c.textColor }]}>{c.hex}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* 3. Typography Scale */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>3. Typography Scale</Text>
          <Text style={[theme.typography.display, { color: theme.colors.text }]}>Display Bold 34px</Text>
          <Text style={[theme.typography.h1, { color: theme.colors.text, marginTop: 4 }]}>H1 Header 26px</Text>
          <Text style={[theme.typography.h2, { color: theme.colors.text, marginTop: 4 }]}>H2 Subtitle 20px</Text>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 4 }]}>
            Body Regular 15px: Optimized for readability across mobile screens and desktop gym dashboards.
          </Text>
          <Text style={[theme.typography.numberDisplay, { color: theme.colors.primary, marginTop: 6 }]}>
            ₹15,999 • 85 KG • 14 DAYS
          </Text>
        </Card>

        {/* 4. Button Variants */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>4. Button Components</Text>
          <View style={styles.buttonStack}>
            <Button
              title="Primary Action (Volt Glow)"
              variant="primary"
              icon={<Sparkles size={18} color={theme.colors.primaryContrast} />}
              onPress={() => {}}
            />
            <Button
              title="Secondary Action"
              variant="secondary"
              onPress={() => {}}
            />
            <Button
              title="Outline Button"
              variant="outline"
              onPress={() => {}}
            />
            <Button
              title="Danger / Freeze Action"
              variant="danger"
              icon={<ShieldAlert size={18} color="#FFF" />}
              onPress={() => {}}
            />
          </View>
        </Card>

        {/* 5. Status Badges */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>5. Status & Membership Badges</Text>
          <View style={styles.badgeRow}>
            <Badge label="ACTIVE" variant="success" />
            <Badge label="EXPIRING SOON" variant="warning" />
            <Badge label="EXPIRED" variant="danger" />
            <Badge label="FROZEN" variant="neutral" />
            <Badge label="APP DISCOUNT" variant="primary" />
          </View>
        </Card>

        {/* 6. Form Inputs */}
        <Card>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>6. Form Inputs</Text>
          <Input
            label="Mobile Number (India UPI & OTP)"
            placeholder="98765 43210"
            isPhonePrefix
            keyboardType="phone-pad"
            value={testInput}
            onChangeText={setTestInput}
          />
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Sharma"
          />
          <Input
            label="Validation Error State"
            placeholder="Invalid coupon code"
            error="Coupon 'GYM2026' has expired"
            defaultValue="GYM2026"
          />
        </Card>
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  colorChip: {
    width: '47%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 65,
    justifyContent: 'center',
  },
  colorName: {
    fontSize: 12,
    fontWeight: '700',
  },
  colorHex: {
    fontSize: 11,
    opacity: 0.85,
    marginTop: 2,
  },
  buttonStack: {
    gap: 10,
    marginTop: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
});
