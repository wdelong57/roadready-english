"use client";

import { useEffect, useState } from "react";
import { loadProgress, ProgressData } from "@/lib/progress";

export default function ProgressPage() {
  const [p, setP] = useState<ProgressData | null>(null);

  useEffect(() => {
    setP(loadProgress());
  }, []);

  if (!p) return null;

  const lessonsDone = Object.keys(p.lessonCompleted).length;

  return (
    <main>
      <h1 className="text-3xl font-bold text-blue-700">Your Progress</h1>

      <section className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-gray-500">Streak</div>
          <div className="mt-2 text-3xl font-bold">{p.streak.count} 🔥</div>
          <div className="mt-1 text-sm text-gray-600">
            Last activity: {p.streak.lastDate ?? "—"}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-gray-500">Lessons completed</div>
          <div className="mt-2 text-3xl font-bold">{lessonsDone}</div>
          <div className="mt-1 text-sm text-gray-600">
            {lessonsDone ? Object.keys(p.lessonCompleted).join(", ") : "Start Day 1 to begin"}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-gray-500">Signs quiz best</div>
          <div className="mt-2 text-3xl font-bold">
            {p.signs.bestScore}/{p.signs.bestTotal}
          </div>
          <div className="mt-1 text-sm text-gray-600">Best session score</div>
        </div>
      </section>

      <section className="mt-6 grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-gray-500">Examiner speaking</div>
          <div className="mt-2 text-2xl font-bold">{p.examiner.bestAccuracy}%</div>
          <div className="mt-1 text-sm text-gray-600">
            Attempts: {p.examiner.attempts}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="text-sm text-gray-500">Next suggested</div>
          <ul className="mt-3 list-disc pl-5 text-gray-700">
            <li>Complete Day 1 lesson</li>
            <li>Try the Signs quiz</li>
            <li>Practice 3 Examiner phrases</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
