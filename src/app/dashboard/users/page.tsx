'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Toast from '@/components/Toast';

type UserProfile = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  is_active?: boolean;
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, email, username, full_name, role, is_active');

    if (!error && data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.full_name.toLowerCase().includes(search.toLowerCase())
  );

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

      <input
        type="text"
        placeholder="Search by email, name, or username..."
        className="mb-4 p-2 border rounded w-full max-w-sm"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

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
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-t">
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
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
