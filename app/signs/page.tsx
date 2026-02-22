"use client";

import { useMemo, useState } from "react";
import { bumpStreak, loadProgress, saveProgress } from "@/lib/progress";

type Sign = { name: string; meaning: string };

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function SignsPage() {
  const signs: Sign[] = useMemo(
    () => [
      { name: "Stop", meaning: "Come to a complete stop." },
      { name: "Yield", meaning: "Let other traffic go first." },
      { name: "Speed Limit", meaning: "Maximum allowed speed." },
      { name: "No U-Turn", meaning: "U-turn not allowed." },
      { name: "One Way", meaning: "Traffic flows one direction." },
      { name: "Do Not Enter", meaning: "You cannot enter this road." },
      { name: "School Zone", meaning: "Slow down. Watch for children." },
      { name: "No Passing Zone", meaning: "Do not pass other vehicles here." },
      { name: "Merge", meaning: "Traffic will join into one lane." },
      { name: "Railroad Crossing", meaning: "Look, listen, and stop if needed." },
    ],
    []
  );

  const [mode, setMode] = useState<"study" | "quiz">("study");

  // Quiz state
  const [qIndex, setQIndex] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);

  const question = signs[qIndex];

  const choices = useMemo(() => {
    // Build 4 choices: 1 correct + 3 wrong meanings
    const wrong = shuffle(signs.filter((s) => s.name !== question.name)).slice(0, 3);
    return shuffle([question, ...wrong]);
  }, [qIndex, signs, question.name]);

  function resetQuiz() {
    setQIndex(0);
    setSessionCorrect(0);
    setSessionTotal(0);
  }

  function saveBest(correct: number, total: number) {
    const p = loadProgress();

    // Save "best session score" by percentage. If tie, prefer higher total.
    const prevPct =
      p.signs.bestTotal > 0 ? p.signs.bestScore / p.signs.bestTotal : 0;
    const newPct = total > 0 ? correct / total : 0;

    if (newPct > prevPct || (newPct === prevPct && total > p.signs.bestTotal)) {
      p.signs.bestScore = correct;
      p.signs.bestTotal = total;
    }

    bumpStreak(p);
    saveProgress(p);
  }

  function answer(choice: Sign) {
    const isCorrect = choice.name === question.name;

    const nextCorrect = sessionCorrect + (isCorrect ? 1 : 0);
    const nextTotal = sessionTotal + 1;

    setSessionCorrect(nextCorrect);
    setSessionTotal(nextTotal);

    // Save best score after every answer (simple + reliable)
    saveBest(nextCorrect, nextTotal);

    // Next question
    setQIndex((i) => (i + 1) % signs.length);
  }

  const best = (() => {
    try {
      const p = loadProgress();
      return p.signs;
    } catch {
      return { bestScore: 0, bestTotal: 0 };
    }
  })();

  const bestPct =
    best.bestTotal > 0 ? Math.round((best.bestScore / best.bestTotal) * 100) : 0;

  const sessionPct =
    sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 0;

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-blue-700">Road Signs Trainer</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setMode("study")}
            className={`px-4 py-2 rounded-xl border ${
              mode === "study"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Study
          </button>
          <button
            onClick={() => setMode("quiz")}
            className={`px-4 py-2 rounded-xl border ${
              mode === "quiz"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            Quiz
          </button>
        </div>
      </div>

      <p className="mt-2 text-gray-600 max-w-2xl">
        Study common road signs, then test yourself in quiz mode. Your best score
        is saved on this device.
      </p>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow p-5">
          <div className="text-sm text-gray-500">This session</div>
          <div className="mt-1 text-2xl font-bold">
            {sessionCorrect}/{sessionTotal}{" "}
            <span className="text-gray-500 text-base font-semibold">
              {sessionTotal ? `(${sessionPct}%)` : ""}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <div className="text-sm text-gray-500">Best score (saved)</div>
          <div className="mt-1 text-2xl font-bold">
            {best.bestScore}/{best.bestTotal}{" "}
            <span className="text-gray-500 text-base font-semibold">
              {best.bestTotal ? `(${bestPct}%)` : ""}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500">Quiz controls</div>
            <div className="mt-1 text-gray-700">
              {mode === "quiz" ? "Answer to continue" : "Switch to Quiz"}
            </div>
          </div>
          <button
            onClick={resetQuiz}
            className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      {mode === "study" ? (
        <section className="mt-8 grid md:grid-cols-3 gap-6">
          {signs.map((s, i) => (
            <div key={i} className="p-6 bg-white rounded-2xl shadow">
              <div className="text-2xl font-semibold text-blue-700">{s.name}</div>
              <div className="mt-2 text-gray-600">{s.meaning}</div>
            </div>
          ))}
        </section>
      ) : (
        <section className="mt-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <div className="text-sm text-gray-500">Question</div>
            <div className="mt-2 text-xl font-semibold">
              What does this sign mean?
            </div>

            <div className="mt-4 p-4 rounded-xl bg-gray-50 border">
              <div className="text-3xl font-bold text-blue-700">
                {question.name}
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-3">
              {choices.map((c, i) => (
                <button
                  key={i}
                  onClick={() => answer(c)}
                  className="text-left px-4 py-3 rounded-xl border bg-white hover:bg-gray-50"
                >
                  {c.meaning}
                </button>
              ))}
            </div>

            <div className="mt-6 text-sm text-gray-500">
              Tip: Try to say the meaning out loud after you answer.
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
