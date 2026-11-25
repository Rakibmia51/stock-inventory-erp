
// import { useState, useEffect } from 'react';
// import { getUsers, updatePermissions, createNewUser } from '../services/api';
// import { Shield, Save, UserPlus, X } from 'lucide-react';

// export default function UserManagement({ currentUser }) {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showAddModal, setShowAddModal] = useState(false);

//   // নতুন ইউজার ফর্ম স্টেট
//   const [newUser, setNewUser] = useState({
//     name: '',
//     email: '',
//     password: '',
//     userType: 'staff',
//     permissions: {
//       products: false,
//       suppliers: false,
//       clients: false,
//       purchases: false,
//       invoices: false,
//       accounts: false,
//       reports: false,
//       users: false
//     }
//   });

//   const fetchUsers = async () => {
//     try {
//       const { data } = await getUsers();
//       setUsers(data);
//     } catch (err) {
//       console.error('Error fetching users:', err);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const handleCheckboxChange = (userId, moduleKey) => {
//     setUsers(users.map(u => {
//       if (u._id === userId) {
//         const currentPerms = u.permissions || {};
//         return {
//           ...u,
//           permissions: {
//             ...currentPerms,
//             [moduleKey]: !currentPerms[moduleKey]
//           }
//         };
//       }
//       return u;
//     }));
//   };

//   const handleSave = async (user) => {
//     setLoading(true);
//     try {
//       await updatePermissions({
//         userId: user._id,
//         userType: user.userType,
//         permissions: user.permissions
//       });
//       alert(`Permissions updated successfully for ${user.name}!`);
//       fetchUsers();
//     } catch (err) {
//       alert('Failed to update permissions');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // নতুন ইউজার সাবমিট হ্যান্ডলার
//   const handleCreateUserSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await createNewUser(newUser);
//       alert('New user created successfully!');
//       setShowAddModal(false);
//       setNewUser({
//         name: '', email: '', password: '', userType: 'staff',
//         permissions: 
//           { products: false, 
//             suppliers: false, 
//             clients: false, 
//             purchases: false, 
//             invoices: false, 
//             accounts: false,
//             reports: false, 
//           }
//       });
//       fetchUsers();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Failed to create user');
//     } finally {
//       setLoading(false);
//     }
//   };

// // ১. অ্যাক্সেস চেক আপডেট:
// const isAdmin = (currentUser?.userType || '').toLowerCase() === 'admin' || (currentUser?.role || '').toLowerCase() === 'admin';
// if (!isAdmin && !currentUser?.permissions?.users) {
//   return <div className="p-6 text-red-500 font-bold">Access Denied. You do not have permission to manage users.</div>;
// }

// // ২. মডিউল লিস্টে 'users' চেক বক্স যুক্ত করা:
// const modules = [
//   { key: 'products', label: 'Inventory / Products' },
//   { key: 'suppliers', label: 'Suppliers' },
//   { key: 'clients', label: 'Clients' },
//   { key: 'purchases', label: 'Purchase Orders' },
//   { key: 'invoices', label: 'Sales & Invoices' },
//   { key: 'accounts', label: 'Accounts / Finance' },
//   { key: 'reports', label: 'Reports' },
//   { key: 'users', label: 'User Management' } // নতুন চেক বক্স
// ];

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-2xl font-bold text-slate-800">User & Permission Control</h2>
//           <p className="text-sm text-slate-500">Create staff accounts and assign dynamic module permissions.</p>
//         </div>
//         <button
//           onClick={() => setShowAddModal(true)}
//           className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition"
//         >
//           <UserPlus className="w-4 h-4" /> Add New User
//         </button>
//       </div>

