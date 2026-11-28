
// import { useState, useEffect } from 'react';
// import {
//   Plus,
//   Trash2,
//   Printer,
//   Download,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   Banknote,
//   Landmark,
//   Smartphone,
//   ArrowUpRight,
//   ArrowDownRight,
//   Layers,
//   HandCoins,
//   Receipt
// } from 'lucide-react';
// import {
//   getAccountTransactions,
//   addAccountTransaction,
//   deleteAccountTransaction
// } from '../services/api';

// const getEffectiveUser = (propUser) => {
//   if (propUser) return propUser;
//   try {
//     const raw =
//       localStorage.getItem('nexusUser') ||
//       localStorage.getItem('user') ||
//       localStorage.getItem('authUser');
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// };

// const todayInputDate = () => new Date().toISOString().slice(0, 10);

// const emptyForm = {
//   entryType: 'INCOME', // INCOME | EXPENSE | OTHERS | DUE_COLLECTION | SUPPLIER_PAYMENT
//   clientId: '',
//   supplierId: '',
//   category: 'Other Income',
//   title: '',
//   amount: '',
//   paymentMethod: 'Cash', // Cash | Bank | Mobile Banking | Adjustment
//   mobileProvider: 'bKash', // bKash | Nagad | Rocket | Upay | Other
//   reference: '',
//   note: '',
//   transactionDate: todayInputDate()
// };

// const extractTxArray = (payload) => {
//   if (Array.isArray(payload)) return payload;
//   if (Array.isArray(payload?.transactions)) return payload.transactions;
//   if (Array.isArray(payload?.data)) return payload.data;
//   return [];
// };

// export default function Accounts({
//   transactions,
//   accountTransactions,
//   clients = [],
//   suppliers = [],
//   invoices = [],
//   purchases = [],
//   reloadData,
//   user
// }) {
//   const incomingTx = Array.isArray(transactions)
//     ? transactions
//     : Array.isArray(accountTransactions)
//     ? accountTransactions
//     : null;

//   const [localTx, setLocalTx] = useState(() => incomingTx || []);
//   const [form, setForm] = useState(emptyForm);
//   const [typeFilter, setTypeFilter] = useState('ALL');
//   const [methodFilter, setMethodFilter] = useState('ALL');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   // Pagination State
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 8;

//   const syncLocalTransactions = async () => {
//     try {
//       const res = await getAccountTransactions();
//       setLocalTx(extractTxArray(res?.data));
//     } catch (err) {
//       console.error('Error syncing account transactions:', err);
//     }
//   };

//   useEffect(() => {
//     if (incomingTx !== null) {
//       setLocalTx(incomingTx);
//     } else {
//       syncLocalTransactions();
//     }
//   }, [transactions, accountTransactions]);

//   const txList = incomingTx !== null ? incomingTx : localTx;
//   const clientList = Array.isArray(clients) ? clients : [];
//   const supplierList = Array.isArray(suppliers) ? suppliers : [];
//   const invoiceList = Array.isArray(invoices) ? invoices : [];
//   const purchaseList = Array.isArray(purchases) ? purchases : [];

//   const currentUser = getEffectiveUser(user);
//   const isAdmin =
//     (currentUser?.userType || '').toLowerCase() === 'admin' ||
//     (currentUser?.role || '').toLowerCase() === 'admin';
//   const canDelete = isAdmin || Boolean(currentUser?.permissions?.accounts);

//   // সিলেক্ট করা Client / Supplier এর Due ব্যালেন্স
//   const selectedClientObj = clientList.find(c => c._id === form.clientId);
//   const selectedSupplierObj = supplierList.find(s => s._id === form.supplierId);

//   // Cash, Bank & Mobile Banking Balance হিসাব
//   const methodBalances = (() => {
//     const map = {
//       Cash: 0,
//       Bank: 0,
//       'Mobile Banking': 0
//     };

//     const applyFlow = (method, delta) => {
//       if (method === 'Cash' || method === 'Bank' || method === 'Mobile Banking') {
//         map[method] += delta;
//       }
//     };

//     // Invoices Paid Amount (+)
//     for (const inv of invoiceList) {
//       const paid = Number(inv.paidAmount || 0);
//       if (paid > 0) {
//         applyFlow(inv.paymentMethod || 'Cash', paid);
//       }
//     }

//     // Purchases Paid Amount (-)
//     for (const pur of purchaseList) {
//       const paid = Number(pur.paidAmount || 0);
//       if (paid > 0) {
//         applyFlow(pur.paymentMethod || 'Cash', -paid);
//       }
//     }

//     // Account Transactions
//     for (const tx of txList) {
//       const amt = Number(tx.amount || 0);
//       const method = tx.paymentMethod || 'Cash';
//       if (tx.entryType === 'INCOME' || tx.entryType === 'DUE_COLLECTION') {
//         applyFlow(method, amt);
//       } else if (tx.entryType === 'EXPENSE' || tx.entryType === 'SUPPLIER_PAYMENT') {
//         applyFlow(method, -amt);
//       } else if (tx.entryType === 'OTHERS') {
//         applyFlow(method, amt);
//       }
//     }

//     return map;
//   })();

//   const totalReceivable = clientList.reduce(
//     (sum, c) => sum + Number(c.dueBalance || 0),
//     0
//   );
//   const totalPayable = supplierList.reduce(
//     (sum, s) => sum + Number(s.dueBalance || 0),
//     0
//   );

//   // Filter Logic
//   const filteredTransactions = txList.filter(item => {
//     const matchesType = typeFilter === 'ALL' || item.entryType === typeFilter;
//     const matchesMethod =
//       methodFilter === 'ALL' || (item.paymentMethod || 'Cash') === methodFilter;
//     const q = searchTerm.trim().toLowerCase();

//     const partyName =
//       item.client?.name ||
//       item.supplier?.companyName ||
//       item.supplier?.name ||
//       '';

//     const matchesSearch =
//       !q ||
//       (item.voucherNumber || '').toLowerCase().includes(q) ||
//       (item.category || '').toLowerCase().includes(q) ||
//       (item.title || '').toLowerCase().includes(q) ||
//       (item.reference || '').toLowerCase().includes(q) ||
//       (item.mobileProvider || '').toLowerCase().includes(q) ||
//       partyName.toLowerCase().includes(q) ||
//       (item.note || '').toLowerCase().includes(q);

//     return matchesType && matchesMethod && matchesSearch;
//   });

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [typeFilter, methodFilter, searchTerm, txList.length]);

//   const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
//   const safeCurrentPage = Math.min(currentPage, totalPages);
//   const startIndex = (safeCurrentPage - 1) * itemsPerPage;
//   const paginatedTransactions = filteredTransactions.slice(
//     startIndex,
//     startIndex + itemsPerPage
//   );

//   const filteredTotal = filteredTransactions.reduce(
//     (sum, item) => sum + Number(item.amount || 0),
//     0
//   );

//   const refreshAll = async () => {
//     await syncLocalTransactions();
//     if (typeof reloadData === 'function') {
//       reloadData();
//     }
//   };

//   // Entry Type পরিবর্তন করলে ডিফল্ট Category/Title সেট করা
//   const handleEntryTypeChange = (newType) => {
//     const defaultCategory =
//       newType === 'DUE_COLLECTION'
//         ? 'Due Collection'
//         : newType === 'SUPPLIER_PAYMENT'
//         ? 'Supplier Payment'
//         : newType === 'INCOME'
//         ? 'Other Income'
//         : newType === 'EXPENSE'
//         ? 'Office Expense'
//         : 'General Adjustment';

//     setForm(prev => ({
//       ...prev,
//       entryType: newType,
//       clientId: '',
//       supplierId: '',
//       category: defaultCategory,
//       title: ''
//     }));
//   };

//   // নতুন এন্ট্রি সাবমিট
//   const handleCreate = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     try {
//       await addAccountTransaction({
//         entryType: form.entryType,
//         clientId: form.entryType === 'DUE_COLLECTION' ? form.clientId : undefined,
//         supplierId: form.entryType === 'SUPPLIER_PAYMENT' ? form.supplierId : undefined,
//         category: form.category,
//         title: form.title,
//         amount: Number(form.amount),
//         paymentMethod: form.paymentMethod,
//         mobileProvider:
//           form.paymentMethod === 'Mobile Banking' ? form.mobileProvider : '',
//         reference: form.reference,
//         note: form.note,
//         transactionDate: form.transactionDate
//       });

//       setForm(prev => ({
//         ...emptyForm,
//         entryType: prev.entryType,
//         category: prev.category,
//         paymentMethod: prev.paymentMethod,
//         mobileProvider: prev.mobileProvider,
//         transactionDate: todayInputDate()
//       }));
//       setCurrentPage(1);
//       await refreshAll();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Error saving transaction');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // এন্ট্রি ডিলিট
//   const handleDelete = async (item) => {
//     if (
//       !confirm(
//         `Voucher ${item.voucherNumber} ডিলিট করতে চান? (Due Collection / Supplier Payment হলে বকেয়া ব্যালেন্সও রিভার্স হবে)`
//       )
//     ) {
//       return;
//     }
//     try {
//       await deleteAccountTransaction(item._id);
//       await refreshAll();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Error deleting transaction');
//     }
//   };

//   // Excel (.csv with UTF-8 BOM) Download
//   const handleDownloadExcel = () => {
//     const headers = [
//       'SL',
//       'Voucher #',
//       'Date',
//       'Type',
//       'Party',
//       'Category',
//       'Title',
//       'Method',
//       'Provider',
//       'Reference',
//       'Amount',
//       'Note'
//     ];

//     const escapeCsv = (val) => {
//       const str = String(val ?? '');
//       return `"${str.replace(/"/g, '""')}"`;
//     };

//     const rows = filteredTransactions.map((item, idx) => {
//       const partyName =
//         item.client?.name ||
//         item.supplier?.companyName ||
//         item.supplier?.name ||
//         '-';
//       return [
//         escapeCsv(idx + 1),
//         escapeCsv(item.voucherNumber || ''),
//         escapeCsv(
//           item.transactionDate
//             ? new Date(item.transactionDate).toLocaleDateString()
//             : ''
//         ),
//         escapeCsv(item.entryType || ''),
//         escapeCsv(partyName),
//         escapeCsv(item.category || ''),
//         escapeCsv(item.title || ''),
//         escapeCsv(item.paymentMethod || 'Cash'),
//         escapeCsv(item.mobileProvider || ''),
//         escapeCsv(item.reference || ''),
//         escapeCsv(Number(item.amount || 0)),
//         escapeCsv(item.note || '')
//       ].join(',');
//     });

//     const totalRow = [
//       escapeCsv(''),
//       escapeCsv('TOTAL'),
//       escapeCsv(''),
//       escapeCsv(typeFilter),
//       escapeCsv(''),
//       escapeCsv(`${filteredTransactions.length} Entries`),
//       escapeCsv(''),
//       escapeCsv(methodFilter),
//       escapeCsv(''),
//       escapeCsv(''),
//       escapeCsv(filteredTotal),
//       escapeCsv('')
//     ].join(',');

//     const csvContent =
//       '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows, totalRow].join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.setAttribute('download', `Accounts_Ledger_${todayInputDate()}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   // Print Accounts Statement
//   const handlePrint = () => {
//     const printWindow = window.open('', '_blank', 'height=750,width=1000');

//     const rowsHtml = filteredTransactions
//       .map((item, idx) => {
//         const partyName =
//           item.client?.name ||
//           item.supplier?.companyName ||
//           item.supplier?.name ||
//           '-';
//         const methodText =
//           item.paymentMethod === 'Mobile Banking' && item.mobileProvider
//             ? `${item.paymentMethod} (${item.mobileProvider})`
//             : item.paymentMethod || 'Cash';

//         return `
//           <tr>
//             <td>${idx + 1}</td>
//             <td><strong>${item.voucherNumber || '-'}</strong></td>
//             <td>${
//               item.transactionDate
//                 ? new Date(item.transactionDate).toLocaleDateString()
//                 : '-'
//             }</td>
//             <td>${item.entryType}</td>
//             <td>${partyName}</td>
//             <td><strong>${item.title}</strong><br/><small>${item.category || ''}</small></td>
//             <td>${methodText}</td>
//             <td class="text-right">৳${Number(item.amount || 0).toLocaleString()}</td>
//           </tr>
//         `;
//       })
//       .join('');

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Accounts & Cash Statement</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
//             .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; }
//             h2 { margin: 0 0 4px 0; font-size: 20px; }
//             p { margin: 2px 0; font-size: 12px; color: #475569; }
//             .cards { display: flex; gap: 10px; margin-bottom: 16px; }
//             .card { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; background: #f8fafc; font-size: 12px; }
//             .card strong { display: block; font-size: 14px; margin-top: 2px; }
//             table { width: 100%; border-collapse: collapse; font-size: 12px; }
//             th, td { border-bottom: 1px solid #cbd5e1; padding: 7px 6px; text-align: left; }
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
//               <h2>ACCOUNTS & CASH STATEMENT</h2>
//               <p>Type: ${typeFilter} • Method: ${methodFilter} • Entries: ${filteredTransactions.length}</p>
//             </div>
//             <div style="text-align:right">
//               <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
//             </div>
//           </div>

