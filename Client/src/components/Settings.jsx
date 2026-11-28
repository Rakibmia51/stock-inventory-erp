
// import { useState, useEffect, useRef } from 'react';
// import {
//   Settings as SettingsIcon,
//   Building2,
//   Sliders,
//   Database,
//   Save,
//   RotateCcw,
//   Download,
//   CheckCircle2,
//   Upload,
//   Trash2,
//   Image as ImageIcon
// } from 'lucide-react';
// import { getSettings, updateSettings } from '../services/api';

// export const DEFAULT_ERP_SETTINGS = {
//   companyName: 'NEXUS ERP',
//   logoUrl: '',
//   tagline: 'Inventory, Sales & Accounting Suite',
//   phone: '',
//   email: '',
//   address: '',
//   taxId: '',
//   currencySymbol: '৳',
//   invoicePrefix: 'INV',
//   invoiceFooter: 'Thank you for your business.',
//   defaultMinStock: 5,
//   defaultPaymentMethod: 'Cash',
//   defaultMobileProvider: 'bKash',
//   showSignatureOnPrint: true,
//   autoReloadAfterAction: true
// };

// const pickKnownSettings = (rawObj = {}) => {
//   const cleaned = {};
//   for (const key of Object.keys(DEFAULT_ERP_SETTINGS)) {
//     if (rawObj[key] !== undefined && rawObj[key] !== null) {
//       cleaned[key] = rawObj[key];
//     }
//   }
//   return cleaned;
// };

// export const loadErpSettings = () => ({ ...DEFAULT_ERP_SETTINGS });

// export const fetchErpSettings = async () => {
//   try {
//     const res = await getSettings();
//     const serverData = res?.data?.settings || res?.data || {};
//     return {
//       ...DEFAULT_ERP_SETTINGS,
//       ...pickKnownSettings(serverData)
//     };
//   } catch {
//     return { ...DEFAULT_ERP_SETTINGS };
//   }
// };

