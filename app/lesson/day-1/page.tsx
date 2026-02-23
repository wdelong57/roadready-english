"use client";

import { useMemo, useState } from "react";
import { bumpStreak, loadProgress, saveProgress } from "@/lib/progress";

type Item = { word: string; meaning: string; example: string };

function speak(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;

  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = 0.95;
  u.pitch = 1.0;

  synth.cancel();
  synth.speak(u);
}

export default function Day1LessonPage() {
  const items: Item[] = useMemo(
    () => [
      { word: "Stop", meaning: "Come to a complete stop.", example: "Stop at the stop sign." },
      { word: "Yield", meaning: "Let other traffic go first.", example: "Yield to pedestrians." },
      { word: "Left", meaning: "Direction opposite of right.", example: "Turn left at the light." },
      { word: "Right", meaning: "Direction opposite of left.", example: "Turn right after the sign." },
      { word: "Speed limit", meaning: "Maximum allowed speed.", example: "The speed limit is 45." },
      { word: "Intersection", meaning: "Where two roads meet.", example: "Slow down at the intersection." },
      { word: "Lane", meaning: "A section of the road for vehicles.", example: "Stay in your lane." },
      { word: "Signal", meaning: "Blinker light that shows direction.", example: "Use your signal before you turn." },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const current = items[index];

  function prev() {
    setSavedMsg(null);
    setIndex((i) => Math.max(0, i - 1));
  }

  function next() {
    setSavedMsg(null);
    setIndex((i) => Math.min(items.length - 1, i + 1));
  }

  function random() {
    setSavedMsg(null);
    const j = Math.floor(Math.random() * items.length);
    setIndex(j);
  }

  function markComplete() {
    const p = loadProgress();
    p.lessonCompleted["day-1"] = new Date().toISOString();
    bumpStreak(p);
    saveProgress(p);
    setSavedMsg("Saved! Day 1 marked complete ✅");
  }

  return (
    <main>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Day 1 — Basic Driving Words</h1>
          <p className="mt-2 text-gray-600">
            Tap “Play” to hear the word + example. Practice a few minutes a day.
          </p>
        </div>

        <div className="text-sm text-gray-500">
          Card {index + 1} of {items.length}
        </div>
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow p-6">
        <div className="text-sm text-gray-500">Word</div>
        <div className="mt-2 text-3xl font-semibold text-blue-700">{current.word}</div>

        <div className="mt-5 grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-gray-50 border">
            <div className="text-sm text-gray-500">Meaning</div>
            <div className="mt-1 text-gray-800">{current.meaning}</div>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border">
            <div className="text-sm text-gray-500">Example</div>
            <div className="mt-1 text-gray-800 italic">{current.example}</div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => speak(`${current.word}. ${current.example}`)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            ▶ Play
          </button>

          <button
            onClick={prev}
            className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50 disabled:opacity-50"
            disabled={index === 0}
          >
            ← Back
          </button>

          <button
            onClick={next}
            className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50 disabled:opacity-50"
            disabled={index === items.length - 1}
          >
            Next →
          </button>

          <button
            onClick={random}
            className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50"
          >
            🎲 Random
          </button>

          <button
            onClick={markComplete}
            className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50"
          >
            ✅ Mark Complete
          </button>
        </div>

        {savedMsg && (
          <div className="mt-5 p-3 rounded-xl border bg-green-50 border-green-200 text-green-800">
            {savedMsg}
          </div>
        )}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        Tip: If audio doesn’t play, check your browser sound settings and try clicking “Play” again.
      </div>
    </main>
  );
}
