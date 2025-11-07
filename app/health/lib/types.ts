export type UnitsWater = 'ml' | 'oz';
export type UnitsWeight = 'kg' | 'lb';

export interface HealthRecord {
  date: string;
  waterMl?: number;
  sleepHrs?: number;
  mood?: number;
  energy?: number;
  notes?: string;
}

export interface Habit {
  id: string;
  name: string;
  days: number[];
  history: Record<string, boolean>;
}

export interface HealthPrefs {
  units: { water: UnitsWater; weight: UnitsWeight };
  show: { weight: boolean; hr: boolean; bodyfat: boolean; waist: boolean };
  weekStart: 'sat' | 'sun' | 'mon';
}

export type InsulinType = 'basal' | 'bolus';
export interface InsulinEntry {
  id: string;
  date: string;
  time: string;
  kind: InsulinType;
  units: number;
  context?: 'pre-meal' | 'post-meal' | 'correction' | 'other';
  note?: string;
  createdAt: string;
}

export interface BodyMetric {
  id: string;
  date: string;
  heightCm?: number;
  weightKg?: number;
  bodyFatPct?: number;
  waistCm?: number;
}

export type ExerciseUnit = 'min' | 'reps';
export interface ExercisePlan {
  id: string;
  name: string;
  unit: ExerciseUnit;
  target: number;
  notes?: string;
}
export interface WorkoutEntry {
  id: string;
  exerciseId: string;
  date: string;
  actual: number;
  note?: string;
  createdAt: string;
}
