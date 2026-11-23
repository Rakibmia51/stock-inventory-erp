
import { useState, useEffect } from 'react';
import { getUsers, updatePermissions, createNewUser } from '../services/api';
import { Shield, Save, UserPlus, X } from 'lucide-react';

export default function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // নতুন ইউজার ফর্ম স্টেট
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'staff',
    permissions: {
      products: false,
      suppliers: false,
      clients: false,
      purchases: false,
      invoices: false,
      accounts: false,
      users: false
    }
  });

  const fetchUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCheckboxChange = (userId, moduleKey) => {
    setUsers(users.map(u => {
      if (u._id === userId) {
        const currentPerms = u.permissions || {};
        return {
          ...u,
          permissions: {
            ...currentPerms,
            [moduleKey]: !currentPerms[moduleKey]
          }
        };
      }
      return u;
    }));
  };

  const handleSave = async (user) => {
    setLoading(true);
    try {
      await updatePermissions({
        userId: user._id,
        userType: user.userType,
        permissions: user.permissions
      });
      alert(`Permissions updated successfully for ${user.name}!`);
      fetchUsers();
    } catch (err) {
      alert('Failed to update permissions');
    } finally {
      setLoading(false);
    }
  };

  // নতুন ইউজার সাবমিট হ্যান্ডলার
  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createNewUser(newUser);
      alert('New user created successfully!');
      setShowAddModal(false);
      setNewUser({
        name: '', email: '', password: '', userType: 'staff',
        permissions: 
          { products: false, 
            suppliers: false, 
            clients: false, 
            purchases: false, 
            invoices: false, 
            accounts: false 
          }
      });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

// ১. অ্যাক্সেস চেক আপডেট:
const isAdmin = (currentUser?.userType || '').toLowerCase() === 'admin' || (currentUser?.role || '').toLowerCase() === 'admin';
if (!isAdmin && !currentUser?.permissions?.users) {
  return <div className="p-6 text-red-500 font-bold">Access Denied. You do not have permission to manage users.</div>;
}

// ২. মডিউল লিস্টে 'users' চেক বক্স যুক্ত করা:
const modules = [
  { key: 'products', label: 'Inventory / Products' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'clients', label: 'Clients' },
  { key: 'purchases', label: 'Purchase Orders' },
  { key: 'invoices', label: 'Sales & Invoices' },
  { key: 'accounts', label: 'Accounts / Finance' },
  { key: 'users', label: 'User Management' } // নতুন চেক বক্স
];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">User & Permission Control</h2>
          <p className="text-sm text-slate-500">Create staff accounts and assign dynamic module permissions.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
        >
          <UserPlus className="w-4 h-4" /> Add New User
        </button>
      </div>

      {/* ইউজার লিস্ট টেবিল */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
                <th className="p-4">User Details</th>
                <th className="p-4">User Type</th>
                <th className="p-4">Module Permissions</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <select 
                      value={u.userType || 'staff'}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUsers(users.map(item => item._id === u._id ? { ...item, userType: val } : item));
                      }}
                      className="border border-slate-200 p-2 rounded-xl text-xs font-semibold bg-white"
                    >
                      <option value="admin">Admin</option>
                      <option value="staff">Staff</option>
                      <option value="others">Others</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-3">
                      {modules.map(mod => (
                        <label key={mod.key} className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
                          <input 
                            type="checkbox"
                            checked={u.permissions?.[mod.key] || false}
                            onChange={() => handleCheckboxChange(u._id, mod.key)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          />
                          {mod.label}
                        </label>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleSave(u)}
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Save className="w-3.5 h-3.5" /> Save
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* নতুন ইউজার তৈরির মডাল (Modal) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-slate-800">Create New User Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Staff Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="staff@nexuserp.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">User Type / Role</label>
                <select
                  value={newUser.userType}
                  onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="staff">Staff</option>
                  <option value="others">Others</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Initial Module Permissions</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {modules.map(mod => (
                    <label key={mod.key} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={newUser.permissions[mod.key]}
                        onChange={() => setNewUser({
                          ...newUser,
                          permissions: { ...newUser.permissions, [mod.key]: !newUser.permissions[mod.key] }
                        })}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                      />
                      {mod.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-3 border-t">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-md transition"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}