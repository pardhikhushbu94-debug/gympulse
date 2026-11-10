export type MuscleGroup = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'cardio';
export type EquipmentType = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'other';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ExerciseDetail {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
  difficulty: DifficultyLevel;
  instructions: string[];
  commonMistakes: string[];
  targetCues: string[];
  thumbnailUrl: string;
  videoUrl?: string;
}

export interface SetPrescription {
  setNumber: number;
  targetReps: number;
  targetWeightKg: number;
  previousWeightKg?: number;
  previousReps?: number;
}

export interface RoutineExercise {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
  targetSets: SetPrescription[];
  restSeconds: number;
  notes?: string;
}

export interface WorkoutRoutineDetail {
  id: string;
  title: string;
  description: string;
  targetMuscle: string;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  createdBy: 'admin' | 'trainer' | 'member';
  trainerName?: string;
  exercises: RoutineExercise[];
}

export interface LoggedSet {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  isPR?: boolean;
}

export interface WorkoutLogEntry {
  id: string;
  workoutId: string;
  workoutTitle: string;
  startedAt: string;
  completedAt: string;
  durationMinutes: number;
  totalVolumeKg: number;
  totalSets: number;
  caloriesEstimated: number;
  prsAchieved: string[];
  completedSets: LoggedSet[];
}
