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

  if (loading) return <div className="p-6 text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md border">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-3xl font-semibold text-gray-800 mb-6">User Profile</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="mt-1 w-full px-4 py-2 bg-gray-100 rounded-lg border border-gray-300 text-sm text-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <input
            type="text"
            value={profile.role}
            disabled
            className="mt-1 w-full px-4 py-2 bg-gray-100 rounded-lg border border-gray-300 text-sm text-gray-600"
          />
        </div>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg transition"
        >
          Save Changes
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-5 py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
