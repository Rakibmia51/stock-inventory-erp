

import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  History,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  addProduct,
  deleteProduct,
  createReturn,
  getReturns
} from '../services/api';
import { DEFAULT_ERP_SETTINGS } from './Settings';

const getEffectiveUser = (propUser) => {
  if (propUser) return propUser;
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function Products({ products = [], suppliers, reloadData, settings, user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | LOW | IN_STOCK
  const [loading, setLoading] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add Product Form State (buyPrice & sellPrice)
  const [form, setForm] = useState({
    name: '',
    sku: '',
    category: '',
    openingStock: '',
    buyPrice: '',
    sellPrice: '',
    minStockLevel: 5
  });

  // Return Modal State
  const [returnModal, setReturnModal] = useState({ open: false, product: null });
  const [returnForm, setReturnForm] = useState({
    returnType: 'SALES_RETURN',
    amount: '',
    reason: ''
  });

  // Return History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [returnHistory, setReturnHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [historyFromDate, setHistoryFromDate] = useState('');
  const [historyToDate, setHistoryToDate] = useState('');

  const currentUser = getEffectiveUser(user);
  const isAdmin =
    (currentUser?.userType || '').toLowerCase() === 'admin' ||
    (currentUser?.role || '').toLowerCase() === 'admin';

  // Stock Ledger Metrics Helper
  const getStockMetrics = (p) => {
    const opening = Number(p.openingStock ?? 0);
    const purchased = Number(p.purchasedQty ?? 0);
    const sold = Number(p.soldQty ?? 0);
    const returned = Number(p.returnedQty ?? 0);
    const current = Math.max(
      0,
      Number(p.quantity ?? opening + purchased - sold + returned)
    );
    const isLow = current <= (p.minStockLevel ?? 5);
    return { opening, purchased, sold, returned, current, isLow };
  };

  // Unique Categories
  const categories = Array.from(
    new Set(
      (Array.isArray(products) ? products : [])
        .map(p => (p.category || '').trim())
        .filter(Boolean)
    )
  );

  // Filter Logic (Search + Category + Stock Status)
  const filteredProducts = (Array.isArray(products) ? products : []).filter(p => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'ALL' ||
      (p.category || '').toLowerCase() === categoryFilter.toLowerCase();

    const { isLow } = getStockMetrics(p);
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'LOW' && isLow) ||
      (statusFilter === 'IN_STOCK' && !isLow);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Total Stock Summary Value (ফিল্টার করা প্রোডাক্ট বা সব প্রোডাক্টের লাইভ হিসাব)
  const stockSummary = filteredProducts.reduce(
    (acc, p) => {
      const { opening, purchased, sold, returned, current } = getStockMetrics(p);
      const buyVal = Number(p.buyPrice ?? 0);
      const sellVal = Number(p.sellPrice ?? p.price ?? 0);

      acc.totalOpening += opening;
      acc.totalPurchased += purchased;
      acc.totalSold += sold;
      acc.totalReturned += returned;
      acc.totalUnits += current;
      acc.totalBuyValue += current * buyVal;
      acc.totalSellValue += current * sellVal;
      return acc;
    },
    {
      totalOpening: 0,
      totalPurchased: 0,
      totalSold: 0,
      totalReturned: 0,
      totalUnits: 0,
      totalBuyValue: 0,
      totalSellValue: 0
    }
  );

  const expectedProfit = stockSummary.totalSellValue - stockSummary.totalBuyValue;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter, products.length]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // ১. নতুন প্রোডাক্ট সেভ করা
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const openingNum = Number(form.openingStock) || 0;
      const buyNum = Number(form.buyPrice) || 0;
      const sellNum = Number(form.sellPrice) || 0;

      await addProduct({
        name: form.name,
        sku: form.sku,
        category: form.category,
        openingStock: openingNum,
        quantity: openingNum,
        buyPrice: buyNum,
        sellPrice: sellNum,
        minStockLevel: Number(form.minStockLevel) || 5
      });

      setForm({
        name: '',
        sku: '',
        category: '',
        openingStock: '',
        buyPrice: '',
        sellPrice: '',
        minStockLevel: 5
      });
      setIsModalOpen(false);
      reloadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding product');
    } finally {
      setLoading(false);
    }
  };

  // ২. Return সাবমিট করা
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnModal.product) return;
    setLoading(true);
    try {
      await createReturn({
        productId: returnModal.product._id,
        returnType: returnForm.returnType,
        amount: Number(returnForm.amount),
        reason: returnForm.reason
      });
      setReturnModal({ open: false, product: null });
      setReturnForm({ returnType: 'SALES_RETURN', amount: '', reason: '' });
      reloadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing return');
    } finally {
      setLoading(false);
    }
  };

  // ৩. Return History লোড করা
  const handleOpenHistory = async () => {
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const { data } = await getReturns();
      setReturnHistory(data || []);
    } catch (err) {
      console.error('Error fetching return history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // ৪. প্রোডাক্ট ডিলিট করা
  const handleDelete = async (id) => {
    if (!confirm('আপনি কি নিশ্চিত এটি ডিলিট করতে চান?')) return;
    try {
      await deleteProduct(id);
      reloadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting product');
    }
  };

  // ৫. Excel (.csv with UTF-8 BOM) Download + Total Stock Summary
  const handleDownloadExcel = () => {
    const headers = [
      'Product Name',
      'SKU',
      'Category',
      'Buy Price',
      'Sell Price',
      'Opening Stock',
      'Purchase (IN)',
      'Sell (OUT)',
      'Return',
      'Current Stock',
      'Stock Buy Value',
      'Stock Sell Value',
      'Status'
    ];

    const escapeCsv = (val) => {
      const str = String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = filteredProducts.map(p => {
      const { opening, purchased, sold, returned, current, isLow } = getStockMetrics(p);
      const buyVal = Number(p.buyPrice ?? 0);
      const sellVal = Number(p.sellPrice ?? p.price ?? 0);
      return [
        escapeCsv(p.name),
        escapeCsv(p.sku),
        escapeCsv(p.category),
        escapeCsv(buyVal),
        escapeCsv(sellVal),
        escapeCsv(opening),
        escapeCsv(purchased),
        escapeCsv(sold),
        escapeCsv(returned),
        escapeCsv(current),
        escapeCsv(current * buyVal),
        escapeCsv(current * sellVal),
        escapeCsv(isLow ? 'Low Stock' : 'In Stock')
      ].join(',');
    });

    const totalRow = [
      escapeCsv('TOTAL SUMMARY'),
      escapeCsv(''),
      escapeCsv(`${filteredProducts.length} Items`),
      escapeCsv(''),
      escapeCsv(''),
      escapeCsv(stockSummary.totalOpening),
      escapeCsv(stockSummary.totalPurchased),
      escapeCsv(stockSummary.totalSold),
      escapeCsv(stockSummary.totalReturned),
      escapeCsv(stockSummary.totalUnits),
      escapeCsv(stockSummary.totalBuyValue),
      escapeCsv(stockSummary.totalSellValue),
      escapeCsv(`Profit: ${expectedProfit}`)
    ].join(',');

    const csvContent =
      '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows, totalRow].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `Stock_Ledger_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ৬. Print Filtered / All Products with Total Stock Summary
const handlePrintProducts = () => {
    const activeSettings = {
      ...DEFAULT_ERP_SETTINGS,
      ...(settings || {})
    };
    const currency = activeSettings.currencySymbol || '৳';
    const companyTitle = (activeSettings.companyName || 'NEXUS ERP').trim();

    const printWindow = window.open('', '_blank', 'height=750,width=1050');
    if (!printWindow) return;

    const filterSummary = [
      categoryFilter !== 'ALL' ? `Category: ${categoryFilter}` : 'All Categories',
      statusFilter === 'LOW'
        ? 'Status: Low Stock'
        : statusFilter === 'IN_STOCK'
        ? 'Status: In Stock'
        : 'All Status',
      searchTerm.trim() ? `Search: "${searchTerm.trim()}"` : ''
    ]
      .filter(Boolean)
      .join(' | ');

    const rowsHtml = filteredProducts
      .map((p, idx) => {
        const { opening, purchased, sold, returned, current, isLow } = getStockMetrics(p);
        const buyVal = Number(p.buyPrice ?? 0);
        const sellVal = Number(p.sellPrice ?? p.price ?? 0);
        return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${p.name}</strong><br/><small>${p.sku || ''}</small></td>
            <td>${p.category || '-'}</td>
            <td class="text-right">${currency}${buyVal.toLocaleString()}</td>
            <td class="text-right">${currency}${sellVal.toLocaleString()}</td>
            <td class="text-right">${opening}</td>
            <td class="text-right">+${purchased}</td>
            <td class="text-right">-${sold}</td>
            <td class="text-right">${returned >= 0 ? `+${returned}` : returned}</td>
            <td class="text-right"><strong>${current}</strong></td>
            <td class="text-right">${currency}${(current * buyVal).toLocaleString()}</td>
            <td class="text-right">${currency}${(current * sellVal).toLocaleString()}</td>
            <td>${isLow ? 'Low Stock' : 'In Stock'}</td>
          </tr>
        `;
      })
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
            <div class="sig-box">Checked By</div>
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
          <title>Inventory Stock Ledger Report - ${companyTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; gap: 12px; }
            .brand-row { display: flex; align-items: flex-start; gap: 10px; }
            h2 { margin: 0 0 4px 0; font-size: 20px; }
            p { margin: 2px 0; font-size: 12px; color: #475569; }
            .summary-grid { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 16px; }
            .summary-box { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; background: #f8fafc; font-size: 12px; }
            .summary-box strong { display: block; font-size: 14px; margin-top: 2px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
            th, td { border-bottom: 1px solid #cbd5e1; padding: 6px 5px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; }
            tfoot td { background: #f8fafc; font-weight: bold; border-top: 2px solid #94a3b8; }
            .text-right { text-align: right; }
            .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
            .sig-box { width: 190px; border-top: 1px solid #64748b; text-align: center; padding-top: 5px; font-size: 11px; color: #475569; }
            .footer-note { margin-top: 24px; padding-top: 10px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-row">
              ${logoHtml}
              <div>
                <h2>${companyTitle} — INVENTORY STOCK LEDGER</h2>
                ${metaParts.length ? `<p>${metaParts.join(' • ')}</p>` : ''}
                <p>${filterSummary} • Total Products: ${filteredProducts.length}</p>
              </div>
            </div>
            <div style="text-align:right">
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div class="summary-grid">
            <div class="summary-box">Total Stock Qty<strong>${stockSummary.totalUnits.toLocaleString()} pcs</strong></div>
            <div class="summary-box">Total Buy Value<strong>${currency}${stockSummary.totalBuyValue.toLocaleString()}</strong></div>
            <div class="summary-box">Total Sell Value<strong>${currency}${stockSummary.totalSellValue.toLocaleString()}</strong></div>
            <div class="summary-box">Expected Profit<strong>${expectedProfit >= 0 ? '+' : ''}${currency}${expectedProfit.toLocaleString()}</strong></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product & SKU</th>
                <th>Category</th>
                <th class="text-right">Buy</th>
                <th class="text-right">Sell</th>
                <th class="text-right">Open</th>
                <th class="text-right">IN</th>
                <th class="text-right">OUT</th>
                <th class="text-right">Ret</th>
                <th class="text-right">Stock</th>
                <th class="text-right">Buy Val</th>
                <th class="text-right">Sell Val</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${
                rowsHtml ||
                `<tr><td colspan="13" style="text-align:center;padding:16px;">No products to display.</td></tr>`
              }
            </tbody>
            <tfoot>
              <tr>
                <td colspan="5">TOTAL</td>
                <td class="text-right">${stockSummary.totalOpening}</td>
                <td class="text-right">+${stockSummary.totalPurchased}</td>
                <td class="text-right">-${stockSummary.totalSold}</td>
                <td class="text-right">${stockSummary.totalReturned}</td>
                <td class="text-right">${stockSummary.totalUnits}</td>
                <td class="text-right">${currency}${stockSummary.totalBuyValue.toLocaleString()}</td>
                <td class="text-right">${currency}${stockSummary.totalSellValue.toLocaleString()}</td>
                <td></td>
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

const activeSettings = {
  ...DEFAULT_ERP_SETTINGS,
  ...(settings || {})
};
const companyTitle = (activeSettings.companyName || 'NEXUS ERP').trim();

const parseDateBound = (dateStr, endOfDay = false) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return null;
  return endOfDay
    ? new Date(y, m - 1, d, 23, 59, 59, 999)
    : new Date(y, m - 1, d, 0, 0, 0, 0);
};

const filteredReturnHistory = (Array.isArray(returnHistory) ? returnHistory : []).filter(item => {
  const fromBound = parseDateBound(historyFromDate, false);
  const toBound = parseDateBound(historyToDate, true);
  if (!fromBound && !toBound) return true;

  const rawDate = item?.createdAt || item?.returnDate || item?.date;
  if (!rawDate) return false;
  const dt = new Date(rawDate);
  if (Number.isNaN(dt.getTime())) return false;

  if (fromBound && dt < fromBound) return false;
  if (toBound && dt > toBound) return false;
  return true;
});

const salesReturnQty = filteredReturnHistory
  .filter(r => r.returnType === 'SALES_RETURN')
  .reduce((sum, r) => sum + Number(r.quantity || 0), 0);

const purchaseReturnQty = filteredReturnHistory
  .filter(r => r.returnType !== 'SALES_RETURN')
  .reduce((sum, r) => sum + Number(r.quantity || 0), 0);

const returnPeriodText =
  historyFromDate && historyToDate
    ? `${historyFromDate} to ${historyToDate}`
    : historyFromDate
    ? `From ${historyFromDate}`
    : historyToDate
    ? `Up to ${historyToDate}`
    : 'All Dates';

  const handlePrintReturnHistory = () => {
    const printWindow = window.open('', '_blank', 'height=750,width=980');
    if (!printWindow) return;

    const rowsHtml = filteredReturnHistory
      .map((item, idx) => {
        const isSalesRet = item.returnType === 'SALES_RETURN';
        const typeLabel = isSalesRet ? 'Sales Return (+)' : 'Purchase Return (-)';
        const dateFormatted = item.createdAt
          ? new Date(item.createdAt).toLocaleDateString()
          : '-';

        return `
          <tr>
            <td>${idx + 1}</td>
            <td class="mono"><strong>${item.returnNumber || '-'}</strong></td>
            <td>
              <strong>${item.product?.name || 'Deleted Product'}</strong>
              ${item.product?.sku ? `<br/><small>${item.product.sku}</small>` : ''}
            </td>
            <td>${typeLabel}</td>
            <td class="text-right"><strong>${Number(item.quantity || 0).toLocaleString()}</strong></td>
            <td>${item.reason || '-'}</td>
            <td>${dateFormatted}</td>
          </tr>
        `;
      })
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
            <div class="sig-box">Store / Checked By</div>
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
          <title>Stock Return History - ${companyTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; gap: 12px; }
            .brand-row { display: flex; align-items: flex-start; gap: 10px; }
            h2 { margin: 0 0 4px 0; font-size: 19px; }
            p { margin: 2px 0; font-size: 12px; color: #475569; }
            .summary-bar { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
            .summary-card { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; background: #f8fafc; font-size: 11.5px; }
            .summary-card strong { display: block; font-size: 13px; margin-top: 2px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border-bottom: 1px solid #cbd5e1; padding: 7px 6px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; }
            .mono { font-family: monospace; }
            .text-right { text-align: right; }
            .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
            .sig-box { width: 190px; border-top: 1px solid #64748b; text-align: center; padding-top: 5px; font-size: 11px; color: #475569; }
            .footer-note { margin-top: 24px; padding-top: 10px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 11px; color: #64748b; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand-row">
              ${logoHtml}
              <div>
                <h2>${companyTitle} — STOCK RETURN HISTORY</h2>
                ${metaParts.length ? `<p>${metaParts.join(' • ')}</p>` : ''}
                <p><strong>Date Range:</strong> ${returnPeriodText} • <strong>Records:</strong> ${filteredReturnHistory.length}</p>
              </div>
            </div>
            <div style="text-align:right">
              <p><strong>Printed:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div class="summary-bar">
            <div class="summary-card">Total Returns<strong>${filteredReturnHistory.length} entries</strong></div>
            <div class="summary-card">Sales Return Qty (+)<strong>${salesReturnQty.toLocaleString()} pcs</strong></div>
            <div class="summary-card">Purchase Return Qty (-)<strong>${purchaseReturnQty.toLocaleString()} pcs</strong></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Return #</th>
                <th>Product</th>
                <th>Type</th>
                <th class="text-right">Qty</th>
                <th>Reason</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              ${
                rowsHtml ||
                `<tr><td colspan="7" style="text-align:center;padding:16px;">No return records found for selected dates.</td></tr>`
              }
            </tbody>
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
      {/* Header & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Inventory Stock Ledger</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Track buy/sell prices, stock summary values, ledger movements, and returns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" /> Excel
          </button>

          <button
            type="button"
            onClick={handlePrintProducts}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4 text-slate-700" /> Print ({filteredProducts.length})
          </button>

          <button
            type="button"
            onClick={handleOpenHistory}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition"
          >
            <History className="w-4 h-4 text-indigo-600" /> Return History
          </button>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Total Stock Summary Value Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Stock Qty</p>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {stockSummary.totalUnits.toLocaleString()}{' '}
            <span className="text-xs font-medium text-slate-500">pcs</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {filteredProducts.length} filtered items
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase">Stock Value (Buy Price)</p>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-700 mt-1">
            ৳ {stockSummary.totalBuyValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Total invested stock cost</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase">Stock Value (Sell Price)</p>
          <p className="text-xl sm:text-2xl font-extrabold text-indigo-700 mt-1">
            ৳ {stockSummary.totalSellValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Potential total sales value</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase">Expected Stock Profit</p>
          <p
            className={`text-xl sm:text-2xl font-extrabold mt-1 ${
              expectedProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {expectedProfit >= 0 ? '+' : ''}৳ {expectedProfit.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Sell value minus buy value</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 flex items-center gap-2.5 border border-slate-200 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Stock Status</option>
            <option value="IN_STOCK">In Stock Only</option>
            <option value="LOW">Low Stock Only</option>
          </select>
        </div>
      </div>

      {/* Stock Ledger Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1160px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Product & SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Buy Price</th>
                <th className="py-3.5 px-4 text-right">Sell Price</th>
                <th className="py-3.5 px-4 text-right">Opening</th>
                <th className="py-3.5 px-4 text-right">Purchase (IN)</th>
                <th className="py-3.5 px-4 text-right">Sell (OUT)</th>
                <th className="py-3.5 px-4 text-right">Return</th>
                <th className="py-3.5 px-4 text-right">Current Stock</th>
                <th className="py-3.5 px-4 text-right">Stock Value</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedProducts.map(p => {
                const { opening, purchased, sold, returned, current, isLow } = getStockMetrics(p);
                const buyVal = Number(p.buyPrice ?? 0);
                const sellVal = Number(p.sellPrice ?? p.price ?? 0);
                const rowBuyValue = current * buyVal;
                const rowSellValue = current * sellVal;

                return (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{p.name}</p>
                      <span className="text-xs font-mono text-slate-400">{p.sku}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                      ৳ {buyVal.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-indigo-700">
                      ৳ {sellVal.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-600 font-medium">
                      {opening}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-700 font-semibold">
                      +{purchased}
                    </td>
                    <td className="py-3.5 px-4 text-right text-amber-700 font-semibold">
                      -{sold}
                    </td>
                    <td className="py-3.5 px-4 text-right text-indigo-700 font-semibold">
                      {returned >= 0 ? `+${returned}` : returned}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {current} pcs
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs">
                      <div className="font-bold text-amber-700">
                        Buy: ৳{rowBuyValue.toLocaleString()}
                      </div>
                      <div className="font-semibold text-indigo-700">
                        Sell: ৳{rowSellValue.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setReturnModal({ open: true, product: p })}
                          title="Process Return"
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Return
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(p._id)}
                            title="Delete Product"
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

              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan="12" className="py-8 text-center text-slate-400 text-sm">
                    No products found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Table Grand Total Footer */}
            {filteredProducts.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200 text-xs sm:text-sm font-bold text-slate-900">
                  <td colSpan="4" className="py-3.5 px-4 uppercase text-xs text-slate-600">
                    Filtered Total ({filteredProducts.length} Products)
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-700">
                    {stockSummary.totalOpening}
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-700">
                    +{stockSummary.totalPurchased}
                  </td>
                  <td className="py-3.5 px-4 text-right text-amber-700">
                    -{stockSummary.totalSold}
                  </td>
                  <td className="py-3.5 px-4 text-right text-indigo-700">
                    {stockSummary.totalReturned >= 0
                      ? `+${stockSummary.totalReturned}`
                      : stockSummary.totalReturned}
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-900">
                    {stockSummary.totalUnits.toLocaleString()} pcs
                  </td>
                  <td className="py-3.5 px-4 text-right text-xs">
                    <div className="font-extrabold text-amber-700">
                      Buy: ৳{stockSummary.totalBuyValue.toLocaleString()}
                    </div>
                    <div className="font-extrabold text-indigo-700">
                      Sell: ৳{stockSummary.totalSellValue.toLocaleString()}
                    </div>
                  </td>
                  <td colSpan="2" className="py-3.5 px-4 text-right text-xs">
                    <span
                      className={`font-extrabold ${
                        expectedProfit >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      Est. Profit: {expectedProfit >= 0 ? '+' : ''}৳
                      {expectedProfit.toLocaleString()}
                    </span>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Mobile / Tablet Card View (< lg) */}
        <div className="lg:hidden divide-y divide-slate-100">
          {paginatedProducts.map(p => {
            const { opening, purchased, sold, returned, current, isLow } = getStockMetrics(p);
            const buyVal = Number(p.buyPrice ?? 0);
            const sellVal = Number(p.sellPrice ?? p.price ?? 0);

            return (
              <div key={p._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{p.name}</h4>
                    <p className="text-xs text-slate-500">
                      <span className="font-mono">{p.sku}</span> • {p.category}
                    </p>
                  </div>
                  {isLow ? (
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                      <AlertTriangle className="w-3 h-3" /> Low
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> In Stock
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 block">Buy / Sell</span>
                    <span className="font-semibold text-slate-800">
                      ৳{buyVal} / ৳{sellVal}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Opening</span>
                    <span className="font-semibold text-slate-700">{opening}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">IN / OUT</span>
                    <span className="font-semibold">
                      <span className="text-emerald-700">+{purchased}</span> /{' '}
                      <span className="text-amber-700">-{sold}</span>
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Ret / Stock</span>
                    <span className="font-bold text-slate-900">
                      ({returned >= 0 ? `+${returned}` : returned}) {current} pcs
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <span className="font-semibold text-amber-700">
                    Buy Val: ৳{(current * buyVal).toLocaleString()}
                  </span>
                  <span className="font-semibold text-indigo-700">
                    Sell Val: ৳{(current * sellVal).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReturnModal({ open: true, product: p })}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Return
                  </button>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDelete(p._id)}
                      title="Delete Product"
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {paginatedProducts.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              No products found matching your filters.
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {filteredProducts.length > 0 && (
          <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <p className="text-slate-500">
              Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-700">{filteredProducts.length}</span> products
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

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-800">Add New Product</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name</label>
                <input
                  placeholder="e.g. Wireless Mouse"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">SKU Code</label>
                  <input
                    placeholder="WM-101"
                    value={form.sku}
                    onChange={e => setForm({ ...form, sku: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <input
                    placeholder="Electronics"
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Buy Price (৳)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="400"
                    value={form.buyPrice}
                    onChange={e => setForm({ ...form, buyPrice: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sell Price (৳)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="550"
                    value={form.sellPrice}
                    onChange={e => setForm({ ...form, sellPrice: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Opening Stock</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.openingStock}
                    onChange={e => setForm({ ...form, openingStock: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Alert Level</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minStockLevel}
                    onChange={e => setForm({ ...form, minStockLevel: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-xl text-sm font-medium transition"
                >
                  {loading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Return Modal */}
      {returnModal.open && returnModal.product && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Process Stock Return</h3>
                <p className="text-xs text-slate-500">
                  {returnModal.product.name} ({returnModal.product.sku}) — Current Stock: {returnModal.product.quantity}
                </p>
              </div>
              <button type="button" onClick={() => setReturnModal({ open: false, product: null })} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReturnSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Return Type</label>
                <select
                  value={returnForm.returnType}
                  onChange={e => setReturnForm({ ...returnForm, returnType: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="SALES_RETURN">Sales Return (Customer Return → Stock +)</option>
                  <option value="PURCHASE_RETURN">Purchase Return (Return to Supplier → Stock -)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Return Quantity</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Enter quantity"
                  value={returnForm.amount}
                  onChange={e => setReturnForm({ ...returnForm, amount: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Reason / Note (Optional)</label>
                <input
                  placeholder="e.g. Damaged item or client exchange"
                  value={returnForm.reason}
                  onChange={e => setReturnForm({ ...returnForm, reason: e.target.value })}
                  className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReturnModal({ open: false, product: null })}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2.5 rounded-xl text-sm font-medium transition"
                >
                  {loading ? 'Processing...' : 'Confirm Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return History Modal */}
      {/* {historyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Stock Return History</h3>
                <p className="text-xs text-slate-500">All recorded sales and purchase returns</p>
              </div>
              <button type="button" onClick={() => setHistoryModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {loadingHistory ? (
                <p className="text-center py-8 text-sm text-slate-500">Loading return history...</p>
              ) : returnHistory.length === 0 ? (
                <p className="text-center py-8 text-sm text-slate-400">No return records found.</p>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
                      <th className="p-3">Return #</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {returnHistory.map(item => (
                      <tr key={item._id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-xs font-semibold text-slate-700">{item.returnNumber}</td>
                        <td className="p-3">
                          <p className="font-medium text-slate-800">{item.product?.name || 'Deleted Product'}</p>
                          <span className="text-xs text-slate-400">{item.product?.sku}</span>
                        </td>
                        <td className="p-3">
                          {item.returnType === 'SALES_RETURN' ? (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                              Sales Return (+)
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                              Purchase Return (-)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-800">{item.quantity}</td>
                        <td className="p-3 text-xs text-slate-600">{item.reason || '-'}</td>
                        <td className="p-3 text-xs text-slate-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )} */}


      {/* Return History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full p-6 max-h-[88vh] flex flex-col">
            <div className="flex flex-wrap justify-between items-center border-b border-slate-100 pb-4 mb-4 gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Stock Return History</h3>
                <p className="text-xs text-slate-500">All recorded sales and purchase returns</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintReturnHistory}
                  disabled={loadingHistory || filteredReturnHistory.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" /> Print History
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Date Wise Filter Bar */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">From Date</label>
                <input
                  type="date"
                  value={historyFromDate}
                  onChange={e => setHistoryFromDate(e.target.value)}
                  className="w-full border border-slate-200 bg-white px-2.5 py-1.5 rounded-lg text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">To Date</label>
                <input
                  type="date"
                  value={historyToDate}
                  onChange={e => setHistoryToDate(e.target.value)}
                  className="w-full border border-slate-200 bg-white px-2.5 py-1.5 rounded-lg text-xs outline-none focus:border-indigo-500"
                />
              </div>
              <div className="sm:col-span-2 flex items-center justify-between gap-2 text-xs text-slate-600 px-1">
                <span>
                  Showing <strong>{filteredReturnHistory.length}</strong> records ({returnPeriodText})
                </span>
                {(historyFromDate || historyToDate) && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistoryFromDate('');
                      setHistoryToDate('');
                    }}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Clear Dates
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {loadingHistory ? (
                <p className="text-center py-8 text-sm text-slate-500">Loading return history...</p>
              ) : filteredReturnHistory.length === 0 ? (
                <p className="text-center py-8 text-sm text-slate-400">
                  No return records found for selected date range.
                </p>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
                      <th className="p-3">Return #</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Type</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3">Reason</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReturnHistory.map(item => (
                      <tr key={item._id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-xs font-semibold text-slate-700">
                          {item.returnNumber}
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-slate-800">
                            {item.product?.name || 'Deleted Product'}
                          </p>
                          <span className="text-xs text-slate-400">{item.product?.sku}</span>
                        </td>
                        <td className="p-3">
                          {item.returnType === 'SALES_RETURN' ? (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                              Sales Return (+)
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md text-xs font-semibold">
                              Purchase Return (-)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-800">{item.quantity}</td>
                        <td className="p-3 text-xs text-slate-600">{item.reason || '-'}</td>
                        <td className="p-3 text-xs text-slate-500">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}