export type ProgressData = {
  lessonCompleted: Record<string, string>; // ISO timestamp per lesson
  streak: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
};

const STORAGE_KEY = "roadready_progress_v1";

function todayKey(d = new Date()): string {
  // local date key YYYY-MM-DD
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function loadProgress(): ProgressData {
  if (typeof window === "undefined") {
    // Server-side safe default
    return { lessonCompleted: {}, streak: 0, lastCompletedDate: null };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lessonCompleted: {}, streak: 0, lastCompletedDate: null };

    const parsed = JSON.parse(raw) as Partial<ProgressData>;
    return {
      lessonCompleted: parsed.lessonCompleted ?? {},
      streak: typeof parsed.streak === "number" ? parsed.streak : 0,
      lastCompletedDate: parsed.lastCompletedDate ?? null,
    };
  } catch {
    return { lessonCompleted: {}, streak: 0, lastCompletedDate: null };
  }
}

export function saveProgress(p: ProgressData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

/**
 * Update streak based on "today". Call this when a lesson is completed.
 * Rules:
 * - If lastCompletedDate is today -> streak unchanged
 * - If lastCompletedDate is yesterday -> streak + 1
 * - Else -> streak = 1
 */
export function bumpStreak(p: ProgressData) {
  const today = todayKey(new Date());

  if (!p.lastCompletedDate) {
    p.streak = 1;
    p.lastCompletedDate = today;
    return;
  }

  if (p.lastCompletedDate === today) return;

  // compute yesterday key
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterday = todayKey(d);

  if (p.lastCompletedDate === yesterday) {
    p.streak = (p.streak ?? 0) + 1;
  } else {
    p.streak = 1;
  }

  p.lastCompletedDate = today;
}

export function resetProgress() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
