import "./globals.css";

export const metadata = {
  title: "RoadReady English",
  description: "Learn the English you need for the Florida driver test.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-bold text-blue-700 text-lg">
              RoadReady English
            </a>

            <nav className="flex gap-4 text-sm">

              <a className="hover:underline" href="/lesson/day-1">
                Lesson
              </a>
<a className="hover:underline" href="/speaking">
  Speaking
</a>
              <a className="hover:underline" href="/signs">
                Signs
              </a>
              <a className="hover:underline" href="/examiner">
                Examiner
              </a>
            </nav>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </body>
    </html>
  );
}
