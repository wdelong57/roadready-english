"use client";

import { useMemo, useState } from "react";

type Sign = { name: string; meaning: string };

export default function SignsPage() {
  const signs: Sign[] = useMemo(
    () => [
      { name: "Stop", meaning: "Come to a complete stop." },
      { name: "Yield", meaning: "Let other traffic go first." },
      { name: "Speed Limit", meaning: "Maximum allowed speed." },
      { name: "No U-Turn", meaning: "U-turn not allowed." },
      { name: "One Way", meaning: "Traffic flows one direction." },
      { name: "Do Not Enter", meaning: "You cannot enter this road." },
    ],
    []
  );

  const [mode, setMode] = useState<"study" | "quiz">("study");
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const question = signs[qIndex];

  const choices = useMemo(() => {
    // build 4 choices including the correct one
    const pool = [...signs].sort(() => Math.random() - 0.5);
    const wrong = pool.filter((s) => s.name !== question.name).slice(0, 3);
    const all = [...wrong, question].sort(() => Math.random() - 0.5);
    return all;
  }, [qIndex, signs, question.name]);

  function answer(choice: Sign) {
    const isCorrect = choice.name === question.name;
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }));
    setQIndex((i) => (i + 1) % signs.length);
  }

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-blue-700">Road Signs Trainer</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setMode("study")}
            className={`px-4 py-2 rounded-xl border ${
              mode === "study" ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"
            }`}
          >
            Study
          </button>
          <button
            onClick={() => setMode("quiz")}
            className={`px-4 py-2 rounded-xl border ${
              mode === "quiz" ? "bg-blue-600 text-white border-blue-600" : "bg-white hover:bg-gray-50"
            }`}
          >
            Quiz
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
            <div className="text-sm text-gray-500">
              Score: {score.correct}/{score.total}
            </div>

            <div className="mt-3 text-xl font-semibold">
              What does this sign mean?
            </div>

            <div className="mt-4 p-4 rounded-xl bg-gray-50 border">
              <div className="text-3xl font-bold text-blue-700">{question.name}</div>
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

            <button
              onClick={() => {
                setScore({ correct: 0, total: 0 });
                setQIndex(0);
              }}
              className="mt-6 px-4 py-2 rounded-xl bg-white border hover:bg-gray-50"
            >
              Reset score
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
