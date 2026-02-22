export default function ExaminerPage() {
  const phrases = [
    "Turn left.",
    "Turn right.",
    "Stop at the stop sign.",
    "Use your left signal.",
    "Back up slowly.",
  ];

  return (
    <main>
      <h1 className="text-3xl font-bold text-blue-700">Examiner Talk</h1>
      <p className="mt-2 text-gray-600">Common instructions you may hear during the driving test.</p>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        {phrases.map((p, i) => (
          <div key={i} className="bg-white rounded-2xl shadow p-5">
            <div className="text-lg font-semibold">{p}</div>
          </div>
        ))}
      </div>
    </main>
  );
}