//       {/* ইউজার লিস্ট টেবিল */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse min-w-[800px]">
//             <thead>
//               <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
//                 <th className="p-4">User Details</th>
//                 <th className="p-4">User Type</th>
//                 <th className="p-4">Module Permissions</th>
//                 <th className="p-4 text-right">Action</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y text-sm">
//               {users.map(u => (
//                 <tr key={u._id} className="hover:bg-slate-50/50">
//                   <td className="p-4">
//                     <p className="font-bold text-slate-800">{u.name}</p>
//                     <p className="text-xs text-slate-400">{u.email}</p>
//                   </td>
//                   <td className="p-4">
//                     <select 
//                       value={u.userType || 'staff'}
//                       onChange={(e) => {
//                         const val = e.target.value;
//                         setUsers(users.map(item => item._id === u._id ? { ...item, userType: val } : item));
//                       }}
//                       className="border border-slate-200 p-2 rounded-xl text-xs font-semibold bg-white"
//                     >
//                       <option value="admin">Admin</option>
//                       <option value="staff">Staff</option>
//                       <option value="others">Others</option>
//                     </select>
//                   </td>
//                   <td className="p-4">
//                     <div className="flex flex-wrap gap-3">
//                       {modules.map(mod => (
//                         <label key={mod.key} className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer select-none">
//                           <input 
//                             type="checkbox"
//                             checked={u.permissions?.[mod.key] || false}
//                             onChange={() => handleCheckboxChange(u._id, mod.key)}
//                             className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
//                           />
//                           {mod.label}
//                         </label>
//                       ))}
//                     </div>
//                   </td>
//                   <td className="p-4 text-right">
//                     <button 
//                       onClick={() => handleSave(u)}
//                       disabled={loading}
//                       className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition"
//                     >
//                       <Save className="w-3.5 h-3.5" /> Save
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* নতুন ইউজার তৈরির মডাল (Modal) */}
//       {showAddModal && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
//             <div className="flex justify-between items-center border-b pb-3">
//               <h3 className="text-lg font-bold text-slate-800">Create New User Account</h3>
//               <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleCreateUserSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
//                 <input
//                   type="text"
//                   placeholder="Staff Name"
//                   value={newUser.name}
//                   onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
//                   className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
//                 <input
//                   type="email"
//                   placeholder="staff@nexuserp.com"
//                   value={newUser.email}
//                   onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
//                   className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
//                 <input
//                   type="password"
//                   placeholder="••••••••"
//                   value={newUser.password}
//                   onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
//                   className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">User Type / Role</label>
//                 <select
//                   value={newUser.userType}
//                   onChange={(e) => setNewUser({ ...newUser, userType: e.target.value })}
//                   className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="staff">Staff</option>
//                   <option value="others">Others</option>
//                   <option value="admin">Admin</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-2">Initial Module Permissions</label>
//                 <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
//                   {modules.map(mod => (
//                     <label key={mod.key} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
//                       <input 
//                         type="checkbox"
//                         checked={newUser.permissions[mod.key]}
//                         onChange={() => setNewUser({
//                           ...newUser,
//                           permissions: { ...newUser.permissions, [mod.key]: !newUser.permissions[mod.key] }
//                         })}
//                         className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
//                       />
//                       {mod.label}
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               <div className="pt-3 flex gap-3 border-t">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-md transition"
//                 >
//                   {loading ? 'Creating...' : 'Create Account'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setShowAddModal(false)}
//                   className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect, useMemo } from 'react';
import { getUsers, updatePermissions, createNewUser } from '../services/api';
import {
  Shield,
  Save,
  UserPlus,
  X,
  Search,
  Users,
  CheckCheck,
  RotateCcw,
  Mail
} from 'lucide-react';

const MODULES = [
  { key: 'products', label: 'Inventory / Products' },
  { key: 'suppliers', label: 'Suppliers' },
  { key: 'clients', label: 'Clients' },
  { key: 'purchases', label: 'Purchase Orders' },
  { key: 'invoices', label: 'Sales & Invoices' },
  { key: 'accounts', label: 'Accounts / Finance' },
  { key: 'reports', label: 'Reports' },
  { key: 'users', label: 'User Management' }
];

const createDefaultPermissions = (grantAll = false) =>
  MODULES.reduce((acc, mod) => {
    acc[mod.key] = Boolean(grantAll);
    return acc;
  }, {});

const createEmptyNewUser = () => ({
  name: '',
  email: '',
  password: '',
  userType: 'staff',
  permissions: createDefaultPermissions(false)
});

