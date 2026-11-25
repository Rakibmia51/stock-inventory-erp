
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
  Building2
} from 'lucide-react';
import { addSupplier, updateSupplier, deleteSupplier } from '../services/api';
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

const emptyForm = {
  name: '',
  companyName: '',
  phone: '',
  email: '',
  address: '',
  dueBalance: ''
};

export default function Suppliers({ suppliers = [], reloadData, settings, user }) {
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit Modal State
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [updating, setUpdating] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const currentUser = getEffectiveUser(user);
  const isAdmin =
    (currentUser?.userType || '').toLowerCase() === 'admin' ||
    (currentUser?.role || '').toLowerCase() === 'admin';

  const supplierList = Array.isArray(suppliers) ? suppliers : [];

  const totalPayableDue = supplierList.reduce(
    (sum, s) => sum + Number(s.dueBalance || 0),
    0
  );

  const filteredSuppliers = supplierList.filter(s => {
    const q = searchTerm.toLowerCase();
    return (
      (s.companyName || '').toLowerCase().includes(q) ||
      (s.name || '').toLowerCase().includes(q) ||
      (s.phone || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.address || '').toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, supplierList.length]);

  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);

  // নতুন সাপ্লায়ার যোগ করা
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const openingDue = Number(form.dueBalance || 0);
      await addSupplier({
        name: form.name,
        companyName: form.companyName,
        phone: form.phone,
        email: form.email,
        address: form.address,
        openingBalance: openingDue,
        dueBalance: openingDue
      });
      setForm(emptyForm);
      setCurrentPage(1);
      reloadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding supplier');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Modal ওপেন করা
  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setEditForm({
      name: supplier.name || '',
      companyName: supplier.companyName || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      dueBalance: supplier.dueBalance ?? 0
    });
  };

  // সাপ্লায়ার তথ্য আপডেট সেভ করা
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!editingSupplier) return;
    setUpdating(true);
    try {
      await updateSupplier(editingSupplier._id, {
        name: editForm.name,
        companyName: editForm.companyName,
        phone: editForm.phone,
        email: editForm.email,
        address: editForm.address,
        dueBalance: Number(editForm.dueBalance || 0)
      });
      setEditingSupplier(null);
      reloadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating supplier');
    } finally {
      setUpdating(false);
    }
  };

  // সাপ্লায়ার ডিলিট করা
  const handleDelete = async (supplier) => {
    if (!confirm(`"${supplier.companyName || supplier.name}" সাপ্লায়ারটি ডিলিট করতে চান?`)) return;
    try {
      await deleteSupplier(supplier._id);
      if (editingSupplier?._id === supplier._id) setEditingSupplier(null);
      reloadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting supplier');
    }
  };

  // Excel (.csv with UTF-8 BOM) ডাউনলোড
  const handleDownloadExcel = () => {
    const headers = [
      'SL',
      'Company Name',
      'Contact Person',
      'Phone',
      'Email',
      'Address',
      'Due Balance'
    ];

    const escapeCsv = (val) => {
      const str = String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = filteredSuppliers.map((s, idx) =>
      [
        escapeCsv(idx + 1),
        escapeCsv(s.companyName || ''),
        escapeCsv(s.name || ''),
        escapeCsv(s.phone || ''),
        escapeCsv(s.email || 'N/A'),
        escapeCsv(s.address || 'N/A'),
        escapeCsv(Number(s.dueBalance || 0))
      ].join(',')
    );

    const csvContent =
      '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `Suppliers_List_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

// সাপ্লায়ার লিস্ট প্রিন্ট করা
  const handlePrintList = () => {
    const activeSettings = {
      ...DEFAULT_ERP_SETTINGS,
      ...(settings || {})
    };
    const currency = activeSettings.currencySymbol || '৳';
    const companyTitle = (activeSettings.companyName || 'NEXUS ERP').trim();

    const printWindow = window.open('', '_blank', 'height=750,width=950');
    if (!printWindow) return;

    const totalDue = filteredSuppliers.reduce(
      (sum, s) => sum + Number(s.dueBalance || 0),
      0
    );

    const rowsHtml = filteredSuppliers
      .map(
        (s, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${s.companyName || '-'}</strong></td>
          <td>${s.name || '-'}</td>
          <td>${s.phone || '-'}</td>
          <td>${s.email || 'N/A'}</td>
          <td>${s.address || 'N/A'}</td>
          <td style="text-align:right">${currency}${Number(s.dueBalance || 0).toLocaleString()}</td>
        </tr>
      `
      )
      .join('');

    const metaParts = [
      activeSettings.address,
      activeSettings.phone && `Phone: ${activeSettings.phone}`,
      activeSettings.email && `Email: ${activeSettings.email}`,
      activeSettings.taxId && `BIN/VAT: ${activeSettings.taxId}`
    ].filter(Boolean);

    const logoHtml =
      activeSettings.logoUrl && activeSettings.logoUrl.trim()
        ? `<img src="${activeSettings.logoUrl}" alt="${companyTitle}" style="width:44px;height:44px;object-fit:contain;border:1px solid #e2e8f0;border-radius:8px;padding:3px;" />`
        : '';

    const signaturesHtml =
      activeSettings.showSignatureOnPrint !== false
        ? `
          <div class="signatures">
            <div class="sig-box">Prepared By</div>
            <div class="sig-box">Purchase / Checked By</div>
            <div class="sig-box">Authorized Signature (${companyTitle})</div>
          </div>
        `
        : '';

    const footerHtml = activeSettings.invoiceFooter
      ? `<div class="footer-note">${activeSettings.invoiceFooter}</div>`
      : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Supplier Directory Report - ${companyTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; gap: 12px; }
            .brand-row { display: flex; align-items: flex-start; gap: 10px; }
            h2 { margin: 0 0 4px 0; font-size: 20px; }
            p { margin: 2px 0; font-size: 12px; color: #475569; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border-bottom: 1px solid #cbd5e1; padding: 8px 6px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; }
            tfoot td { background: #f8fafc; font-weight: bold; border-top: 2px solid #94a3b8; }
            .signatures { display: flex; justify-content: space-between; margin-top: 55px; }
            .sig-box { width: 190px; border-top: 1px solid #64748b; text-align: center; padding-top: 5px; font-size: 11px; color: #475569; }
            .footer-note { margin-top: 24px; padding-top: 10px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-row">
              ${logoHtml}
              <div>
                <h2>${companyTitle} — SUPPLIER DIRECTORY & PAYABLE REPORT</h2>
                ${metaParts.length ? `<p>${metaParts.join(' • ')}</p>` : ''}
                <p>Total Suppliers: ${filteredSuppliers.length}${
                  searchTerm.trim() ? ` • Filter: "${searchTerm.trim()}"` : ''
                }</p>
              </div>
            </div>
            <div style="text-align:right">
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Company</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th style="text-align:right">Due Balance</th>
              </tr>
            </thead>
            <tbody>
              ${
                rowsHtml ||
                `<tr><td colspan="7" style="text-align:center;padding:16px;">No suppliers found.</td></tr>`
              }
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6">Total Due Balance</td>
                <td style="text-align:right">${currency}${totalDue.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          ${signaturesHtml}
          ${footerHtml}
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Supplier Management</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Add, edit, search, export Excel, and print supplier directory & payables.
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
            <Printer className="w-4 h-4 text-indigo-600" /> Print ({filteredSuppliers.length})
          </button>
        </div>
      </div>

      {/* Add Supplier Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 sm:gap-4"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Contact Person *
          </label>
          <input
            placeholder="Contact Person Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Company Name *
          </label>
          <input
            placeholder="Company Name"
            value={form.companyName}
            onChange={e => setForm({ ...form, companyName: e.target.value })}
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Phone Number *
          </label>
          <input
            placeholder="Phone Number"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
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
            placeholder="Email Address"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Address
          </label>
          <input
            placeholder="Office / Factory Address"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Opening Due (৳)
          </label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder="0.00"
            value={form.dueBalance}
            onChange={e => setForm({ ...form, dueBalance: e.target.value })}
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
          <div className="text-xs text-slate-500 flex flex-wrap gap-4">
            <span>
              Total Suppliers:{' '}
              <strong className="text-slate-800">{filteredSuppliers.length}</strong>
            </span>
            <span>
              Total Payable Due:{' '}
              <strong className="text-red-600">৳{totalPayableDue.toLocaleString()}</strong>
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-medium text-sm inline-flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Building2 className="w-4 h-4" />
            {submitting ? 'Adding...' : 'Add Supplier'}
          </button>
        </div>
      </form>

      {/* Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by company name, contact person, phone, email, or address..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
        />
      </div>

      {/* Suppliers List Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Desktop / Tablet Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Contact Person</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Address</th>
                <th className="py-3.5 px-4 text-right">Due Balance</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedSuppliers.length > 0 ? (
                paginatedSuppliers.map(s => {
                  const dueVal = Number(s.dueBalance || 0);
                  return (
                    <tr key={s._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{s.companyName}</td>
                      <td className="py-3.5 px-4 text-slate-700">{s.name}</td>
                      <td className="py-3.5 px-4 text-slate-700">{s.phone}</td>
                      <td className="py-3.5 px-4 text-slate-500">{s.email || 'N/A'}</td>
                      <td className="py-3.5 px-4 text-slate-500">{s.address || 'N/A'}</td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold ${
                          dueVal > 0 ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        ৳{dueVal.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDelete(s)}
                              title="Delete Supplier"
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
                  <td colSpan="7" className="py-8 text-center text-slate-400 text-sm">
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View (< md) */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedSuppliers.length > 0 ? (
            paginatedSuppliers.map(s => {
              const dueVal = Number(s.dueBalance || 0);
              return (
                <div key={s._id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{s.companyName}</h4>
                      <p className="text-xs text-slate-600 mt-0.5">Contact: {s.name}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {s.phone}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-0.5">
                    <p>Email: {s.email || 'N/A'}</p>
                    <p>Address: {s.address || 'N/A'}</p>
                    <p className="font-semibold text-slate-700">
                      Due Balance:{' '}
                      <span className={dueVal > 0 ? 'text-red-600' : 'text-emerald-700'}>
                        ৳{dueVal.toLocaleString()}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => openEditModal(s)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(s)}
                        title="Delete Supplier"
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
              No suppliers found.
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {filteredSuppliers.length > 0 && (
          <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <p className="text-slate-500">
              Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(startIndex + itemsPerPage, filteredSuppliers.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-700">{filteredSuppliers.length}</span> suppliers
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

      {/* Edit Supplier Modal */}
      {editingSupplier && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Edit Supplier</h3>
                <p className="text-xs text-slate-500">Update supplier company and contact info</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSupplier(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Company Name *
                </label>
                <input
                  value={editForm.companyName}
                  onChange={e => setEditForm({ ...editForm, companyName: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Contact Person *
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

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Due Balance (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={editForm.dueBalance}
                  onChange={e => setEditForm({ ...editForm, dueBalance: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSupplier(null)}
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