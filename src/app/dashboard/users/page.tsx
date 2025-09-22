'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Toast from '@/components/Toast';
import Select from 'react-select';
import { RotateCcw, Slash, AlertCircle } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

const ALL_GROUPS = ['IT', 'GA', 'HR', 'Finance', 'BoC', 'GBP'];

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
  const [search, setSearch] = useState('');

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
    try {
      const { error } = await supabase.from('user_profiles').update({ role: newRole }).eq('id', id);
      if (error) throw error;

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
    } catch {
      showToast('Failed to update role.', 'error');
    }
  };

  const updateName = async (id: string, newName: string) => {
    try {
      const { error } = await supabase.from('user_profiles').update({ full_name: newName }).eq('id', id);
      if (error) throw error;

      setUsers(users.map(user => user.id === id ? { ...user, full_name: newName } : user));
      showToast('Name updated.', 'success');
    } catch {
      showToast('Failed to update name.', 'error');
    }
  };

  const updateGroups = async (id: string, newGroups: string[]) => {
    try {
      const { error } = await supabase.from('user_profiles').update({ groups: newGroups }).eq('id', id);
      if (error) throw error;

      setUsers(users.map(user => user.id === id ? { ...user, groups: newGroups } : user));
      showToast('Groups updated.', 'success');
    } catch {
      showToast('Failed to update groups.', 'error');
    }
  };

  const disableUser = async (id: string) => {
    if (!confirm('Are you sure you want to disable this user?')) return;

    try {
      const { error } = await supabase.from('user_profiles').update({ is_active: false }).eq('id', id);
      if (error) throw error;

      setUsers(users.map(user => user.id === id ? { ...user, is_active: false } : user));
      showToast('User disabled.', 'success');
    } catch {
      showToast('Failed to disable user.', 'error');
    }
  };

  const sendResetEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/reset-password`,
      });
      if (error) throw error;

      showToast(`Reset email sent to ${email}`, 'success');
    } catch {
      showToast('Failed to send reset email.', 'error');
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.username?.toLowerCase().includes(search.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems,
  } = usePagination(filteredUsers.length, 10);

  if (authorized === null) return <p>Checking authorization...</p>;
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email or username..."
          className="w-full md:w-1/3 px-3 py-2 border rounded-md shadow-sm"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1); // reset to page 1 on search
          }}
        />
      </div>

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
              {paginatedItems(filteredUsers).map(user => (
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
                    <Select
                      isMulti
                      options={ALL_GROUPS.map(g => ({ label: g, value: g }))}
                      value={(user.groups || []).map(g => ({ label: g, value: g }))}
                      onChange={(selected) => {
                        const selectedValues = selected.map(s => s.value);
                        updateGroups(user.id, selectedValues);
                      }}
                      className="text-sm"
                      classNamePrefix="select"
                    />
                  </td>
                  <td className="p-3">
                    {user.is_active === false ? (
                      <span className="text-red-500 font-medium">Inactive</span>
                    ) : (
                      <span className="text-green-600 font-medium">Active</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => sendResetEmail(user.email)}
                        className="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-xs transition duration-200"
                      >
                        <RotateCcw size={14} />
                        Reset Password
                      </button>
                      <button
                        onClick={() => disableUser(user.id)}
                        disabled={user.is_active === false}
                        className={`flex items-center justify-center gap-1 px-3 py-1 rounded-md text-xs transition duration-200
                          ${user.is_active === false
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600 text-white'}
                        `}
                      >
                        <Slash size={14} />
                        Disable
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