//           <div class="cards">
//             <div class="card">Cash Balance<strong>৳${methodBalances.Cash.toLocaleString()}</strong></div>
//             <div class="card">Bank Balance<strong>৳${methodBalances.Bank.toLocaleString()}</strong></div>
//             <div class="card">Mobile Banking<strong>৳${methodBalances['Mobile Banking'].toLocaleString()}</strong></div>
//             <div class="card">Filtered Total<strong>৳${filteredTotal.toLocaleString()}</strong></div>
//           </div>

//           <table>
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Voucher</th>
//                 <th>Date</th>
//                 <th>Type</th>
//                 <th>Party</th>
//                 <th>Description</th>
//                 <th>Method</th>
//                 <th class="text-right">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${
//                 rowsHtml ||
//                 `<tr><td colspan="8" style="text-align:center;padding:16px;">No records found.</td></tr>`
//               }
//             </tbody>
//             <tfoot>
//               <tr>
//                 <td colspan="7">Filtered Total</td>
//                 <td class="text-right">৳${filteredTotal.toLocaleString()}</td>
//               </tr>
//             </tfoot>
//           </table>

//           <div class="signatures">
//             <div class="sig-box">Prepared By</div>
//             <div class="sig-box">Accounts Officer</div>
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

//   const renderBadge = (type) => {
//     switch (type) {
//       case 'INCOME':
//         return (
//           <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
//             <ArrowUpRight className="w-3.5 h-3.5" /> Income
//           </span>
//         );
//       case 'EXPENSE':
//         return (
//           <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
//             <ArrowDownRight className="w-3.5 h-3.5" /> Expense
//           </span>
//         );
//       case 'DUE_COLLECTION':
//         return (
//           <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
//             <HandCoins className="w-3.5 h-3.5" /> Due Collection
//           </span>
//         );
//       case 'SUPPLIER_PAYMENT':
//         return (
//           <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
//             <Receipt className="w-3.5 h-3.5" /> Supplier Payment
//           </span>
//         );
//       default:
//         return (
//           <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
//             <Layers className="w-3.5 h-3.5" /> Others
//           </span>
//         );
//     }
//   };

//   return (
//     <div className="space-y-5 sm:space-y-6">
//       {/* Header & Actions */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div>
//           <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
//             Accounts — Cash, Bank, Due & Expenses
//           </h2>
//           <p className="text-xs sm:text-sm text-slate-500">
//             Manage Cash/Bank/Mobile Banking balances, client due collections, supplier payments, and expenses.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           <button
//             type="button"
//             onClick={handleDownloadExcel}
//             className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm inline-flex items-center gap-1.5 transition"
//           >
//             <Download className="w-4 h-4" /> Excel
//           </button>

//           <button
//             type="button"
//             onClick={handlePrint}
//             className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-sm inline-flex items-center gap-1.5 transition"
//           >
//             <Printer className="w-4 h-4 text-indigo-600" /> Print ({filteredTransactions.length})
//           </button>
//         </div>
//       </div>

//       {/* Cash, Bank, Mobile Banking & Receivable/Payable Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
//           <div>
//             <p className="text-xs font-semibold text-slate-500 uppercase">Cash Balance</p>
//             <p className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1">
//               ৳ {methodBalances.Cash.toLocaleString()}
//             </p>
//           </div>
//           <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
//             <Banknote className="w-5 h-5" />
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
//           <div>
//             <p className="text-xs font-semibold text-slate-500 uppercase">Bank Balance</p>
//             <p className="text-lg sm:text-xl font-extrabold text-indigo-700 mt-1">
//               ৳ {methodBalances.Bank.toLocaleString()}
//             </p>
//           </div>
//           <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
//             <Landmark className="w-5 h-5" />
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
//           <div>
//             <p className="text-xs font-semibold text-slate-500 uppercase">Mobile Banking</p>
//             <p className="text-lg sm:text-xl font-extrabold text-violet-700 mt-1">
//               ৳ {methodBalances['Mobile Banking'].toLocaleString()}
//             </p>
//             <p className="text-[11px] text-slate-400">bKash / Nagad / Rocket</p>
//           </div>
//           <div className="p-3 rounded-xl bg-violet-50 text-violet-600 shrink-0">
//             <Smartphone className="w-5 h-5" />
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
//           <p className="text-xs font-semibold text-slate-500 uppercase">Receivable (Client Due)</p>
//           <p className="text-lg sm:text-xl font-extrabold text-amber-700 mt-1">
//             ৳ {totalReceivable.toLocaleString()}
//           </p>
//           <p className="text-[11px] text-slate-400 mt-0.5">To be collected from clients</p>
//         </div>

//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
//           <p className="text-xs font-semibold text-slate-500 uppercase">Payable (Supplier Due)</p>
//           <p className="text-lg sm:text-xl font-extrabold text-red-600 mt-1">
//             ৳ {totalPayable.toLocaleString()}
//           </p>
//           <p className="text-[11px] text-slate-400 mt-0.5">To be paid to suppliers</p>
//         </div>
//       </div>

//       {/* Add Transaction Form */}
//       <form
//         onSubmit={handleCreate}
//         className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4"
//       >
//         <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 text-sm sm:text-base">
//           Record Accounting Entry
//         </h3>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Transaction Type *
//             </label>
//             <select
//               value={form.entryType}
//               onChange={e => handleEntryTypeChange(e.target.value)}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//             >
//               <option value="INCOME">Income (+)</option>
//               <option value="EXPENSE">Expense (-)</option>
//               <option value="DUE_COLLECTION">Due Collection (Client Due -)</option>
//               <option value="SUPPLIER_PAYMENT">Supplier Payment (Supplier Due -)</option>
//               <option value="OTHERS">Others</option>
//             </select>
//           </div>

