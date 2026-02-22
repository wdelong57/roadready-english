"use client";

import { useMemo, useState } from "react";

type Item = { word: string; meaning: string; example: string };

function speak(text: string) {
  // Browser text-to-speech (free, no API keys)
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;

  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  u.pitch = 1.0;
  synth.cancel();
  synth.speak(u);
}

export default function Day1Lesson() {
  const items: Item[] = useMemo(
    () => [
      { word: "Stop", meaning: "Come to a complete stop.", example: "Stop at the stop sign." },
      { word: "Yield", meaning: "Let other traffic go first.", example: "Yield to pedestrians." },
      { word: "Left", meaning: "Direction opposite of right.", example: "Turn left at the light." },
      { word: "Right", meaning: "Direction opposite of left.", example: "Turn right after the sign." },
      { word: "Speed limit", meaning: "Maximum allowed speed.", example: "The speed limit is 45." },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const current = items[index];

  return (
    <main>
      <h1 className="text-3xl font-bold text-blue-700">Day 1 — Basic Driving Words</h1>
      <p className="mt-2 text-gray-600">
        Tap “Play” to hear the word and example. Use Next/Back to study.
      </p>

      <div className="mt-8 bg-white rounded-2xl shadow p-6">
        <div className="text-sm text-gray-500">
          Card {index + 1} of {items.length}
        </div>

        <div className="mt-3 text-3xl font-semibold text-blue-700">{current.word}</div>
        <div className="mt-2 text-gray-700">{current.meaning}</div>
        <div className="mt-3 text-gray-600 italic">Example: {current.example}</div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => speak(`${current.word}. ${current.example}`)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            ▶ Play
          </button>

          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50"
            disabled={index === 0}
          >
            ← Back
          </button>

          <button
            onClick={() => setIndex((i) => Math.min(items.length - 1, i + 1))}
            className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50"
            disabled={index === items.length - 1}
          >
            Next →
          </button>

          <button
            onClick={() => {
              // quick shuffle for practice
              const j = Math.floor(Math.random() * items.length);
              setIndex(j);
            }}
            className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50"
          >
            🎲 Random
          </button>
        </div>
      </div>
    </main>
  );
}
