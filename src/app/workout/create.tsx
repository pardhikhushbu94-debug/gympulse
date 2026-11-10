import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useWorkoutStore } from '../../store/workoutStore';
import { fullExerciseCatalog } from '../../services/workoutService';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  ArrowLeft,
  Plus,
  Dumbbell,
  Check,
  Trash2,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { safeGoBack } from '@/utils/navigation';
import { RoutineExercise } from '../../types/workout';

export default function CreateRoutineScreen() {
  const { theme } = useTheme();
  const { addCustomRoutine } = useWorkoutStore();

  const [title, setTitle] = useState('');
  const [targetMuscle, setTargetMuscle] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>([
    {
      exerciseId: 'ex_bench_press',
      exerciseName: 'Barbell Flat Bench Press',
      muscleGroup: 'chest',
      equipment: 'barbell',
      restSeconds: 90,
      targetSets: [
        { setNumber: 1, targetReps: 10, targetWeightKg: 70 },
        { setNumber: 2, targetReps: 8, targetWeightKg: 80 },
        { setNumber: 3, targetReps: 6, targetWeightKg: 90 },
      ],
    },
  ]);

  const handleAddExercise = (exerciseId: string) => {
    const ex = fullExerciseCatalog.find((e) => e.id === exerciseId);
    if (!ex) return;

    if (selectedExercises.some((s) => s.exerciseId === exerciseId)) {
      Alert.alert('Already Added', `${ex.name} is already in your routine.`);
      return;
    }

    const newEx: RoutineExercise = {
      exerciseId: ex.id,
      exerciseName: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      restSeconds: 60,
      targetSets: [
        { setNumber: 1, targetReps: 10, targetWeightKg: 20 },
        { setNumber: 2, targetReps: 10, targetWeightKg: 25 },
        { setNumber: 3, targetReps: 8, targetWeightKg: 30 },
      ],
    };

    setSelectedExercises([...selectedExercises, newEx]);
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExercises(selectedExercises.filter((e) => e.exerciseId !== exerciseId));
  };

  const handleSaveRoutine = () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please give your routine a name.');
      return;
    }
    if (selectedExercises.length === 0) {
      Alert.alert('No Exercises', 'Please select at least 1 exercise.');
      return;
    }

    const routineId = `routine_custom_${Date.now()}`;
    addCustomRoutine({
      id: routineId,
      title,
      description: `Custom athlete routine targeting ${targetMuscle || 'General Fitness'}.`,
      targetMuscle: targetMuscle || 'Full Body',
      difficulty,
      durationMinutes: selectedExercises.length * 12,
      createdBy: 'member',
      exercises: selectedExercises,
    });

    Alert.alert('Custom Routine Saved', `'${title}' has been added to your workout routines!`, [
      { text: 'OK', onPress: () => safeGoBack('/(tabs)/workouts') },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="BUILD ROUTINE" subtitle="Create Custom Training Split" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          onPress={() => safeGoBack('/(tabs)/workouts')}
          style={[styles.backBtn, { borderColor: theme.colors.border }]}
        >
          <ArrowLeft size={16} color={theme.colors.text} />
          <Text style={[styles.backBtnText, { color: theme.colors.text }]}>Back</Text>
        </TouchableOpacity>

        {/* Basic Routine Information */}
        <Card elevated style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
            Routine Specifications
          </Text>

          <Input
            label="Routine Title"
            placeholder="e.g. Chest & Arm Hypertrophy"
            value={title}
            onChangeText={setTitle}
          />

          <Input
            label="Target Muscle Group"
            placeholder="e.g. Chest, Shoulders, Arms"
            value={targetMuscle}
            onChangeText={setTargetMuscle}
          />

          <Text style={[styles.inputLabel, { color: theme.colors.textSecondary, marginTop: 8 }]}>
            Difficulty Level
          </Text>
          <View style={styles.diffRow}>
            {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setDifficulty(d)}
                style={[
                  styles.diffPill,
                  {
                    backgroundColor: difficulty === d ? theme.colors.primary : theme.colors.cardElevated,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.diffText,
                    {
                      color: difficulty === d ? theme.colors.primaryContrast : theme.colors.text,
                      fontWeight: difficulty === d ? '700' : '500',
                    },
                  ]}
                >
                  {d.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Selected Exercises Stack */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text }]}>
          Prescribed Exercises ({selectedExercises.length})
        </Text>

        {selectedExercises.map((ex, idx) => (
          <Card key={ex.exerciseId} style={styles.selectedExCard}>
            <View style={styles.exCardTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.exIndexText, { color: theme.colors.primary }]}>
                  EXERCISE #{idx + 1}
                </Text>
                <Text style={[styles.exTitle, { color: theme.colors.text }]}>
                  {ex.exerciseName}
                </Text>
                <Text style={[styles.exSub, { color: theme.colors.textSecondary }]}>
                  {ex.targetSets.length} Sets • {ex.equipment} • {ex.restSeconds}s Rest
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => handleRemoveExercise(ex.exerciseId)}
                style={styles.trashBtn}
              >
                <Trash2 size={16} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {/* Add Exercises from Catalog */}
        <Text style={[styles.sectionHeading, { color: theme.colors.text, marginTop: 14 }]}>
          Add From Exercise Catalog
        </Text>

        <View style={styles.catalogGrid}>
          {fullExerciseCatalog.slice(0, 6).map((item) => {
            const isAdded = selectedExercises.some((s) => s.exerciseId === item.id);

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleAddExercise(item.id)}
                disabled={isAdded}
                style={[
                  styles.catalogItem,
                  {
                    backgroundColor: theme.colors.card,
                    borderColor: isAdded ? theme.colors.primary : theme.colors.border,
                    opacity: isAdded ? 0.6 : 1,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.catalogItemName, { color: theme.colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.catalogItemSub, { color: theme.colors.textSecondary }]}>
                    {item.muscleGroup} • {item.equipment}
                  </Text>
                </View>

                {isAdded ? (
                  <Badge label="ADDED" variant="primary" />
                ) : (
                  <Plus size={16} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Save Routine Button */}
        <Button
          title="Save & Add to Routines"
          variant="primary"
          size="lg"
          icon={<Check size={18} color={theme.colors.primaryContrast} />}
          onPress={handleSaveRoutine}
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
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 8,
  },
  diffPill: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  diffText: {
    fontSize: 11,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  selectedExCard: {
    padding: 14,
    marginBottom: 8,
  },
  exCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exIndexText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  exTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  exSub: {
    fontSize: 12,
    marginTop: 2,
  },
  trashBtn: {
    padding: 6,
  },
  catalogGrid: {
    gap: 8,
  },
  catalogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  catalogItemName: {
    fontSize: 14,
    fontWeight: '700',
  },
  catalogItemSub: {
    fontSize: 11,
    marginTop: 1,
  },
});
