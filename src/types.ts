export interface Lesson {
  id: string;
  title: string;
  type: 'vocabulary' | 'phrase';
  nativeText: string;
  phonetic: string;
  translation: string;
  contextTip: string;
}

export interface DayPlan {
  dayNumber: number;
  topic: string;
  description: string;
  lessons: Lesson[];
}

export interface Roadmap {
  language: string;
  targetLanguageCode: 'zh' | 'ja' | 'ko' | 'en';
  level: string;
  goal: string;
  title: string;
  summary: string;
  days: DayPlan[];
}

export interface PhonemeFeedback {
  phoneme: string;
  score: number;
  type: 'consonant' | 'vowel' | 'tone' | 'padchim';
}

export interface SyllableFeedback {
  syllable: string;
  phonetic: string;
  score: number;
  isCorrect: boolean;
  issue: string;
  correction: string;
  // ⭐ FORCED ALIGNMENT
  startTimeMs: number;
  endTimeMs: number;
  // ⭐ Chinese Tonal details
  chineseTone?: {
    expectedTone: '1' | '2' | '3' | '4' | '5'; // 1st, 2nd, 3rd, 4th, or Light tone (5)
    actualTone: '1' | '2' | '3' | '4' | '5';
    contourExpected: number[]; // e.g. [5,5] or [3,5]
    contourActual: number[]; // user contour
    description: string;
  };
  // ⭐ Phoneme scoring breakdowns
  phonemes?: PhonemeFeedback[];
}

export interface JapanesePitchAccent {
  patternType: 'Heiban' | 'Atamadaka' | 'Nakadaka' | 'Odaka';
  contourExpected: ('H' | 'L')[]; // e.g. ['L', 'H', 'H', 'H'] or ['H', 'L', 'L']
  contourActual?: ('H' | 'L')[];
  description: string;
}

export interface EvaluationResult {
  overallScore: number;
  accuracyScore: number;
  intonationScore: number;
  fluencyScore: number;
  feedback: string;
  syllableFeedback: SyllableFeedback[];
  improvedTips: string;
  
  // ⭐ GAMIFICATION
  xpEarned: number;
  achievementsAwarded?: {
    id: string;
    title: string;
    description: string;
    icon: string;
  }[];
  // ⭐ Japanese specialized Pitch Accent metrics
  japanesePitchAccent?: JapanesePitchAccent;
}

export interface UserProfile {
  name: string;
  language: 'zh' | 'ja' | 'ko' | 'en';
  level: 'Moi_Bat_Dau' | 'Trung_Cap' | 'Nang_Cao';
  goal: 'Giao_Tiep_Hang_Ngay' | 'Cong_Viec_Thuong_Mai' | 'Du_Lich_Kham_Pha' | 'Khao_Thi_Chung_Chi';
}

export interface DailyQuest {
  id: string;
  description: string;
  target: number;
  progress: number;
  done: boolean;
  rewardXp: number;
}

export interface UserStats {
  completedLessonIds: string[];
  scoreHistory: { lessonId: string; score: number; date: string }[];
  streak: number;
  lastPracticedDate: string | null;
  
  // ⭐ GAMIFICATION PROGRESS
  xp: number;
  level: number;
  badges: string[];
  dailyQuests: DailyQuest[];
}