//           {form.entryType === 'DUE_COLLECTION' && (
//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">
//                 Select Client *
//               </label>
//               <select
//                 value={form.clientId}
//                 onChange={e => setForm({ ...form, clientId: e.target.value })}
//                 className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//                 required
//               >
//                 <option value="">-- Select Client --</option>
//                 {clientList.map(c => (
//                   <option key={c._id} value={c._id}>
//                     {c.name} (Due: ৳{Number(c.dueBalance || 0).toLocaleString()})
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {form.entryType === 'SUPPLIER_PAYMENT' && (
//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">
//                 Select Supplier *
//               </label>
//               <select
//                 value={form.supplierId}
//                 onChange={e => setForm({ ...form, supplierId: e.target.value })}
//                 className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//                 required
//               >
//                 <option value="">-- Select Supplier --</option>
//                 {supplierList.map(s => (
//                   <option key={s._id} value={s._id}>
//                     {s.companyName || s.name} (Due: ৳{Number(s.dueBalance || 0).toLocaleString()})
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Category *
//             </label>
//             <input
//               placeholder="e.g. Rent, Salary, Utility, Due Collection"
//               value={form.category}
//               onChange={e => setForm({ ...form, category: e.target.value })}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Title / Description *
//             </label>
//             <input
//               placeholder={
//                 form.entryType === 'DUE_COLLECTION'
//                   ? 'e.g. Partial due collected'
//                   : form.entryType === 'SUPPLIER_PAYMENT'
//                   ? 'e.g. Bill payment against purchase'
//                   : 'e.g. Shop rent / Electricity bill'
//               }
//               value={form.title}
//               onChange={e => setForm({ ...form, title: e.target.value })}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Amount (৳) *
//             </label>
//             <input
//               type="number"
//               min="1"
//               step="any"
//               placeholder="0.00"
//               value={form.amount}
//               onChange={e => setForm({ ...form, amount: e.target.value })}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//               required
//             />
//             {selectedClientObj && (
//               <span className="text-[11px] text-amber-700 font-medium">
//                 Client Due: ৳{Number(selectedClientObj.dueBalance || 0).toLocaleString()}
//               </span>
//             )}
//             {selectedSupplierObj && (
//               <span className="text-[11px] text-red-600 font-medium">
//                 Supplier Due: ৳{Number(selectedSupplierObj.dueBalance || 0).toLocaleString()}
//               </span>
//             )}
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Payment Method
//             </label>
//             <select
//               value={form.paymentMethod}
//               onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//             >
//               <option value="Cash">Cash</option>
//               <option value="Bank">Bank</option>
//               <option value="Mobile Banking">Mobile Banking</option>
//               <option value="Adjustment">Adjustment</option>
//             </select>
//           </div>

//           {form.paymentMethod === 'Mobile Banking' && (
//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">
//                 Mobile Wallet
//               </label>
//               <select
//                 value={form.mobileProvider}
//                 onChange={e => setForm({ ...form, mobileProvider: e.target.value })}
//                 className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//               >
//                 <option value="bKash">bKash</option>
//                 <option value="Nagad">Nagad</option>
//                 <option value="Rocket">Rocket</option>
//                 <option value="Upay">Upay</option>
//                 <option value="Other">Other</option>
//               </select>
//             </div>
//           )}

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">Date *</label>
//             <input
//               type="date"
//               value={form.transactionDate}
//               onChange={e => setForm({ ...form, transactionDate: e.target.value })}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">Reference</label>
//             <input
//               placeholder="TrxID / Voucher Ref"
//               value={form.reference}
//               onChange={e => setForm({ ...form, reference: e.target.value })}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">Note</label>
//             <input
//               placeholder="Optional remarks"
//               value={form.note}
//               onChange={e => setForm({ ...form, note: e.target.value })}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//             />
//           </div>
//         </div>

//         <div className="flex justify-end pt-1">
//           <button
//             type="submit"
//             disabled={submitting}
//             className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 transition shadow-sm"
//           >
//             <Plus className="w-4 h-4" />
//             {submitting ? 'Saving...' : 'Save Entry'}
//           </button>
//         </div>
//       </form>

//       {/* Filters & Search */}
//       <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
//         <div className="flex flex-wrap gap-1.5">
//           {[
//             { key: 'ALL', label: 'All' },
//             { key: 'INCOME', label: 'Income' },
//             { key: 'EXPENSE', label: 'Expense' },
//             { key: 'DUE_COLLECTION', label: 'Due Collection' },
//             { key: 'SUPPLIER_PAYMENT', label: 'Supplier Payment' },
//             { key: 'OTHERS', label: 'Others' }
//           ].map(tab => (
//             <button
//               key={tab.key}
//               type="button"
//               onClick={() => setTypeFilter(tab.key)}
//               className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
//                 typeFilter === tab.key
//                   ? 'bg-indigo-600 text-white shadow-sm'
//                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//               }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         <div className="flex flex-col sm:flex-row gap-2.5">
//           <select
//             value={methodFilter}
//             onChange={e => setMethodFilter(e.target.value)}
//             className="border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white text-slate-700 outline-none"
//           >
//             <option value="ALL">All Methods</option>
//             <option value="Cash">Cash</option>
//             <option value="Bank">Bank</option>
//             <option value="Mobile Banking">Mobile Banking</option>
//             <option value="Adjustment">Adjustment</option>
//           </select>

//           <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 sm:w-64">
//             <Search className="w-4 h-4 text-slate-400 shrink-0" />
//             <input
//               type="text"
//               placeholder="Search voucher, party, title..."
//               value={searchTerm}
//               onChange={e => setSearchTerm(e.target.value)}
//               className="w-full text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Transactions List */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
//         {/* Desktop Table */}
//         <div className="hidden md:block overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
//                 <th className="py-3.5 px-4">Voucher & Date</th>
//                 <th className="py-3.5 px-4">Type</th>
//                 <th className="py-3.5 px-4">Party / Description</th>
//                 <th className="py-3.5 px-4">Method</th>
//                 <th className="py-3.5 px-4 text-right">Amount</th>
//                 <th className="py-3.5 px-4 text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 text-sm">
//               {paginatedTransactions.length > 0 ? (
//                 paginatedTransactions.map(item => {
//                   const partyName =
//                     item.client?.name ||
//                     item.supplier?.companyName ||
//                     item.supplier?.name ||
//                     '';
//                   const isPositive =
//                     item.entryType === 'INCOME' || item.entryType === 'DUE_COLLECTION';
//                   const isNegative =
//                     item.entryType === 'EXPENSE' || item.entryType === 'SUPPLIER_PAYMENT';

//                   return (
//                     <tr key={item._id} className="hover:bg-slate-50/80 transition">
//                       <td className="py-3.5 px-4">
//                         <p className="font-mono text-xs font-bold text-indigo-600">
//                           {item.voucherNumber}
//                         </p>
//                         <p className="text-xs text-slate-500">
//                           {item.transactionDate
//                             ? new Date(item.transactionDate).toLocaleDateString()
//                             : ''}
//                         </p>
//                       </td>
//                       <td className="py-3.5 px-4">{renderBadge(item.entryType)}</td>
//                       <td className="py-3.5 px-4">
//                         <p className="font-bold text-slate-800">{item.title}</p>
//                         <p className="text-xs text-slate-500">
//                           {partyName ? `${partyName} • ` : ''}
//                           {item.category}
//                           {item.reference ? ` • Ref: ${item.reference}` : ''}
//                         </p>
//                       </td>
//                       <td className="py-3.5 px-4 text-xs text-slate-700 font-medium">
//                         {item.paymentMethod || 'Cash'}
//                         {item.paymentMethod === 'Mobile Banking' && item.mobileProvider && (
//                           <span className="block text-[11px] text-violet-700 font-semibold">
//                             {item.mobileProvider}
//                           </span>
//                         )}
//                       </td>
//                       <td
//                         className={`py-3.5 px-4 text-right font-extrabold ${
//                           isPositive
//                             ? 'text-emerald-700'
//                             : isNegative
//                             ? 'text-red-600'
//                             : 'text-amber-700'
//                         }`}
//                       >
//                         {isPositive ? '+' : isNegative ? '-' : ''}৳{' '}
//                         {Number(item.amount || 0).toLocaleString()}
//                       </td>
//                       <td className="py-3.5 px-4 text-right">
//                         {isAdmin && (
//                           <button
//                             type="button"
//                             onClick={() => handleDelete(item)}
//                             title="Delete Entry"
//                             className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="py-8 text-center text-slate-400 text-sm">
//                     No accounting entries found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Mobile Cards (< md) */}
//         <div className="md:hidden divide-y divide-slate-100">
//           {paginatedTransactions.length > 0 ? (
//             paginatedTransactions.map(item => {
//               const partyName =
//                 item.client?.name ||
//                 item.supplier?.companyName ||
//                 item.supplier?.name ||
//                 '';
//               const isPositive =
//                 item.entryType === 'INCOME' || item.entryType === 'DUE_COLLECTION';
//               const isNegative =
//                 item.entryType === 'EXPENSE' || item.entryType === 'SUPPLIER_PAYMENT';

//               return (
//                 <div key={item._id} className="p-4 space-y-2.5">
//                   <div className="flex items-start justify-between gap-2">
//                     <div>
//                       <span className="font-mono text-xs font-bold text-indigo-600">
//                         {item.voucherNumber}
//                       </span>
//                       <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
//                       <p className="text-xs text-slate-500">
//                         {partyName ? `${partyName} • ` : ''}
//                         {item.category}
//                       </p>
//                     </div>
//                     {renderBadge(item.entryType)}
//                   </div>

//                   <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl">
//                     <span className="text-slate-600 font-medium">
//                       {item.paymentMethod || 'Cash'}
//                       {item.mobileProvider ? ` (${item.mobileProvider})` : ''}
//                     </span>
//                     <span
//                       className={`font-extrabold text-sm ${
//                         isPositive
//                           ? 'text-emerald-700'
//                           : isNegative
//                           ? 'text-red-600'
//                           : 'text-amber-700'
//                       }`}
//                     >
//                       {isPositive ? '+' : isNegative ? '-' : ''}৳
//                       {Number(item.amount || 0).toLocaleString()}
//                     </span>
//                   </div>

//                   {isAdmin && (
//                     <div className="flex justify-end">
//                       <button
//                         type="button"
//                         onClick={() => handleDelete(item)}
//                         className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
//                       >
//                         <Trash2 className="w-3.5 h-3.5" /> Delete
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           ) : (
//             <div className="p-8 text-center text-slate-400 text-sm">
//               No accounting entries found.
//             </div>
//           )}
//         </div>

//         {/* Pagination */}
//         {filteredTransactions.length > 0 && (
//           <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
//             <p className="text-slate-500">
//               Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
//               <span className="font-semibold text-slate-700">
//                 {Math.min(startIndex + itemsPerPage, filteredTransactions.length)}
//               </span>{' '}
//               of <span className="font-semibold text-slate-700">{filteredTransactions.length}</span>{' '}
//               entries
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
//     </div>
//   );
// }


// import { useState, useEffect } from 'react';
// import {
//   Plus,
//   Pencil,
//   Trash2,
//   Printer,
//   Download,
//   Search,
//   ChevronLeft,
//   ChevronRight,
//   Banknote,
//   Landmark,
//   Smartphone,
//   ArrowUpRight,
//   ArrowDownRight,
//   Layers,
//   HandCoins,
//   Receipt,
//   X
// } from 'lucide-react';
// import {
//   getAccountTransactions,
//   addAccountTransaction,
//   updateAccountTransaction,
//   deleteAccountTransaction
// } from '../services/api';
// import { DEFAULT_ERP_SETTINGS } from './Settings';

// const getEffectiveUser = (propUser) => {
//   if (propUser) return propUser;
//   try {
//     const raw =
//       localStorage.getItem('nexusUser') ||
//       localStorage.getItem('user') ||
//       localStorage.getItem('authUser');
//     return raw ? JSON.parse(raw) : null;
//   } catch {
//     return null;
//   }
// };

// const todayInputDate = () => new Date().toISOString().slice(0, 10);

// const toInputDate = (val) => {
//   if (!val) return todayInputDate();
//   const d = new Date(val);
//   if (Number.isNaN(d.getTime())) return todayInputDate();
//   return d.toISOString().slice(0, 10);
// };

// const emptyForm = {
//   entryType: 'INCOME',
//   customEntryType: '',
//   clientId: '',
//   supplierId: '',
//   category: '',
//   customCategory: '',
//   title: '',
//   customTitle: '',
//   amount: '',
//   paymentMethod: 'Cash',
//   mobileProvider: 'bKash',
//   reference: '',
//   note: '',
//   transactionDate: todayInputDate()
// };

// const extractTxArray = (payload) => {
//   if (Array.isArray(payload)) return payload;
//   if (Array.isArray(payload?.transactions)) return payload.transactions;
//   if (Array.isArray(payload?.data)) return payload.data;
//   return [];
// };

// export default function Accounts({
//   transactions,
//   accountTransactions,
//   clients = [],
//   suppliers = [],
//   invoices = [],
//   purchases = [],
//   settings,
//   reloadData,
//   user
// }) {
//   const activeSettings = {
//     ...DEFAULT_ERP_SETTINGS,
//     ...(settings || {})
//   };
//   const currency = activeSettings.currencySymbol || '৳';

//   const typeOptions =
//     Array.isArray(activeSettings?.transactionTypes) && activeSettings.transactionTypes.length
//       ? activeSettings.transactionTypes
//       : ['INCOME', 'EXPENSE', 'DUE_COLLECTION', 'SUPPLIER_PAYMENT', 'OTHERS'];

//   const categoryOptions =
//     Array.isArray(activeSettings?.transactionCategories) &&
//     activeSettings.transactionCategories.length
//       ? activeSettings.transactionCategories
//       : [
//           'Sales / Service Income',
//           'Office & Utility Expense',
//           'Salary & Allowance',
//           'Transport & Logistics',
//           'Due Collection',
//           'Supplier Payment',
//           'Maintenance',
//           'Others'
//         ];

//   const titleOptions =
//     Array.isArray(activeSettings?.transactionTitles) && activeSettings.transactionTitles.length
//       ? activeSettings.transactionTitles
//       : [
//           'Daily Cash Sales',
//           'Monthly Office Rent',
//           'Electricity & Internet Bill',
//           'Staff Advance / Salary',
//           'Client Due Collection',
//           'Supplier Bill Payment',
//           'Others'
//         ];

//   const incomingTx = Array.isArray(transactions)
//     ? transactions
//     : Array.isArray(accountTransactions)
//     ? accountTransactions
//     : null;

//   const [localTx, setLocalTx] = useState(() => incomingTx || []);
//   const [form, setForm] = useState(() => ({
//     ...emptyForm,
//     entryType: typeOptions[0] || 'INCOME',
//     category: categoryOptions[0] || 'Others',
//     title: titleOptions[0] || 'Others'
//   }));
//   const [typeFilter, setTypeFilter] = useState('ALL');
//   const [methodFilter, setMethodFilter] = useState('ALL');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   // Edit Modal State
//   const [editingTx, setEditingTx] = useState(null);
//   const [editForm, setEditForm] = useState(emptyForm);
//   const [updating, setUpdating] = useState(false);

//   // Pagination State
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 8;

//   const syncLocalTransactions = async () => {
//     try {
//       const res = await getAccountTransactions();
//       setLocalTx(extractTxArray(res?.data));
//     } catch (err) {
//       console.error('Error syncing account transactions:', err);
//     }
//   };

//   useEffect(() => {
//     if (incomingTx !== null) {
//       setLocalTx(incomingTx);
//     } else {
//       syncLocalTransactions();
//     }
//   }, [transactions, accountTransactions]);

//   const txList = incomingTx !== null ? incomingTx : localTx;
//   const clientList = Array.isArray(clients) ? clients : [];
//   const supplierList = Array.isArray(suppliers) ? suppliers : [];
//   const invoiceList = Array.isArray(invoices) ? invoices : [];
//   const purchaseList = Array.isArray(purchases) ? purchases : [];

//   const currentUser = getEffectiveUser(user);
//   const isAdmin =
//     (currentUser?.userType || '').toLowerCase() === 'admin' ||
//     (currentUser?.role || '').toLowerCase() === 'admin';
//   const canEdit = isAdmin || Boolean(currentUser?.permissions?.accounts);
//   const canDelete = isAdmin || Boolean(currentUser?.permissions?.accounts);

//   const selectedClientObj = clientList.find(c => c._id === form.clientId);
//   const selectedSupplierObj = supplierList.find(s => s._id === form.supplierId);

//   const editClientObj = clientList.find(c => c._id === editForm.clientId);
//   const editSupplierObj = supplierList.find(s => s._id === editForm.supplierId);

//   const methodBalances = (() => {
//     const map = {
//       Cash: 0,
//       Bank: 0,
//       'Mobile Banking': 0
//     };

//     const applyFlow = (method, delta) => {
//       if (method === 'Cash' || method === 'Bank' || method === 'Mobile Banking') {
//         map[method] += delta;
//       }
//     };

//     for (const inv of invoiceList) {
//       const paid = Number(inv.paidAmount || 0);
//       if (paid > 0) {
//         applyFlow(inv.paymentMethod || 'Cash', paid);
//       }
//     }

//     for (const pur of purchaseList) {
//       const paid = Number(pur.paidAmount || 0);
//       if (paid > 0) {
//         applyFlow(pur.paymentMethod || 'Cash', -paid);
//       }
//     }

//     for (const tx of txList) {
//       const amt = Number(tx.amount || 0);
//       const method = tx.paymentMethod || 'Cash';
//       if (tx.entryType === 'INCOME' || tx.entryType === 'DUE_COLLECTION') {
//         applyFlow(method, amt);
//       } else if (tx.entryType === 'EXPENSE' || tx.entryType === 'SUPPLIER_PAYMENT') {
//         applyFlow(method, -amt);
//       } else if (tx.entryType === 'OTHERS') {
//         applyFlow(method, amt);
//       }
//     }

//     return map;
//   })();

//   const totalReceivable = clientList.reduce(
//     (sum, c) => sum + Number(c.dueBalance || 0),
//     0
//   );
//   const totalPayable = supplierList.reduce(
//     (sum, s) => sum + Number(s.dueBalance || 0),
//     0
//   );

//   const filteredTransactions = txList.filter(item => {
//     const matchesType = typeFilter === 'ALL' || item.entryType === typeFilter;
//     const matchesMethod =
//       methodFilter === 'ALL' || (item.paymentMethod || 'Cash') === methodFilter;
//     const q = searchTerm.trim().toLowerCase();

//     const partyName =
//       item.client?.name ||
//       item.supplier?.companyName ||
//       item.supplier?.name ||
//       '';

//     const matchesSearch =
//       !q ||
//       (item.voucherNumber || '').toLowerCase().includes(q) ||
//       (item.category || '').toLowerCase().includes(q) ||
//       (item.title || '').toLowerCase().includes(q) ||
//       (item.reference || '').toLowerCase().includes(q) ||
//       (item.mobileProvider || '').toLowerCase().includes(q) ||
//       partyName.toLowerCase().includes(q) ||
//       (item.note || '').toLowerCase().includes(q);

//     return matchesType && matchesMethod && matchesSearch;
//   });

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [typeFilter, methodFilter, searchTerm, txList.length]);

//   const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
//   const safeCurrentPage = Math.min(currentPage, totalPages);
//   const startIndex = (safeCurrentPage - 1) * itemsPerPage;
//   const paginatedTransactions = filteredTransactions.slice(
//     startIndex,
//     startIndex + itemsPerPage
//   );

//   const filteredTotal = filteredTransactions.reduce(
//     (sum, item) => sum + Number(item.amount || 0),
//     0
//   );

//   const refreshAll = async () => {
//     await syncLocalTransactions();
//     if (typeof reloadData === 'function') {
//       reloadData();
//     }
//   };

//   const resolveDropdownPayload = (src) => {
//     const resolvedEntryType =
//       src.entryType === 'OTHERS' && src.customEntryType.trim()
//         ? src.customEntryType.trim()
//         : src.entryType;

//     const resolvedCategory =
//       src.category === 'Others' && src.customCategory.trim()
//         ? src.customCategory.trim()
//         : src.category;

//     const resolvedTitle =
//       src.title === 'Others' && src.customTitle.trim()
//         ? src.customTitle.trim()
//         : src.title;

//     return {
//       resolvedEntryType,
//       resolvedCategory,
//       resolvedTitle
//     };
//   };

//   const handleEntryTypeChange = (newType) => {
//     setForm(prev => ({
//       ...prev,
//       entryType: newType,
//       customEntryType: '',
//       clientId: '',
//       supplierId: ''
//     }));
//   };

//   const handleCreate = async (e) => {
//     e.preventDefault();
//     const { resolvedEntryType, resolvedCategory, resolvedTitle } = resolveDropdownPayload(form);

//     if (!resolvedEntryType || !resolvedCategory || !resolvedTitle) {
//       alert('Transaction Type, Category, and Title / Description are required.');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       await addAccountTransaction({
//         entryType: resolvedEntryType,
//         clientId: resolvedEntryType === 'DUE_COLLECTION' ? form.clientId : undefined,
//         supplierId: resolvedEntryType === 'SUPPLIER_PAYMENT' ? form.supplierId : undefined,
//         category: resolvedCategory,
//         title: resolvedTitle,
//         amount: Number(form.amount),
//         paymentMethod: form.paymentMethod,
//         mobileProvider:
//           form.paymentMethod === 'Mobile Banking' ? form.mobileProvider : '',
//         reference: form.reference,
//         note: form.note,
//         transactionDate: form.transactionDate
//       });

//       setForm(prev => ({
//         ...emptyForm,
//         entryType: prev.entryType,
//         category: prev.category,
//         title: prev.title,
//         paymentMethod: prev.paymentMethod,
//         mobileProvider: prev.mobileProvider,
//         transactionDate: todayInputDate()
//       }));
//       setCurrentPage(1);
//       await refreshAll();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Error saving transaction');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const openEditModal = (item) => {
//     const hasEntryType = typeOptions.includes(item.entryType);
//     const hasCategory = categoryOptions.includes(item.category);
//     const hasTitle = titleOptions.includes(item.title);

//     setEditingTx(item);
//     setEditForm({
//       entryType: hasEntryType ? item.entryType : 'OTHERS',
//       customEntryType: hasEntryType ? '' : item.entryType || '',
//       clientId: item.client?._id || item.client || '',
//       supplierId: item.supplier?._id || item.supplier || '',
//       category: hasCategory ? item.category : 'Others',
//       customCategory: hasCategory ? '' : item.category || '',
//       title: hasTitle ? item.title : 'Others',
//       customTitle: hasTitle ? '' : item.title || '',
//       amount: item.amount ?? '',
//       paymentMethod: item.paymentMethod || 'Cash',
//       mobileProvider: item.mobileProvider || 'bKash',
//       reference: item.reference || '',
//       note: item.note || '',
//       transactionDate: toInputDate(item.transactionDate)
//     });
//   };

//   const handleUpdateSubmit = async (e) => {
//     e.preventDefault();
//     if (!editingTx) return;

//     const { resolvedEntryType, resolvedCategory, resolvedTitle } =
//       resolveDropdownPayload(editForm);

//     if (!resolvedEntryType || !resolvedCategory || !resolvedTitle) {
//       alert('Transaction Type, Category, and Title / Description are required.');
//       return;
//     }

//     setUpdating(true);
//     try {
//       await updateAccountTransaction(editingTx._id, {
//         entryType: resolvedEntryType,
//         clientId: resolvedEntryType === 'DUE_COLLECTION' ? editForm.clientId : null,
//         supplierId: resolvedEntryType === 'SUPPLIER_PAYMENT' ? editForm.supplierId : null,
//         category: resolvedCategory,
//         title: resolvedTitle,
//         amount: Number(editForm.amount),
//         paymentMethod: editForm.paymentMethod,
//         mobileProvider:
//           editForm.paymentMethod === 'Mobile Banking' ? editForm.mobileProvider : '',
//         reference: editForm.reference,
//         note: editForm.note,
//         transactionDate: editForm.transactionDate
//       });

//       setEditingTx(null);
//       await refreshAll();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Error updating transaction');
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleDelete = async (item) => {
//     if (
//       !confirm(
//         `Voucher ${item.voucherNumber} ডিলিট করতে চান? (Due Collection / Supplier Payment হলে বকেয়া ব্যালেন্সও রিভার্স হবে)`
//       )
//     ) {
//       return;
//     }
//     try {
//       await deleteAccountTransaction(item._id);
//       await refreshAll();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Error deleting transaction');
//     }
//   };

//   const handleDownloadExcel = () => {
//     const headers = [
//       'SL',
//       'Voucher #',
//       'Date',
//       'Type',
//       'Party',
//       'Category',
//       'Title',
//       'Method',
//       'Provider',
//       'Reference',
//       'Amount',
//       'Note'
//     ];

//     const escapeCsv = (val) => {
//       const str = String(val ?? '');
//       return `"${str.replace(/"/g, '""')}"`;
//     };

//     const rows = filteredTransactions.map((item, idx) => {
//       const partyName =
//         item.client?.name ||
//         item.supplier?.companyName ||
//         item.supplier?.name ||
//         '-';
//       return [
//         escapeCsv(idx + 1),
//         escapeCsv(item.voucherNumber || ''),
//         escapeCsv(
//           item.transactionDate
//             ? new Date(item.transactionDate).toLocaleDateString()
//             : ''
//         ),
//         escapeCsv(item.entryType || ''),
//         escapeCsv(partyName),
//         escapeCsv(item.category || ''),
//         escapeCsv(item.title || ''),
//         escapeCsv(item.paymentMethod || 'Cash'),
//         escapeCsv(item.mobileProvider || ''),
//         escapeCsv(item.reference || ''),
//         escapeCsv(Number(item.amount || 0)),
//         escapeCsv(item.note || '')
//       ].join(',');
//     });

//     const totalRow = [
//       escapeCsv(''),
//       escapeCsv('TOTAL'),
//       escapeCsv(''),
//       escapeCsv(typeFilter),
//       escapeCsv(''),
//       escapeCsv(`${filteredTransactions.length} Entries`),
//       escapeCsv(''),
//       escapeCsv(methodFilter),
//       escapeCsv(''),
//       escapeCsv(''),
//       escapeCsv(filteredTotal),
//       escapeCsv('')
//     ].join(',');

//     const csvContent =
//       '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows, totalRow].join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.setAttribute('download', `Accounts_Ledger_${todayInputDate()}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   const handlePrint = () => {
//     const printWindow = window.open('', '_blank', 'height=750,width=1000');
//     if (!printWindow) return;

//     const rowsHtml = filteredTransactions
//       .map((item, idx) => {
//         const partyName =
//           item.client?.name ||
//           item.supplier?.companyName ||
//           item.supplier?.name ||
//           '-';
//         const methodText =
//           item.paymentMethod === 'Mobile Banking' && item.mobileProvider
//             ? `${item.paymentMethod} (${item.mobileProvider})`
//             : item.paymentMethod || 'Cash';

//         return `
//           <tr>
//             <td>${idx + 1}</td>
//             <td><strong>${item.voucherNumber || '-'}</strong></td>
//             <td>${
//               item.transactionDate
//                 ? new Date(item.transactionDate).toLocaleDateString()
//                 : '-'
//             }</td>
//             <td>${item.entryType}</td>
//             <td>${partyName}</td>
//             <td><strong>${item.title}</strong><br/><small>${item.category || ''}</small></td>
//             <td>${methodText}</td>
//             <td class="text-right">${currency}${Number(item.amount || 0).toLocaleString()}</td>
//           </tr>
//         `;
//       })
//       .join('');

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Accounts & Cash Statement</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
//             .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; }
//             h2 { margin: 0 0 4px 0; font-size: 20px; }
//             p { margin: 2px 0; font-size: 12px; color: #475569; }
//             .cards { display: flex; gap: 10px; margin-bottom: 16px; }
//             .card { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; background: #f8fafc; font-size: 12px; }
//             .card strong { display: block; font-size: 14px; margin-top: 2px; }
//             table { width: 100%; border-collapse: collapse; font-size: 12px; }
//             th, td { border-bottom: 1px solid #cbd5e1; padding: 7px 6px; text-align: left; }
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
//               <h2>ACCOUNTS & CASH STATEMENT</h2>
//               <p>Type: ${typeFilter} • Method: ${methodFilter} • Entries: ${filteredTransactions.length}</p>
//             </div>
//             <div style="text-align:right">
//               <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
//             </div>
//           </div>

//           <div class="cards">
//             <div class="card">Cash Balance<strong>${currency}${methodBalances.Cash.toLocaleString()}</strong></div>
//             <div class="card">Bank Balance<strong>${currency}${methodBalances.Bank.toLocaleString()}</strong></div>
//             <div class="card">Mobile Banking<strong>${currency}${methodBalances['Mobile Banking'].toLocaleString()}</strong></div>
//             <div class="card">Filtered Total<strong>${currency}${filteredTotal.toLocaleString()}</strong></div>
//           </div>

//           <table>
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Voucher</th>
//                 <th>Date</th>
//                 <th>Type</th>
//                 <th>Party</th>
//                 <th>Description</th>
//                 <th>Method</th>
//                 <th class="text-right">Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${
//                 rowsHtml ||
//                 `<tr><td colspan="8" style="text-align:center;padding:16px;">No records found.</td></tr>`
//               }
//             </tbody>
//             <tfoot>
//               <tr>
//                 <td colspan="7">Filtered Total</td>
//                 <td class="text-right">${currency}${filteredTotal.toLocaleString()}</td>
//               </tr>
//             </tfoot>
//           </table>

//           <div class="signatures">
//             <div class="sig-box">Prepared By</div>
//             <div class="sig-box">Accounts Officer</div>
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

//   const renderBadge = (type) => {
//     switch (type) {
//       case 'INCOME':
//         return (
//           <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
//             <ArrowUpRight className="w-3.5 h-3.5" /> Income
//           </span>
//         );
//       case 'EXPENSE':
//         return (
//           <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
//             <ArrowDownRight className="w-3.5 h-3.5" /> Expense
//           </span>
//         );
//       case 'DUE_COLLECTION':
//         return (
//           <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
//             <HandCoins className="w-3.5 h-3.5" /> Due Collection
//           </span>
//         );
//       case 'SUPPLIER_PAYMENT':
//         return (
//           <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
//             <Receipt className="w-3.5 h-3.5" /> Supplier Payment
//           </span>
//         );
//       default:
//         return (
//           <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
//             <Layers className="w-3.5 h-3.5" /> {type || 'Others'}
//           </span>
//         );
//     }
//   };

//   return (
//     <div className="space-y-5 sm:space-y-6">
//       {/* Header & Actions */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div>
//           <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
//             Accounts — Cash, Bank, Due & Expenses
//           </h2>
//           <p className="text-xs sm:text-sm text-slate-500">
//             Manage Cash/Bank/Mobile Banking balances, client due collections, supplier payments, and expenses.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           <button
//             type="button"
//             onClick={handleDownloadExcel}
//             className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm inline-flex items-center gap-1.5 transition cursor-pointer"
//           >
//             <Download className="w-4 h-4" /> Excel
//           </button>

//           <button
//             type="button"
//             onClick={handlePrint}
//             className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-sm inline-flex items-center gap-1.5 transition cursor-pointer"
//           >
//             <Printer className="w-4 h-4 text-indigo-600" /> Print ({filteredTransactions.length})
//           </button>
//         </div>
//       </div>

//       {/* Cash, Bank, Mobile Banking & Receivable/Payable Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
//           <div>
//             <p className="text-xs font-semibold text-slate-500 uppercase">Cash Balance</p>
//             <p className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1">
//               {currency} {methodBalances.Cash.toLocaleString()}
//             </p>
//           </div>
//           <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
//             <Banknote className="w-5 h-5" />
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
//           <div>
//             <p className="text-xs font-semibold text-slate-500 uppercase">Bank Balance</p>
//             <p className="text-lg sm:text-xl font-extrabold text-indigo-700 mt-1">
//               {currency} {methodBalances.Bank.toLocaleString()}
//             </p>
//           </div>
//           <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
//             <Landmark className="w-5 h-5" />
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
//           <div>
//             <p className="text-xs font-semibold text-slate-500 uppercase">Mobile Banking</p>
//             <p className="text-lg sm:text-xl font-extrabold text-violet-700 mt-1">
//               {currency} {methodBalances['Mobile Banking'].toLocaleString()}
//             </p>
//             <p className="text-[11px] text-slate-400">bKash / Nagad / Rocket</p>
//           </div>
//           <div className="p-3 rounded-xl bg-violet-50 text-violet-600 shrink-0">
//             <Smartphone className="w-5 h-5" />
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
//           <p className="text-xs font-semibold text-slate-500 uppercase">Receivable (Client Due)</p>
//           <p className="text-lg sm:text-xl font-extrabold text-amber-700 mt-1">
//             {currency} {totalReceivable.toLocaleString()}
//           </p>
//           <p className="text-[11px] text-slate-400 mt-0.5">To be collected from clients</p>
//         </div>

//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
//           <p className="text-xs font-semibold text-slate-500 uppercase">Payable (Supplier Due)</p>
//           <p className="text-lg sm:text-xl font-extrabold text-red-600 mt-1">
//             {currency} {totalPayable.toLocaleString()}
//           </p>
//           <p className="text-[11px] text-slate-400 mt-0.5">To be paid to suppliers</p>
//         </div>
//       </div>

//       {/* Add Transaction Form */}
//       <form
//         onSubmit={handleCreate}
//         className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4"
//       >
//         <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 text-sm sm:text-base">
//           Record Accounting Entry
//         </h3>

//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
//           {/* Transaction Type Dropdown (from Settings) */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Transaction Type *
//             </label>
//             <select
//               required
//               value={form.entryType}
//               onChange={e => handleEntryTypeChange(e.target.value)}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//             >
//               <option value="">Select Transaction Type</option>
//               {typeOptions.map(t => (
//                 <option key={t} value={t}>
//                   {t}
//                 </option>
//               ))}
//             </select>
//             {form.entryType === 'OTHERS' && (
//               <input
//                 type="text"
//                 required
//                 placeholder="Enter custom transaction type"
//                 value={form.customEntryType}
//                 onChange={e => setForm({ ...form, customEntryType: e.target.value })}
//                 className="mt-2 w-full border border-slate-200 p-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
//               />
//             )}
//           </div>

//           {form.entryType === 'DUE_COLLECTION' && (
//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">
//                 Select Client *
//               </label>
//               <select
//                 value={form.clientId}
//                 onChange={e => setForm({ ...form, clientId: e.target.value })}
//                 className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//                 required
//               >
//                 <option value="">-- Select Client --</option>
//                 {clientList.map(c => (
//                   <option key={c._id} value={c._id}>
//                     {c.name} (Due: {currency}
//                     {Number(c.dueBalance || 0).toLocaleString()})
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {form.entryType === 'SUPPLIER_PAYMENT' && (
//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">
//                 Select Supplier *
//               </label>
//               <select
//                 value={form.supplierId}
//                 onChange={e => setForm({ ...form, supplierId: e.target.value })}
//                 className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//                 required
//               >
//                 <option value="">-- Select Supplier --</option>
//                 {supplierList.map(s => (
//                   <option key={s._id} value={s._id}>
//                     {s.companyName || s.name} (Due: {currency}
//                     {Number(s.dueBalance || 0).toLocaleString()})
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )}

//           {/* Category Dropdown (from Settings) */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Category *
//             </label>
//             <select
//               required
//               value={form.category}
//               onChange={e =>
//                 setForm({
//                   ...form,
//                   category: e.target.value,
//                   customCategory: e.target.value === 'Others' ? form.customCategory : ''
//                 })
//               }
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//             >
//               <option value="">Select Category</option>
//               {categoryOptions.map(cat => (
//                 <option key={cat} value={cat}>
//                   {cat}
//                 </option>
//               ))}
//             </select>
//             {form.category === 'Others' && (
//               <input
//                 type="text"
//                 required
//                 placeholder="Enter custom category"
//                 value={form.customCategory}
//                 onChange={e => setForm({ ...form, customCategory: e.target.value })}
//                 className="mt-2 w-full border border-slate-200 p-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
//               />
//             )}
//           </div>

//           {/* Title / Description Dropdown (from Settings) */}
//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Title / Description *
//             </label>
//             <select
//               required
//               value={form.title}
//               onChange={e =>
//                 setForm({
//                   ...form,
//                   title: e.target.value,
//                   customTitle: e.target.value === 'Others' ? form.customTitle : ''
//                 })
//               }
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//             >
//               <option value="">Select Title / Description</option>
//               {titleOptions.map(t => (
//                 <option key={t} value={t}>
//                   {t}
//                 </option>
//               ))}
//             </select>
//             {form.title === 'Others' && (
//               <input
//                 type="text"
//                 required
//                 placeholder="Enter custom title / description"
//                 value={form.customTitle}
//                 onChange={e => setForm({ ...form, customTitle: e.target.value })}
//                 className="mt-2 w-full border border-slate-200 p-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
//               />
//             )}
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Amount ({currency}) *
//             </label>
//             <input
//               type="number"
//               min="1"
//               step="any"
//               placeholder="0.00"
//               value={form.amount}
//               onChange={e => setForm({ ...form, amount: e.target.value })}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//               required
//             />
//             {selectedClientObj && (
//               <span className="text-[11px] text-amber-700 font-medium">
//                 Client Due: {currency}
//                 {Number(selectedClientObj.dueBalance || 0).toLocaleString()}
//               </span>
//             )}
//             {selectedSupplierObj && (
//               <span className="text-[11px] text-red-600 font-medium">
//                 Supplier Due: {currency}
//                 {Number(selectedSupplierObj.dueBalance || 0).toLocaleString()}
//               </span>
//             )}
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Payment Method
//             </label>
//             <select
//               value={form.paymentMethod}
//               onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//             >
//               <option value="Cash">Cash</option>
//               <option value="Bank">Bank</option>
//               <option value="Mobile Banking">Mobile Banking</option>
//               <option value="Adjustment">Adjustment</option>
//             </select>
//           </div>

//           {form.paymentMethod === 'Mobile Banking' && (
//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">
//                 Mobile Wallet
//               </label>
//               <select
//                 value={form.mobileProvider}
//                 onChange={e => setForm({ ...form, mobileProvider: e.target.value })}
//                 className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//               >
//                 <option value="bKash">bKash</option>
//                 <option value="Nagad">Nagad</option>
//                 <option value="Rocket">Rocket</option>
//                 <option value="Upay">Upay</option>
//                 <option value="Other">Other</option>
//               </select>
//             </div>
//           )}

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">Date *</label>
//             <input
//               type="date"
//               value={form.transactionDate}
//               onChange={e => setForm({ ...form, transactionDate: e.target.value })}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">Reference</label>
//             <input
//               placeholder="TrxID / Voucher Ref"
//               value={form.reference}
//               onChange={e => setForm({ ...form, reference: e.target.value })}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">Note</label>
//             <input
//               placeholder="Optional remarks"
//               value={form.note}
//               onChange={e => setForm({ ...form, note: e.target.value })}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//             />
//           </div>
//         </div>

//         <div className="flex justify-end pt-1">
//           <button
//             type="submit"
//             disabled={submitting}
//             className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
//           >
//             <Plus className="w-4 h-4" />
//             {submitting ? 'Saving...' : 'Save Entry'}
//           </button>
//         </div>
//       </form>

//       {/* Filters & Search */}
//       <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
//         <div className="flex flex-wrap gap-1.5">
//           {[
//             { key: 'ALL', label: 'All' },
//             { key: 'INCOME', label: 'Income' },
//             { key: 'EXPENSE', label: 'Expense' },
//             { key: 'DUE_COLLECTION', label: 'Due Collection' },
//             { key: 'SUPPLIER_PAYMENT', label: 'Supplier Payment' },
//             { key: 'OTHERS', label: 'Others' }
//           ].map(tab => (
//             <button
//               key={tab.key}
//               type="button"
//               onClick={() => setTypeFilter(tab.key)}
//               className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
//                 typeFilter === tab.key
//                   ? 'bg-indigo-600 text-white shadow-sm'
//                   : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
//               }`}
//             >
//               {tab.label}
//             </button>
//           ))}
//         </div>

//         <div className="flex flex-col sm:flex-row gap-2.5">
//           <select
//             value={methodFilter}
//             onChange={e => setMethodFilter(e.target.value)}
//             className="border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white text-slate-700 outline-none"
//           >
//             <option value="ALL">All Methods</option>
//             <option value="Cash">Cash</option>
//             <option value="Bank">Bank</option>
//             <option value="Mobile Banking">Mobile Banking</option>
//             <option value="Adjustment">Adjustment</option>
//           </select>

//           <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 sm:w-64">
//             <Search className="w-4 h-4 text-slate-400 shrink-0" />
//             <input
//               type="text"
//               placeholder="Search voucher, party, title..."
//               value={searchTerm}
//               onChange={e => setSearchTerm(e.target.value)}
//               className="w-full text-xs sm:text-sm outline-none bg-transparent"
//             />
//           </div>
//         </div>
//       </div>

//       {/* Transactions Table */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-x-auto">
//         <table className="w-full text-left border-collapse">
//           <thead>
//             <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase">
//               <th className="py-3 px-3">Voucher</th>
//               <th className="py-3 px-3">Date</th>
//               <th className="py-3 px-3">Type</th>
//               <th className="py-3 px-3">Party</th>
//               <th className="py-3 px-3">Category / Title</th>
//               <th className="py-3 px-3">Method</th>
//               <th className="py-3 px-3 text-right">Amount</th>
//               <th className="py-3 px-3 text-right">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
//             {paginatedTransactions.length === 0 ? (
//               <tr>
//                 <td colSpan="8" className="py-8 text-center text-slate-500">
//                   No transactions found.
//                 </td>
//               </tr>
//             ) : (
//               paginatedTransactions.map(item => {
//                 const partyName =
//                   item.client?.name ||
//                   item.supplier?.companyName ||
//                   item.supplier?.name ||
//                   '-';
//                 const methodLabel =
//                   item.paymentMethod === 'Mobile Banking' && item.mobileProvider
//                     ? `${item.paymentMethod} (${item.mobileProvider})`
//                     : item.paymentMethod || 'Cash';

//                 return (
//                   <tr key={item._id} className="hover:bg-slate-50/70 transition">
//                     <td className="py-3 px-3 font-mono text-xs font-bold text-slate-800 whitespace-nowrap">
//                       {item.voucherNumber || '-'}
//                     </td>
//                     <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
//                       {item.transactionDate
//                         ? new Date(item.transactionDate).toLocaleDateString()
//                         : '-'}
//                     </td>
//                     <td className="py-3 px-3 whitespace-nowrap">{renderBadge(item.entryType)}</td>
//                     <td className="py-3 px-3 text-slate-700 font-medium">{partyName}</td>
//                     <td className="py-3 px-3">
//                       <div className="font-semibold text-slate-800">{item.title}</div>
//                       <div className="text-[11px] text-slate-400">
//                         {item.category || 'General'}
//                         {item.reference ? ` • Ref: ${item.reference}` : ''}
//                       </div>
//                     </td>
//                     <td className="py-3 px-3 text-slate-700 whitespace-nowrap">{methodLabel}</td>
//                     <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
//                       {currency} {Number(item.amount || 0).toLocaleString()}
//                     </td>
//                     <td className="py-3 px-3 text-right whitespace-nowrap">
//                       <div className="inline-flex items-center justify-end gap-1">
//                         {canEdit && (
//                           <button
//                             type="button"
//                             onClick={() => openEditModal(item)}
//                             title="Edit Entry"
//                             className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
//                           >
//                             <Pencil className="w-4 h-4" />
//                           </button>
//                         )}
//                         {canDelete && (
//                           <button
//                             type="button"
//                             onClick={() => handleDelete(item)}
//                             title="Delete Entry"
//                             className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination Bar */}
//       {filteredTransactions.length > 0 && (
//         <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-600">
//           <span>
//             Showing <strong>{startIndex + 1}</strong>–
//             <strong>
//               {Math.min(startIndex + itemsPerPage, filteredTransactions.length)}
//             </strong>{' '}
//             of <strong>{filteredTransactions.length}</strong> entries • Filtered Total:{' '}
//             <strong className="text-slate-900">
//               {currency} {filteredTotal.toLocaleString()}
//             </strong>
//           </span>

//           <div className="flex items-center gap-2">
//             <button
//               type="button"
//               disabled={safeCurrentPage <= 1}
//               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//               className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
//             >
//               <ChevronLeft className="w-4 h-4" /> Prev
//             </button>
//             <span className="px-2 font-semibold text-slate-800">
//               Page {safeCurrentPage} / {totalPages}
//             </span>
//             <button
//               type="button"
//               disabled={safeCurrentPage >= totalPages}
//               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//               className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
//             >
//               Next <ChevronRight className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Edit Transaction Modal */}
//       {editingTx && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
//           <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
//               <h3 className="text-lg font-bold text-slate-800">
//                 Edit Entry — {editingTx.voucherNumber}
//               </h3>
//               <button
//                 type="button"
//                 onClick={() => setEditingTx(null)}
//                 className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Transaction Type *
//                   </label>
//                   <select
//                     required
//                     value={editForm.entryType}
//                     onChange={e =>
//                       setEditForm({
//                         ...editForm,
//                         entryType: e.target.value,
//                         clientId: e.target.value === 'DUE_COLLECTION' ? editForm.clientId : '',
//                         supplierId:
//                           e.target.value === 'SUPPLIER_PAYMENT' ? editForm.supplierId : ''
//                       })
//                     }
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//                   >
//                     <option value="">Select Transaction Type</option>
//                     {typeOptions.map(t => (
//                       <option key={t} value={t}>
//                         {t}
//                       </option>
//                     ))}
//                   </select>
//                   {editForm.entryType === 'OTHERS' && (
//                     <input
//                       type="text"
//                       required
//                       placeholder="Enter custom transaction type"
//                       value={editForm.customEntryType}
//                       onChange={e =>
//                         setEditForm({ ...editForm, customEntryType: e.target.value })
//                       }
//                       className="mt-2 w-full border border-slate-200 p-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
//                     />
//                   )}
//                 </div>

//                 {editForm.entryType === 'DUE_COLLECTION' && (
//                   <div>
//                     <label className="block text-xs font-semibold text-slate-600 mb-1">
//                       Select Client *
//                     </label>
//                     <select
//                       required
//                       value={editForm.clientId}
//                       onChange={e => setEditForm({ ...editForm, clientId: e.target.value })}
//                       className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//                     >
//                       <option value="">-- Select Client --</option>
//                       {clientList.map(c => (
//                         <option key={c._id} value={c._id}>
//                           {c.name} (Due: {currency}
//                           {Number(c.dueBalance || 0).toLocaleString()})
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}

//                 {editForm.entryType === 'SUPPLIER_PAYMENT' && (
//                   <div>
//                     <label className="block text-xs font-semibold text-slate-600 mb-1">
//                       Select Supplier *
//                     </label>
//                     <select
//                       required
//                       value={editForm.supplierId}
//                       onChange={e => setEditForm({ ...editForm, supplierId: e.target.value })}
//                       className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//                     >
//                       <option value="">-- Select Supplier --</option>
//                       {supplierList.map(s => (
//                         <option key={s._id} value={s._id}>
//                           {s.companyName || s.name} (Due: {currency}
//                           {Number(s.dueBalance || 0).toLocaleString()})
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Category *
//                   </label>
//                   <select
//                     required
//                     value={editForm.category}
//                     onChange={e => setEditForm({ ...editForm, category: e.target.value })}
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//                   >
//                     <option value="">Select Category</option>
//                     {categoryOptions.map(cat => (
//                       <option key={cat} value={cat}>
//                         {cat}
//                       </option>
//                     ))}
//                   </select>
//                   {editForm.category === 'Others' && (
//                     <input
//                       type="text"
//                       required
//                       placeholder="Enter custom category"
//                       value={editForm.customCategory}
//                       onChange={e =>
//                         setEditForm({ ...editForm, customCategory: e.target.value })
//                       }
//                       className="mt-2 w-full border border-slate-200 p-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
//                     />
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Title / Description *
//                   </label>
//                   <select
//                     required
//                     value={editForm.title}
//                     onChange={e => setEditForm({ ...editForm, title: e.target.value })}
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//                   >
//                     <option value="">Select Title / Description</option>
//                     {titleOptions.map(t => (
//                       <option key={t} value={t}>
//                         {t}
//                       </option>
//                     ))}
//                   </select>
//                   {editForm.title === 'Others' && (
//                     <input
//                       type="text"
//                       required
//                       placeholder="Enter custom title / description"
//                       value={editForm.customTitle}
//                       onChange={e =>
//                         setEditForm({ ...editForm, customTitle: e.target.value })
//                       }
//                       className="mt-2 w-full border border-slate-200 p-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
//                     />
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Amount ({currency}) *
//                   </label>
//                   <input
//                     type="number"
//                     min="1"
//                     step="any"
//                     required
//                     value={editForm.amount}
//                     onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//                   />
//                   {editClientObj && (
//                     <span className="text-[11px] text-amber-700 font-medium">
//                       Current Client Due: {currency}
//                       {Number(editClientObj.dueBalance || 0).toLocaleString()}
//                     </span>
//                   )}
//                   {editSupplierObj && (
//                     <span className="text-[11px] text-red-600 font-medium">
//                       Current Supplier Due: {currency}
//                       {Number(editSupplierObj.dueBalance || 0).toLocaleString()}
//                     </span>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Payment Method
//                   </label>
//                   <select
//                     value={editForm.paymentMethod}
//                     onChange={e => setEditForm({ ...editForm, paymentMethod: e.target.value })}
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//                   >
//                     <option value="Cash">Cash</option>
//                     <option value="Bank">Bank</option>
//                     <option value="Mobile Banking">Mobile Banking</option>
//                     <option value="Adjustment">Adjustment</option>
//                   </select>
//                 </div>

//                 {editForm.paymentMethod === 'Mobile Banking' && (
//                   <div>
//                     <label className="block text-xs font-semibold text-slate-600 mb-1">
//                       Mobile Wallet
//                     </label>
//                     <select
//                       value={editForm.mobileProvider}
//                       onChange={e =>
//                         setEditForm({ ...editForm, mobileProvider: e.target.value })
//                       }
//                       className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
//                     >
//                       <option value="bKash">bKash</option>
//                       <option value="Nagad">Nagad</option>
//                       <option value="Rocket">Rocket</option>
//                       <option value="Upay">Upay</option>
//                       <option value="Other">Other</option>
//                     </select>
//                   </div>
//                 )}

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Date *
//                   </label>
//                   <input
//                     type="date"
//                     required
//                     value={editForm.transactionDate}
//                     onChange={e =>
//                       setEditForm({ ...editForm, transactionDate: e.target.value })
//                     }
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Reference
//                   </label>
//                   <input
//                     placeholder="TrxID / Voucher Ref"
//                     value={editForm.reference}
//                     onChange={e => setEditForm({ ...editForm, reference: e.target.value })}
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//                   />
//                 </div>

//                 <div className="sm:col-span-2">
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Note
//                   </label>
//                   <input
//                     placeholder="Optional remarks"
//                     value={editForm.note}
//                     onChange={e => setEditForm({ ...editForm, note: e.target.value })}
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
//                 <button
//                   type="button"
//                   onClick={() => setEditingTx(null)}
//                   className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={updating}
//                   className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-sm font-medium text-white cursor-pointer"
//                 >
//                   {updating ? 'Updating...' : 'Update Entry'}
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
  Plus,
  Pencil,
  Trash2,
  Printer,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Banknote,
  Landmark,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  HandCoins,
  Receipt,
  X
} from 'lucide-react';
import {
  getAccountTransactions,
  addAccountTransaction,
  updateAccountTransaction,
  deleteAccountTransaction
} from '../services/api';
import { DEFAULT_ERP_SETTINGS } from './Settings';

