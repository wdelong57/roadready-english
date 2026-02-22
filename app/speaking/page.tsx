"use client";

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

  // Missing words from target
  const sSet = new Set(s);
  const missing = t.filter((w) => !sSet.has(w));

  return { accuracy, missing };
}

export default function SpeakingPage() {
  const phrases: Phrase[] = useMemo(
    () => [
      { text: "Turn left.", tip: "Say: turn left" },
      { text: "Turn right.", tip: "Say: turn right" },
      { text: "Stop at the stop sign.", tip: "Focus on: stop / stop sign" },
      { text: "Use your left signal.", tip: "Focus on: left signal" },
      { text: "Back up slowly.", tip: "Focus on: back up" },
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

  // We use the Web Speech API (SpeechRecognition) available in Chromium browsers.
  const SpeechRecognitionCtor =
    typeof window !== "undefined"
      ? // @ts-ignore
        (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;

  useEffect(() => {
    setSupported(Boolean(SpeechRecognitionCtor));
  }, [SpeechRecognitionCtor]);

  function start() {
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
    // Some browsers support this; safe to set
    // @ts-ignore
    recog.maxAlternatives = 1;

    recog.onstart = () => {
      setListening(true);
    };

    recog.onresult = (event: any) => {
      const text = Array.from(event.results)
        .map((r: any) => r[0]?.transcript ?? "")
        .join(" ");
      setTranscript(text);

      // If final result exists, score it
      const last = event.results[event.results.length - 1];
      if (last && last.isFinal) {
        const scored = scorePhrase(current.text, text);
        setResult(scored);
      }
    };

    recog.onerror = (e: any) => {
      setListening(false);
      setError(e?.error ? `Speech error: ${e.error}` : "Speech error.");
    };

    recog.onend = () => {
      setListening(false);
      // If we never got a final result, score what we have
      if (!result && transcript) {
        setResult(scorePhrase(current.text, transcript));
      }
    };

    try {
      recog.start();
    } catch (e: any) {
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

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-blue-700">Speaking Practice</h1>
        <div className="text-sm text-gray-500">
          Phrase {index + 1} of {phrases.length}
        </div>
      </div>

      <p className="mt-2 text-gray-600 max-w-2xl">
        Tap “Play” to hear the phrase, then tap “Start Mic” and repeat it. Works best in Chrome/Edge.
      </p>

      {!supported && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          Your browser doesn’t support SpeechRecognition. Try Chrome or Edge.
        </div>
      )}

      <div className="mt-8 bg-white rounded-2xl shadow p-6">
        <div className="text-sm text-gray-500">Target phrase</div>
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
            onClick={start}
            disabled={!supported || listening}
            className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50 disabled:opacity-50"
          >
            {listening ? "🎙 Listening..." : "🎙 Start Mic"}
          </button>

          <button
            onClick={next}
            className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-50"
          >
            Next →
          </button>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
            <div className="mt-2 text-sm text-red-600">
              If you see “not-allowed”, allow microphone permission for this site.
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="text-sm text-gray-500">What the app heard</div>
          <div className="mt-2 p-3 rounded-xl bg-gray-50 border min-h-[48px]">
            {transcript || <span className="text-gray-400">—</span>}
          </div>
        </div>

        {result && (
          <div className="mt-6 p-4 rounded-xl border bg-green-50 border-green-200">
            <div className="font-semibold">Accuracy: {result.accuracy}%</div>
            {result.missing.length > 0 ? (
              <div className="mt-2 text-sm text-gray-700">
                Missing words:{" "}
                <span className="font-medium">{result.missing.join(", ")}</span>
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-700">Nice! You hit all key words.</div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        Note: Some browsers require HTTPS and user interaction before mic starts.
      </div>
    </main>
  );
}
