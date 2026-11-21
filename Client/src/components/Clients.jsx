// import { useState } from 'react';
// import { addClient } from '../services/api';

// export default function Clients({ clients, reloadData }) {
//   const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', dueBalance: 0 });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await addClient(form);
//     setForm({ name: '', phone: '', email: '', address: '', dueBalance: 0 });
//     reloadData();
//   };

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold text-gray-800">Client Management</h2>
//       <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border grid grid-cols-1 sm:grid-cols-2 gap-4">
//         <input placeholder="Client Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border p-2.5 rounded-lg text-sm" required />
//         <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="border p-2.5 rounded-lg text-sm" required />
//         <input placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="border p-2.5 rounded-lg text-sm" />
//         <input placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="border p-2.5 rounded-lg text-sm" />
//         <button type="submit" className="sm:col-span-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 text-sm">Add Client</button>
//       </form>

//       <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
//         <table className="w-full text-left border-collapse min-w-[600px]">
//           <thead className="bg-gray-50 border-b text-sm text-gray-600">
//             <tr><th className="p-4">Name</th><th className="p-4">Phone</th><th className="p-4">Email</th><th className="p-4">Address</th></tr>
//           </thead>
//           <tbody className="divide-y text-sm">
//             {clients.map(c => (
//               <tr key={c._id}>
//                 <td className="p-4 font-bold text-gray-800">{c.name}</td>
//                 <td className="p-4">{c.phone}</td>
//                 <td className="p-4 text-gray-500">{c.email || 'N/A'}</td>
//                 <td className="p-4 text-gray-500">{c.address || 'N/A'}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }


// import { useState, useEffect } from 'react';
// import {
//   Pencil,
//   Trash2,
//   Printer,
//   Search,
//   X,
//   ChevronLeft,
//   ChevronRight,
//   UserPlus
// } from 'lucide-react';
// import { addClient, updateClient, deleteClient } from '../services/api';

// const getEffectiveUser = (propUser) => {
//   if (propUser) return propUser;
//   try {
//     const raw = localStorage.getItem('user') || localStorage.getItem('authUser');
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// };

// const emptyForm = {
//   name: '',
//   phone: '',
//   email: '',
//   address: '',
//   dueBalance: 0
// };

// export default function Clients({ clients = [], reloadData, user }) {
//   const [form, setForm] = useState(emptyForm);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   // Edit Modal State
//   const [editingClient, setEditingClient] = useState(null);
//   const [editForm, setEditForm] = useState(emptyForm);
//   const [updating, setUpdating] = useState(false);

//   // Pagination State
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 7;

//   const currentUser = getEffectiveUser(user);
//   const isAdmin =
//     (currentUser?.userType || '').toLowerCase() === 'admin' ||
//     (currentUser?.role || '').toLowerCase() === 'admin';
//   const canDeleteClient = isAdmin || Boolean(currentUser?.permissions?.clients);

//   const clientList = Array.isArray(clients) ? clients : [];

//   const filteredClients = clientList.filter(c => {
//     const q = searchTerm.toLowerCase();
//     return (
//       (c.name || '').toLowerCase().includes(q) ||
//       (c.phone || '').toLowerCase().includes(q) ||
//       (c.email || '').toLowerCase().includes(q) ||
//       (c.address || '').toLowerCase().includes(q)
//     );
//   });

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, clientList.length]);

//   const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
//   const safeCurrentPage = Math.min(currentPage, totalPages);
//   const startIndex = (safeCurrentPage - 1) * itemsPerPage;
//   const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

//   const totalDue = filteredClients.reduce(
//     (sum, c) => sum + Number(c.dueBalance || 0),
//     0
//   );

