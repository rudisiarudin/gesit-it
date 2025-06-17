"use client";

export default function Page() {
  return (
    <main className="min-h-screen px-4 py-6 md:px-8 bg-gray-50">
      <div className="bg-white rounded-2xl shadow p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          Dashboard Utama
        </h1>
        <p className="text-gray-600 text-lg">
          Selamat datang di sistem log IT <span className="font-semibold">Gesit</span>.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-blue-100 p-4 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-blue-800">Total Aktivitas</h2>
            <p className="text-2xl font-bold text-blue-900">--</p>
          </div>
          <div className="bg-green-100 p-4 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-green-800">Selesai</h2>
            <p className="text-2xl font-bold text-green-900">--</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-yellow-800">Proses</h2>
            <p className="text-2xl font-bold text-yellow-900">--</p>
          </div>
        </div>
      </div>
    </main>
  );
}
