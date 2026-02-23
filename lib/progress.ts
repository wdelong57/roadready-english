export type Progress = {
  streak: number;
  lastStudiedISO: string | null;
  bestSignsScore: number;
};

const KEY = "roadready_progress_v1";

export function loadProgress(): Progress {
  if (typeof window === "undefined") {
    // during build/SSR
    return { streak: 0, lastStudiedISO: null, bestSignsScore: 0 };
  }

  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { streak: 0, lastStudiedISO: null, bestSignsScore: 0 };
    const parsed = JSON.parse(raw) as Partial<Progress>;
    return {
      streak: typeof parsed.streak === "number" ? parsed.streak : 0,
      lastStudiedISO: typeof parsed.lastStudiedISO === "string" ? parsed.lastStudiedISO : null,
      bestSignsScore: typeof parsed.bestSignsScore === "number" ? parsed.bestSignsScore : 0,
    };
  } catch {
    return { streak: 0, lastStudiedISO: null, bestSignsScore: 0 };
  }
}

export function saveProgress(next: Progress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(next));
}

function todayISO() {
  // YYYY-MM-DD
  return new Date().toISOString().slice(0, 10);
}

export function bumpStreak() {
  const p = loadProgress();
  const today = todayISO();

  // already counted today
  if (p.lastStudiedISO === today) return p;

  // compare to yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yISO = yesterday.toISOString().slice(0, 10);

  const next: Progress = {
    ...p,
    streak: p.lastStudiedISO === yISO ? p.streak + 1 : 1,
    lastStudiedISO: today,
  };

  saveProgress(next);
  return next;
}

export function updateBestSignsScore(score: number) {
  const p = loadProgress();
  if (score <= p.bestSignsScore) return p;
  const next = { ...p, bestSignsScore: score };
  saveProgress(next);
  return next;
}
