import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../theme/ThemeContext';
import { useAuthStore } from '../../store/authStore';
import { useNutritionStore } from '../../store/nutritionStore';
import { Header } from '../../components/common/Header';
import { QuickRoleSwitcher } from '../../components/common/QuickRoleSwitcher';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  TrendingUp,
  Trophy,
  Calendar,
  Flame,
  Scale,
  Plus,
  CheckCircle2,
  Utensils,
  BookOpen,
  Bell,
  Ruler,
  ChevronRight,
  Sparkles,
} from 'lucide-react-native';

export default function ProgressScreen() {
  const { theme } = useTheme();
  const { user, updateProfile } = useAuthStore();
  const { measurements, logMeasurement, notifications } = useNutritionStore();

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const latestMeasurement = measurements[0];

  const [weightInput, setWeightInput] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);

  // Measurement logging form state
  const [showMeasureModal, setShowMeasureModal] = useState(false);
  const [chestInput, setChestInput] = useState('');
  const [armsInput, setArmsInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [thighsInput, setThighsInput] = useState('');
  const [fatInput, setFatInput] = useState('');

  const [weightHistory, setWeightHistory] = useState([
    { date: 'Nov 09', weight: 76.5 },
    { date: 'Nov 02', weight: 77.0 },
    { date: 'Oct 26', weight: 77.6 },
    { date: 'Oct 19', weight: 78.4 },
    { date: 'Oct 12', weight: 79.1 },
  ]);

  const handleSaveWeight = () => {
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 30 && val < 250) {
      setWeightHistory([{ date: 'Today', weight: val }, ...weightHistory]);
      updateProfile({ weightKg: val });
      setWeightInput('');
      setShowLogModal(false);
    }
  };

  const handleSaveMeasurements = () => {
    const chest = parseFloat(chestInput) || latestMeasurement?.chestInches || 41.5;
    const arms = parseFloat(armsInput) || latestMeasurement?.armsInches || 15.5;
    const waist = parseFloat(waistInput) || latestMeasurement?.waistInches || 32.5;
    const thighs = parseFloat(thighsInput) || latestMeasurement?.thighsInches || 23.0;
    const fat = parseFloat(fatInput) || latestMeasurement?.bodyFatPct || 16.0;

    logMeasurement({
      date: 'Today',
      weightKg: user?.weightKg || 76.5,
      chestInches: chest,
      armsInches: arms,
      waistInches: waist,
      thighsInches: thighs,
      bodyFatPct: fat,
    });

    setChestInput('');
    setArmsInput('');
    setWaistInput('');
    setThighsInput('');
    setFatInput('');
    setShowMeasureModal(false);

    Alert.alert('Measurements Logged!', 'Your new body circumferences have been updated.');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="GOALS & PROGRESS" subtitle="Strength Records & Weight Tracking" />
      <QuickRoleSwitcher />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Hub Shortcuts Banner: Diet, Programs, Notifications */}
        <View style={styles.hubShortcutsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/diet' as any)}
            style={[
              styles.hubShortcutCard,
              { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
            ]}
          >
            <View style={[styles.hubIconCircle, { backgroundColor: '#10B98120' }]}>
              <Utensils size={18} color="#10B981" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.hubTitle, { color: theme.colors.text }]}>
                Indian Diet
              </Text>
              <Text style={[styles.hubSub, { color: theme.colors.textSecondary }]}>
                Desi Macros & Hydration
              </Text>
            </View>
            <ChevronRight size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/programs' as any)}
            style={[
              styles.hubShortcutCard,
              { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
            ]}
          >
            <View style={[styles.hubIconCircle, { backgroundColor: theme.colors.primary + '20' }]}>
              <BookOpen size={18} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.hubTitle, { color: theme.colors.text }]}>
                Programs
              </Text>
              <Text style={[styles.hubSub, { color: theme.colors.textSecondary }]}>
                4 to 12 Week Splits
              </Text>
            </View>
            <ChevronRight size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/notifications' as any)}
            style={[
              styles.hubShortcutCard,
              { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
            ]}
          >
            <View style={[styles.hubIconCircle, { backgroundColor: '#38BDF820' }]}>
              <Bell size={18} color="#38BDF8" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.hubTitle, { color: theme.colors.text }]}>
                  Alerts & Nudges
                </Text>
                {unreadNotifs > 0 && (
                  <Badge variant="primary" label={`${unreadNotifs} New`} />
                )}
              </View>
              <Text style={[styles.hubSub, { color: theme.colors.textSecondary }]}>
                Trainer updates & expiry
              </Text>
            </View>
            <ChevronRight size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Weight & Recomp Card */}
        <Card elevated style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
              <Scale size={20} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Body Weight & Recomp
              </Text>
            </View>
            <Button
              title="+ Log Weight"
              size="sm"
              variant="outline"
              onPress={() => setShowLogModal(!showLogModal)}
            />
          </View>

          <View style={styles.weightDisplayRow}>
            <View>
              <Text style={[styles.currentWeightNum, { color: theme.colors.text }]}>
                {user?.weightKg || 76.5}{' '}
                <Text style={{ fontSize: 16, color: theme.colors.textSecondary }}>KG</Text>
              </Text>
              <Text style={[styles.weightTrendText, { color: theme.colors.success }]}>
                ↓ -2.6 kg over past 30 days
              </Text>
            </View>

            <View
              style={[
                styles.bmiPill,
                { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.bmiLabel, { color: theme.colors.textSecondary }]}>BMI</Text>
              <Text style={[styles.bmiValue, { color: theme.colors.primary }]}>24.1</Text>
              <Text style={[styles.bmiStatus, { color: theme.colors.success }]}>Normal</Text>
            </View>
          </View>

          {showLogModal && (
            <View
              style={[
                styles.logInputBox,
                { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
              ]}
            >
              <Input
                label="Enter Today's Morning Weight (KG)"
                placeholder="76.2"
                keyboardType="numeric"
                value={weightInput}
                onChangeText={setWeightInput}
              />
              <Button
                title="Save Weight Entry"
                variant="primary"
                size="sm"
                onPress={handleSaveWeight}
              />
            </View>
          )}

          {/* Simple Sparkline / Weight History Chips */}
          <View style={styles.historyChipsRow}>
            {weightHistory.slice(0, 4).map((entry, idx) => (
              <View
                key={idx}
                style={[
                  styles.weightChip,
                  { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.chipDate, { color: theme.colors.textSecondary }]}>
                  {entry.date}
                </Text>
                <Text style={[styles.chipWeight, { color: theme.colors.text }]}>
                  {entry.weight} kg
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Body Measurements Tracker */}
        <Card elevated style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleRow}>
              <Ruler size={20} color="#38BDF8" />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                Body Measurements
              </Text>
            </View>
            <Button
              title="+ Log Tape"
              size="sm"
              variant="outline"
              onPress={() => setShowMeasureModal(!showMeasureModal)}
            />
          </View>

          <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
            Key anthropometric circumferences (inches) & body fat percentage.
          </Text>

          {/* Measurements Grid */}
          <View style={styles.measureGrid}>
            <View
              style={[
                styles.measureBox,
                { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.measureLabel, { color: theme.colors.textSecondary }]}>
                CHEST
              </Text>
              <Text style={[styles.measureVal, { color: theme.colors.text }]}>
                {latestMeasurement?.chestInches || 41.5}&quot;
              </Text>
              <Text style={[styles.measureSub, { color: theme.colors.success }]}>
                +0.5&quot; (40d)
              </Text>
            </View>

            <View
              style={[
                styles.measureBox,
                { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.measureLabel, { color: theme.colors.textSecondary }]}>
                ARMS (FLEXED)
              </Text>
              <Text style={[styles.measureVal, { color: theme.colors.text }]}>
                {latestMeasurement?.armsInches || 15.5}&quot;
              </Text>
              <Text style={[styles.measureSub, { color: theme.colors.success }]}>
                +0.3&quot; (40d)
              </Text>
            </View>

            <View
              style={[
                styles.measureBox,
                { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.measureLabel, { color: theme.colors.textSecondary }]}>
                WAIST (NAVEL)
              </Text>
              <Text style={[styles.measureVal, { color: theme.colors.text }]}>
                {latestMeasurement?.waistInches || 32.5}&quot;
              </Text>
              <Text style={[styles.measureSub, { color: theme.colors.success }]}>
                -1.5&quot; (40d)
              </Text>
            </View>

            <View
              style={[
                styles.measureBox,
                { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.measureLabel, { color: theme.colors.textSecondary }]}>
                BODY FAT
              </Text>
              <Text style={[styles.measureVal, { color: '#FBBF24' }]}>
                {latestMeasurement?.bodyFatPct || 16.2}%
              </Text>
              <Text style={[styles.measureSub, { color: theme.colors.success }]}>
                -1.8% Leaner
              </Text>
            </View>
          </View>

          {/* Form to Log Measurements */}
          {showMeasureModal && (
            <View
              style={[
                styles.measureFormBox,
                { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
              ]}
            >
              <Text style={[styles.formHeading, { color: theme.colors.text }]}>
                Log New Tape Measurements
              </Text>

              <View style={styles.formInputsRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Chest (Inches)"
                    placeholder="41.5"
                    keyboardType="numeric"
                    value={chestInput}
                    onChangeText={setChestInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Arms (Inches)"
                    placeholder="15.5"
                    keyboardType="numeric"
                    value={armsInput}
                    onChangeText={setArmsInput}
                  />
                </View>
              </View>

              <View style={styles.formInputsRow}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Waist (Inches)"
                    placeholder="32.5"
                    keyboardType="numeric"
                    value={waistInput}
                    onChangeText={setWaistInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Body Fat %"
                    placeholder="16.0"
                    keyboardType="numeric"
                    value={fatInput}
                    onChangeText={setFatInput}
                  />
                </View>
              </View>

              <Button
                title="Save Circumferences"
                variant="primary"
                size="sm"
                onPress={handleSaveMeasurements}
              />
            </View>
          )}
        </Card>

        {/* Personal Records (PRs) */}
        <Card elevated style={styles.card}>
          <View style={styles.headerTitleRow}>
            <Trophy size={20} color="#FF6B00" />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              Hall of PRs (Personal Records)
            </Text>
          </View>
          <Text style={[styles.cardSub, { color: theme.colors.textSecondary }]}>
            Verified by trainer or logged in guided workout player.
          </Text>

          <View style={styles.prGrid}>
            {[
              { lift: 'Barbell Flat Bench', pr: '100 KG', date: '3 days ago', badge: '1RM' },
              { lift: 'Barbell Back Squat', pr: '140 KG', date: 'Last week', badge: '1RM' },
              { lift: 'Conventional Deadlift', pr: '180 KG', date: '2 weeks ago', badge: '1RM' },
              { lift: 'Overhead Press', pr: '62.5 KG', date: 'Oct 28', badge: '3RM' },
            ].map((item) => (
              <View
                key={item.lift}
                style={[
                  styles.prBox,
                  { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                ]}
              >
                <View style={styles.prTop}>
                  <Text style={[styles.prLiftName, { color: theme.colors.textSecondary }]}>
                    {item.lift}
                  </Text>
                  <Badge label={item.badge} variant="primary" />
                </View>
                <Text style={[styles.prValue, { color: theme.colors.primary }]}>
                  {item.pr}
                </Text>
                <Text style={[styles.prDate, { color: theme.colors.textMuted }]}>
                  {item.date}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Attendance Heatmap / Consistency */}
        <Card style={styles.card}>
          <View style={styles.headerTitleRow}>
            <Calendar size={20} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
              November Consistency Matrix
            </Text>
          </View>

          <View style={styles.heatmapRow}>
            {Array.from({ length: 14 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.heatCell,
                  { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.heatCellText}>{i + 1}</Text>
              </View>
            ))}
            {Array.from({ length: 16 }).map((_, i) => (
              <View
                key={i + 14}
                style={[
                  styles.heatCell,
                  { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.heatCellText, { color: theme.colors.textMuted }]}>
                  {i + 15}
                </Text>
              </View>
            ))}
          </View>
          <Text style={[styles.heatLegend, { color: theme.colors.textSecondary }]}>
            🟢 14 Consecutive Days Logged in Nov • 100% Attendance Target Met
          </Text>
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
    paddingBottom: 40,
  },
  hubShortcutsRow: {
    gap: 8,
    marginBottom: 14,
  },
  hubShortcutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  hubIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  hubSub: {
    fontSize: 12,
    marginTop: 1,
  },
  card: {
    padding: 18,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 12,
    marginBottom: 12,
    marginTop: 2,
  },
  weightDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  currentWeightNum: {
    fontSize: 28,
    fontWeight: '900',
  },
  weightTrendText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  bmiPill: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  bmiLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  bmiValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  bmiStatus: {
    fontSize: 11,
    fontWeight: '700',
  },
  logInputBox: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 12,
    gap: 8,
  },
  historyChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  weightChip: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  chipDate: {
    fontSize: 11,
    marginBottom: 2,
  },
  chipWeight: {
    fontSize: 14,
    fontWeight: '700',
  },
  measureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  measureBox: {
    width: '48.5%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  measureLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  measureVal: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  measureSub: {
    fontSize: 11,
    fontWeight: '600',
  },
  measureFormBox: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    gap: 8,
  },
  formHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  formInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  prGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  prBox: {
    width: '48.5%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  prTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  prLiftName: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  prValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  prDate: {
    fontSize: 10,
    marginTop: 4,
  },
  heatmapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 12,
  },
  heatCell: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heatCellText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  heatLegend: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
