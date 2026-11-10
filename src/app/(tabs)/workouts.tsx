import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useWorkoutStore } from '../../store/workoutStore';
import { fullExerciseCatalog } from '../../services/workoutService';
import { Header } from '../../components/common/Header';
import { QuickRoleSwitcher } from '../../components/common/QuickRoleSwitcher';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Dumbbell, Plus, Clock, Search, ChevronRight, Play, Flame, Filter } from 'lucide-react-native';
import { router } from 'expo-router';

export default function WorkoutsScreen() {
  const { theme } = useTheme();
  const { routines, startWorkout } = useWorkoutStore();

  const [selectedCategory, setSelectedCategory] = useState<'routines' | 'exercises'>('routines');
  const [searchQuery, setSearchQuery] = useState('');
  const [splitFilter, setSplitFilter] = useState<'all' | 'push' | 'pull' | 'legs'>('all');

  const filteredRoutines = routines.filter((r) => {
    if (splitFilter === 'push') return r.title.toLowerCase().includes('push');
    if (splitFilter === 'pull') return r.title.toLowerCase().includes('pull');
    if (splitFilter === 'legs') return r.title.toLowerCase().includes('leg');
    return true;
  });

  const filteredExercises = fullExerciseCatalog.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.equipment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartRoutine = (routine: any) => {
    startWorkout(routine);
    router.push(`/workout/${routine.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="WORKOUTS" subtitle="Training Splits & Guided Exercise Player" />
      <QuickRoleSwitcher />

      {/* Segment Selector */}
      <View
        style={[
          styles.segmentBar,
          { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => setSelectedCategory('routines')}
          style={[
            styles.segmentBtn,
            selectedCategory === 'routines' && { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              {
                color:
                  selectedCategory === 'routines'
                    ? theme.colors.primaryContrast
                    : theme.colors.textSecondary,
                fontWeight: selectedCategory === 'routines' ? '700' : '500',
              },
            ]}
          >
            🏋️ Routines & Splits ({routines.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedCategory('exercises')}
          style={[
            styles.segmentBtn,
            selectedCategory === 'exercises' && { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              {
                color:
                  selectedCategory === 'exercises'
                    ? theme.colors.primaryContrast
                    : theme.colors.textSecondary,
                fontWeight: selectedCategory === 'exercises' ? '700' : '500',
              },
            ]}
          >
            📖 Exercise Guide ({fullExerciseCatalog.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {selectedCategory === 'routines' ? (
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
                Assigned & Custom Routines
              </Text>
              <Button
                title="+ Build Routine"
                size="sm"
                variant="primary"
                icon={<Plus size={14} color={theme.colors.primaryContrast} />}
                onPress={() => router.push('/workout/create')}
              />
            </View>

            {/* Split Filter Pills */}
            <View style={styles.splitFilterRow}>
              {[
                { id: 'all', label: 'All Splits' },
                { id: 'push', label: 'Push Day' },
                { id: 'pull', label: 'Pull Day' },
                { id: 'legs', label: 'Legs' },
              ].map((pill) => (
                <TouchableOpacity
                  key={pill.id}
                  onPress={() => setSplitFilter(pill.id as any)}
                  style={[
                    styles.splitPill,
                    {
                      backgroundColor: splitFilter === pill.id ? theme.colors.primary : theme.colors.cardElevated,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.splitPillText,
                      {
                        color: splitFilter === pill.id ? theme.colors.primaryContrast : theme.colors.textSecondary,
                        fontWeight: splitFilter === pill.id ? '700' : '500',
                      },
                    ]}
                  >
                    {pill.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredRoutines.map((routine) => (
              <Card elevated key={routine.id} style={styles.routineCard}>
                <View style={styles.routineTopRow}>
                  <Badge
                    label={routine.difficulty.toUpperCase()}
                    variant={routine.difficulty === 'advanced' ? 'danger' : 'primary'}
                  />
                  <View style={styles.durationRow}>
                    <Clock size={14} color={theme.colors.textSecondary} />
                    <Text style={[styles.durationText, { color: theme.colors.textSecondary }]}>
                      {routine.durationMinutes} mins
                    </Text>
                  </View>
                </View>

                <Text style={[styles.routineTitle, { color: theme.colors.text }]}>
                  {routine.title}
                </Text>
                <Text style={[styles.routineDesc, { color: theme.colors.textSecondary }]}>
                  {routine.description}
                </Text>

                <View style={[styles.routineMetaBox, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
                  <Text style={[styles.metaText, { color: theme.colors.text }]}>
                    🎯 Target: <Text style={{ fontWeight: '700' }}>{routine.targetMuscle}</Text>
                  </Text>
                  <Text style={[styles.metaText, { color: theme.colors.textSecondary }]}>
                    {routine.exercises.length} Exercises
                  </Text>
                </View>

                {/* Exercises preview pills */}
                <View style={styles.exPillsRow}>
                  {routine.exercises.map((ex, idx) => (
                    <View
                      key={idx}
                      style={[styles.miniExPill, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}
                    >
                      <Text style={[styles.miniExPillText, { color: theme.colors.textSecondary }]}>
                        {idx + 1}. {ex.exerciseName.split(' ')[0]}
                      </Text>
                    </View>
                  ))}
                </View>

                <Button
                  title="Start Guided Workout"
                  variant="primary"
                  size="md"
                  icon={<Play size={15} color={theme.colors.primaryContrast} fill={theme.colors.primaryContrast} />}
                  onPress={() => handleStartRoutine(routine)}
                  style={{ marginTop: 12 }}
                />
              </Card>
            ))}
          </View>
        ) : (
          <View>
            {/* Search Input */}
            <View
              style={[
                styles.searchBox,
                { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border },
              ]}
            >
              <Search size={18} color={theme.colors.textSecondary} />
              <TextInput
                placeholder="Search exercises by name, muscle, equipment..."
                placeholderTextColor={theme.colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={[styles.searchInput, { color: theme.colors.text }]}
              />
            </View>

            {filteredExercises.map((ex) => (
              <Card key={ex.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.exerciseName, { color: theme.colors.text }]}>
                      {ex.name}
                    </Text>
                    <View style={styles.tagRow}>
                      <Badge label={ex.muscleGroup.toUpperCase()} variant="primary" />
                      <Badge label={ex.equipment.toUpperCase()} variant="neutral" />
                      <Badge label={ex.difficulty.toUpperCase()} variant="neutral" />
                    </View>
                  </View>
                </View>

                {/* Key Form Cues */}
                <Text style={[styles.cueHeading, { color: theme.colors.textSecondary }]}>
                  Key Execution Instructions:
                </Text>
                {ex.instructions.map((inst, idx) => (
                  <Text key={idx} style={[styles.cueText, { color: theme.colors.text }]}>
                    {idx + 1}. {inst}
                  </Text>
                ))}

                <View style={[styles.mistakeBox, { backgroundColor: theme.isDark ? '#2B1212' : '#FEE2E2' }]}>
                  <Text style={[styles.mistakeText, { color: theme.colors.danger }]}>
                    ⚠️ Common Mistake: {ex.commonMistakes[0]}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}
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
  segmentBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  splitFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  splitPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  splitPillText: {
    fontSize: 11,
  },
  routineCard: {
    padding: 16,
    marginBottom: 14,
  },
  routineTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    fontSize: 12,
  },
  routineTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  routineDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  routineMetaBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  metaText: {
    fontSize: 12,
  },
  exPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  miniExPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  miniExPillText: {
    fontSize: 11,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 14,
    height: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  exerciseCard: {
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  cueHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 4,
  },
  cueText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  mistakeBox: {
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  mistakeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
