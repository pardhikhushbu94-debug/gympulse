import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useWorkoutStore } from '../../store/workoutStore';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Trophy,
  Flame,
  Clock,
  Dumbbell,
  Share2,
  Home,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import { router } from 'expo-router';

export default function WorkoutSummaryScreen() {
  const { theme } = useTheme();
  const { lastCompletedSession, workoutHistory } = useWorkoutStore();

  const session = lastCompletedSession || workoutHistory[0];

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Workout Completed at IronCore Fitness',
        message: `I just crushed ${session.workoutTitle} at IronCore Fitness Gym!\n💪 Volume: ${session.totalVolumeKg.toLocaleString('en-IN')} KG lifted\n⏱️ Duration: ${session.durationMinutes} mins\n🔥 ${session.caloriesEstimated} kcal burned\n#GymPulse #IronCoreFitness #FitnessIndia`,
      });
    } catch (e) {
      // Ignored
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="WORKOUT FINISHED" subtitle="Training Log & Personal Records" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Celebration Trophy Banner */}
        <Card elevated style={styles.celebrationCard}>
          <View style={[styles.trophyBox, { backgroundColor: theme.colors.primary }]}>
            <Trophy size={42} color={theme.colors.primaryContrast} />
          </View>

          <Badge label="SESSION COMPLETE" variant="primary" style={{ marginBottom: 6 }} />
          <Text style={[styles.celebrationTitle, { color: theme.colors.text }]}>
            Workout Crushed!
          </Text>
          <Text style={[styles.celebrationSub, { color: theme.colors.textSecondary }]}>
            {session.workoutTitle}
          </Text>

          {/* PR Achieved Callout */}
          {session.prsAchieved.length > 0 && (
            <View style={[styles.prBanner, { backgroundColor: theme.isDark ? '#2E1805' : '#FEF3C7', borderColor: '#FF6B00' }]}>
              <Sparkles size={18} color="#FF6B00" />
              <View style={{ flex: 1 }}>
                <Text style={styles.prBannerTitle}>NEW PERSONAL RECORD DETECTED!</Text>
                <Text style={styles.prBannerText}>{session.prsAchieved[0]}</Text>
              </View>
            </View>
          )}

          {/* Stats Grid */}
          <View style={[styles.statsGrid, { borderColor: theme.colors.border }]}>
            <View style={styles.statBox}>
              <Dumbbell size={18} color={theme.colors.primary} />
              <Text style={[styles.statVal, { color: theme.colors.text }]}>
                {session.totalVolumeKg.toLocaleString('en-IN')} <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>KG</Text>
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Total Tonnage
              </Text>
            </View>

            <View style={[styles.vDivider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.statBox}>
              <Clock size={18} color="#3B82F6" />
              <Text style={[styles.statVal, { color: theme.colors.text }]}>
                {session.durationMinutes} <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>MIN</Text>
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Duration
              </Text>
            </View>

            <View style={[styles.vDivider, { backgroundColor: theme.colors.border }]} />

            <View style={styles.statBox}>
              <Flame size={18} color="#FF6B00" />
              <Text style={[styles.statVal, { color: theme.colors.text }]}>
                {session.caloriesEstimated} <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>KCAL</Text>
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Est. Burn
              </Text>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Button
            title="Share Workout"
            variant="outline"
            icon={<Share2 size={16} color={theme.colors.primary} />}
            onPress={handleShare}
            style={{ flex: 1, marginRight: 6 }}
          />

          <Button
            title="Return to Home"
            variant="primary"
            icon={<Home size={16} color={theme.colors.primaryContrast} />}
            onPress={() => router.replace('/(tabs)')}
            style={{ flex: 1, marginLeft: 6 }}
          />
        </View>

        {/* Motivational Quote */}
        <Card style={styles.quoteCard}>
          <Text style={[styles.quoteText, { color: theme.colors.text }]}>
            "Consistency is the true driver of transformation. Another step closer to your fitness goals."
          </Text>
          <Text style={[styles.quoteAuthor, { color: theme.colors.textSecondary }]}>
            — Coach Vikram Sharma, Head Strength Coach
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
    paddingBottom: 48,
  },
  celebrationCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  trophyBox: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  celebrationTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  celebrationSub: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 16,
  },
  prBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    width: '100%',
    marginBottom: 16,
  },
  prBannerTitle: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  prBannerText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  statBox: {
    alignItems: 'center',
    gap: 4,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
  },
  vDivider: {
    width: 1,
    height: 36,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  quoteCard: {
    padding: 16,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  quoteAuthor: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
});
