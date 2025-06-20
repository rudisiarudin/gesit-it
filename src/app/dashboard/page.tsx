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

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) router.replace('/login');
      else fetchDashboardStats();
      setSessionChecked(true);
    };
    checkSession();
  }, []);

  const fetchDashboardStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    const [{ data: actData }, { data: itAssets }, { data: gaAssets }, { data: users }] =
      await Promise.all([
        supabase.from('activities').select('*').gte('created_at', `${today}T00:00:00`),
        supabase.from('it_assets').select('id'),
        supabase.from('ga_assets').select('id'),
        supabase.from('user_profiles').select('id'),
      ]);

    if (actData) {
      setTodayActivities(actData);
      const totalActivities = actData.length;
      const completedActivities = actData.filter(
        (a) => a.status === 'Completed'
      ).length;
      setTotal(totalActivities);
      setCompleted(completedActivities);
      setInProgress(totalActivities - completedActivities);
    }

    setTotalITAssets(itAssets?.length || 0);
    setTotalGAAssets(gaAssets?.length || 0);
    setTotalUsers(users?.length || 0);

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
      className={`flex items-center gap-4 rounded-xl p-5 shadow bg-white border hover:shadow-md transition-transform hover:scale-[1.02] ${bg}`}
    >
      <div className={`p-3 rounded-full ${iconColor} bg-opacity-10`}>
        <Icon size={28} className={iconColor} />
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
        <div className="text-gray-500 text-lg flex items-center gap-2">
          <Loader2 className="animate-spin" /> Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              IT Gesit Dashboard
            </h1>
            <p className="text-gray-600 text-base mt-1">
              Welcome back. Here's your activity summary.
            </p>
          </div>
        </div>

        {/* Activity Summary */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            icon={ActivityIcon}
            title="Total Activities"
            value={total}
            bg=""
            textColor="text-blue-700"
            iconColor="text-blue-700"
          />
          <Card
            icon={CheckCircle}
            title="Completed"
            value={completed}
            bg=""
            textColor="text-green-700"
            iconColor="text-green-700"
          />
          <Card
            icon={Loader2}
            title="In Progress"
            value={inProgress}
            bg=""
            textColor="text-yellow-700"
            iconColor="text-yellow-700"
          />
        </div>

        {/* Asset Summary */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Asset Summary</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card
              icon={Monitor}
              title="IT Assets"
              value={totalITAssets}
              bg=""
              textColor="text-purple-700"
              iconColor="text-purple-700"
            />
            <Card
              icon={Package}
              title="GA Assets"
              value={totalGAAssets}
              bg=""
              textColor="text-indigo-700"
              iconColor="text-indigo-700"
            />
            <Card
              icon={Users}
              title="Total Users"
              value={totalUsers}
              bg=""
              textColor="text-pink-700"
              iconColor="text-pink-700"
            />
          </div>
        </div>

        {/* Today's Activities Timeline */}
        {todayActivities.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">Today's Activities</h2>
            <div className="relative border-l border-gray-200 pl-4">
              {todayActivities
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
                .slice(0, 4)
                .map((a, i) => (
                  <div key={i} className="mb-6 relative">
                    <span className="absolute -left-2 top-1.5 w-4 h-4 bg-blue-600 rounded-full border border-white"></span>
                    <div className="bg-white p-4 rounded-lg shadow border">
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold text-blue-700">{a.it}</span> -{' '}
                        {a.activity_name}
                      </div>
                      <div className="text-xs text-gray-500 italic">{a.category}</div>
                      <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={14} className="text-gray-400" />
                        {format(new Date(a.created_at), 'dd-MMM-yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