//   // নতুন ক্লায়েন্ট যোগ করা
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     try {
//       await addClient({
//         ...form,
//         dueBalance: Number(form.dueBalance) || 0
//       });
//       setForm(emptyForm);
//       setCurrentPage(1);
//       reloadData();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Error adding client');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Edit Modal ওপেন করা
//   const openEditModal = (client) => {
//     setEditingClient(client);
//     setEditForm({
//       name: client.name || '',
//       phone: client.phone || '',
//       email: client.email || '',
//       address: client.address || '',
//       dueBalance: Number(client.dueBalance || 0)
//     });
//   };

//   // ক্লায়েন্ট আপডেট সেভ করা
//   const handleUpdateSubmit = async (e) => {
//     e.preventDefault();
//     if (!editingClient) return;
//     setUpdating(true);
//     try {
//       await updateClient(editingClient._id, {
//         ...editForm,
//         dueBalance: Number(editForm.dueBalance) || 0
//       });
//       setEditingClient(null);
//       reloadData();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Error updating client');
//     } finally {
//       setUpdating(false);
//     }
//   };

//   // ক্লায়েন্ট ডিলিট করা
//   const handleDelete = async (client) => {
//     if (!confirm(`"${client.name}" ক্লায়েন্টটি ডিলিট করতে চান?`)) return;
//     try {
//       await deleteClient(client._id);
//       if (editingClient?._id === client._id) setEditingClient(null);
//       reloadData();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Error deleting client');
//     }
//   };

//   // ক্লায়েন্ট লিস্ট প্রিন্ট করা
//   const handlePrintList = () => {
//     const printWindow = window.open('', '_blank', 'height=750,width=950');

//     const rowsHtml = filteredClients
//       .map(
//         (c, idx) => `
//         <tr>
//           <td>${idx + 1}</td>
//           <td><strong>${c.name}</strong></td>
//           <td>${c.phone || '-'}</td>
//           <td>${c.email || 'N/A'}</td>
//           <td>${c.address || 'N/A'}</td>
//           <td class="text-right">৳${Number(c.dueBalance || 0).toLocaleString()}</td>
//         </tr>
//       `
//       )
//       .join('');

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Client Directory Report</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
//             .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; }
//             h2 { margin: 0 0 4px 0; font-size: 20px; }
//             p { margin: 2px 0; font-size: 12px; color: #475569; }
//             table { width: 100%; border-collapse: collapse; font-size: 12px; }
//             th, td { border-bottom: 1px solid #cbd5e1; padding: 8px 6px; text-align: left; }
//             th { background: #f1f5f9; font-weight: bold; }
//             tfoot td { background: #f8fafc; font-weight: bold; border-top: 2px solid #94a3b8; }
//             .text-right { text-align: right; }
//             .signatures { display: flex; justify-content: space-between; margin-top: 55px; }
//             .sig-box { width: 180px; border-top: 1px solid #64748b; text-align: center; padding-top: 5px; font-size: 11px; color: #475569; }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <div>
//               <h2>CLIENT DIRECTORY</h2>
//               <p>Total Clients: ${filteredClients.length}${
//                 searchTerm.trim() ? ` • Filter: "${searchTerm.trim()}"` : ''
//               }</p>
//             </div>
//             <div style="text-align:right">
//               <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
//             </div>
//           </div>

//           <table>
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Name</th>
//                 <th>Phone</th>
//                 <th>Email</th>
//                 <th>Address</th>
//                 <th class="text-right">Due Balance</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${
//                 rowsHtml ||
//                 `<tr><td colspan="6" style="text-align:center;padding:16px;">No clients found.</td></tr>`
//               }
//             </tbody>
//             <tfoot>
//               <tr>
//                 <td colspan="5">Total Due Balance</td>
//                 <td class="text-right">৳${totalDue.toLocaleString()}</td>
//               </tr>
//             </tfoot>
//           </table>

//           <div class="signatures">
//             <div class="sig-box">Prepared By</div>
//             <div class="sig-box">Accounts / Checked By</div>
//             <div class="sig-box">Authorized Signature</div>
//           </div>
//         </body>
//       </html>
//     `);

//     printWindow.document.close();
//     printWindow.focus();
//     setTimeout(() => {
//       printWindow.print();
//       printWindow.close();
//     }, 400);
//   };

//   return (
//     <div className="space-y-5 sm:space-y-6">
//       {/* Header & Print Action */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div>
//           <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Client Management</h2>
//           <p className="text-xs sm:text-sm text-slate-500">
//             Add, edit, search, print clients, and track customer due balances.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={handlePrintList}
//           className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-sm inline-flex items-center justify-center gap-2 transition self-start sm:self-auto"
//         >
//           <Printer className="w-4 h-4 text-indigo-600" /> Print Client List ({filteredClients.length})
//         </button>
//       </div>

//       {/* Add Client Form */}
//       <form
//         onSubmit={handleSubmit}
//         className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4"
//       >
//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">Client Name *</label>
//           <input
//             placeholder="Client Name"
//             value={form.name}
//             onChange={e => setForm({ ...form, name: e.target.value })}
//             className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
//           <input
//             placeholder="Phone Number"
//             value={form.phone}
//             onChange={e => setForm({ ...form, phone: e.target.value })}
//             className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
//           <input
//             type="email"
//             placeholder="Email Address"
//             value={form.email}
//             onChange={e => setForm({ ...form, email: e.target.value })}
//             className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//           />
//         </div>

//         <div>
//           <label className="block text-xs font-semibold text-slate-600 mb-1">Address</label>
//           <input
//             placeholder="Address"
//             value={form.address}
//             onChange={e => setForm({ ...form, address: e.target.value })}
//             className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//           />
//         </div>

//         <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
//           <span className="text-xs text-slate-500">
//             Total Filtered Due:{' '}
//             <strong className="text-red-600">৳ {totalDue.toLocaleString()}</strong>
//           </span>

//           <button
//             type="submit"
//             disabled={submitting}
//             className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 transition shadow-sm"
//           >
//             <UserPlus className="w-4 h-4" />
//             {submitting ? 'Adding...' : 'Add Client'}
//           </button>
//         </div>
//       </form>

//       {/* Search Bar */}
//       <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-3">
//         <Search className="w-4 h-4 text-slate-400 shrink-0" />
//         <input
//           type="text"
//           placeholder="Search by client name, phone, email, or address..."
//           value={searchTerm}
//           onChange={e => setSearchTerm(e.target.value)}
//           className="w-full text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
//         />
//       </div>

//       {/* Clients List Container */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
//         {/* Desktop / Tablet Table View */}
//         <div className="hidden md:block overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
//                 <th className="py-3.5 px-4">Name</th>
//                 <th className="py-3.5 px-4">Phone</th>
//                 <th className="py-3.5 px-4">Email</th>
//                 <th className="py-3.5 px-4">Address</th>
//                 <th className="py-3.5 px-4 text-right">Due</th>
//                 <th className="py-3.5 px-4 text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 text-sm">
//               {paginatedClients.length > 0 ? (
//                 paginatedClients.map(c => {
//                   const due = Number(c.dueBalance || 0);
//                   return (
//                     <tr key={c._id} className="hover:bg-slate-50/80 transition">
//                       <td className="py-3.5 px-4 font-bold text-slate-800">{c.name}</td>
//                       <td className="py-3.5 px-4 text-slate-700">{c.phone}</td>
//                       <td className="py-3.5 px-4 text-slate-500">{c.email || 'N/A'}</td>
//                       <td className="py-3.5 px-4 text-slate-500">{c.address || 'N/A'}</td>
//                       <td className="py-3.5 px-4 text-right font-semibold">
//                         <span className={due > 0 ? 'text-red-600' : 'text-emerald-600'}>
//                           ৳ {due.toLocaleString()}
//                         </span>
//                       </td>
//                       <td className="py-3.5 px-4">
//                         <div className="flex items-center justify-end gap-2">
//                           <button
//                             type="button"
//                             onClick={() => openEditModal(c)}
//                             className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
//                           >
//                             <Pencil className="w-3.5 h-3.5" /> Edit
//                           </button>

//                           {canDeleteClient && (
//                             <button
//                               type="button"
//                               onClick={() => handleDelete(c)}
//                               title="Delete Client"
//                               className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="py-8 text-center text-slate-400 text-sm">
//                     No clients found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Mobile Card View (< md) */}
//         <div className="md:hidden divide-y divide-slate-100">
//           {paginatedClients.length > 0 ? (
//             paginatedClients.map(c => {
//               const due = Number(c.dueBalance || 0);
//               return (
//                 <div key={c._id} className="p-4 space-y-2.5">
//                   <div className="flex items-start justify-between gap-2">
//                     <div>
//                       <h4 className="font-bold text-slate-800 text-sm">{c.name}</h4>
//                       <p className="text-xs text-slate-600 mt-0.5">{c.phone}</p>
//                     </div>
//                     <span
//                       className={`text-xs font-bold px-2.5 py-1 rounded-full ${
//                         due > 0
//                           ? 'bg-red-50 text-red-600 border border-red-200'
//                           : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
//                       }`}
//                     >
//                       Due: ৳{due.toLocaleString()}
//                     </span>
//                   </div>

//                   <div className="text-xs text-slate-500 space-y-0.5">
//                     <p>Email: {c.email || 'N/A'}</p>
//                     <p>Address: {c.address || 'N/A'}</p>
//                   </div>

//                   <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
//                     <button
//                       type="button"
//                       onClick={() => openEditModal(c)}
//                       className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
//                     >
//                       <Pencil className="w-3.5 h-3.5" /> Edit
//                     </button>

//                     {canDeleteClient && (
//                       <button
//                         type="button"
//                         onClick={() => handleDelete(c)}
//                         title="Delete Client"
//                         className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           ) : (
//             <div className="p-8 text-center text-slate-400 text-sm">
//               No clients found.
//             </div>
//           )}
//         </div>

//         {/* Pagination Controls */}
//         {filteredClients.length > 0 && (
//           <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
//             <p className="text-slate-500">
//               Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
//               <span className="font-semibold text-slate-700">
//                 {Math.min(startIndex + itemsPerPage, filteredClients.length)}
//               </span>{' '}
//               of <span className="font-semibold text-slate-700">{filteredClients.length}</span> clients
//             </p>

//             <div className="flex items-center gap-1.5">
//               <button
//                 type="button"
//                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//                 disabled={safeCurrentPage === 1}
//                 className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
//                 aria-label="Previous Page"
//               >
//                 <ChevronLeft className="w-4 h-4" />
//               </button>

//               {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//                 <button
//                   key={page}
//                   type="button"
//                   onClick={() => setCurrentPage(page)}
//                   className={`min-w-[34px] h-[34px] rounded-lg text-xs font-semibold transition ${
//                     safeCurrentPage === page
//                       ? 'bg-indigo-600 text-white shadow-sm'
//                       : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
//                   }`}
//                 >
//                   {page}
//                 </button>
//               ))}

//               <button
//                 type="button"
//                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
//                 disabled={safeCurrentPage === totalPages}
//                 className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
//                 aria-label="Next Page"
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Edit Client Modal */}
//       {editingClient && (
//         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
//             <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
//               <div>
//                 <h3 className="text-lg font-bold text-slate-800">Edit Client</h3>
//                 <p className="text-xs text-slate-500">Update client contact and due info</p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setEditingClient(null)}
//                 className="text-slate-400 hover:text-slate-600"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleUpdateSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">
//                   Client Name *
//                 </label>
//                 <input
//                   value={editForm.name}
//                   onChange={e => setEditForm({ ...editForm, name: e.target.value })}
//                   className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">
//                   Phone Number *
//                 </label>
//                 <input
//                   value={editForm.phone}
//                   onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
//                   className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   value={editForm.email}
//                   onChange={e => setEditForm({ ...editForm, email: e.target.value })}
//                   className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">
//                   Address
//                 </label>
//                 <input
//                   value={editForm.address}
//                   onChange={e => setEditForm({ ...editForm, address: e.target.value })}
//                   className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//                 />
//               </div>