// export default function Settings({
//   products = [],
//   suppliers = [],
//   clients = [],
//   purchases = [],
//   invoices = [],
//   transactions = [],
//   accountTransactions = [],
//   settings,
//   onSettingsChange,
//   reloadData
// }) {
//   const [activeTab, setActiveTab] = useState('COMPANY'); // 'COMPANY' | 'SYSTEM' | 'DATA'
//   const [form, setForm] = useState(() => ({
//     ...DEFAULT_ERP_SETTINGS,
//     ...pickKnownSettings(settings || {})
//   }));
//   const [savedNotice, setSavedNotice] = useState('');
//   const [saving, setSaving] = useState(false);
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     if (settings) {
//       setForm(prev => ({ ...prev, ...pickKnownSettings(settings) }));
//     }
//   }, [settings]);

//   useEffect(() => {
//     let mounted = true;
//     fetchErpSettings().then((synced) => {
//       if (!mounted) return;
//       setForm(prev => ({ ...prev, ...synced }));
//       onSettingsChange?.(synced);
//     });
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const txList = Array.isArray(transactions)
//     ? transactions
//     : Array.isArray(accountTransactions)
//     ? accountTransactions
//     : [];

//   const handleField = (key, value) => {
//     setForm(prev => ({ ...prev, [key]: value }));
//     if (savedNotice) setSavedNotice('');
//   };

//   const handleLogoFileChange = (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       alert('Please select a valid image file (PNG, JPG, WEBP, SVG).');
//       e.target.value = '';
//       return;
//     }

//     const maxBytes = 2 * 1024 * 1024; // 2MB limit for clean DB storage & fast rendering
//     if (file.size > maxBytes) {
//       alert('Logo image size must be 2MB or less.');
//       e.target.value = '';
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = () => {
//       if (typeof reader.result === 'string') {
//         handleField('logoUrl', reader.result);
//       }
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleRemoveLogo = () => {
//     handleField('logoUrl', '');
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const persistSettings = async (targetObj, successMsg) => {
//     setSaving(true);
//     try {
//       const res = await updateSettings(targetObj);
//       const savedFromApi = res?.data?.settings || res?.data || targetObj;
//       const finalSettings = {
//         ...DEFAULT_ERP_SETTINGS,
//         ...pickKnownSettings(targetObj),
//         ...pickKnownSettings(savedFromApi)
//       };

//       setForm(finalSettings);
//       onSettingsChange?.(finalSettings);
//       setSavedNotice(successMsg);
//       setTimeout(() => setSavedNotice(''), 3000);
//     } catch (err) {
//       const errMsg =
//         err.response?.data?.message ||
//         err.response?.data?.error ||
//         'Could not save settings to server.';
//       alert(`Error saving settings: ${errMsg}`);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleSave = async (e) => {
//     e.preventDefault();
//     const cleaned = {
//       ...DEFAULT_ERP_SETTINGS,
//       ...pickKnownSettings(form),
//       companyName: String(form.companyName || '').trim() || DEFAULT_ERP_SETTINGS.companyName,
//       logoUrl: String(form.logoUrl || '').trim(),
//       currencySymbol: String(form.currencySymbol || '').trim() || '৳',
//       invoicePrefix: String(form.invoicePrefix || 'INV').trim().toUpperCase() || 'INV',
//       defaultMinStock: Math.max(0, Number(form.defaultMinStock ?? 5))
//     };

//     await persistSettings(cleaned, 'Settings saved to database.');
//   };

//   const handleResetDefaults = async () => {
//     if (!confirm('Reset all ERP settings to default values?')) return;
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//     await persistSettings({ ...DEFAULT_ERP_SETTINGS }, 'Default settings restored.');
//   };

//   const handleExportBackup = () => {
//     const backupPayload = {
//       exportedAt: new Date().toISOString(),
//       settings: form,
//       counts: {
//         products: products.length,
//         suppliers: suppliers.length,
//         clients: clients.length,
//         purchases: purchases.length,
//         invoices: invoices.length,
//         accountTransactions: txList.length
//       },
//       data: {
//         products,
//         suppliers,
//         clients,
//         purchases,
//         invoices,
//         accountTransactions: txList
//       }
//     };

//     const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
//       type: 'application/json'
//     });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     const dateStamp = new Date().toISOString().slice(0, 10);
//     link.href = url;
//     link.setAttribute('download', `${form.companyName || 'NEXUS ERP'}_Backup_${dateStamp}.json`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div>
//           <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
//             <SettingsIcon className="w-6 h-6 text-indigo-600" />
//             System Settings
//           </h2>
//           <p className="text-xs sm:text-sm text-slate-500">
//             Configure business profile, logo, billing defaults, print preferences, and data backups.
//           </p>
//         </div>

//         {savedNotice && (
//           <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-semibold">
//             <CheckCircle2 className="w-4 h-4" />
//             {savedNotice}
//           </div>
//         )}
//       </div>

//       {/* Sub-navigation Tabs */}
//       <div className="flex flex-wrap gap-2">
//         <button
//           type="button"
//           onClick={() => setActiveTab('COMPANY')}
//           className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
//             activeTab === 'COMPANY'
//               ? 'bg-indigo-600 text-white shadow-sm'
//               : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
//           }`}
//         >
//           <Building2 className="w-4 h-4" />
//           Company & Invoice
//         </button>

//         <button
//           type="button"
//           onClick={() => setActiveTab('SYSTEM')}
//           className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
//             activeTab === 'SYSTEM'
//               ? 'bg-indigo-600 text-white shadow-sm'
//               : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
//           }`}
//         >
//           <Sliders className="w-4 h-4" />
//           Billing & Stock Rules
//         </button>

//         <button
//           type="button"
//           onClick={() => setActiveTab('DATA')}
//           className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
//             activeTab === 'DATA'
//               ? 'bg-indigo-600 text-white shadow-sm'
//               : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
//           }`}
//         >
//           <Database className="w-4 h-4" />
//           Backup & Sync
//         </button>
//       </div>

//       {/* Tab 1 & Tab 2 Form */}
//       {(activeTab === 'COMPANY' || activeTab === 'SYSTEM') && (
//         <form
//           onSubmit={handleSave}
//           className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 space-y-5"
//         >
//           {activeTab === 'COMPANY' && (
//             <>
//               <div className="border-b border-slate-100 pb-3">
//                 <h3 className="font-bold text-slate-800">Company & Receipt Information</h3>
//                 <p className="text-xs text-slate-500">
//                   Displayed in sidebar, login screen, printed invoices, ledgers, and reports.
//                 </p>
//               </div>

//               {/* Company Logo Upload & Preview */}
//               <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                 <div className="flex items-center gap-4">
//                   <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
//                     {form.logoUrl ? (
//                       <img
//                         src={form.logoUrl}
//                         alt="Company Logo Preview"
//                         className="w-full h-full object-contain p-1"
//                       />
//                     ) : (
//                       <ImageIcon className="w-7 h-7 text-slate-400" />
//                     )}
//                   </div>
//                   <div>
//                     <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
//                       Company Logo
//                     </p>
//                     <p className="text-xs text-slate-500 mt-0.5">
//                       Upload PNG, JPG, or WEBP (max 2MB) for sidebar, login & invoice headers.
//                     </p>
//                     <input
//                       ref={fileInputRef}
//                       type="file"
//                       accept="image/*"
//                       onChange={handleLogoFileChange}
//                       className="hidden"
//                     />
//                   </div>
//                 </div>

//                 <div className="flex flex-wrap items-center gap-2">
//                   <button
//                     type="button"
//                     onClick={() => fileInputRef.current?.click()}
//                     className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
//                   >
//                     <Upload className="w-3.5 h-3.5 text-indigo-600" />
//                     {form.logoUrl ? 'Change Logo' : 'Upload Logo'}
//                   </button>

//                   {form.logoUrl && (
//                     <button
//                       type="button"
//                       onClick={handleRemoveLogo}
//                       className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 text-xs font-semibold transition"
//                     >
//                       <Trash2 className="w-3.5 h-3.5" />
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Company / Business Name
//                   </label>
//                   <input
//                     type="text"
//                     value={form.companyName}
//                     onChange={e => handleField('companyName', e.target.value)}
//                     placeholder="e.g., NEXUS ERP"
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Tagline / Subtitle
//                   </label>
//                   <input
//                     type="text"
//                     value={form.tagline}
//                     onChange={e => handleField('tagline', e.target.value)}
//                     placeholder="e.g., Wholesale & Distribution"
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Phone Number
//                   </label>
//                   <input
//                     type="text"
//                     value={form.phone}
//                     onChange={e => handleField('phone', e.target.value)}
//                     placeholder="+880 1XXX-XXXXXX"
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Email Address
//                   </label>
//                   <input
//                     type="email"
//                     value={form.email}
//                     onChange={e => handleField('email', e.target.value)}
//                     placeholder="accounts@company.com"
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     BIN / VAT / Tax Registration No.
//                   </label>
//                   <input
//                     type="text"
//                     value={form.taxId}
//                     onChange={e => handleField('taxId', e.target.value)}
//                     placeholder="Optional BIN / VAT ID"
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Office / Warehouse Address
//                   </label>
//                   <input
//                     type="text"
//                     value={form.address}
//                     onChange={e => handleField('address', e.target.value)}
//                     placeholder="Street, Area, City"
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Invoice Number Prefix
//                   </label>
//                   <input
//                     type="text"
//                     maxLength={10}
//                     value={form.invoicePrefix}
//                     onChange={e => handleField('invoicePrefix', e.target.value)}
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm font-mono uppercase outline-none focus:border-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Invoice Footer Note
//                   </label>
//                   <input
//                     type="text"
//                     value={form.invoiceFooter}
//                     onChange={e => handleField('invoiceFooter', e.target.value)}
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
//                   />
//                 </div>
//               </div>
//             </>
//           )}

//           {activeTab === 'SYSTEM' && (
//             <>
//               <div className="border-b border-slate-100 pb-3">
//                 <h3 className="font-bold text-slate-800">Billing, Payment & Inventory Rules</h3>
//                 <p className="text-xs text-slate-500">
//                   Set default values used across new invoices, purchases, and stock alerts.
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Currency Symbol
//                   </label>
//                   <input
//                     type="text"
//                     maxLength={5}
//                     value={form.currencySymbol}
//                     onChange={e => handleField('currencySymbol', e.target.value)}
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Default Low-Stock Alert Level
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     value={form.defaultMinStock}
//                     onChange={e => handleField('defaultMinStock', e.target.value)}
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Default Payment Method
//                   </label>
//                   <select
//                     value={form.defaultPaymentMethod}
//                     onChange={e => handleField('defaultPaymentMethod', e.target.value)}
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white outline-none focus:border-indigo-500"
//                   >
//                     <option value="Cash">Cash</option>
//                     <option value="Bank">Bank</option>
//                     <option value="Mobile Banking">Mobile Banking</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Default Mobile Banking Provider
//                   </label>
//                   <select
//                     value={form.defaultMobileProvider}
//                     onChange={e => handleField('defaultMobileProvider', e.target.value)}
//                     className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white outline-none focus:border-indigo-500"
//                   >
//                     <option value="bKash">bKash</option>
//                     <option value="Nagad">Nagad</option>
//                     <option value="Rocket">Rocket</option>
//                     <option value="Upay">Upay</option>
//                   </select>
//                 </div>

//                 <div className="flex flex-col justify-end space-y-2.5 pt-2">
//                   <label className="inline-flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={Boolean(form.showSignatureOnPrint)}
//                       onChange={e => handleField('showSignatureOnPrint', e.target.checked)}
//                       className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
//                     />
//                     Include signature block on printed invoices & reports
//                   </label>

//                   <label className="inline-flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={Boolean(form.autoReloadAfterAction)}
//                       onChange={e => handleField('autoReloadAfterAction', e.target.checked)}
//                       className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
//                     />
//                     Refresh live records automatically after transactions
//                   </label>
//                 </div>
//               </div>
//             </>
//           )}

//           {/* Action Buttons */}
//           <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
//             <button
//               type="button"
//               disabled={saving}
//               onClick={handleResetDefaults}
//               className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-xs sm:text-sm font-medium transition"
//             >
//               <RotateCcw className="w-4 h-4" />
//               Reset Defaults
//             </button>

//             <button
//               type="submit"
//               disabled={saving}
//               className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs sm:text-sm font-semibold shadow-sm transition"
//             >
//               <Save className="w-4 h-4" />
//               {saving ? 'Saving...' : 'Save Settings'}
//             </button>
//           </div>
//         </form>
//       )}

//       {/* Tab 3: Backup & Sync */}
//       {activeTab === 'DATA' && (
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 space-y-5">
//           <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//             <div>
//               <h3 className="font-bold text-slate-800">Snapshot & Data Sync</h3>
//               <p className="text-xs text-slate-500">
//                 Download a complete JSON snapshot of current ERP records or refresh server data.
//               </p>
//             </div>
//             <div className="flex flex-wrap gap-2">
//               {reloadData && (
//                 <button
//                   type="button"
//                   onClick={() => reloadData()}
//                   className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium transition"
//                 >
//                   <RotateCcw className="w-4 h-4 text-indigo-600" />
//                   Reload Live Data
//                 </button>
//               )}
//               <button
//                 type="button"
//                 onClick={handleExportBackup}
//                 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition"
//               >
//                 <Download className="w-4 h-4" />
//                 Export JSON Backup
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
//             {[
//               { label: 'Products', count: products.length },
//               { label: 'Suppliers', count: suppliers.length },
//               { label: 'Clients', count: clients.length },
//               { label: 'Purchases', count: purchases.length },
//               { label: 'Invoices', count: invoices.length },
//               { label: 'Account Entries', count: txList.length }
//             ].map(item => (
//               <div
//                 key={item.label}
//                 className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70"
//               >
//                 <p className="text-[11px] font-semibold text-slate-500 uppercase">{item.label}</p>
//                 <p className="text-lg font-extrabold text-slate-800 mt-1">
//                   {Number(item.count || 0).toLocaleString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



import { useState, useEffect, useRef } from 'react';
import {
  Settings as SettingsIcon,
  Building2,
  Sliders,
  Database,
  ListChecks,
  Plus,
  Save,
  RotateCcw,
  Download,
  CheckCircle2,
  Upload,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { getSettings, updateSettings } from '../services/api';

export const DEFAULT_ERP_SETTINGS = {
  companyName: 'NEXUS ERP',
  logoUrl: '',
  tagline: 'Inventory, Sales & Accounting Suite',
  phone: '',
  email: '',
  address: '',
  taxId: '',
  currencySymbol: '৳',
  invoicePrefix: 'INV',
  invoiceFooter: 'Thank you for your business.',
  defaultMinStock: 5,
  defaultPaymentMethod: 'Cash',
  defaultMobileProvider: 'bKash',
  showSignatureOnPrint: true,
  autoReloadAfterAction: true,
  transactionTypes: ['INCOME', 'EXPENSE', 'DUE_COLLECTION', 'SUPPLIER_PAYMENT', 'OTHERS'],
  transactionCategories: [
    'Sales / Service Income',
    'Office & Utility Expense',
    'Salary & Allowance',
    'Transport & Logistics',
    'Due Collection',
    'Supplier Payment',
    'Maintenance',
    'Others'
  ],
  transactionTitles: [
    'Daily Cash Sales',
    'Monthly Office Rent',
    'Electricity & Internet Bill',
    'Staff Advance / Salary',
    'Client Due Collection',
    'Supplier Bill Payment',
    'Others'
  ]
};

const normalizeList = (arr, fallback = []) => {
  const source = Array.isArray(arr) ? arr : fallback;
  const seen = new Set();
  const result = [];
  for (const item of source) {
    const clean = String(item ?? '').trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(clean);
    }
  }
  return result.length ? result : [...fallback];
};

const pickKnownSettings = (rawObj = {}) => {
  const cleaned = {};
  for (const key of Object.keys(DEFAULT_ERP_SETTINGS)) {
    if (rawObj[key] !== undefined && rawObj[key] !== null) {
      if (Array.isArray(DEFAULT_ERP_SETTINGS[key])) {
        cleaned[key] = normalizeList(rawObj[key], DEFAULT_ERP_SETTINGS[key]);
      } else {
        cleaned[key] = rawObj[key];
      }
    }
  }
  return cleaned;
};

export const loadErpSettings = () => ({
  ...DEFAULT_ERP_SETTINGS,
  transactionTypes: [...DEFAULT_ERP_SETTINGS.transactionTypes],
  transactionCategories: [...DEFAULT_ERP_SETTINGS.transactionCategories],
  transactionTitles: [...DEFAULT_ERP_SETTINGS.transactionTitles]
});

export const fetchErpSettings = async () => {
  try {
    const res = await getSettings();
    const serverData = res?.data?.settings || res?.data || {};
    return {
      ...loadErpSettings(),
      ...pickKnownSettings(serverData)
    };
  } catch {
    return loadErpSettings();
  }
};

export default function Settings({
  products = [],
  suppliers = [],
  clients = [],
  purchases = [],
  invoices = [],
  transactions = [],
  accountTransactions = [],
  settings,
  onSettingsChange,
  reloadData
}) {
  const [activeTab, setActiveTab] = useState('COMPANY'); // 'COMPANY' | 'SYSTEM' | 'ACCOUNTS' | 'DATA'
  const [form, setForm] = useState(() => ({
    ...loadErpSettings(),
    ...pickKnownSettings(settings || {})
  }));
  const [newType, setNewType] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [savedNotice, setSavedNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (settings) {
      setForm(prev => ({ ...prev, ...pickKnownSettings(settings) }));
    }
  }, [settings]);

  useEffect(() => {
    let mounted = true;
    fetchErpSettings().then((synced) => {
      if (!mounted) return;
      setForm(prev => ({ ...prev, ...synced }));
      onSettingsChange?.(synced);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const txList = Array.isArray(transactions)
    ? transactions
    : Array.isArray(accountTransactions)
    ? accountTransactions
    : [];

  const handleField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (savedNotice) setSavedNotice('');
  };

  const handleAddOption = (fieldKey, rawVal, setter, uppercase = false) => {
    const clean = uppercase
      ? String(rawVal || '').trim().toUpperCase().replace(/\s+/g, '_')
      : String(rawVal || '').trim();
    if (!clean) return;

    setForm(prev => {
      const current = Array.isArray(prev[fieldKey]) ? prev[fieldKey] : [];
      const exists = current.some(item => item.toLowerCase() === clean.toLowerCase());
      if (exists) return prev;
      return {
        ...prev,
        [fieldKey]: [...current, clean]
      };
    });
    setter('');
    if (savedNotice) setSavedNotice('');
  };

  const handleRemoveOption = (fieldKey, targetItem) => {
    setForm(prev => {
      const current = Array.isArray(prev[fieldKey]) ? prev[fieldKey] : [];
      const filtered = current.filter(item => item !== targetItem);
      return {
        ...prev,
        [fieldKey]: filtered.length ? filtered : [...DEFAULT_ERP_SETTINGS[fieldKey]]
      };
    });
    if (savedNotice) setSavedNotice('');
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, SVG).');
      e.target.value = '';
      return;
    }

    const maxBytes = 2 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert('Logo image size must be 2MB or less.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleField('logoUrl', reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    handleField('logoUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const persistSettings = async (targetObj, successMsg) => {
    setSaving(true);
    try {
      const res = await updateSettings(targetObj);
      const savedFromApi = res?.data?.settings || res?.data || targetObj;
      const finalSettings = {
        ...loadErpSettings(),
        ...pickKnownSettings(targetObj),
        ...pickKnownSettings(savedFromApi)
      };

      setForm(finalSettings);
      onSettingsChange?.(finalSettings);
      setSavedNotice(successMsg);
      setTimeout(() => setSavedNotice(''), 3000);
    } catch (err) {
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Could not save settings to server.';
      alert(`Error saving settings: ${errMsg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const cleaned = {
      ...loadErpSettings(),
      ...pickKnownSettings(form),
      companyName: String(form.companyName || '').trim() || DEFAULT_ERP_SETTINGS.companyName,
      logoUrl: String(form.logoUrl || '').trim(),
      currencySymbol: String(form.currencySymbol || '').trim() || '৳',
      invoicePrefix: String(form.invoicePrefix || 'INV').trim().toUpperCase() || 'INV',
      defaultMinStock: Math.max(0, Number(form.defaultMinStock ?? 5)),
      transactionTypes: normalizeList(
        form.transactionTypes,
        DEFAULT_ERP_SETTINGS.transactionTypes
      ),
      transactionCategories: normalizeList(
        form.transactionCategories,
        DEFAULT_ERP_SETTINGS.transactionCategories
      ),
      transactionTitles: normalizeList(
        form.transactionTitles,
        DEFAULT_ERP_SETTINGS.transactionTitles
      )
    };

    await persistSettings(cleaned, 'Settings saved to database.');
  };

  const handleResetDefaults = async () => {
    if (!confirm('Reset all ERP settings to default values?')) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    const defaults = loadErpSettings();
    await persistSettings(defaults, 'Default settings restored.');
  };

  const handleExportBackup = () => {
    const backupPayload = {
      exportedAt: new Date().toISOString(),
      settings: form,
      counts: {
        products: products.length,
        suppliers: suppliers.length,
        clients: clients.length,
        purchases: purchases.length,
        invoices: invoices.length,
        accountTransactions: txList.length
      },
      data: {
        products,
        suppliers,
        clients,
        purchases,
        invoices,
        accountTransactions: txList
      }
    };

    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `${form.companyName || 'NEXUS ERP'}_Backup_${dateStamp}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderOptionManager = ({
    title,
    subtitle,
    items = [],
    fieldKey,
    inputValue,
    setInputValue,
    placeholder,
    uppercase = false
  }) => (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
      <div>
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddOption(fieldKey, inputValue, setInputValue, uppercase);
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:border-indigo-500"
        />
        <button
          type="button"
          onClick={() => handleAddOption(fieldKey, inputValue, setInputValue, uppercase)}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {items.map(item => (
          <span
            key={item}
            className="inline-flex items-center gap-1.5 bg-white text-slate-700 border border-slate-200 px-3 py-1 rounded-xl text-xs font-medium shadow-2xs"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => handleRemoveOption(fieldKey, item)}
              title={`Remove ${item}`}
              className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-indigo-600" />
            System Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure business profile, logo, billing defaults, account dropdowns, and data backups.
          </p>
        </div>

        {savedNotice && (
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            {savedNotice}
          </div>
        )}
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('COMPANY')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeTab === 'COMPANY'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Company & Invoice
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('SYSTEM')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeTab === 'SYSTEM'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Billing & Stock Rules
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ACCOUNTS')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeTab === 'ACCOUNTS'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          Account Dropdowns
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DATA')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
            activeTab === 'DATA'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          Backup & Sync
        </button>
      </div>

      {/* Tab 1, Tab 2 & Tab 3 Form */}
      {(activeTab === 'COMPANY' || activeTab === 'SYSTEM' || activeTab === 'ACCOUNTS') && (
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 space-y-5"
        >
          {activeTab === 'COMPANY' && (
            <>
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800">Company & Receipt Information</h3>
                <p className="text-xs text-slate-500">
                  Displayed in sidebar, login screen, printed invoices, ledgers, and reports.
                </p>
              </div>

              {/* Company Logo Upload & Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                    {form.logoUrl ? (
                      <img
                        src={form.logoUrl}
                        alt="Company Logo Preview"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="w-7 h-7 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Company Logo
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload PNG, JPG, or WEBP (max 2MB) for sidebar, login & invoice headers.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-indigo-600" />
                    {form.logoUrl ? 'Change Logo' : 'Upload Logo'}
                  </button>

                  {form.logoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 text-xs font-semibold transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Company / Business Name
                  </label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={e => handleField('companyName', e.target.value)}
                    placeholder="e.g., NEXUS ERP"
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={form.tagline}
                    onChange={e => handleField('tagline', e.target.value)}
                    placeholder="e.g., Wholesale & Distribution"
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={e => handleField('phone', e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => handleField('email', e.target.value)}
                    placeholder="accounts@company.com"
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    BIN / VAT / Tax Registration No.
                  </label>
                  <input
                    type="text"
                    value={form.taxId}
                    onChange={e => handleField('taxId', e.target.value)}
                    placeholder="Optional BIN / VAT ID"
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Office / Warehouse Address
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => handleField('address', e.target.value)}
                    placeholder="Street, Area, City"
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Invoice Number Prefix
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={form.invoicePrefix}
                    onChange={e => handleField('invoicePrefix', e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm font-mono uppercase outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Invoice Footer Note
                  </label>
                  <input
                    type="text"
                    value={form.invoiceFooter}
                    onChange={e => handleField('invoiceFooter', e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'SYSTEM' && (
            <>
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800">Billing, Payment & Inventory Rules</h3>
                <p className="text-xs text-slate-500">
                  Set default values used across new invoices, purchases, and stock alerts.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    value={form.currencySymbol}
                    onChange={e => handleField('currencySymbol', e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Default Low-Stock Alert Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.defaultMinStock}
                    onChange={e => handleField('defaultMinStock', e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Default Payment Method
                  </label>
                  <select
                    value={form.defaultPaymentMethod}
                    onChange={e => handleField('defaultPaymentMethod', e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                    <option value="Mobile Banking">Mobile Banking</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Default Mobile Banking Provider
                  </label>
                  <select
                    value={form.defaultMobileProvider}
                    onChange={e => handleField('defaultMobileProvider', e.target.value)}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white outline-none focus:border-indigo-500"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Upay">Upay</option>
                  </select>
                </div>

                <div className="flex flex-col justify-end space-y-2.5 pt-2">
                  <label className="inline-flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(form.showSignatureOnPrint)}
                      onChange={e => handleField('showSignatureOnPrint', e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Include signature block on printed invoices & reports
                  </label>

                  <label className="inline-flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(form.autoReloadAfterAction)}
                      onChange={e => handleField('autoReloadAfterAction', e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Refresh live records automatically after transactions
                  </label>
                </div>
              </div>
            </>
          )}

          {activeTab === 'ACCOUNTS' && (
            <>
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-800">Account Entry Dropdown Options</h3>
                <p className="text-xs text-slate-500">
                  Manage options for Transaction Type, Category, and Title / Description used in Accounts.
                </p>
              </div>

              <div className="space-y-4">
                {renderOptionManager({
                  title: 'Transaction Types',
                  subtitle: 'Shown in Transaction Type * dropdown (Add / Edit entry).',
                  items: form.transactionTypes || [],
                  fieldKey: 'transactionTypes',
                  inputValue: newType,
                  setInputValue: setNewType,
                  placeholder: 'e.g. ADVANCE_RETURN or PETTY_CASH',
                  uppercase: true
                })}

                {renderOptionManager({
                  title: 'Categories',
                  subtitle: 'Shown in Category * dropdown.',
                  items: form.transactionCategories || [],
                  fieldKey: 'transactionCategories',
                  inputValue: newCategory,
                  setInputValue: setNewCategory,
                  placeholder: 'e.g. Internet & Utility'
                })}

                {renderOptionManager({
                  title: 'Titles / Descriptions',
                  subtitle: 'Shown in Title / Description * dropdown.',
                  items: form.transactionTitles || [],
                  fieldKey: 'transactionTitles',
                  inputValue: newTitle,
                  setInputValue: setNewTitle,
                  placeholder: 'e.g. Monthly Broadband Bill'
                })}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Defaults
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 4: Backup & Sync */}
      {activeTab === 'DATA' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 sm:p-6 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800">Snapshot & Data Sync</h3>
              <p className="text-xs text-slate-500">
                Download a complete JSON snapshot of current ERP records or refresh server data.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {reloadData && (
                <button
                  type="button"
                  onClick={() => reloadData()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-indigo-600" />
                  Reload Live Data
                </button>
              )}
              <button
                type="button"
                onClick={handleExportBackup}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export JSON Backup
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Products', count: products.length },
              { label: 'Suppliers', count: suppliers.length },
              { label: 'Clients', count: clients.length },
              { label: 'Purchases', count: purchases.length },
              { label: 'Invoices', count: invoices.length },
              { label: 'Account Entries', count: txList.length }
            ].map(item => (
              <div
                key={item.label}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70"
              >
                <p className="text-[11px] font-semibold text-slate-500 uppercase">{item.label}</p>
                <p className="text-lg font-extrabold text-slate-800 mt-1">
                  {Number(item.count || 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}