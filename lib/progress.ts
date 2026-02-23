// lib/progress.ts

export type ExaminerProgress = {
  attempts: number;
  bestAccuracy: number; // 0..1
};

export type Progress = {
  version: number;

  // streak tracking
  streak: number;
  lastStudyDate: string | null; // YYYY-MM-DD

  // lesson progress (example structure)
  day1: {
    completed: boolean;
    score: number; // 0..100
  };

  // examiner stats
  examiner: ExaminerProgress;
};

const STORAGE_KEY = "roadready_progress_v1";

export const DEFAULT_PROGRESS: Progress = {
  version: 1,
  streak: 0,
  lastStudyDate: null,
  day1: {
    completed: false,
    score: 0,
  },
  examiner: {
    attempts: 0,
    bestAccuracy: 0,
  },
};

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

/**
 * Loads progress from localStorage (client-only).
 * Always returns a fully-populated Progress object by merging with defaults.
 */
export function loadProgress(): Progress {
  // On the server, just return defaults (no localStorage)
  if (typeof window === "undefined") return DEFAULT_PROGRESS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;

    const parsed = JSON.parse(raw) as Partial<Progress>;

    // Merge with defaults so newly added keys (like examiner) always exist
    const merged: Progress = {
      ...DEFAULT_PROGRESS,
      ...parsed,
      day1: { ...DEFAULT_PROGRESS.day1, ...(parsed.day1 ?? {}) },
      examiner: { ...DEFAULT_PROGRESS.examiner, ...(parsed.examiner ?? {}) },
    };

    // Basic sanity clamps (optional but helpful)
    merged.streak = Number.isFinite(merged.streak) ? merged.streak : 0;
    merged.day1.score = Number.isFinite(merged.day1.score) ? merged.day1.score : 0;
    merged.examiner.attempts = Number.isFinite(merged.examiner.attempts)
      ? merged.examiner.attempts
      : 0;
    merged.examiner.bestAccuracy = Number.isFinite(merged.examiner.bestAccuracy)
      ? merged.examiner.bestAccuracy
      : 0;

    // Clamp bestAccuracy into 0..1
    merged.examiner.bestAccuracy = Math.max(0, Math.min(1, merged.examiner.bestAccuracy));

    return merged;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

/**
 * Saves progress to localStorage (client-only).
 */
export function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

/**
 * Increments streak once per calendar day when user completes an action.
 * If you have different streak rules, adjust here.
 */
export function bumpStreak(p: Progress) {
  const today = todayKey();

  // First activity ever
  if (!p.lastStudyDate) {
    p.streak = Math.max(1, p.streak);
    p.lastStudyDate = today;
    return;
  }

  // Already counted today
  if (p.lastStudyDate === today) return;

  // Compute yesterday key
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterday = d.toISOString().slice(0, 10);

  // If last activity was yesterday, continue streak; otherwise reset to 1
  if (p.lastStudyDate === yesterday) {
    p.streak += 1;
  } else {
    p.streak = 1;
  }

  p.lastStudyDate = today;
}

/**
 * Optional helper: mark day1 completion + score.
 * Safe to remove if you don’t use it.
 */
export function setDay1Completed(p: Progress, score: number) {
  p.day1.completed = true;
  p.day1.score = Math.max(0, Math.min(100, Math.round(score)));
}
