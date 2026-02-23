import Image from "next/image";
import { IMAGES } from "@/lib/images";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold text-blue-700">
            RoadReady English
          </h1>

          <p className="mt-4 text-lg text-gray-600">
            Learn the English you need to pass your Florida driver test.
            Practice vocabulary, signs, and speaking.
          </p>

          <div className="mt-6 flex gap-3">
            <a href="/lesson/day-1" className="rounded-xl bg-blue-600 px-5 py-3 text-white">
              Start Day 1
            </a>

            <a href="/progress" className="rounded-xl border px-5 py-3">
              View Progress
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border shadow-sm">
          <Image
            src={IMAGES.hero}
            alt="RoadReady learning"
            width={1200}
            height={800}
            priority
            className="h-auto w-full"
          />
        </div>
      </section>
    </main>
  );
}
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900">
      <header className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-700">
          Learn the English You Need for the Florida Driver Test
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl">
          Practice road signs, DMV test vocabulary, and examiner instructions in short daily lessons.
        </p>

        <div className="mt-6 flex gap-4">
          <a
            href="/lesson/day-1"
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
          >
            Start Free Lesson
          </a>
          <a
            href="/signs"
            className="px-6 py-3 bg-white border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50"
          >
            Practice Road Signs
          </a>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded-2xl shadow">
          <h3 className="text-xl font-semibold text-blue-700">DMV Test English</h3>
          <p className="mt-2 text-gray-600">
            Learn words like yield, merge, intersection, speed limit, and more.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow">
          <h3 className="text-xl font-semibold text-blue-700">Road Signs</h3>
          <p className="mt-2 text-gray-600">
            Study real Florida road signs with meaning and quick quizzes.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow">
          <h3 className="text-xl font-semibold text-blue-700">Examiner Talk</h3>
          <p className="mt-2 text-gray-600">
            Understand instructions like “turn left”, “stop”, and “back up”.
          </p>
        </div>
      </section>

      <footer className="text-center text-sm text-gray-500 py-10">
        Built by FreedomUSA — tech support that never closes
      </footer>
    </main>
  );
}
