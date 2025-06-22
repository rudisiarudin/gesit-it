'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const getProfile = async () => {
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError || !userData.user) {
        router.push('/login');
        return;
      }

      const user = userData.user;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('full_name, username, email, role')
        .eq('id', user.id)
        .single();

      if (!error && data) {
        setProfile({ ...data, email: user.email });
        setFullName(data.full_name);
        setUsername(data.username);
      }

      setLoading(false);
    };

    getProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ full_name: fullName, username })
      .eq('email', profile.email);

    if (updateError) {
      setToast({ message: 'Failed to update profile', type: 'error' });
      return;
    }

    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      await fetch('/api/update-profile-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          full_name: fullName,
          username: username,
        }),
      });
    }

    setToast({ message: 'Profile updated successfully!', type: 'success' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="p-6 text-gray-500 text-center">Loading profile...</div>;

  return (
    <div className="max-w-xl mx-auto mt-12 p-8 bg-white rounded-3xl shadow-lg border border-gray-200">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Your Profile
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="w-full rounded-xl border border-gray-300 bg-gray-100 px-5 py-3 text-gray-500 text-sm cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-5 py-3 text-gray-900 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your username"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-5 py-3 text-gray-900 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
          <input
            type="text"
            value={profile.role}
            disabled
            className="w-full rounded-xl border border-gray-300 bg-gray-100 px-5 py-3 text-gray-500 text-sm cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex justify-between gap-4 pt-6">
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-2xl px-6 py-3 shadow-lg transition-transform active:scale-95"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-400 hover:from-red-600 hover:to-red-500 text-white font-semibold rounded-2xl px-6 py-3 shadow-lg transition-transform active:scale-95"
          >
            Logout
          </button>
        </div>
      </form>
    </div>
  );
}