//               <div className="pt-2 flex gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setEditingClient(null)}
//                   className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={updating}
//                   className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-xl text-sm font-medium transition"
//                 >
//                   {updating ? 'Saving...' : 'Save Changes'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import {
  Pencil,
  Trash2,
  Printer,
  Download,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { addClient, updateClient, deleteClient } from '../services/api';

const getEffectiveUser = (propUser) => {
  if (propUser) return propUser;
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  dueBalance: 0
};

export default function Clients({ clients = [], reloadData, user }) {
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editingClient, setEditingClient] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [updating, setUpdating] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const currentUser = getEffectiveUser(user);
  const isAdmin =
    (currentUser?.userType || '').toLowerCase() === 'admin' ||
    (currentUser?.role || '').toLowerCase() === 'admin';
  const canDeleteClient = isAdmin || Boolean(currentUser?.permissions?.clients);

  const clientList = Array.isArray(clients) ? clients : [];

  const filteredClients = clientList.filter(c => {
    const q = searchTerm.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.address || '').toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, clientList.length]);

  const totalPages = Math.max(1, Math.ceil(filteredClients.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedClients = filteredClients.slice(startIndex, startIndex + itemsPerPage);

  const totalDue = filteredClients.reduce(
    (sum, c) => sum + Number(c.dueBalance || 0),
    0
  );

  // নতুন ক্লায়েন্ট যোগ করা
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addClient({
        ...form,
        dueBalance: Number(form.dueBalance) || 0
      });
      setForm(emptyForm);
      setCurrentPage(1);
      reloadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding client');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Modal ওপেন করা
  const openEditModal = (client) => {
    setEditingClient(client);
    setEditForm({
      name: client.name || '',
      phone: client.phone || '',
      email: client.email || '',
      address: client.address || '',
      dueBalance: Number(client.dueBalance || 0)
    });
  };

  // ক্লায়েন্ট আপডেট সেভ করা
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingClient) return;
    setUpdating(true);
    try {
      await updateClient(editingClient._id, {
        ...editForm,
        dueBalance: Number(editForm.dueBalance) || 0
      });
      setEditingClient(null);
      reloadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating client');
    } finally {
      setUpdating(false);
    }
  };

  // ক্লায়েন্ট ডিলিট করা
  const handleDelete = async (client) => {
    if (!confirm(`"${client.name}" ক্লায়েন্টটি ডিলিট করতে চান?`)) return;
    try {
      await deleteClient(client._id);
      if (editingClient?._id === client._id) setEditingClient(null);
      reloadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting client');
    }
  };

  // ক্লায়েন্ট লিস্ট Excel (.csv with UTF-8 BOM) ডাউনলোড করা
  const handleDownloadExcel = () => {
    const headers = ['SL', 'Client Name', 'Phone', 'Email', 'Address', 'Due Balance'];

    const escapeCsv = (val) => {
      const str = String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = filteredClients.map((c, idx) =>
      [
        escapeCsv(idx + 1),
        escapeCsv(c.name),
        escapeCsv(c.phone || ''),
        escapeCsv(c.email || 'N/A'),
        escapeCsv(c.address || 'N/A'),
        escapeCsv(Number(c.dueBalance || 0))
      ].join(',')
    );

    const summaryRow = [
      escapeCsv(''),
      escapeCsv('TOTAL DUE'),
      escapeCsv(''),
      escapeCsv(''),
      escapeCsv(`${filteredClients.length} Clients`),
      escapeCsv(totalDue)
    ].join(',');

    const csvContent =
      '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows, summaryRow].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `Clients_List_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ক্লায়েন্ট লিস্ট প্রিন্ট করা
  const handlePrintList = () => {
    const printWindow = window.open('', '_blank', 'height=750,width=950');

    const rowsHtml = filteredClients
      .map(
        (c, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${c.name}</strong></td>
          <td>${c.phone || '-'}</td>
          <td>${c.email || 'N/A'}</td>
          <td>${c.address || 'N/A'}</td>
          <td class="text-right">৳${Number(c.dueBalance || 0).toLocaleString()}</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Client Directory Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; }
            h2 { margin: 0 0 4px 0; font-size: 20px; }
            p { margin: 2px 0; font-size: 12px; color: #475569; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border-bottom: 1px solid #cbd5e1; padding: 8px 6px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; }
            tfoot td { background: #f8fafc; font-weight: bold; border-top: 2px solid #94a3b8; }
            .text-right { text-align: right; }
            .signatures { display: flex; justify-content: space-between; margin-top: 55px; }
            .sig-box { width: 180px; border-top: 1px solid #64748b; text-align: center; padding-top: 5px; font-size: 11px; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>CLIENT DIRECTORY</h2>
              <p>Total Clients: ${filteredClients.length}${
                searchTerm.trim() ? ` • Filter: "${searchTerm.trim()}"` : ''
              }</p>
            </div>
            <div style="text-align:right">
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th class="text-right">Due Balance</th>
              </tr>
            </thead>
            <tbody>
              ${
                rowsHtml ||
                `<tr><td colspan="6" style="text-align:center;padding:16px;">No clients found.</td></tr>`
              }
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">Total Due Balance</td>
                <td class="text-right">৳${totalDue.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div class="signatures">
            <div class="sig-box">Prepared By</div>
            <div class="sig-box">Accounts / Checked By</div>
            <div class="sig-box">Authorized Signature</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Client Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Add, edit, search, export Excel, print clients, and track customer due balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" /> Excel
          </button>

          <button
            type="button"
            onClick={handlePrintList}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-sm inline-flex items-center justify-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4 text-indigo-600" /> Print ({filteredClients.length})
          </button>
        </div>
      </div>

      {/* Add Client Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Client Name *</label>
          <input
            placeholder="Client Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
          <input
            placeholder="Phone Number"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Address</label>
          <input
            placeholder="Address"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <span className="text-xs text-slate-500">
            Total Filtered Due:{' '}
            <strong className="text-red-600">৳ {totalDue.toLocaleString()}</strong>
          </span>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 transition shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            {submitting ? 'Adding...' : 'Add Client'}
          </button>
        </div>
      </form>

      {/* Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by client name, phone, email, or address..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
        />
      </div>

      {/* Clients List Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Desktop / Tablet Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4 text-right">Due</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedClients.length > 0 ? (
                paginatedClients.map(c => {
                  const due = Number(c.dueBalance || 0);
                  return (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{c.name}</td>
                      <td className="py-3.5 px-4 text-slate-700">{c.phone}</td>
                      <td className="py-3.5 px-4 text-slate-500">{c.email || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-slate-500">{c.address || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-right font-semibold">
                        <span className={due > 0 ? 'text-red-600' : 'text-emerald-600'}>
                          ৳ {due.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDelete(c)}
                              title="Delete Client"
                              className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400 text-sm">
                    No clients found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (< md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedClients.length > 0 ? (
            paginatedClients.map(c => {
              const due = Number(c.dueBalance || 0);
              return (
                <div key={c._id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{c.name}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">{c.phone}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        due > 0
                          ? 'bg-red-50 text-red-600 border border-red-200'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}
                    >
                      Due: ৳{due.toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p>Email: {c.email || 'N/A'}</p>
                    <p>Address: {c.address || 'N/A'}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => openEditModal(c)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        title="Delete Client"
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              No clients found.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredClients.length > 0 && (
          <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <p className="text-slate-500">
              Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(startIndex + itemsPerPage, filteredClients.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-700">{filteredClients.length}</span> clients
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={safeCurrentPage === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[34px] h-[34px] rounded-lg text-xs font-semibold transition ${
                    safeCurrentPage === page
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={safeCurrentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Edit Client</h3>
                <p className="text-xs text-slate-500">Update client contact and due info</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Client Name *
                </label>
                <input
                  value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Phone Number *
                </label>
                <input
                  value={editForm.phone}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Address
                </label>
                <input
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-xl text-sm font-medium transition"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}