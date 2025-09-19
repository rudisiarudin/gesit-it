'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Activity as ActivityIcon,
  CheckCircle,
  CalendarCheck,
  FileText,
  Laptop,
  Cpu,
  Monitor,
  Printer,
  Package,
  Users,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

type Asset = { category?: string | null };

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sessionChecked, setSessionChecked] = useState(false);

  // KPI – aktivitas & rencana
  const [activitiesToday, setActivitiesToday] = useState<any[]>([]);
  const [completedToday, setCompletedToday] = useState(0);
  const [weeklyPlans, setWeeklyPlans] = useState(0);
  const [purchasePlans, setPurchasePlans] = useState(0);

  // Users & GA
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalGAAssets, setTotalGAAssets] = useState(0);

  // Asset IT/GBP (untuk filter)
  const [assetsIT, setAssetsIT] = useState<Asset[]>([]);
  const [assetsGBP, setAssetsGBP] = useState<Asset[]>([]);
  const [assetFilter, setAssetFilter] = useState<'IT' | 'GBP'>('IT');

  // Totals
  const [totalITAssets, setTotalITAssets] = useState(0);
  const [totalGBPAssets, setTotalGBPAssets] = useState(0);

  // Breakdown (ikut filter)
  const [laptopCount, setLaptopCount] = useState(0);
  const [pcCount, setPCCount] = useState(0);
  const [monitorCount, setMonitorCount] = useState(0);
  const [printerCount, setPrinterCount] = useState(0);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.replace('/login');
      else await fetchStats();
      setSessionChecked(true);
    };
    checkSession();
  }, []);

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];

    const [
      { data: actData },
      { data: itAssets },
      { data: gbpAssets },
      { data: gaAssets },
      { data: users },
      { data: plansData },
      { data: purchaseData },
    ] = await Promise.all([
      supabase.from('activities').select('*').gte('created_at', `${today}T00:00:00`),
      supabase.from('it_assets').select('*'),
      supabase.from('asset_gbp').select('*'),     // <- gunakan tabel asset_gbp
      supabase.from('ga_assets').select('id'),
      supabase.from('user_profiles').select('id'),
      supabase.from('plans').select('id'),
      supabase.from('purchase_plans').select('id'),
    ]);

    // Aktivitas IT (hari ini)
    const acts = actData || [];
    setActivitiesToday(acts);
    setCompletedToday(acts.filter((a: any) => a.status === 'Completed').length);

    // Users, GA, Plans
    setTotalUsers(users?.length || 0);
    setTotalGAAssets(gaAssets?.length || 0);
    setWeeklyPlans(plansData?.length || 0);
    setPurchasePlans(purchaseData?.length || 0);

    // IT / GBP assets
    const itList = (itAssets as Asset[]) || [];
    const gbpList = (gbpAssets as Asset[]) || [];
    setAssetsIT(itList);
    setAssetsGBP(gbpList);
    setTotalITAssets(itList.length);
    setTotalGBPAssets(gbpList.length);

    // default breakdown pakai IT
    recomputeBreakdown(itList);

    setLoading(false);
  };

  const recomputeBreakdown = (list: Asset[]) => {
    const cat = (s?: string | null) => (s || '').toLowerCase();
    setLaptopCount(list.filter(a => cat(a.category).includes('laptop')).length);
    setPCCount(list.filter(a => {
      const c = cat(a.category);
      return c.includes('pc') || c.includes('computer');
    }).length);
    setMonitorCount(list.filter(a => cat(a.category).includes('monitor')).length);
    setPrinterCount(list.filter(a => cat(a.category).includes('printer')).length);
  };

  const onChangeAssetFilter = (val: 'IT' | 'GBP') => {
    setAssetFilter(val);
    recomputeBreakdown(val === 'IT' ? assetsIT : assetsGBP);
  };

  // ---- UI helpers: kelas statis (anti purge) ----
  const tones = {
    blue:   { card: 'bg-gradient-to-br from-blue-50 to-blue-100',       icon: 'bg-blue-600 text-white' },
    green:  { card: 'bg-gradient-to-br from-green-50 to-green-100',     icon: 'bg-green-600 text-white' },
    sky:    { card: 'bg-gradient-to-br from-sky-50 to-sky-100',         icon: 'bg-sky-600 text-white' },
    purple: { card: 'bg-gradient-to-br from-purple-50 to-purple-100',   icon: 'bg-purple-600 text-white' },
    pink:   { card: 'bg-gradient-to-br from-pink-50 to-pink-100',       icon: 'bg-pink-600 text-white' },
    indigo: { card: 'bg-gradient-to-br from-indigo-50 to-indigo-100',   icon: 'bg-indigo-600 text-white' },
    teal:   { card: 'bg-gradient-to-br from-teal-50 to-teal-100',       icon: 'bg-teal-600 text-white' },
    cyan:   { card: 'bg-gradient-to-br from-cyan-50 to-cyan-100',       icon: 'bg-cyan-600 text-white' },
    orange: { card: 'bg-gradient-to-br from-orange-50 to-orange-100',   icon: 'bg-orange-600 text-white' },
    rose:   { card: 'bg-gradient-to-br from-rose-50 to-rose-100',       icon: 'bg-rose-600 text-white' },
    emerald:{ card: 'bg-gradient-to-br from-emerald-50 to-emerald-100', icon: 'bg-emerald-600 text-white' },
  } as const;

  const Card = ({
    title, value, icon: Icon, tone,
  }: { title: string; value: number; icon: any; tone: keyof typeof tones }) => (
    <div className={`relative rounded-2xl p-5 shadow-md ${tones[tone].card} hover:shadow-xl transition`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${tones[tone].icon}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );

  if (!sessionChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <header>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back 👋 Here's an overview.</p>
        </header>

        {/* KPI: Activity IT + Completed + Weekly + Purchase */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card title="Activity IT (Today)" value={activitiesToday.length} icon={ActivityIcon} tone="blue" />
          <Card title="Completed (Today)" value={completedToday} icon={CheckCircle} tone="green" />
          <Card title="Weekly Plans" value={weeklyPlans} icon={CalendarCheck} tone="sky" />
          <Card title="Purchase Plans" value={purchasePlans} icon={FileText} tone="purple" />
        </section>

        {/* Asset Breakdown + Filter */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-700">Asset Breakdown</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Source:</span>
              <select
                value={assetFilter}
                onChange={(e) => onChangeAssetFilter(e.target.value as 'IT' | 'GBP')}
                className="border rounded-lg px-3 py-1 text-sm"
              >
                <option value="IT">IT Assets ({totalITAssets})</option>
                <option value="GBP">GBP Assets ({totalGBPAssets})</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card title="Laptop"  value={laptopCount}  icon={Laptop}  tone="cyan" />
            <Card title="PC"      value={pcCount}      icon={Cpu}     tone="indigo" />
            <Card title="Monitor" value={monitorCount} icon={Monitor} tone="orange" />
            <Card title="Printer" value={printerCount} icon={Printer} tone="rose" />
          </div>
        </section>

        {/* General Totals (opsional, tetap ringan) */}
        <section>
          <h2 className="text-lg font-semibold text-gray-700 mb-3">General Info</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <Card title="Total IT Assets"  value={totalITAssets}  icon={Monitor} tone="purple" />
            <Card title="Total GBP Assets"  value={totalGBPAssets}  icon={Package} tone="teal" />
            <Card title="Total Users"      value={totalUsers}      icon={Users}   tone="pink" />
          </div>
        </section>

        {/* Today's Activities timeline */}
        {activitiesToday.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Today's Activities</h2>
            <div className="border-l-2 border-blue-300 pl-4 space-y-4">
              {activitiesToday.slice(0, 5).map((a, i) => (
                <div key={i} className="relative pl-4">
                  <span className="absolute -left-[10px] top-2 w-3 h-3 bg-blue-600 rounded-full"></span>
                  <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-blue-600">{a.it}</span> – {a.activity_name}
                    </p>
                    <p className="text-xs text-gray-400">{a.category}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={14} className="text-gray-400" />
                      {format(new Date(a.created_at), 'dd-MMM-yyyy HH:mm')}
                    </p>
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
