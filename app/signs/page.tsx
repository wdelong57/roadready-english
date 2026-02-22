export default function SignsPage() {
  const signs = [
    { name: "Stop", meaning: "Come to a complete stop" },
    { name: "Yield", meaning: "Let other traffic go first" },
    { name: "Speed Limit", meaning: "Maximum allowed speed" },
    { name: "No U-Turn", meaning: "U-turn not allowed" },
    { name: "One Way", meaning: "Traffic flows one direction" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <h1 className="text-3xl font-bold text-blue-700 mb-8">
        Road Signs Trainer
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {signs.map((s, i) => (
          <div key={i} className="p-6 bg-white rounded-xl shadow">
            <div className="text-2xl font-semibold text-blue-700">
              {s.name}
            </div>
            <div className="mt-2 text-gray-600">
              {s.meaning}
            </div>
          </div>
        ))}
      </div>

      <a
        href="/"
        className="inline-block mt-10 text-blue-600 hover:underline"
      >
        ← Back to Home
      </a>
    </main>
  );
}
