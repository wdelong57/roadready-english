// lib/progress.ts
// Pure TypeScript utilities (NO JSX). Safe in Next.js App Router.

export type Progress = {
  version: number;

  createdAt: string;        // ISO
  updatedAt: string;        // ISO
  lastActiveAt: string;     // ISO

  streak: {
    count: number;
    lastDate: string;       // YYYY-MM-DD (local)
  };

  // Mark lessons completed by slug: "day-1", "day-2", ...
  lessonCompleted: Record<string, string>; // ISO timestamp

  // Examiner quiz stats
  examiner: {
    attempts: number;
    bestAccuracy: number;   // 0..1
    lastRunAt: string | null;
  };
};

const STORAGE_KEY = "roadready_progress_v1";

function isoNow() {
  return new Date().toISOString();
}

function localDayString(d = new Date()) {
  // YYYY-MM-DD in local time
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function defaultProgress(): Progress {
  const now = isoNow();
  return {
    version: 1,
    createdAt: now,
    updatedAt: now,
    lastActiveAt: now,

    streak: {
      count: 0,
      lastDate: "",
    },

    lessonCompleted: {},

    examiner: {
      attempts: 0,
      bestAccuracy: 0,
      lastRunAt: null,
    },
  };
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function safeParse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Merge saved progress with defaults so missing fields never break builds/pages.
 */
export function normalizeProgress(input: unknown): Progress {
  const base = defaultProgress();

  if (!input || typeof input !== "object") return base;

  const obj = input as Record<string, any>;

  const merged: Progress = {
    ...base,
    version: typeof obj.version === "number" ? obj.version : base.version,
    createdAt: typeof obj.createdAt === "string" ? obj.createdAt : base.createdAt,
    updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : base.updatedAt,
    lastActiveAt: typeof obj.lastActiveAt === "string" ? obj.lastActiveAt : base.lastActiveAt,

    streak: {
      count:
        obj.streak && typeof obj.streak.count === "number"
          ? obj.streak.count
          : base.streak.count,
      lastDate:
        obj.streak && typeof obj.streak.lastDate === "string"
          ? obj.streak.lastDate
          : base.streak.lastDate,
    },

    lessonCompleted:
      obj.lessonCompleted && typeof obj.lessonCompleted === "object"
        ? { ...base.lessonCompleted, ...obj.lessonCompleted }
        : base.lessonCompleted,

    examiner: {
      attempts:
        obj.examiner && typeof obj.examiner.attempts === "number"
          ? obj.examiner.attempts
          : base.examiner.attempts,
      bestAccuracy:
        obj.examiner && typeof obj.examiner.bestAccuracy === "number"
          ? obj.examiner.bestAccuracy
          : base.examiner.bestAccuracy,
      lastRunAt:
        obj.examiner && (typeof obj.examiner.lastRunAt === "string" || obj.examiner.lastRunAt === null)
          ? obj.examiner.lastRunAt
          : base.examiner.lastRunAt,
    },
  };

  return merged;
}

export function loadProgress(): Progress {
  // Must not crash during SSR/build
  if (!isBrowser()) return defaultProgress();

  const raw = localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse(raw);
  const p = normalizeProgress(parsed);

  // keep lastActive fresh but don't save automatically (caller can save if desired)
  p.lastActiveAt = isoNow();
  return p;
}

export function saveProgress(p: Progress) {
  if (!isBrowser()) return;

  const now = isoNow();
  const next: Progress = {
    ...normalizeProgress(p),
    updatedAt: now,
    lastActiveAt: now,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function bumpStreak(p: Progress): Progress {
  const today = localDayString();
  const last = p.streak?.lastDate || "";

  // same day: no change
  if (last === today) return p;

  // yesterday check (local)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = localDayString(yesterday);

  const nextCount = last === yStr ? (p.streak?.count || 0) + 1 : 1;

  p.streak = {
    count: nextCount,
    lastDate: today,
  };

  return p;
}
