import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { safeGoBack } from '../../utils/navigation';
import { useTheme } from '../../theme/ThemeContext';
import { useWorkoutStore } from '../../store/workoutStore';
import { fullExerciseCatalog } from '../../services/workoutService';
import { Header } from '../../components/common/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import {
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Info,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Plus,
  Minus,
} from 'lucide-react-native';

export default function WorkoutPlayerScreen() {
  const { theme } = useTheme();
  const params = useLocalSearchParams<{ id: string }>();
  const {
    routines,
    activeWorkout,
    activeExerciseIndex,
    loggedSets,
    isResting,
    activeRestSeconds,
    startWorkout,
    setActiveExerciseIndex,
    updateSetValues,
    completeSet,
    decrementRestTimer,
    skipRestTimer,
    addRestSeconds,
    finishWorkout,
  } = useWorkoutStore();

  const [showCues, setShowCues] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Initialize routine if not active
  useEffect(() => {
    if (!activeWorkout) {
      const routine = routines.find((r) => r.id === params.id) || routines[0];
      startWorkout(routine);
    }
  }, [activeWorkout, params.id, routines, startWorkout]);

  // Workout duration stopwatch
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Rest timer countdown
  useEffect(() => {
    if (isResting && activeRestSeconds > 0) {
      const timer = setInterval(() => {
        decrementRestTimer();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isResting, activeRestSeconds, decrementRestTimer]);

  if (!activeWorkout) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Loading workout...</Text>
      </View>
    );
  }

  const currentExercise = activeWorkout.exercises[activeExerciseIndex];
  const nextExercise = activeWorkout.exercises[activeExerciseIndex + 1];
  const exerciseDetail = fullExerciseCatalog.find((e) => e.id === currentExercise.exerciseId);

  const currentSets = loggedSets.filter((s) => s.exerciseId === currentExercise.exerciseId);

  const formatStopwatch = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinish = () => {
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to wrap up this workout session and log your PRs?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish & View Summary',
          style: 'default',
          onPress: () => {
            const summary = finishWorkout();
            if (summary) {
              router.replace('/workout/summary');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Player Control Bar */}
      <View style={[styles.playerHeader, { backgroundColor: theme.colors.cardElevated, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => safeGoBack('/(tabs)/workouts')}
          style={styles.closeBtn}
        >
          <X size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.routineTitle, { color: theme.colors.text }]}>
            {activeWorkout.title}
          </Text>
          <View style={styles.stopwatchRow}>
            <Clock size={14} color={theme.colors.primary} />
            <Text style={[styles.stopwatchText, { color: theme.colors.primary }]}>
              {formatStopwatch(elapsedSeconds)}
            </Text>
            <Text style={[styles.exerciseCounter, { color: theme.colors.textSecondary }]}>
              • Exercise {activeExerciseIndex + 1}/{activeWorkout.exercises.length}
            </Text>
          </View>
        </View>

        <Button
          title="Finish"
          size="sm"
          variant="primary"
          onPress={handleFinish}
        />
      </View>

      {/* Floating Rest Countdown Banner (shows when resting) */}
      {isResting && activeRestSeconds > 0 && (
        <View style={[styles.restBanner, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.primary }]}>
          <View style={styles.restLeft}>
            <RotateCcw size={18} color={theme.colors.primary} />
            <View>
              <Text style={[styles.restTitle, { color: theme.colors.text }]}>
                REST INTERVAL
              </Text>
              <Text style={[styles.restSecondsBig, { color: theme.colors.primary }]}>
                {activeRestSeconds}s <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>remaining</Text>
              </Text>
            </View>
          </View>

          <View style={styles.restActionBtns}>
            <TouchableOpacity
              onPress={() => addRestSeconds(30)}
              style={[styles.restPill, { borderColor: theme.colors.border }]}
            >
              <Text style={[styles.restPillText, { color: theme.colors.text }]}>+30s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={skipRestTimer}
              style={[styles.skipPill, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={[styles.skipPillText, { color: theme.colors.primaryContrast }]}>
                Skip Rest
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Exercise Information Card */}
        <Card elevated style={styles.exerciseCard}>
          <View style={styles.exerciseHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.exerciseName, { color: theme.colors.text }]}>
                {currentExercise.exerciseName}
              </Text>
              <View style={styles.exerciseBadges}>
                <Badge label={currentExercise.muscleGroup.toUpperCase()} variant="primary" />
                <Badge label={currentExercise.equipment.toUpperCase()} variant="neutral" />
                <Badge label={`${currentExercise.restSeconds}s REST`} variant="neutral" />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowCues(!showCues)}
              style={[styles.infoToggleBtn, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}
            >
              <Info size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Expandable Form Guidance */}
          {showCues && exerciseDetail && (
            <View style={[styles.cuesBox, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
              <Text style={[styles.cuesHeading, { color: theme.colors.text }]}>
                Coach Vikram's Key Form Cues:
              </Text>
              {exerciseDetail.targetCues.map((cue, idx) => (
                <Text key={idx} style={[styles.cueLine, { color: theme.colors.primary }]}>
                  ✓ {cue}
                </Text>
              ))}

              <Text style={[styles.cuesHeading, { color: theme.colors.danger, marginTop: 10 }]}>
                Avoid Common Mistake:
              </Text>
              <Text style={[styles.cueLine, { color: theme.colors.textSecondary }]}>
                ⚠️ {exerciseDetail.commonMistakes[0]}
              </Text>
            </View>
          )}

          {currentExercise.notes && (
            <Text style={[styles.exerciseNotes, { color: theme.colors.textSecondary }]}>
              💡 Note: {currentExercise.notes}
            </Text>
          )}
        </Card>

        {/* Set Logger Table */}
        <Card elevated style={styles.setTableCard}>
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.colSet, { color: theme.colors.textMuted }]}>SET</Text>
            <Text style={[styles.colPrev, { color: theme.colors.textMuted }]}>PREV</Text>
            <Text style={[styles.colWeight, { color: theme.colors.textMuted }]}>KG</Text>
            <Text style={[styles.colReps, { color: theme.colors.textMuted }]}>REPS</Text>
            <Text style={[styles.colCheck, { color: theme.colors.textMuted }]}>DONE</Text>
          </View>

          {currentSets.map((s) => {
            const isCompleted = s.completed;

            return (
              <View
                key={s.setNumber}
                style={[
                  styles.setRow,
                  {
                    borderBottomColor: theme.colors.border,
                    backgroundColor: isCompleted
                      ? theme.isDark
                        ? 'rgba(204, 255, 0, 0.06)'
                        : '#F0FDF4'
                      : 'transparent',
                  },
                ]}
              >
                {/* Set Number */}
                <View style={styles.colSetBox}>
                  <Text
                    style={[
                      styles.setNumText,
                      { color: isCompleted ? theme.colors.primary : theme.colors.text },
                    ]}
                  >
                    {s.setNumber}
                  </Text>
                  {s.isPR && (
                    <View style={styles.prMiniBadge}>
                      <Text style={styles.prMiniText}>PR!</Text>
                    </View>
                  )}
                </View>

                {/* Previous Weight Reference */}
                <View style={styles.colPrevBox}>
                  <Text style={[styles.prevText, { color: theme.colors.textMuted }]}>
                    {s.weightKg}k × {s.reps}
                  </Text>
                </View>

                {/* Weight Input with Stepper */}
                <View style={styles.colWeightBox}>
                  <View style={[styles.inputStepper, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
                    <TouchableOpacity
                      onPress={() => updateSetValues(s.exerciseId, s.setNumber, Math.max(0, s.weightKg - 2.5), s.reps)}
                      style={styles.stepBtn}
                    >
                      <Minus size={12} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    <Text style={[styles.weightInputText, { color: theme.colors.text }]}>
                      {s.weightKg}
                    </Text>

                    <TouchableOpacity
                      onPress={() => updateSetValues(s.exerciseId, s.setNumber, s.weightKg + 2.5, s.reps)}
                      style={styles.stepBtn}
                    >
                      <Plus size={12} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Reps Input with Stepper */}
                <View style={styles.colRepsBox}>
                  <View style={[styles.inputStepper, { backgroundColor: theme.colors.cardElevated, borderColor: theme.colors.border }]}>
                    <TouchableOpacity
                      onPress={() => updateSetValues(s.exerciseId, s.setNumber, s.weightKg, Math.max(1, s.reps - 1))}
                      style={styles.stepBtn}
                    >
                      <Minus size={12} color={theme.colors.textSecondary} />
                    </TouchableOpacity>

                    <Text style={[styles.weightInputText, { color: theme.colors.text }]}>
                      {s.reps}
                    </Text>

                    <TouchableOpacity
                      onPress={() => updateSetValues(s.exerciseId, s.setNumber, s.weightKg, s.reps + 1)}
                      style={styles.stepBtn}
                    >
                      <Plus size={12} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Done Checkbox */}
                <View style={styles.colCheckBox}>
                  <TouchableOpacity
                    onPress={() =>
                      completeSet(
                        s.exerciseId,
                        s.exerciseName,
                        s.setNumber,
                        s.weightKg,
                        s.reps,
                        currentExercise.restSeconds
                      )
                    }
                    style={[
                      styles.checkCircleBtn,
                      {
                        backgroundColor: isCompleted ? theme.colors.primary : theme.colors.cardElevated,
                        borderColor: isCompleted ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <CheckCircle2
                      size={20}
                      color={isCompleted ? theme.colors.primaryContrast : theme.colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </Card>

        {/* Stepper Navigation between Exercises */}
        <View style={styles.stepperNavRow}>
          <Button
            title="Prev Exercise"
            variant="secondary"
            size="sm"
            icon={<ChevronLeft size={16} color={theme.colors.text} />}
            disabled={activeExerciseIndex === 0}
            onPress={() => setActiveExerciseIndex(activeExerciseIndex - 1)}
            style={{ flex: 1, marginRight: 6 }}
          />

          <Button
            title={
              activeExerciseIndex < activeWorkout.exercises.length - 1
                ? 'Next Exercise'
                : 'Finish Workout'
            }
            variant="primary"
            size="sm"
            icon={<ChevronRight size={16} color={theme.colors.primaryContrast} />}
            onPress={() => {
              if (activeExerciseIndex < activeWorkout.exercises.length - 1) {
                setActiveExerciseIndex(activeExerciseIndex + 1);
              } else {
                handleFinish();
              }
            }}
            style={{ flex: 1, marginLeft: 6 }}
          />
        </View>

        {/* Next Exercise Preview Banner */}
        {nextExercise && (
          <Card style={styles.nextPreviewCard}>
            <Text style={[styles.nextPreviewLabel, { color: theme.colors.textMuted }]}>
              UP NEXT:
            </Text>
            <Text style={[styles.nextPreviewTitle, { color: theme.colors.text }]}>
              {nextExercise.exerciseName}
            </Text>
            <Text style={[styles.nextPreviewSub, { color: theme.colors.textSecondary }]}>
              {nextExercise.targetSets.length} Sets • {nextExercise.equipment}
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 6,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  routineTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  stopwatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  stopwatchText: {
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  exerciseCounter: {
    fontSize: 12,
  },
  restBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 2,
  },
  restLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  restTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  restSecondsBig: {
    fontSize: 18,
    fontWeight: '900',
  },
  restActionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  restPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  skipPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  skipPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 48,
  },
  exerciseCard: {
    padding: 18,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  exerciseBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  infoToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cuesBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
  },
  cuesHeading: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  cueLine: {
    fontSize: 12,
    lineHeight: 17,
  },
  exerciseNotes: {
    fontSize: 12,
    marginTop: 10,
    fontStyle: 'italic',
  },
  setTableCard: {
    padding: 14,
    marginBottom: 14,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  colSet: {
    width: 44,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  colPrev: {
    width: 70,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  colWeight: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  colReps: {
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  colCheck: {
    width: 48,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderRadius: 8,
  },
  colSetBox: {
    width: 44,
    alignItems: 'center',
  },
  setNumText: {
    fontSize: 15,
    fontWeight: '800',
  },
  prMiniBadge: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  prMiniText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  colPrevBox: {
    width: 70,
    alignItems: 'center',
  },
  prevText: {
    fontSize: 12,
  },
  colWeightBox: {
    flex: 1,
    paddingHorizontal: 4,
  },
  colRepsBox: {
    flex: 1,
    paddingHorizontal: 4,
  },
  inputStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 4,
    height: 38,
  },
  stepBtn: {
    padding: 6,
  },
  weightInputText: {
    fontSize: 14,
    fontWeight: '800',
  },
  colCheckBox: {
    width: 48,
    alignItems: 'center',
  },
  checkCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperNavRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  nextPreviewCard: {
    padding: 14,
  },
  nextPreviewLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  nextPreviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  nextPreviewSub: {
    fontSize: 12,
    marginTop: 2,
  },
});
