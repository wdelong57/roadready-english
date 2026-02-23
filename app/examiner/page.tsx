"use client";

import Image from "next/image";
import { IMAGES } from "@/lib/images";
import { bumpStreak, loadProgress, saveProgress } from "@/lib/progress";
import { useEffect, useMemo, useState } from "react";

type Phrase = { text: string; tip?: string };

function speak(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;

  const u = new SpeechSynthesisUtterance(text);
  u.rate = 0.95;
  synth.cancel();
  synth.speak(u);
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\w\s']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function scorePhrase(target: string, spoken: string) {
  const t = normalize(target).split(" ").filter(Boolean);
  const s = normalize(spoken).split(" ").filter(Boolean);

  const tSet = new Set(t);
  const correctWords = s.filter((w) => tSet.has(w)).length;

  const accuracy = t.length === 0 ? 0 : Math.round((correctWords / t.length) * 100);

  const sSet = new Set(s);
  const missing = t.filter((w) => !sSet.has(w));

  return { accuracy, missing };
}

export default function ExaminerPage() {
  const phrases: Phrase[] = useMemo(
    () => [
      { text: "Turn left.", tip: "Say: turn left" },
      { text: "Turn right.", tip: "Say: turn right" },
      { text: "Stop at the stop sign.", tip: "Focus on: stop / stop sign" },
      { text: "Use your left signal.", tip: "Focus on: left signal" },
      { text: "Use your right signal.", tip: "Focus on: right signal" },
      { text: "Back up slowly.", tip: "Focus on: back up slowly" },
      { text: "Pull up to the curb.", tip: "Focus on: curb" },
      { text: "Check your mirrors.", tip: "Focus on: check / mirrors" },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<{ accuracy: number; missing: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const current = phrases[index];

  // Chromium browsers: window.SpeechRecognition or window.webkitSpeechRecognition
  const SpeechRecognitionCtor =
    typeof window !== "undefined"
      ? // @ts-ignore
        (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

  useEffect(() => {
    setSupported(Boolean(SpeechRecognitionCtor));
  }, [SpeechRecognitionCtor]);

  function recordProgress(scored: { accuracy: number; missing: string[] }) {
    const p = loadProgress();
    p.examiner.attempts += 1;
    p.examiner.bestAccuracy = Math.max(p.examiner.bestAccuracy, scored.accuracy / 100);
    p.examiner.lastRunAt = new Date().toISOString();
    bumpStreak(p);
    saveProgress(p);
  }

  function startMic() {
    setError(null);
    setResult(null);
    setTranscript("");

    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }

    // @ts-ignore
    const recog = new SpeechRecognitionCtor();
    recog.lang = "en-US";
    recog.interimResults = true;
    recog.continuous = false;
    // @ts-ignore
    recog.maxAlternatives = 1;

    recog.onstart = () => setListening(true);

    recog.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0]?.transcript ?? "")
        .join(" ");

      setTranscript(text);

      const last = event.results[event.results.length - 1];
      if (last && last.isFinal) {
        const scored = scorePhrase(current.text, text);
        setResult(scored);
        recordProgress(scored);
      }
    };

    recog.onerror = (e: any) => {
      setListening(false);
      setError(e?.error ? `Speech error: ${e.error}` : "Speech error.");
    };

    recog.onend = () => {
      setListening(false);
      // If we never got final, score whatever we captured
      setResult((prev) => {
        if (prev) return prev;
        if (!transcript) return null;
        const scored = scorePhrase(current.text, transcript);
        // optional: only record if we got something
        recordProgress(scored);
        return scored;
      });
    };

    try {
      recog.start();
    } catch {
      setListening(false);
      setError("Could not start microphone. Check permissions.");
    }
  }

  function next() {
    setTranscript("");
    setResult(null);
    setError(null);
    setIndex((i) => (i + 1) % phrases.length);
  }

  function back() {
    setTranscript("");
    setResult(null);
    setError(null);
    setIndex((i) => (i - 1 + phrases.length) % phrases.length);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex justify-center">
        <div className="w-48 overflow-hidden rounded-2xl border bg-white shadow-sm">
          <Image
            src={IMAGES.accent}
            alt="Examiner"
            width={512}
            height={512}
            className="h-auto w-full"
            priority
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-blue-700">Examiner Talk + Speaking Practice</h1>
        <div className="text-sm text-gray-500">
          Phrase {index + 1} of {phrases.length}
        </div>
      </div>

      <p className="mt-2 text-gray-600 max-w-2xl">
        Hear the instruction, then repeat it. Works best in Chrome/Edge. Make sure microphone
        permission is allowed.
      </p>

      {!supported && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          Your browser doesn’t support SpeechRecognition. Try Chrome or Edge.
        </div>
      )}

      <div className="mt-8 bg-white rounded-2xl shadow p-6">
        <div className="text-sm text-gray-500">Instruction</div>
        <div className="mt-2 text-2xl font-semibold">{current.text}</div>
        {current.tip && <div className="mt-2 text-sm text-gray-600">Tip: {current.tip}</div>}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => speak(current.text)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          >
            ▶ Play
          </button>

          <button
            onClick={startMic}
            disabled={!supported || listening}
            className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50 disabled:opacity-50"
          >
            {listening ? "🎙 Listening..." : "🎙 Start Mic"}
          </button>

          <button onClick={back} className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50">
            ← Back
          </button>

          <button onClick={next} className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50">
            Next →
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {transcript && (
          <div className="mt-6">
            <div className="text-sm text-gray-500">You said</div>
            <div className="mt-1 rounded-xl border bg-gray-50 p-3">{transcript}</div>
          </div>
        )}

        {result && (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border p-4">
              <div className="text-sm text-gray-500">Accuracy</div>
              <div className="mt-1 text-3xl font-bold text-blue-700">{result.accuracy}%</div>
            </div>

            <div className="rounded-2xl border p-4">
              <div className="text-sm text-gray-500">Missing words</div>
              <div className="mt-2 text-gray-700">
                {result.missing.length === 0 ? (
                  <span className="text-green-700 font-semibold">None ✅</span>
                ) : (
                  result.missing.join(", ")
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
