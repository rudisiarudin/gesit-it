"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Activity,
  CheckCircle,
  Loader2,
  Monitor,
  Package,
} from "lucide-react";

export default function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [inProgress, setInProgress] = useState(0);
  const [totalITAssets, setTotalITAssets] = useState(0);
  const [totalGAAssets, setTotalGAAssets] = useState(0);
  const [todayActivities, setTodayActivities] = useState<any[]>([]);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
      } else {
        fetchDashboardStats();
      }

      setSessionChecked(true);
    };

    checkSession();
  }, []);

  const fetchDashboardStats = async () => {
    const today = new Date().toISOString().split("T")[0];

    const [{ data: actData }, { data: itAssets }, { data: gaAssets }] = await Promise.all([
      supabase.from("activities").select("*").gte("created_at", `${today}T00:00:00`),
      supabase.from("it_assets").select("id"),
      supabase.from("ga_assets").select("id"),
    ]);

    if (actData) {
      setTodayActivities(actData);
      const totalActivities = actData.length;
      const completedActivities = actData.filter((a) => a.status === "Completed").length;
      setTotal(totalActivities);
      setCompleted(completedActivities);
      setInProgress(totalActivities - completedActivities);
    }

    setTotalITAssets(itAssets?.length || 0);
    setTotalGAAssets(gaAssets?.length || 0);

    setLoading(false);
  };

  const Card = ({
    icon: Icon,
    title,
    value,
    bg,
    textColor,
    iconColor,
  }: {
    icon: any;
    title: string;
    value: number;
    bg: string;
    textColor: string;
    iconColor: string;
  }) => (
    <div
      className={`flex items-center gap-4 rounded-2xl p-5 shadow-sm ${bg} transition hover:scale-[1.02] hover:shadow-md`}
    >
      <div className={`p-3 rounded-xl ${iconColor} bg-white shadow-sm`}>
        <Icon size={28} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${textColor}`}>{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  if (!sessionChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">Memuat dashboard...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 bg-gray-100">
      <div className="bg-white rounded-2xl shadow p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Dashboard Utama
        </h1>
        <p className="text-gray-600 text-lg">
          Selamat datang di sistem log IT <span className="font-semibold">Gesit</span>.
        </p>

        {/* Aktivitas */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            icon={Activity}
            title="Total Aktivitas"
            value={total}
            bg="bg-blue-50"
            textColor="text-blue-800"
            iconColor="text-blue-600"
          />
          <Card
            icon={CheckCircle}
            title="Selesai"
            value={completed}
            bg="bg-green-50"
            textColor="text-green-800"
            iconColor="text-green-600"
          />
          <Card
            icon={Loader2}
            title="Proses"
            value={inProgress}
            bg="bg-yellow-50"
            textColor="text-yellow-800"
            iconColor="text-yellow-600"
          />
        </div>

        {/* Aset */}
        <h2 className="text-xl font-semibold text-gray-700 mt-10 mb-4">
          Ringkasan Aset
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          <Card
            icon={Monitor}
            title="Aset IT"
            value={totalITAssets}
            bg="bg-purple-50"
            textColor="text-purple-800"
            iconColor="text-purple-600"
          />
          <Card
            icon={Package}
            title="Aset GA"
            value={totalGAAssets}
            bg="bg-indigo-50"
            textColor="text-indigo-800"
            iconColor="text-indigo-600"
          />
        </div>

        {/* Notifikasi Hari Ini */}
        {todayActivities.length > 0 && (
          <>
            <h2 className="text-xl font-semibold text-gray-700 mt-10 mb-4">
              Aktivitas Hari Ini
            </h2>
            <ul className="divide-y divide-gray-200 bg-white rounded-xl border shadow-sm">
              {todayActivities.map((a, i) => (
                <li key={i} className="p-4 text-sm text-gray-700">
                  <span className="font-semibold">{a.user || "User"}</span> - {a.activity}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
