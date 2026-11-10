import { create } from 'zustand';
import { WorkoutRoutineDetail, LoggedSet, WorkoutLogEntry } from '../types/workout';
import { initialWorkoutRoutines } from '../services/workoutService';

interface WorkoutState {
  routines: WorkoutRoutineDetail[];
  activeWorkout: WorkoutRoutineDetail | null;
  activeExerciseIndex: number;
  loggedSets: LoggedSet[];
  activeRestSeconds: number;
  isResting: boolean;
  workoutStartedAt: string | null;
  workoutHistory: WorkoutLogEntry[];
  lastCompletedSession: WorkoutLogEntry | null;

  // Actions
  startWorkout: (routine: WorkoutRoutineDetail) => void;
  setActiveExerciseIndex: (index: number) => void;
  updateSetValues: (exerciseId: string, setNumber: number, weightKg: number, reps: number) => void;
  completeSet: (exerciseId: string, exerciseName: string, setNumber: number, weightKg: number, reps: number, restSeconds: number) => void;
  startRestTimer: (seconds: number) => void;
  decrementRestTimer: () => void;
  skipRestTimer: () => void;
  addRestSeconds: (seconds: number) => void;
  finishWorkout: () => WorkoutLogEntry | null;
  addCustomRoutine: (routine: WorkoutRoutineDetail) => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  routines: initialWorkoutRoutines,
  activeWorkout: null,
  activeExerciseIndex: 0,
  loggedSets: [],
  activeRestSeconds: 0,
  isResting: false,
  workoutStartedAt: null,
  workoutHistory: [
    {
      id: 'log_prev_1',
      workoutId: 'routine_pull_strength',
      workoutTitle: 'Pull Day: Heavy Back & Biceps',
      startedAt: '2026-11-07T07:10:00Z',
      completedAt: '2026-11-07T08:12:00Z',
      durationMinutes: 62,
      totalVolumeKg: 9480,
      totalSets: 14,
      caloriesEstimated: 460,
      prsAchieved: ['Conventional Barbell Deadlift (180 KG)'],
      completedSets: [],
    },
  ],
  lastCompletedSession: null,

  startWorkout: (routine: WorkoutRoutineDetail) => {
    // Pre-populate logged sets from routine prescription
    const initialSets: LoggedSet[] = [];
    routine.exercises.forEach((ex) => {
      ex.targetSets.forEach((ts) => {
        initialSets.push({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          setNumber: ts.setNumber,
          weightKg: ts.targetWeightKg,
          reps: ts.targetReps,
          completed: false,
        });
      });
    });

    set({
      activeWorkout: routine,
      activeExerciseIndex: 0,
      loggedSets: initialSets,
      workoutStartedAt: new Date().toISOString(),
      isResting: false,
      activeRestSeconds: 0,
    });
  },

  setActiveExerciseIndex: (index: number) => {
    set({ activeExerciseIndex: index });
  },

  updateSetValues: (exerciseId: string, setNumber: number, weightKg: number, reps: number) => {
    set((state) => ({
      loggedSets: state.loggedSets.map((s) =>
        s.exerciseId === exerciseId && s.setNumber === setNumber
          ? { ...s, weightKg, reps }
          : s
      ),
    }));
  },

  completeSet: (exerciseId: string, exerciseName: string, setNumber: number, weightKg: number, reps: number, restSeconds: number) => {
    // Detect PR (e.g. bench press >= 100kg or squat >= 140kg)
    const isPR = (exerciseId === 'ex_bench_press' && weightKg >= 100) ||
                 (exerciseId === 'ex_squat' && weightKg >= 140) ||
                 (exerciseId === 'ex_deadlift' && weightKg >= 180);

    set((state) => ({
      loggedSets: state.loggedSets.map((s) =>
        s.exerciseId === exerciseId && s.setNumber === setNumber
          ? { ...s, weightKg, reps, completed: true, isPR }
          : s
      ),
      isResting: true,
      activeRestSeconds: restSeconds || 60,
    }));
  },

  startRestTimer: (seconds: number) => {
    set({ isResting: true, activeRestSeconds: seconds });
  },

  decrementRestTimer: () => {
    const current = get().activeRestSeconds;
    if (current <= 1) {
      set({ isResting: false, activeRestSeconds: 0 });
    } else {
      set({ activeRestSeconds: current - 1 });
    }
  },

  skipRestTimer: () => {
    set({ isResting: false, activeRestSeconds: 0 });
  },

  addRestSeconds: (seconds: number) => {
    set((state) => ({ activeRestSeconds: state.activeRestSeconds + seconds }));
  },

  finishWorkout: () => {
    const { activeWorkout, loggedSets, workoutStartedAt, workoutHistory } = get();
    if (!activeWorkout || !workoutStartedAt) return null;

    const completed = loggedSets.filter((s) => s.completed);
    const totalVolumeKg = completed.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
    const durationMinutes = Math.max(1, Math.round((Date.now() - new Date(workoutStartedAt).getTime()) / 60000));
    const caloriesEstimated = Math.round(durationMinutes * 7.5); // ~7.5 kcal/min lifting

    const prsAchieved: string[] = [];
    completed.forEach((s) => {
      if (s.isPR && !prsAchieved.includes(`${s.exerciseName} (${s.weightKg} KG)`)) {
        prsAchieved.push(`${s.exerciseName} (${s.weightKg} KG)`);
      }
    });

    const sessionLog: WorkoutLogEntry = {
      id: `log_${Date.now()}`,
      workoutId: activeWorkout.id,
      workoutTitle: activeWorkout.title,
      startedAt: workoutStartedAt,
      completedAt: new Date().toISOString(),
      durationMinutes,
      totalVolumeKg,
      totalSets: completed.length,
      caloriesEstimated,
      prsAchieved,
      completedSets: completed,
    };

    set({
      workoutHistory: [sessionLog, ...workoutHistory],
      activeWorkout: null,
      isResting: false,
      lastCompletedSession: sessionLog,
    });

    return sessionLog;
  },

  addCustomRoutine: (routine: WorkoutRoutineDetail) => {
    set((state) => ({
      routines: [routine, ...state.routines],
    }));
  },
}));
