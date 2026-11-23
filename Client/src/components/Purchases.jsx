
import { useState, useEffect } from 'react';
import {
  Printer,
  Eye,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Plus
} from 'lucide-react';
import { addPurchase, deletePurchase } from '../services/api';

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

const createEmptyItem = () => ({
  product: '',
  quantity: 1,
  purchasePrice: ''
});

export default function Purchases({
  suppliers = [],
  products = [],
  purchases = [],
  reloadData,
  user
}) {
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState([createEmptyItem()]);
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [mobileProvider, setMobileProvider] = useState('bKash');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const currentUser = getEffectiveUser(user);
  const isAdmin =
    (currentUser?.userType || '').toLowerCase() === 'admin' ||
    (currentUser?.role || '').toLowerCase() === 'admin';

  const supplierList = Array.isArray(suppliers) ? suppliers : [];
  const productList = Array.isArray(products) ? products : [];
  const purchaseList = Array.isArray(purchases) ? purchases : [];

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(purchaseList.length / itemsPerPage));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [purchaseList.length, currentPage]);

  const totalPages = Math.max(1, Math.ceil(purchaseList.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPurchases = purchaseList.slice(startIndex, startIndex + itemsPerPage);

  // নতুন প্রোডাক্ট রো যুক্ত করা
  const handleAddRow = () => {
    setItems(prev => [...prev, createEmptyItem()]);
  };

  // নির্দিষ্ট প্রোডাক্ট রো ডিলিট করা (কমপক্ষে ১টি রো থাকবে)
  const handleRemoveRow = (index) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  // রো-এর ফিল্ড আপডেট করা (প্রোডাক্ট সিলেক্ট করলে ডিফল্ট buyPrice অটো-ফিল হবে)
  const handleItemChange = (index, field, value) => {
    setItems(prev =>
      prev.map((row, idx) => {
        if (idx !== index) return row;
        const updatedRow = { ...row, [field]: value };

        if (field === 'product') {
          const matchedProduct = productList.find(p => p._id === value);
          if (
            matchedProduct &&
            (row.purchasePrice === '' || Number(row.purchasePrice) === 0)
          ) {
            updatedRow.purchasePrice =
              matchedProduct.buyPrice ??
              matchedProduct.sellPrice ??
              matchedProduct.price ??
              '';
          }
        }
        return updatedRow;
      })
    );
  };

  // লাইন টোটাল, গ্র্যান্ড টোটাল ও Due হিসাব
  const getLineTotal = (item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.purchasePrice) || 0;
    return qty * price;
  };

  const grandTotalPreview = items.reduce((sum, item) => sum + getLineTotal(item), 0);
  const numericPaid =
    paymentMethod === 'Due'
      ? 0
      : Math.min(grandTotalPreview, Math.max(0, Number(paidAmount) || 0));
  const dueAmountPreview = Math.max(0, grandTotalPreview - numericPaid);

  const selectedSupplierObj = supplierList.find(s => s._id === supplier);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!supplier) {
      alert('Please select a supplier.');
      return;
    }

    const validItems = items
      .filter(row => row.product && Number(row.quantity) > 0)
      .map(row => ({
        product: row.product,
        quantity: Number(row.quantity),
        purchasePrice: Number(row.purchasePrice) || 0
      }));

    if (validItems.length === 0) {
      alert('Please select at least one product with valid quantity.');
      return;
    }

    setSubmitting(true);
    try {
      await addPurchase({
        supplier,
        items: validItems,
        paidAmount: numericPaid,
        paymentMethod,
        mobileProvider: paymentMethod === 'Mobile Banking' ? mobileProvider : '',
        reference: reference.trim(),
        note: note.trim(),
        status: 'Received'
      });

      alert('Purchase Invoice created, stock & supplier due updated!');
      setSupplier('');
      setItems([createEmptyItem()]);
      setPaidAmount('');
      setPaymentMethod('Cash');
      setMobileProvider('bKash');
      setReference('');
      setNote('');
      setCurrentPage(1);
      reloadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        'এই Purchase Order ডিলিট করলে স্টক ও সাপ্লায়ার Due ব্যালেন্স রিভার্স হয়ে যাবে। আপনি কি নিশ্চিত?'
      )
    ) {
      return;
    }
    try {
      await deletePurchase(id);
      if (selectedPurchase?._id === id) setSelectedPurchase(null);
      reloadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting purchase order');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* প্রিন্ট করার সময় শুধু ইনভয়েস মডাল প্রিন্ট হবে */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-purchase-invoice, #printable-purchase-invoice * {
            visibility: visible;
          }
          #printable-purchase-invoice {
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            background: #ffffff;
            padding: 20px;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="no-print space-y-5 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Purchase Order / Invoice (Stock In)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Add multiple products in a single purchase invoice, track paid/due balance, and update stock.
            </p>
          </div>
        </div>

        {/* Multi-Item Purchase Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-5"
        >
          {/* Supplier & Add Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Supplier *
              </label>
              <select
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                required
              >
                <option value="">Select Supplier</option>
                {supplierList.map(s => (
                  <option key={s._id} value={s._id}>
                    {s.companyName || s.name}{' '}
                    {s.name && s.companyName ? `(${s.name})` : ''} — Due: ৳
                    {Number(s.dueBalance || 0).toLocaleString()}
                  </option>
                ))}
              </select>
              {selectedSupplierObj && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Current Supplier Due:{' '}
                  <strong className="text-red-600">
                    ৳{Number(selectedSupplierObj.dueBalance || 0).toLocaleString()}
                  </strong>
                </p>
              )}
            </div>

            <div className="flex md:justify-end">
              <button
                type="button"
                onClick={handleAddRow}
                className="w-full md:w-auto bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" /> Add Another Product
              </button>
            </div>
          </div>

          {/* Dynamic Product Rows */}
          <div className="space-y-3">
            <div className="hidden lg:grid lg:grid-cols-12 gap-3 px-1 text-xs font-semibold text-slate-500 uppercase">
              <div className="lg:col-span-5">Product</div>
              <div className="lg:col-span-2">Quantity</div>
              <div className="lg:col-span-2">Unit Buy Price (৳)</div>
              <div className="lg:col-span-2 text-right">Line Total</div>
              <div className="lg:col-span-1 text-right">Remove</div>
            </div>

            {items.map((row, index) => {
              const lineTotal = getLineTotal(row);
              return (
                <div
                  key={index}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-2 lg:col-span-5">
                    <label className="block lg:hidden text-[11px] font-semibold text-slate-500 mb-1">
                      Product #{index + 1}
                    </label>
                    <select
                      value={row.product}
                      onChange={e => handleItemChange(index, 'product', e.target.value)}
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    >
                      <option value="">Select Product</option>
                      {productList.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name} (SKU: {p.sku}) — Stock: {p.quantity}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block lg:hidden text-[11px] font-semibold text-slate-500 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={row.quantity}
                      onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      min="1"
                      required
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block lg:hidden text-[11px] font-semibold text-slate-500 mb-1">
                      Unit Buy Price (৳)
                    </label>
                    <input
                      type="number"
                      placeholder="Buy Price (৳)"
                      value={row.purchasePrice}
                      onChange={e => handleItemChange(index, 'purchasePrice', e.target.value)}
                      className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      min="0"
                      step="any"
                      required
                    />
                  </div>

                  <div className="lg:col-span-2 flex items-center justify-between lg:justify-end px-1">
                    <span className="lg:hidden text-xs font-semibold text-slate-500">
                      Line Total:
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      ৳ {lineTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="lg:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      disabled={items.length === 1}
                      title="Remove Product Row"
                      className="text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none p-2 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Payment & Due Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={e => {
                  const nextMethod = e.target.value;
                  setPaymentMethod(nextMethod);
                  if (nextMethod === 'Due') setPaidAmount('0');
                }}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="Bank">Bank</option>
                <option value="Mobile Banking">Mobile Banking</option>
                <option value="Due">Full Due</option>
              </select>
            </div>

            {paymentMethod === 'Mobile Banking' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mobile Provider
                </label>
                <select
                  value={mobileProvider}
                  onChange={e => setMobileProvider(e.target.value)}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Rocket">Rocket</option>
                  <option value="Upay">Upay</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Paid Amount (৳)
              </label>
              <input
                type="number"
                min="0"
                max={grandTotalPreview}
                step="any"
                disabled={paymentMethod === 'Due'}
                placeholder="0.00"
                value={paymentMethod === 'Due' ? 0 : paidAmount}
                onChange={e => setPaidAmount(e.target.value)}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white disabled:bg-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Challan / Ref #
              </label>
              <input
                placeholder="Optional reference"
                value={reference}
                onChange={e => setReference(e.target.value)}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Remarks / Note
              </label>
              <input
                placeholder="Optional note"
                value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Grand Total, Paid, Due & Submit Bar */}
          <div className="pt-3 border-t border-slate-200/80 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap gap-3">
              <div className="bg-emerald-50/80 border border-emerald-200/80 px-4 py-2.5 rounded-xl">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase block">
                  Grand Total ({items.length} {items.length === 1 ? 'Item' : 'Items'})
                </span>
                <span className="text-base sm:text-lg font-extrabold text-emerald-700">
                  ৳ {grandTotalPreview.toLocaleString()}
                </span>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-200/70 px-4 py-2.5 rounded-xl">
                <span className="text-[11px] font-semibold text-indigo-800 uppercase block">
                  Paid Now
                </span>
                <span className="text-base sm:text-lg font-extrabold text-indigo-700">
                  ৳ {numericPaid.toLocaleString()}
                </span>
              </div>

              <div className="bg-red-50/70 border border-red-200/70 px-4 py-2.5 rounded-xl">
                <span className="text-[11px] font-semibold text-red-700 uppercase block">
                  Purchase Due
                </span>
                <span className="text-base sm:text-lg font-extrabold text-red-600">
                  ৳ {dueAmountPreview.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 py-3 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              {submitting
                ? 'Saving Purchase Invoice...'
                : 'Confirm Purchase Invoice & Update Stock'}
            </button>
          </div>
        </form>

        {/* Purchase History Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h3 className="font-bold text-slate-800 text-base">Purchase History</h3>
            <span className="text-xs text-slate-500 font-medium">
              Total Invoices: {purchaseList.length}
            </span>
          </div>

          {/* Desktop / Tablet Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">PO Ref</th>
                  <th className="py-3.5 px-4">Supplier</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Due</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedPurchases.map((pur, idx) => {
                  const globalIndex = purchaseList.length - (startIndex + idx);
                  const totalAmt = Number(pur.totalAmount || 0);
                  const paidAmt = Number(pur.paidAmount || 0);
                  const dueAmt =
                    pur.dueAmount !== undefined
                      ? Number(pur.dueAmount || 0)
                      : Math.max(0, totalAmt - paidAmt);

                  return (
                    <tr key={pur._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">
                        {pur.purchaseNumber || `PO-${String(globalIndex).padStart(4, '0')}`}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {pur.supplier?.companyName || pur.supplier?.name || 'Unknown'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-800">
                        ৳ {totalAmt.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                        ৳ {paidAmt.toLocaleString()}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold ${
                          dueAmt > 0 ? 'text-red-600' : 'text-slate-400'
                        }`}
                      >
                        ৳ {dueAmt.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                        {pur.paymentMethod || 'Cash'}
                        {pur.paymentMethod === 'Mobile Banking' && pur.mobileProvider && (
                          <span className="block text-[11px] text-violet-700">
                            {pur.mobileProvider}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {new Date(pur.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedPurchase(pur)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
                          >
                            <Eye className="w-3.5 h-3.5" /> View / Print
                          </button>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDelete(pur._id)}
                              title="Delete Purchase"
                              className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {paginatedPurchases.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-slate-400 text-sm">
                      No purchase orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (< md) */}
          <div className="md:hidden divide-y divide-slate-100">
            {paginatedPurchases.map((pur, idx) => {
              const globalIndex = purchaseList.length - (startIndex + idx);
              const totalAmt = Number(pur.totalAmount || 0);
              const paidAmt = Number(pur.paidAmount || 0);
              const dueAmt =
                pur.dueAmount !== undefined
                  ? Number(pur.dueAmount || 0)
                  : Math.max(0, totalAmt - paidAmt);

              return (
                <div key={pur._id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-semibold text-slate-500">
                        {pur.purchaseNumber || `PO-${String(globalIndex).padStart(4, '0')}`} •{' '}
                        {pur.paymentMethod || 'Cash'}
                      </span>
                      <h4 className="font-bold text-slate-800 text-sm">
                        {pur.supplier?.companyName || pur.supplier?.name || 'Unknown'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(pur.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      {pur.status || 'Received'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                    <div>
                      <span className="text-slate-400 block">Total</span>
                      <strong className="text-slate-800">৳{totalAmt.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Paid</span>
                      <strong className="text-emerald-700">৳{paidAmt.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Due</span>
                      <strong className={dueAmt > 0 ? 'text-red-600' : 'text-slate-500'}>
                        ৳{dueAmt.toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPurchase(pur)}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View / Print
                    </button>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDelete(pur._id)}
                        title="Delete Purchase"
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {paginatedPurchases.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-sm">
                No purchase orders found.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {purchaseList.length > 0 && (
            <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
              <p className="text-slate-500">
                Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
                <span className="font-semibold text-slate-700">
                  {Math.min(startIndex + itemsPerPage, purchaseList.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-700">{purchaseList.length}</span> entries
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
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
                      currentPage === page
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Invoice View & Print Modal */}
      {selectedPurchase && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 max-h-[92vh] overflow-y-auto">
            {/* Top Bar */}
            <div className="flex flex-wrap justify-between items-center border-b pb-3 mb-5 gap-2 no-print">
              <h3 className="text-base font-bold text-slate-800">Purchase Invoice Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" /> Print Invoice
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPurchase(null)}
                  className="text-slate-400 hover:text-slate-700 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Body */}
            <div id="printable-purchase-invoice" className="space-y-6 text-slate-800">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start border-b pb-4 gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                    PURCHASE INVOICE
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Stock In & Supplier Purchase Receipt
                  </p>
                </div>
                <div className="sm:text-right text-xs space-y-1">
                  <p className="font-bold text-sm text-slate-800">
                    PO ID:{' '}
                    {selectedPurchase.purchaseNumber ||
                      `#${selectedPurchase._id?.slice(-6).toUpperCase()}`}
                  </p>
                  <p className="text-slate-600">
                    Date: {new Date(selectedPurchase.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-slate-600">
                    Method: <span className="font-semibold">{selectedPurchase.paymentMethod || 'Cash'}</span>
                    {selectedPurchase.mobileProvider ? ` (${selectedPurchase.mobileProvider})` : ''}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-sm">
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Supplier Details
                </p>
                <p className="font-bold text-slate-900">
                  {selectedPurchase.supplier?.companyName ||
                    selectedPurchase.supplier?.name ||
                    'Unknown Supplier'}
                </p>
                {selectedPurchase.supplier?.name && selectedPurchase.supplier?.companyName && (
                  <p className="text-xs text-slate-600">
                    Contact: {selectedPurchase.supplier.name}
                  </p>
                )}
                {selectedPurchase.supplier?.phone && (
                  <p className="text-xs text-slate-600">
                    Phone: {selectedPurchase.supplier.phone}
                  </p>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm min-w-[460px]">
                  <thead>
                    <tr className="bg-slate-100 border-y text-xs font-semibold text-slate-600 uppercase">
                      <th className="p-3">#</th>
                      <th className="p-3">Product</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(selectedPurchase.items || []).map((item, index) => {
                      const qty = Number(item.quantity || 0);
                      const unitPrice = Number(item.purchasePrice || 0);
                      const lineTotal = qty * unitPrice;

                      return (
                        <tr key={item._id || index}>
                          <td className="p-3 text-slate-500">{index + 1}</td>
                          <td className="p-3">
                            <p className="font-semibold text-slate-800">
                              {item.product?.name || 'Product'}
                            </p>
                            {item.product?.sku && (
                              <span className="text-xs font-mono text-slate-400">
                                SKU: {item.product.sku}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right font-medium">{qty}</td>
                          <td className="p-3 text-right">৳ {unitPrice.toLocaleString()}</td>
                          <td className="p-3 text-right font-semibold">
                            ৳ {lineTotal.toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {(() => {
                const totalAmt = Number(selectedPurchase.totalAmount || 0);
                const paidAmt = Number(selectedPurchase.paidAmount || 0);
                const dueAmt =
                  selectedPurchase.dueAmount !== undefined
                    ? Number(selectedPurchase.dueAmount || 0)
                    : Math.max(0, totalAmt - paidAmt);

                return (
                  <div className="flex justify-end pt-2">
                    <div className="w-full sm:w-64 space-y-1.5 text-sm border-t pt-3">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>Grand Total:</span>
                        <span>৳ {totalAmt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Paid Amount:</span>
                        <span>৳ {paidAmt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-red-600 font-bold border-t pt-1.5">
                        <span>Due Amount:</span>
                        <span>৳ {dueAmt.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 pt-10 text-center text-xs text-slate-600">
                <div className="border-t pt-2">Received By</div>
                <div className="border-t pt-2">Checked By</div>
                <div className="border-t pt-2">Authorized Signature</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}