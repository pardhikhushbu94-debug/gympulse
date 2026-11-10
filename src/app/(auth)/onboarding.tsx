import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Target, User, Dumbbell, Award, ArrowRight } from 'lucide-react-native';
import { router } from 'expo-router';

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const { updateProfile } = useAuthStore();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('Rajesh Kumar');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [goal, setGoal] = useState<'fat_loss' | 'muscle_gain' | 'strength' | 'general_fitness'>('muscle_gain');
  const [height, setHeight] = useState('178');
  const [weight, setWeight] = useState('76');
  const [emergencyPhone, setEmergencyPhone] = useState('9876543211');

  const handleNext = () => {
    if (step < 3) {
      setStep((s) => s + 1);
    } else {
      updateProfile({
        fullName,
        age: parseInt(age, 10) || 28,
        gender,
        fitnessGoal: goal,
        heightCm: parseFloat(height) || 178,
        weightKg: parseFloat(weight) || 76,
        emergencyContact: {
          name: 'Emergency Contact',
          phone: emergencyPhone,
          relation: 'Family',
        },
      });
      router.replace('/(tabs)');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.stepIndicatorRow}>
          <Text style={[styles.stepLabel, { color: theme.colors.textSecondary }]}>
            Step {step} of 3
          </Text>
          <Text style={[styles.stepTitle, { color: theme.colors.primary }]}>
            {step === 1 ? 'Personal Bio & Goals' : step === 2 ? 'Body Biometrics' : 'Plan Recommendation'}
          </Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: theme.colors.cardElevated }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: theme.colors.primary,
                width: `${(step / 3) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {step === 1 && (
          <Card elevated style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary }]}>
              <User size={28} color={theme.colors.primaryContrast} />
            </View>
            <Text style={[styles.heading, { color: theme.colors.text }]}>
              Tell us about yourself
            </Text>
            <Text style={[styles.subtext, { color: theme.colors.textSecondary }]}>
              We personalize your training splits and nutrition guidance based on this.
            </Text>

            <Input
              label="Full Name"
              placeholder="e.g. Rajesh Kumar"
              value={fullName}
              onChangeText={setFullName}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Input
                  label="Age"
                  placeholder="28"
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.inputLabel, { color: theme.colors.textSecondary }]}>
                  Gender
                </Text>
                <View style={styles.genderRow}>
                  {(['male', 'female'] as const).map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGender(g)}
                      style={[
                        styles.genderBtn,
                        {
                          backgroundColor: gender === g ? theme.colors.primary : theme.colors.cardElevated,
                          borderColor: theme.colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          {
                            color: gender === g ? theme.colors.primaryContrast : theme.colors.text,
                            fontWeight: gender === g ? '700' : '500',
                          },
                        ]}
                      >
                        {g === 'male' ? 'Male' : 'Female'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, marginTop: 12 }]}>
              Primary Fitness Goal
            </Text>
            <View style={styles.goalGrid}>
              {[
                { id: 'fat_loss', label: '🔥 Fat Loss', desc: 'Burn fat & get lean' },
                { id: 'muscle_gain', label: '💪 Hypertrophy', desc: 'Build muscle & mass' },
                { id: 'strength', label: '🏋️ Strength', desc: 'Heavy PRs & power' },
                { id: 'general_fitness', label: '⚡ Athletic Health', desc: 'Stamina & mobility' },
              ].map((g) => {
                const isSelected = goal === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    onPress={() => setGoal(g.id as any)}
                    style={[
                      styles.goalCard,
                      {
                        backgroundColor: isSelected ? theme.colors.cardElevated : theme.colors.card,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.goalTitle,
                        { color: isSelected ? theme.colors.primary : theme.colors.text },
                      ]}
                    >
                      {g.label}
                    </Text>
                    <Text style={[styles.goalDesc, { color: theme.colors.textSecondary }]}>
                      {g.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Card>
        )}

        {step === 2 && (
          <Card elevated style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary }]}>
              <Target size={28} color={theme.colors.primaryContrast} />
            </View>
            <Text style={[styles.heading, { color: theme.colors.text }]}>
              Body Measurements
            </Text>
            <Text style={[styles.subtext, { color: theme.colors.textSecondary }]}>
              Used for BMI and body recomposition tracking (private to you).
            </Text>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Input
                  label="Height (cm)"
                  placeholder="178"
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Input
                  label="Current Weight (kg)"
                  placeholder="76"
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>

            <Input
              label="Emergency Contact Phone"
              isPhonePrefix
              placeholder="98765 43211"
              keyboardType="phone-pad"
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
            />

            <View style={[styles.infoBanner, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                🔒 Emergency contact is strictly kept on file for gym safety protocols.
              </Text>
            </View>
          </Card>
        )}

        {step === 3 && (
          <Card elevated style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primary }]}>
              <Award size={28} color={theme.colors.primaryContrast} />
            </View>
            <Badge label="RECOMMENDED FOR YOU" variant="primary" style={{ marginBottom: 8 }} />
            <Text style={[styles.heading, { color: theme.colors.text }]}>
              6 Months Gold Transformation Plan
            </Text>
            <Text style={[styles.subtext, { color: theme.colors.textSecondary }]}>
              Based on your goal of <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Hypertrophy & Muscle Gain</Text>, our Gold plan includes trainer form checks and body composition scans.
            </Text>

            <View style={[styles.priceTagBox, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
              <Text style={[styles.strikePrice, { color: theme.colors.textMuted }]}>
                Walk-in: ₹11,999
              </Text>
              <Text style={[styles.appPrice, { color: theme.colors.primary }]}>
                App Exclusive: ₹8,999
              </Text>
              <Text style={[styles.saveBadge, { color: theme.colors.success }]}>
                Save ₹3,000 + 15 Days Free Freeze
              </Text>
            </View>

            <View style={styles.perksList}>
              <Text style={[styles.perkItem, { color: theme.colors.text }]}>
                ✓ Unlimited Gym Floor & Free Weights Access
              </Text>
              <Text style={[styles.perkItem, { color: theme.colors.text }]}>
                ✓ Assigned Trainer Form Check: Coach Vikram Sharma
              </Text>
              <Text style={[styles.perkItem, { color: theme.colors.text }]}>
                ✓ Monthly 3D Body Composition Scans
              </Text>
              <Text style={[styles.perkItem, { color: theme.colors.text }]}>
                ✓ Instant Dynamic Anti-Fraud QR Check-in
              </Text>
            </View>
          </Card>
        )}

        <Button
          title={step === 3 ? "Complete Setup & Enter Gym" : "Next Step"}
          onPress={handleNext}
          variant="primary"
          icon={<ArrowRight size={18} color={theme.colors.primaryContrast} />}
          style={{ marginTop: 20 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 20,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtext: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
  },
  genderText: {
    fontSize: 13,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  goalCard: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    minHeight: 80,
    justifyContent: 'center',
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  goalDesc: {
    fontSize: 11,
  },
  infoBanner: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
  },
  infoText: {
    fontSize: 12,
  },
  priceTagBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 14,
  },
  strikePrice: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  appPrice: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 2,
  },
  saveBadge: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  perksList: {
    gap: 8,
  },
  perkItem: {
    fontSize: 13,
    lineHeight: 18,
  },
});