export default function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [savingUserId, setSavingUserId] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [newUser, setNewUser] = useState(createEmptyNewUser);

  const fetchUsers = async () => {
    setLoadingList(true);
    try {
      const { data } = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const isAdmin =
    (currentUser?.userType || '').toLowerCase() === 'admin' ||
    (currentUser?.role || '').toLowerCase() === 'admin';

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return users.filter(u => {
      const uRole = String(u?.userType || 'staff').toLowerCase();
      const matchesRole = roleFilter === 'ALL' || uRole === roleFilter.toLowerCase();
      const matchesSearch =
        !q ||
        String(u?.name || '').toLowerCase().includes(q) ||
        String(u?.email || '').toLowerCase().includes(q) ||
        uRole.includes(q);
      return matchesRole && matchesSearch;
    });
  }, [users, searchTerm, roleFilter]);

  const roleCounts = useMemo(() => {
    return users.reduce(
      (acc, u) => {
        const r = String(u?.userType || 'staff').toLowerCase();
        acc.total += 1;
        if (r === 'admin') acc.admin += 1;
        else if (r === 'staff') acc.staff += 1;
        else acc.others += 1;
        return acc;
      },
      { total: 0, admin: 0, staff: 0, others: 0 }
    );
  }, [users]);

  if (!isAdmin && !currentUser?.permissions?.users) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto mt-6 text-center space-y-2 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Access Denied</h3>
        <p className="text-sm text-slate-500">
          You do not have permission to manage users or module permissions.
        </p>
      </div>
    );
  }

  const handleCheckboxChange = (userId, moduleKey) => {
    setUsers(prev =>
      prev.map(u => {
        if (u._id !== userId) return u;
        const currentPerms = u.permissions || {};
        return {
          ...u,
          permissions: {
            ...currentPerms,
            [moduleKey]: !currentPerms[moduleKey]
          }
        };
      })
    );
  };

  const handleSetAllForUser = (userId, grantAll) => {
    setUsers(prev =>
      prev.map(u =>
        u._id === userId
          ? {
              ...u,
              permissions: createDefaultPermissions(grantAll)
            }
          : u
      )
    );
  };

  const handleRoleChange = (userId, nextRole) => {
    setUsers(prev =>
      prev.map(item => (item._id === userId ? { ...item, userType: nextRole } : item))
    );
  };

  const handleSave = async (userItem) => {
    setSavingUserId(userItem._id);
    try {
      await updatePermissions({
        userId: userItem._id,
        userType: userItem.userType || 'staff',
        permissions: userItem.permissions || createDefaultPermissions(false)
      });
      alert(`Permissions updated successfully for ${userItem.name}!`);
      await fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update permissions');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      await createNewUser(newUser);
      alert('New user created successfully!');
      setShowAddModal(false);
      setNewUser(createEmptyNewUser());
      await fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  const getEnabledCount = (perms = {}) =>
    MODULES.filter(m => Boolean(perms?.[m.key])).length;

  const getRoleBadgeClass = (role) => {
    const r = String(role || 'staff').toLowerCase();
    if (r === 'admin') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (r === 'staff') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0 mt-0.5">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              User & Permission Control
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Create staff accounts and assign dynamic module permissions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setNewUser(createEmptyNewUser());
            setShowAddModal(true);
          }}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition"
        >
          <UserPlus className="w-4 h-4" /> Add New User
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Users</p>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {roleCounts.total}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Admins</p>
          <p className="text-xl sm:text-2xl font-extrabold text-indigo-600 mt-1">
            {roleCounts.admin}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Staff</p>
          <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-1">
            {roleCounts.staff}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">Others</p>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-600 mt-1">
            {roleCounts.others}
          </p>
        </div>
      </div>

      {/* Search & Role Filter Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'ALL', label: `All (${roleCounts.total})` },
            { id: 'admin', label: `Admin (${roleCounts.admin})` },
            { id: 'staff', label: `Staff (${roleCounts.staff})` },
            { id: 'others', label: `Others (${roleCounts.others})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                roleFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/30 md:w-72">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search name or email..."
            className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-700"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Users List: Loading / Empty / Responsive Cards & Desktop Table */}
      {loadingList ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center text-sm text-slate-500 shadow-sm">
          Loading user accounts and permissions...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-2 shadow-sm">
          <Users className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">No matching users found</p>
          <p className="text-xs text-slate-400">
            Try adjusting your search keyword or role filter.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile & Tablet Card Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {filteredUsers.map(u => {
              const enabledCount = getEnabledCount(u.permissions);
              const isSaving = savingUserId === u._id;

              return (
                <div
                  key={u._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-base truncate">{u.name}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 truncate mt-0.5">
                          <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{u.email}</span>
                        </p>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${getRoleBadgeClass(
                          u.userType
                        )}`}
                      >
                        {enabledCount}/{MODULES.length} Modules
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <label className="text-xs font-semibold text-slate-600">User Role</label>
                      <select
                        value={u.userType || 'staff'}
                        onChange={e => handleRoleChange(u._id, e.target.value)}
                        className="border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                        <option value="others">Others</option>
                      </select>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                          Module Access
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-semibold">
                          <button
                            type="button"
                            onClick={() => handleSetAllForUser(u._id, true)}
                            className="text-indigo-600 hover:underline"
                          >
                            All
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={() => handleSetAllForUser(u._id, false)}
                            className="text-slate-500 hover:underline"
                          >
                            None
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {MODULES.map(mod => {
                          const checked = Boolean(u.permissions?.[mod.key]);
                          return (
                            <label
                              key={mod.key}
                              className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-medium cursor-pointer select-none transition ${
                                checked
                                  ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                                  : 'bg-slate-50/60 border-slate-200/70 text-slate-600 hover:bg-slate-100/70'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => handleCheckboxChange(u._id, mod.key)}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 shrink-0"
                              />
                              <span className="truncate">{mod.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSave(u)}
                    disabled={isSaving}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {isSaving ? 'Saving...' : 'Save Permissions'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-xs font-semibold text-slate-500 uppercase">
                    <th className="py-3.5 px-5 w-60">User Details</th>
                    <th className="py-3.5 px-4 w-40">User Type</th>
                    <th className="py-3.5 px-4">Module Permissions</th>
                    <th className="py-3.5 px-5 text-right w-36">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.map(u => {
                    const enabledCount = getEnabledCount(u.permissions);
                    const isSaving = savingUserId === u._id;

                    return (
                      <tr key={u._id} className="hover:bg-slate-50/60 align-top transition">
                        <td className="py-4 px-5">
                          <p className="font-bold text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5 break-all">{u.email}</p>
                          <span
                            className={`inline-block mt-2 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadgeClass(
                              u.userType
                            )}`}
                          >
                            {enabledCount} of {MODULES.length} active
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <select
                            value={u.userType || 'staff'}
                            onChange={e => handleRoleChange(u._id, e.target.value)}
                            className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="admin">Admin</option>
                            <option value="staff">Staff</option>
                            <option value="others">Others</option>
                          </select>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2 mb-2 text-[11px] font-semibold">
                            <button
                              type="button"
                              onClick={() => handleSetAllForUser(u._id, true)}
                              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                            >
                              <CheckCheck className="w-3.5 h-3.5" /> Select All
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => handleSetAllForUser(u._id, false)}
                              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700"
                            >
                              <RotateCcw className="w-3 h-3" /> Clear
                            </button>
                          </div>

                          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2">
                            {MODULES.map(mod => {
                              const checked = Boolean(u.permissions?.[mod.key]);
                              return (
                                <label
                                  key={mod.key}
                                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-medium cursor-pointer select-none transition ${
                                    checked
                                      ? 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                                      : 'bg-slate-50/50 border-slate-200/70 text-slate-600 hover:bg-slate-100/70'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => handleCheckboxChange(u._id, mod.key)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 shrink-0"
                                  />
                                  <span className="truncate">{mod.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => handleSave(u)}
                            disabled={isSaving}
                            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Create New User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-slate-200/80">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-800">
                  Create New User Account
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Staff Name"
                    value={newUser.name}
                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    User Type / Role
                  </label>
                  <select
                    value={newUser.userType}
                    onChange={e => setNewUser({ ...newUser, userType: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="staff">Staff</option>
                    <option value="others">Others</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="staff@company.com"
                  value={newUser.email}
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-600">
                    Initial Module Permissions ({getEnabledCount(newUser.permissions)}/{MODULES.length})
                  </label>
                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() =>
                        setNewUser(prev => ({
                          ...prev,
                          permissions: createDefaultPermissions(true)
                        }))
                      }
                      className="text-indigo-600 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() =>
                        setNewUser(prev => ({
                          ...prev,
                          permissions: createDefaultPermissions(false)
                        }))
                      }
                      className="text-slate-500 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  {MODULES.map(mod => {
                    const checked = Boolean(newUser.permissions[mod.key]);
                    return (
                      <label
                        key={mod.key}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs font-medium cursor-pointer transition ${
                          checked
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                            : 'bg-white border-slate-200/70 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setNewUser(prev => ({
                              ...prev,
                              permissions: {
                                ...prev.permissions,
                                [mod.key]: !prev.permissions[mod.key]
                              }
                            }))
                          }
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 shrink-0"
                        />
                        <span className="truncate">{mod.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-xl text-sm font-semibold shadow-sm transition"
                >
                  {creatingUser ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}