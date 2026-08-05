/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HabitId = 'no-smoking' | 'no-masturbation' | 'no-porn' | 'no-drugs' | 'no-alcohol';

export type TargetKey = '1-month' | '3-months' | '6-months' | '1-year';

export interface HabitConfig {
  id: HabitId;
  nameEn: string;
  nameBn: string;
  tagEn: string;
  tagBn: string;
  color: string;
  gradient: string;
  rocketStyle: 'classic' | 'eco' | 'crystal' | 'fusion' | 'heavy';
  flameColor: string;
  impactEn: {
    health: string;
    mind: string;
    family: string;
    society: string;
    advantages: string;
  };
  impactBn: {
    health: string;
    mind: string;
    family: string;
    society: string;
    advantages: string;
  };
}

export interface UserProfile {
  name: string;
  avatarUrl: string; // Base64 or placeholder
  selectedHabits: HabitId[];
  joinedDate: string;
  language: 'en' | 'bn';
  theme: 'light' | 'dark';
}

export interface StreakState {
  habitId: HabitId;
  currentStreak: number;
  highestStreak: number;
  startDate: string;
  lastCheckIn: string | null; // ISO Date String
  target: TargetKey;
  targetDays: number;
  completedTarget: boolean;
  history: string[]; // List of ISO Date Strings checked in
}

export interface DatabaseState {
  profile: UserProfile | null;
  streaks: Record<HabitId, StreakState>;
}
