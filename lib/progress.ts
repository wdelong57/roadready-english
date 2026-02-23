// lib/progress.ts
// Client-side progress tracking (localStorage). No JSX here.

export type LessonId = string;

export type LessonCompletedMap = Record<LessonId, string>; // ISO timestamp

export type ExaminerProgress = {
  attempts: number;
  bestAccuracy: number; // 0..1
  lastAttemptAt?: string; // ISO
};

export type Progress = {
  version: number;

  // streak + engagement
  streak: number;
  lastActiveDate: string | null; // YYYY-MM-DD

  // lessons
  lessonCompleted: LessonCompletedMap;

  // features / modules
  examiner: ExaminerProgress;
};

const STORAGE_KEY = "roadready_progress_v1";
const VERSION = 1;

function todayYMD(d = new Date()): string {
  // Use local time; if you want strict UTC, adjust accordingly.
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function getDefaultProgress(): Progress {
  return {
    version: VERSION,
    streak: 0,
    lastActiveDate: null,

    lessonCompleted: {},

    examiner: {
      attempts: 0,
      bestAccuracy: 0,
      lastAttemptAt: undefined,
    },
  };
}

function safeParse(json: string | null): any | null {
  if (!json) return null;
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Ensures any older/partial progress object gets all required fields.
 * This prevents "Property X does not exist" and runtime undefined errors.
 */
export function normalizeProgress(input: any): Progress {
  const d = getDefaultProgress();

  // If input is not an object, return defaults
  if (!input || typeof input !== "object") return d;

  const p: Progress = {
    version: typeof input.version === "number" ? input.version : VERSION,

    streak: typeof input.streak === "number" ? input.streak : d.streak,
    lastActiveDate:
      typeof input.lastActiveDate === "string" || input.lastActiveDate === null
        ? input.lastActiveDate
        : d.lastActiveDate,

    lessonCompleted:
      input.lessonCompleted && typeof input.lessonCompleted === "object"
        ? (input.lessonCompleted as LessonCompletedMap)
        : d.lessonCompleted,

    examiner: {
      attempts:
        input.examiner && typeof input.examiner.attempts === "number"
          ? input.examiner.attempts
          : d.examiner.attempts,

      bestAccuracy:
        input.examiner && typeof input.examiner.bestAccuracy === "number"
          ? input.examiner.bestAccuracy
          : d.examiner.bestAccuracy,

      lastAttemptAt:
        input.examiner && typeof input.examiner.lastAttemptAt === "string"
          ? input.examiner.lastAttemptAt
          : d.examiner.lastAttemptAt,
    },
  };

  return p;
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return getDefaultProgress();

  const raw = safeParse(window.localStorage.getItem(STORAGE_KEY));
  return normalizeProgress(raw);
}

export function saveProgress(progress: Progress): void {
  if (typeof window === "undefined") return;

  const normalized = normalizeProgress(progress);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

/**
 * Call this when the user completes an action for the day.
 * - If lastActiveDate was yesterday -> streak++
 * - If lastActiveDate was today -> no change
 * - Otherwise -> streak = 1
 */
export function bumpStreak(progress: Progress): Progress {
  const p = normalizeProgress(progress);

  const today = todayYMD();
  const last = p.lastActiveDate;

  if (last === today) {
    return p; // already counted today
  }

  // Compute yesterday in local time
  const now = new Date();
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(now.getDate() - 1);
  const yesterday = todayYMD(yesterdayDate);

  if (last === yesterday) {
    p.streak = Math.max(1, p.streak + 1);
  } else {
    p.streak = 1;
  }

  p.lastActiveDate = today;
  return p;
}

export function markLessonComplete(progress: Progress, lessonId: LessonId): Progress {
  const p = normalizeProgress(progress);
  p.lessonCompleted[lessonId] = new Date().toISOString();
  return p;
}

export function isLessonComplete(progress: Progress, lessonId: LessonId): boolean {
  const p = normalizeProgress(progress);
  return Boolean(p.lessonCompleted?.[lessonId]);
}

export function bumpExaminerAttempt(progress: Progress, accuracy: number): Progress {
  const p = normalizeProgress(progress);

  p.examiner.attempts += 1;
  p.examiner.lastAttemptAt = new Date().toISOString();

  const safeAcc = Number.isFinite(accuracy) ? Math.max(0, Math.min(1, accuracy)) : 0;
  p.examiner.bestAccuracy = Math.max(p.examiner.bestAccuracy, safeAcc);

  return p;
}

/**
 * Optional: wipe progress (debug/reset)
 */
export function clearProgress(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