const getEffectiveUser = (propUser) => {
  if (propUser) return propUser;
  try {
    const raw =
      localStorage.getItem('nexusUser') ||
      localStorage.getItem('user') ||
      localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const todayInputDate = () => new Date().toISOString().slice(0, 10);

const toInputDate = (val) => {
  if (!val) return todayInputDate();
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return todayInputDate();
  return d.toISOString().slice(0, 10);
};

const emptyForm = {
  entryType: 'INCOME',
  customEntryType: '',
  clientId: '',
  supplierId: '',
  category: '',
  customCategory: '',
  title: '',
  customTitle: '',
  amount: '',
  paymentMethod: 'Cash',
  mobileProvider: 'bKash',
  reference: '',
  note: '',
  transactionDate: todayInputDate()
};

const extractTxArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.transactions)) return payload.transactions;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function Accounts({
  transactions,
  accountTransactions,
  clients = [],
  suppliers = [],
  invoices = [],
  purchases = [],
  settings,
  reloadData,
  user
}) {
  const activeSettings = {
    ...DEFAULT_ERP_SETTINGS,
    ...(settings || {})
  };
  const currency = activeSettings.currencySymbol || '৳';

  const typeOptions =
    Array.isArray(activeSettings?.transactionTypes) && activeSettings.transactionTypes.length
      ? activeSettings.transactionTypes
      : ['INCOME', 'EXPENSE', 'DUE_COLLECTION', 'SUPPLIER_PAYMENT', 'OTHERS'];

  const categoryOptions =
    Array.isArray(activeSettings?.transactionCategories) &&
    activeSettings.transactionCategories.length
      ? activeSettings.transactionCategories
      : [
          'Sales / Service Income',
          'Office & Utility Expense',
          'Salary & Allowance',
          'Transport & Logistics',
          'Due Collection',
          'Supplier Payment',
          'Maintenance',
          'Others'
        ];

  const titleOptions =
    Array.isArray(activeSettings?.transactionTitles) && activeSettings.transactionTitles.length
      ? activeSettings.transactionTitles
      : [
          'Daily Cash Sales',
          'Monthly Office Rent',
          'Electricity & Internet Bill',
          'Staff Advance / Salary',
          'Client Due Collection',
          'Supplier Bill Payment',
          'Others'
        ];

  const incomingTx = Array.isArray(transactions)
    ? transactions
    : Array.isArray(accountTransactions)
    ? accountTransactions
    : null;

  const [localTx, setLocalTx] = useState(() => incomingTx || []);
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    entryType: typeOptions[0] || 'INCOME',
    category: categoryOptions[0] || 'Others',
    title: titleOptions[0] || 'Others'
  }));
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [editingTx, setEditingTx] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [updating, setUpdating] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const syncLocalTransactions = async () => {
    try {
      const res = await getAccountTransactions();
      setLocalTx(extractTxArray(res?.data));
    } catch (err) {
      console.error('Error syncing account transactions:', err);
    }
  };

  useEffect(() => {
    if (incomingTx !== null) {
      setLocalTx(incomingTx);
    } else {
      syncLocalTransactions();
    }
  }, [transactions, accountTransactions]);

  const txList = incomingTx !== null ? incomingTx : localTx;
  const clientList = Array.isArray(clients) ? clients : [];
  const supplierList = Array.isArray(suppliers) ? suppliers : [];
  const invoiceList = Array.isArray(invoices) ? invoices : [];
  const purchaseList = Array.isArray(purchases) ? purchases : [];

  const currentUser = getEffectiveUser(user);
  const isAdmin =
    (currentUser?.userType || '').toLowerCase() === 'admin' ||
    (currentUser?.role || '').toLowerCase() === 'admin';
  const canEdit = isAdmin || Boolean(currentUser?.permissions?.accounts);
  const canDelete = isAdmin || Boolean(currentUser?.permissions?.accounts);

  const selectedClientObj = clientList.find(c => c._id === form.clientId);
  const selectedSupplierObj = supplierList.find(s => s._id === form.supplierId);

  const editClientObj = clientList.find(c => c._id === editForm.clientId);
  const editSupplierObj = supplierList.find(s => s._id === editForm.supplierId);

  const methodBalances = (() => {
    const map = {
      Cash: 0,
      Bank: 0,
      'Mobile Banking': 0
    };

    const applyFlow = (method, delta) => {
      if (method === 'Cash' || method === 'Bank' || method === 'Mobile Banking') {
        map[method] += delta;
      }
    };

    for (const inv of invoiceList) {
      const paid = Number(inv.paidAmount || 0);
      if (paid > 0) {
        applyFlow(inv.paymentMethod || 'Cash', paid);
      }
    }

    for (const pur of purchaseList) {
      const paid = Number(pur.paidAmount || 0);
      if (paid > 0) {
        applyFlow(pur.paymentMethod || 'Cash', -paid);
      }
    }

    for (const tx of txList) {
      const amt = Number(tx.amount || 0);
      const method = tx.paymentMethod || 'Cash';
      if (tx.entryType === 'INCOME' || tx.entryType === 'DUE_COLLECTION') {
        applyFlow(method, amt);
      } else if (tx.entryType === 'EXPENSE' || tx.entryType === 'SUPPLIER_PAYMENT') {
        applyFlow(method, -amt);
      } else if (tx.entryType === 'OTHERS') {
        applyFlow(method, amt);
      }
    }

    return map;
  })();

  const totalReceivable = clientList.reduce(
    (sum, c) => sum + Number(c.dueBalance || 0),
    0
  );
  const totalPayable = supplierList.reduce(
    (sum, s) => sum + Number(s.dueBalance || 0),
    0
  );

  const filteredTransactions = txList.filter(item => {
    const matchesType = typeFilter === 'ALL' || item.entryType === typeFilter;
    const matchesMethod =
      methodFilter === 'ALL' || (item.paymentMethod || 'Cash') === methodFilter;
    const q = searchTerm.trim().toLowerCase();

    const partyName =
      item.client?.name ||
      item.supplier?.companyName ||
      item.supplier?.name ||
      '';

    const matchesSearch =
      !q ||
      (item.voucherNumber || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      (item.title || '').toLowerCase().includes(q) ||
      (item.reference || '').toLowerCase().includes(q) ||
      (item.mobileProvider || '').toLowerCase().includes(q) ||
      partyName.toLowerCase().includes(q) ||
      (item.note || '').toLowerCase().includes(q);

    return matchesType && matchesMethod && matchesSearch;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, methodFilter, searchTerm, txList.length]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const filteredTotal = filteredTransactions.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const refreshAll = async () => {
    await syncLocalTransactions();
    if (typeof reloadData === 'function') {
      reloadData();
    }
  };

  const resolveDropdownPayload = (src) => {
    const resolvedEntryType =
      src.entryType === 'OTHERS' && src.customEntryType.trim()
        ? src.customEntryType.trim()
        : src.entryType;

    const resolvedCategory =
      src.category === 'Others' && src.customCategory.trim()
        ? src.customCategory.trim()
        : src.category;

    const resolvedTitle =
      src.title === 'Others' && src.customTitle.trim()
        ? src.customTitle.trim()
        : src.title;

    return {
      resolvedEntryType,
      resolvedCategory,
      resolvedTitle
    };
  };

  const handleEntryTypeChange = (newType) => {
    setForm(prev => ({
      ...prev,
      entryType: newType,
      customEntryType: '',
      clientId: '',
      supplierId: ''
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const { resolvedEntryType, resolvedCategory, resolvedTitle } = resolveDropdownPayload(form);

    if (!resolvedEntryType || !resolvedCategory || !resolvedTitle) {
      alert('Transaction Type, Category, and Title / Description are required.');
      return;
    }

    setSubmitting(true);
    try {
      await addAccountTransaction({
        entryType: resolvedEntryType,
        clientId: resolvedEntryType === 'DUE_COLLECTION' ? form.clientId : undefined,
        supplierId: resolvedEntryType === 'SUPPLIER_PAYMENT' ? form.supplierId : undefined,
        category: resolvedCategory,
        title: resolvedTitle,
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        mobileProvider:
          form.paymentMethod === 'Mobile Banking' ? form.mobileProvider : '',
        reference: form.reference,
        note: form.note,
        transactionDate: form.transactionDate
      });

      setForm(prev => ({
        ...emptyForm,
        entryType: prev.entryType,
        category: prev.category,
        title: prev.title,
        paymentMethod: prev.paymentMethod,
        mobileProvider: prev.mobileProvider,
        transactionDate: todayInputDate()
      }));
      setCurrentPage(1);
      await refreshAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item) => {
    const hasEntryType = typeOptions.includes(item.entryType);
    const hasCategory = categoryOptions.includes(item.category);
    const hasTitle = titleOptions.includes(item.title);

    setEditingTx(item);
    setEditForm({
      entryType: hasEntryType ? item.entryType : 'OTHERS',
      customEntryType: hasEntryType ? '' : item.entryType || '',
      clientId: item.client?._id || item.client || '',
      supplierId: item.supplier?._id || item.supplier || '',
      category: hasCategory ? item.category : 'Others',
      customCategory: hasCategory ? '' : item.category || '',
      title: hasTitle ? item.title : 'Others',
      customTitle: hasTitle ? '' : item.title || '',
      amount: item.amount ?? '',
      paymentMethod: item.paymentMethod || 'Cash',
      mobileProvider: item.mobileProvider || 'bKash',
      reference: item.reference || '',
      note: item.note || '',
      transactionDate: toInputDate(item.transactionDate)
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingTx) return;

    const { resolvedEntryType, resolvedCategory, resolvedTitle } =
      resolveDropdownPayload(editForm);

    if (!resolvedEntryType || !resolvedCategory || !resolvedTitle) {
      alert('Transaction Type, Category, and Title / Description are required.');
      return;
    }

    setUpdating(true);
    try {
      await updateAccountTransaction(editingTx._id, {
        entryType: resolvedEntryType,
        clientId: resolvedEntryType === 'DUE_COLLECTION' ? editForm.clientId : null,
        supplierId: resolvedEntryType === 'SUPPLIER_PAYMENT' ? editForm.supplierId : null,
        category: resolvedCategory,
        title: resolvedTitle,
        amount: Number(editForm.amount),
        paymentMethod: editForm.paymentMethod,
        mobileProvider:
          editForm.paymentMethod === 'Mobile Banking' ? editForm.mobileProvider : '',
        reference: editForm.reference,
        note: editForm.note,
        transactionDate: editForm.transactionDate
      });

      setEditingTx(null);
      await refreshAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating transaction');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (item) => {
    if (
      !confirm(
        `Voucher ${item.voucherNumber} ডিলিট করতে চান? (Due Collection / Supplier Payment হলে বকেয়া ব্যালেন্সও রিভার্স হবে)`
      )
    ) {
      return;
    }
    try {
      await deleteAccountTransaction(item._id);
      await refreshAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting transaction');
    }
  };

  const handleDownloadExcel = () => {
    const headers = [
      'SL',
      'Voucher #',
      'Date',
      'Type',
      'Party',
      'Category',
      'Title',
      'Method',
      'Provider',
      'Reference',
      'Amount',
      'Note'
    ];

    const escapeCsv = (val) => {
      const str = String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = filteredTransactions.map((item, idx) => {
      const partyName =
        item.client?.name ||
        item.supplier?.companyName ||
        item.supplier?.name ||
        '-';
      return [
        escapeCsv(idx + 1),
        escapeCsv(item.voucherNumber || ''),
        escapeCsv(
          item.transactionDate
            ? new Date(item.transactionDate).toLocaleDateString()
            : ''
        ),
        escapeCsv(item.entryType || ''),
        escapeCsv(partyName),
        escapeCsv(item.category || ''),
        escapeCsv(item.title || ''),
        escapeCsv(item.paymentMethod || 'Cash'),
        escapeCsv(item.mobileProvider || ''),
        escapeCsv(item.reference || ''),
        escapeCsv(Number(item.amount || 0)),
        escapeCsv(item.note || '')
      ].join(',');
    });

    const totalRow = [
      escapeCsv(''),
      escapeCsv('TOTAL'),
      escapeCsv(''),
      escapeCsv(typeFilter),
      escapeCsv(''),
      escapeCsv(`${filteredTransactions.length} Entries`),
      escapeCsv(''),
      escapeCsv(methodFilter),
      escapeCsv(''),
      escapeCsv(''),
      escapeCsv(filteredTotal),
      escapeCsv('')
    ].join(',');

    const csvContent =
      '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows, totalRow].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Accounts_Ledger_${todayInputDate()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'height=750,width=1000');
    if (!printWindow) return;

    const rowsHtml = filteredTransactions
      .map((item, idx) => {
        const partyName =
          item.client?.name ||
          item.supplier?.companyName ||
          item.supplier?.name ||
          '-';
        const methodText =
          item.paymentMethod === 'Mobile Banking' && item.mobileProvider
            ? `${item.paymentMethod} (${item.mobileProvider})`
            : item.paymentMethod || 'Cash';

        return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${item.voucherNumber || '-'}</strong></td>
            <td>${
              item.transactionDate
                ? new Date(item.transactionDate).toLocaleDateString()
                : '-'
            }</td>
            <td>${item.entryType}</td>
            <td>${partyName}</td>
            <td><strong>${item.title}</strong><br/><small>${item.category || ''}</small></td>
            <td>${methodText}</td>
            <td class="text-right">${currency}${Number(item.amount || 0).toLocaleString()}</td>
          </tr>
        `;
      })
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Accounts & Cash Statement</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; }
            h2 { margin: 0 0 4px 0; font-size: 20px; }
            p { margin: 2px 0; font-size: 12px; color: #475569; }
            .cards { display: flex; gap: 10px; margin-bottom: 16px; }
            .card { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; background: #f8fafc; font-size: 12px; }
            .card strong { display: block; font-size: 14px; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border-bottom: 1px solid #cbd5e1; padding: 7px 6px; text-align: left; }
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
              <h2>ACCOUNTS & CASH STATEMENT</h2>
              <p>Type: ${typeFilter} • Method: ${methodFilter} • Entries: ${filteredTransactions.length}</p>
            </div>
            <div style="text-align:right">
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div class="cards">
            <div class="card">Cash Balance<strong>${currency}${methodBalances.Cash.toLocaleString()}</strong></div>
            <div class="card">Bank Balance<strong>${currency}${methodBalances.Bank.toLocaleString()}</strong></div>
            <div class="card">Mobile Banking<strong>${currency}${methodBalances['Mobile Banking'].toLocaleString()}</strong></div>
            <div class="card">Filtered Total<strong>${currency}${filteredTotal.toLocaleString()}</strong></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Voucher</th>
                <th>Date</th>
                <th>Type</th>
                <th>Party</th>
                <th>Description</th>
                <th>Method</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${
                rowsHtml ||
                `<tr><td colspan="8" style="text-align:center;padding:16px;">No records found.</td></tr>`
              }
            </tbody>
            <tfoot>
              <tr>
                <td colspan="7">Filtered Total</td>
                <td class="text-right">${currency}${filteredTotal.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div class="signatures">
            <div class="sig-box">Prepared By</div>
            <div class="sig-box">Accounts Officer</div>
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

  const renderBadge = (type) => {
    switch (type) {
      case 'INCOME':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" /> Income
          </span>
        );
      case 'EXPENSE':
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
            <ArrowDownRight className="w-3.5 h-3.5 shrink-0" /> Expense
          </span>
        );
      case 'DUE_COLLECTION':
        return (
          <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
            <HandCoins className="w-3.5 h-3.5 shrink-0" /> Due Collection
          </span>
        );
      case 'SUPPLIER_PAYMENT':
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
            <Receipt className="w-3.5 h-3.5 shrink-0" /> Supplier Payment
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap">
            <Layers className="w-3.5 h-3.5 shrink-0" /> {type || 'Others'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-2xl font-bold text-slate-800 truncate">
            Accounts — Cash, Bank, Due & Expenses
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage Cash/Bank/Mobile Banking balances, client due collections, supplier payments, and expenses.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" /> Excel
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-sm inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-indigo-600 shrink-0" /> Print ({filteredTransactions.length})
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase truncate">Cash Balance</p>
            <p className="text-base sm:text-xl font-extrabold text-emerald-700 mt-1 break-all">
              {currency} {methodBalances.Cash.toLocaleString()}
            </p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase truncate">Bank Balance</p>
            <p className="text-base sm:text-xl font-extrabold text-indigo-700 mt-1 break-all">
              {currency} {methodBalances.Bank.toLocaleString()}
            </p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3 min-w-0">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-500 uppercase truncate">Mobile Banking</p>
            <p className="text-base sm:text-xl font-extrabold text-violet-700 mt-1 break-all">
              {currency} {methodBalances['Mobile Banking'].toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 truncate">bKash / Nagad / Rocket</p>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-violet-50 text-violet-600 shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 min-w-0">
          <p className="text-[11px] font-semibold text-slate-500 uppercase truncate">Receivable (Client Due)</p>
          <p className="text-base sm:text-xl font-extrabold text-amber-700 mt-1 break-all">
            {currency} {totalReceivable.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">To be collected from clients</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 sm:col-span-2 lg:col-span-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-500 uppercase truncate">Payable (Supplier Due)</p>
          <p className="text-base sm:text-xl font-extrabold text-red-600 mt-1 break-all">
            {currency} {totalPayable.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">To be paid to suppliers</p>
        </div>
      </div>

      {/* Add Transaction Form */}
      <form
        onSubmit={handleCreate}
        className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4"
      >
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 text-sm sm:text-base">
          Record Accounting Entry
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="min-w-0">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Transaction Type *
            </label>
            <select
              required
              value={form.entryType}
              onChange={e => handleEntryTypeChange(e.target.value)}
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select Transaction Type</option>
              {typeOptions.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {form.entryType === 'OTHERS' && (
              <input
                type="text"
                required
                placeholder="Enter custom transaction type"
                value={form.customEntryType}
                onChange={e => setForm({ ...form, customEntryType: e.target.value })}
                className="mt-2 w-full border border-slate-200 p-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            )}
          </div>

          {form.entryType === 'DUE_COLLECTION' && (
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Select Client *
              </label>
              <select
                value={form.clientId}
                onChange={e => setForm({ ...form, clientId: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="">-- Select Client --</option>
                {clientList.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name} (Due: {currency}
                    {Number(c.dueBalance || 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.entryType === 'SUPPLIER_PAYMENT' && (
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Select Supplier *
              </label>
              <select
                value={form.supplierId}
                onChange={e => setForm({ ...form, supplierId: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="">-- Select Supplier --</option>
                {supplierList.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.companyName || s.name} (Due: {currency}
                    {Number(s.dueBalance || 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="min-w-0">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Category *
            </label>
            <select
              required
              value={form.category}
              onChange={e =>
                setForm({
                  ...form,
                  category: e.target.value,
                  customCategory: e.target.value === 'Others' ? form.customCategory : ''
                })
              }
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select Category</option>
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {form.category === 'Others' && (
              <input
                type="text"
                required
                placeholder="Enter custom category"
                value={form.customCategory}
                onChange={e => setForm({ ...form, customCategory: e.target.value })}
                className="mt-2 w-full border border-slate-200 p-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            )}
          </div>

          <div className="min-w-0">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Title / Description *
            </label>
            <select
              required
              value={form.title}
              onChange={e =>
                setForm({
                  ...form,
                  title: e.target.value,
                  customTitle: e.target.value === 'Others' ? form.customTitle : ''
                })
              }
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select Title / Description</option>
              {titleOptions.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {form.title === 'Others' && (
              <input
                type="text"
                required
                placeholder="Enter custom title / description"
                value={form.customTitle}
                onChange={e => setForm({ ...form, customTitle: e.target.value })}
                className="mt-2 w-full border border-slate-200 p-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            )}
          </div>

          <div className="min-w-0">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Amount ({currency}) *
            </label>
            <input
              type="number"
              min="1"
              step="any"
              placeholder="0.00"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
            {selectedClientObj && (
              <span className="block mt-1 text-[11px] text-amber-700 font-medium">
                Client Due: {currency}
                {Number(selectedClientObj.dueBalance || 0).toLocaleString()}
              </span>
            )}
            {selectedSupplierObj && (
              <span className="block mt-1 text-[11px] text-red-600 font-medium">
                Supplier Due: {currency}
                {Number(selectedSupplierObj.dueBalance || 0).toLocaleString()}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Payment Method
            </label>
            <select
              value={form.paymentMethod}
              onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
              <option value="Mobile Banking">Mobile Banking</option>
              <option value="Adjustment">Adjustment</option>
            </select>
          </div>

          {form.paymentMethod === 'Mobile Banking' && (
            <div className="min-w-0">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Mobile Wallet
              </label>
              <select
                value={form.mobileProvider}
                onChange={e => setForm({ ...form, mobileProvider: e.target.value })}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="bKash">bKash</option>
                <option value="Nagad">Nagad</option>
                <option value="Rocket">Rocket</option>
                <option value="Upay">Upay</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          <div className="min-w-0">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date *</label>
            <input
              type="date"
              value={form.transactionDate}
              onChange={e => setForm({ ...form, transactionDate: e.target.value })}
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <div className="min-w-0">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Reference</label>
            <input
              placeholder="TrxID / Voucher Ref"
              value={form.reference}
              onChange={e => setForm({ ...form, reference: e.target.value })}
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="min-w-0">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Note</label>
            <input
              placeholder="Optional remarks"
              value={form.note}
              onChange={e => setForm({ ...form, note: e.target.value })}
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {submitting ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      </form>

      {/* Filters & Search */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {[
            { key: 'ALL', label: 'All' },
            { key: 'INCOME', label: 'Income' },
            { key: 'EXPENSE', label: 'Expense' },
            { key: 'DUE_COLLECTION', label: 'Due Collection' },
            { key: 'SUPPLIER_PAYMENT', label: 'Supplier Payment' },
            { key: 'OTHERS', label: 'Others' }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setTypeFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap shrink-0 ${
                typeFilter === tab.key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full lg:w-auto">
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="w-full sm:w-44 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white text-slate-700 outline-none"
          >
            <option value="ALL">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Bank">Bank</option>
            <option value="Mobile Banking">Mobile Banking</option>
            <option value="Adjustment">Adjustment</option>
          </select>

          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search voucher, party, title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs sm:text-sm outline-none bg-transparent min-w-0"
            />
          </div>
        </div>
      </div>

      {/* Mobile Card View (< md) */}
      <div className="space-y-3 md:hidden">
        {paginatedTransactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-xs sm:text-sm text-slate-500 border border-slate-200/80 shadow-sm">
            No transactions found.
          </div>
        ) : (
          paginatedTransactions.map(item => {
            const partyName =
              item.client?.name ||
              item.supplier?.companyName ||
              item.supplier?.name ||
              '-';
            const methodLabel =
              item.paymentMethod === 'Mobile Banking' && item.mobileProvider
                ? `${item.paymentMethod} (${item.mobileProvider})`
                : item.paymentMethod || 'Cash';

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {item.voucherNumber || '-'}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">
                      {item.transactionDate
                        ? new Date(item.transactionDate).toLocaleDateString()
                        : '-'}
                    </span>
                  </div>
                  {renderBadge(item.entryType)}
                </div>

                <div>
                  <div className="font-semibold text-sm text-slate-800">{item.title}</div>
                  <div className="text-xs text-slate-500">
                    {item.category || 'General'} • Party: <strong className="font-medium text-slate-700">{partyName}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-[11px] text-slate-400 block">{methodLabel}</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {currency} {Number(item.amount || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => openEditModal(item)}
                        title="Edit Entry"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        title="Delete Entry"
                        className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Table View (>= md) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase">
              <th className="py-3 px-3">Voucher</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Party</th>
              <th className="py-3 px-3">Category / Title</th>
              <th className="py-3 px-3">Method</th>
              <th className="py-3 px-3 text-right">Amount</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-8 text-center text-slate-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              paginatedTransactions.map(item => {
                const partyName =
                  item.client?.name ||
                  item.supplier?.companyName ||
                  item.supplier?.name ||
                  '-';
                const methodLabel =
                  item.paymentMethod === 'Mobile Banking' && item.mobileProvider
                    ? `${item.paymentMethod} (${item.mobileProvider})`
                    : item.paymentMethod || 'Cash';

                return (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-mono text-xs font-bold text-slate-800 whitespace-nowrap">
                      {item.voucherNumber || '-'}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {item.transactionDate
                        ? new Date(item.transactionDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">{renderBadge(item.entryType)}</td>
                    <td className="py-3 px-3 text-slate-700 font-medium">{partyName}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{item.title}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.category || 'General'}
                        {item.reference ? ` • Ref: ${item.reference}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 whitespace-nowrap">{methodLabel}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 whitespace-nowrap">
                      {currency} {Number(item.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1">
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Edit Entry"
                            className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            title="Delete Entry"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {filteredTransactions.length > 0 && (
        <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-600">
          <span className="text-center sm:text-left">
            Showing <strong>{startIndex + 1}</strong>–
            <strong>
              {Math.min(startIndex + itemsPerPage, filteredTransactions.length)}
            </strong>{' '}
            of <strong>{filteredTransactions.length}</strong> entries • Filtered Total:{' '}
            <strong className="text-slate-900">
              {currency} {filteredTotal.toLocaleString()}
            </strong>
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="px-2 font-semibold text-slate-800 whitespace-nowrap">
              Page {safeCurrentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 p-2 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                Edit Entry — {editingTx.voucherNumber}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Transaction Type *
                  </label>
                  <select
                    required
                    value={editForm.entryType}
                    onChange={e =>
                      setEditForm({
                        ...editForm,
                        entryType: e.target.value,
                        clientId: e.target.value === 'DUE_COLLECTION' ? editForm.clientId : '',
                        supplierId:
                          e.target.value === 'SUPPLIER_PAYMENT' ? editForm.supplierId : ''
                      })
                    }
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select Transaction Type</option>
                    {typeOptions.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {editForm.entryType === 'OTHERS' && (
                    <input
                      type="text"
                      required
                      placeholder="Enter custom transaction type"
                      value={editForm.customEntryType}
                      onChange={e =>
                        setEditForm({ ...editForm, customEntryType: e.target.value })
                      }
                      className="mt-2 w-full border border-slate-200 p-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  )}
                </div>

                {editForm.entryType === 'DUE_COLLECTION' && (
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Select Client *
                    </label>
                    <select
                      required
                      value={editForm.clientId}
                      onChange={e => setEditForm({ ...editForm, clientId: e.target.value })}
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">-- Select Client --</option>
                      {clientList.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.name} (Due: {currency}
                          {Number(c.dueBalance || 0).toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {editForm.entryType === 'SUPPLIER_PAYMENT' && (
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Select Supplier *
                    </label>
                    <select
                      required
                      value={editForm.supplierId}
                      onChange={e => setEditForm({ ...editForm, supplierId: e.target.value })}
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="">-- Select Supplier --</option>
                      {supplierList.map(s => (
                        <option key={s._id} value={s._id}>
                          {s.companyName || s.name} (Due: {currency}
                          {Number(s.dueBalance || 0).toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select Category</option>
                    {categoryOptions.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {editForm.category === 'Others' && (
                    <input
                      type="text"
                      required
                      placeholder="Enter custom category"
                      value={editForm.customCategory}
                      onChange={e =>
                        setEditForm({ ...editForm, customCategory: e.target.value })
                      }
                      className="mt-2 w-full border border-slate-200 p-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Title / Description *
                  </label>
                  <select
                    required
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="">Select Title / Description</option>
                    {titleOptions.map(t => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {editForm.title === 'Others' && (
                    <input
                      type="text"
                      required
                      placeholder="Enter custom title / description"
                      value={editForm.customTitle}
                      onChange={e =>
                        setEditForm({ ...editForm, customTitle: e.target.value })
                      }
                      className="mt-2 w-full border border-slate-200 p-2 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={editForm.amount}
                    onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  {editClientObj && (
                    <span className="block mt-1 text-[11px] text-amber-700 font-medium">
                      Current Client Due: {currency}
                      {Number(editClientObj.dueBalance || 0).toLocaleString()}
                    </span>
                  )}
                  {editSupplierObj && (
                    <span className="block mt-1 text-[11px] text-red-600 font-medium">
                      Current Supplier Due: {currency}
                      {Number(editSupplierObj.dueBalance || 0).toLocaleString()}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={editForm.paymentMethod}
                    onChange={e => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                    <option value="Adjustment">Adjustment</option>
                  </select>
                </div>

                {editForm.paymentMethod === 'Mobile Banking' && (
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Mobile Wallet
                    </label>
                    <select
                      value={editForm.mobileProvider}
                      onChange={e =>
                        setEditForm({ ...editForm, mobileProvider: e.target.value })
                      }
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                      <option value="Upay">Upay</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.transactionDate}
                    onChange={e =>
                      setEditForm({ ...editForm, transactionDate: e.target.value })
                    }
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="min-w-0">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Reference
                  </label>
                  <input
                    placeholder="TrxID / Voucher Ref"
                    value={editForm.reference}
                    onChange={e => setEditForm({ ...editForm, reference: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="sm:col-span-2 min-w-0">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Note
                  </label>
                  <input
                    placeholder="Optional remarks"
                    value={editForm.note}
                    onChange={e => setEditForm({ ...editForm, note: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-sm font-medium text-white cursor-pointer"
                >
                  {updating ? 'Updating...' : 'Update Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}