'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Activity as ActivityIcon,
  CheckCircle,
  Loader2,
  Monitor,
  Package,
  Clock,
  Users,
  Laptop,
  Printer,
  Cpu,
  FileText,
  CalendarCheck,
} from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  const [total, setTotal] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [inProgress, setInProgress] = useState(0);
  const [totalITAssets, setTotalITAssets] = useState(0);
  const [totalGAAssets, setTotalGAAssets] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [todayActivities, setTodayActivities] = useState<any[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState(0);
  const [purchasePlans, setPurchasePlans] = useState(0);

  const [laptopCount, setLaptopCount] = useState(0);
  const [pcCount, setPCCount] = useState(0);
  const [monitorCount, setMonitorCount] = useState(0);
  const [printerCount, setPrinterCount] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.replace('/login');
      else fetchDashboardStats();
      setSessionChecked(true);
    };
    checkSession();
  }, []);

  const fetchDashboardStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    const [
      { data: actData },
      { data: itAssets },
      { data: gaAssets },
      { data: users },
      { data: plansData },
      { data: purchaseData },
    ] = await Promise.all([
      supabase.from('activities').select('*').gte('created_at', `${today}T00:00:00`),
      supabase.from('it_assets').select('*'),
      supabase.from('ga_assets').select('id'),
      supabase.from('user_profiles').select('id'),
      supabase.from('plans').select('id'),
      supabase.from('purchase_plans').select('id'),
    ]);

    if (actData) {
      setTodayActivities(actData);
      setTotal(actData.length);
      const completedCount = actData.filter((a) => a.status === 'Completed').length;
      setCompleted(completedCount);
      setInProgress(actData.length - completedCount);
    }

    if (itAssets) {
      setTotalITAssets(itAssets.length);
      setLaptopCount(itAssets.filter((a) => a.category === 'Laptop').length);
      setPCCount(itAssets.filter((a) => a.category === 'PC').length);
      setMonitorCount(itAssets.filter((a) => a.category === 'Monitor').length);
      setPrinterCount(itAssets.filter((a) => a.category === 'Printer').length);
    }

    setTotalGAAssets(gaAssets?.length || 0);
    setTotalUsers(users?.length || 0);
    setWeeklyPlans(plansData?.length || 0);
    setPurchasePlans(purchaseData?.length || 0);
    setLoading(false);
  };

  const Card = ({ icon: Icon, title, value, color }: { icon: any; title: string; value: number; color: string }) => (
    <div className="flex items-center gap-4 p-4 rounded-2xl shadow bg-white border hover:shadow-lg transition-transform hover:scale-[1.01]">
      <div className={`p-3 rounded-full bg-${color}-100 text-${color}-700`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );

  if (!sessionChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 text-lg flex items-center gap-2">
          <Loader2 className="animate-spin" /> Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-10">

        <header className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back. Here's a quick overview.</p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Card icon={ActivityIcon} title="Activities Today" value={total} color="blue" />
          <Card icon={CheckCircle} title="Completed" value={completed} color="green" />
          <Card icon={CalendarCheck} title="Weekly Plans" value={weeklyPlans} color="sky" />
          <Card icon={FileText} title="Purchase Plans" value={purchasePlans} color="purple" />
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">IT Asset Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card icon={Laptop} title="Laptop" value={laptopCount} color="cyan" />
            <Card icon={Cpu} title="PC" value={pcCount} color="emerald" />
            <Card icon={Monitor} title="Monitor" value={monitorCount} color="orange" />
            <Card icon={Printer} title="Printer" value={printerCount} color="rose" />
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">General Info</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card icon={Monitor} title="Total IT Assets" value={totalITAssets} color="purple" />
            <Card icon={Package} title="Total GA Assets" value={totalGAAssets} color="indigo" />
            <Card icon={Users} title="Users" value={totalUsers} color="pink" />
          </div>
        </section>

        {todayActivities.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Today's Activities</h2>
            <div className="border-l border-gray-300 pl-4 space-y-4">
              {todayActivities.slice(0, 4).map((a, i) => (
                <div key={i} className="relative pl-4">
                  <span className="absolute -left-[10px] top-1 w-3 h-3 bg-blue-600 rounded-full"></span>
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <div className="text-sm text-gray-700">
                      <span className="font-medium text-blue-600">{a.it}</span> – {a.activity_name}
                    </div>
                    <div className="text-xs text-gray-400 italic">{a.category}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={14} className="text-gray-400" />
                      {format(new Date(a.created_at), 'dd-MMM-yyyy HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
