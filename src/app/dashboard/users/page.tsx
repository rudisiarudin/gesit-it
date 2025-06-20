'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Toast from '@/components/Toast';
import { AlertCircle } from 'lucide-react';

type UserProfile = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  groups?: string[];
  is_active?: boolean;
};

export default function UserManagementPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        router.replace('/login');
        return;
      }

      const role = data.user.user_metadata?.role || null;

      if (role === 'admin') {
        setAuthorized(true);
        fetchUsers();
      } else {
        setAuthorized(false);
        setTimeout(() => {
          router.replace('/dashboard');
        }, 1500);
      }
    };

    checkAuth();
  }, [router]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email, username, full_name, role, groups, is_active');
    if (!error && data) setUsers(data);
    setLoading(false);
  };

  const updateRole = async (id: string, newRole: string) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ role: newRole })
      .eq('id', id);

    if (!error) {
      setUsers(users.map(user => user.id === id ? { ...user, role: newRole } : user));
      showToast('Role updated successfully.', 'success');

      const res = await fetch('/api/update-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, role: newRole }),
      });

      const result = await res.json();
      if (!res.ok) {
        showToast(`Auth metadata update failed: ${result.error}`, 'error');
      }
    } else {
      showToast('Failed to update role.', 'error');
    }
  };

  const updateName = async (id: string, newName: string) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ full_name: newName })
      .eq('id', id);

    if (!error) {
      setUsers(users.map(user => user.id === id ? { ...user, full_name: newName } : user));
      showToast('Name updated.', 'success');
    } else {
      showToast('Failed to update name.', 'error');
    }
  };

  const updateGroups = async (id: string, newGroups: string[]) => {
    const { error } = await supabase
      .from('user_profiles')
      .update({ groups: newGroups })
      .eq('id', id);

    if (!error) {
      setUsers(users.map(user => user.id === id ? { ...user, groups: newGroups } : user));
      showToast('Groups updated.', 'success');
    } else {
      showToast('Failed to update groups.', 'error');
    }
  };

  const disableUser = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to disable this user?");
    if (!confirmed) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ is_active: false })
      .eq('id', id);

    if (!error) {
      setUsers(users.map(user => user.id === id ? { ...user, is_active: false } : user));
      showToast('User disabled.', 'success');
    } else {
      showToast('Failed to disable user.', 'error');
    }
  };

  const sendResetEmail = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`,
    });

    if (!error) {
      showToast(`Reset email sent to ${email}`, 'success');
    } else {
      showToast('Failed to send reset email.', 'error');
    }
  };

  if (authorized === null) {
    return <p>Checking authorization...</p>;
  }

  if (authorized === false) {
    return (
     <div className="p-6 text-center text-red-600 flex flex-col items-center gap-3">
      <AlertCircle size={48} className="mx-auto" />
      <p className="font-bold text-lg">You do not have permission to access this page.</p>
      <p className="font-semibold">Redirecting...</p>
    </div>
    );
  }

  return (
    <div className="p-6">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-auto rounded shadow bg-white">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 text-xs font-semibold">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Username</th>
                <th className="p-3">Full Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Groups</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
              {users.map(user => (
                <tr key={user.id} className="border-t align-top">
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.username}</td>
                  <td className="p-3">
                    <input
                      value={user.full_name}
                      onChange={(e) => updateName(user.id, e.target.value)}
                      className="border px-2 py-1 rounded w-full"
                    />
                  </td>
                  <td className="p-3">
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="user">User</option>
                    </select>
                  </td>
                  <td className="p-3">
                    {user.groups?.join(', ') || '-'}
                  </td>
                  <td className="p-3">
                    {user.is_active === false ? (
                      <span className="text-red-500 font-medium">Inactive</span>
                    ) : (
                      <span className="text-green-600 font-medium">Active</span>
                    )}
                  </td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={() => sendResetEmail(user.email)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                    >
                      Reset Password
                    </button>
                    <button
                      onClick={() => disableUser(user.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                      disabled={user.is_active === false}
                    >
                      Disable
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
