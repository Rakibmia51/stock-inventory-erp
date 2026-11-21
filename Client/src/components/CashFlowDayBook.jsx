import { useState, useMemo } from 'react';
import {
  Banknote,
  Landmark,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Download,
  Calendar,
  Search
} from 'lucide-react';

const METHODS = ['Cash', 'Bank', 'Mobile Banking'];

const formatDateInput = (dateObj) => {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeMethod = (rawMethod) => {
  if (rawMethod === 'Cash' || rawMethod === 'Bank' || rawMethod === 'Mobile Banking') {
    return rawMethod;
  }
  return 'Cash';
};

const parseDateSafe = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? null : d;
};

export default function CashFlowDayBook({
  invoices = [],
  purchases = [],
  transactions = [],
  accountTransactions = []
}) {
  const todayStr = formatDateInput(new Date());
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const invoiceList = Array.isArray(invoices) ? invoices : [];
  const purchaseList = Array.isArray(purchases) ? purchases : [];
  const txList = Array.isArray(transactions)
    ? transactions
    : Array.isArray(accountTransactions)
    ? accountTransactions
    : [];

  // Build unified cash/bank/mobile movement list
  const allMovements = useMemo(() => {
    const list = [];

    for (const inv of invoiceList) {
      const status = String(inv?.status || '').toLowerCase();
      if (status === 'cancelled' || status === 'void') continue;
      const paid = Number(inv?.paidAmount || 0);
      if (paid <= 0) continue;

      const dt = parseDateSafe(inv?.createdAt || inv?.date);
      if (!dt) continue;

      const method = normalizeMethod(inv?.paymentMethod);
      const clientName = inv?.client?.name || inv?.clientName || 'Walk-in / Client';

      list.push({
        id: `inv-${inv._id}`,
        date: dt,
        refNo: inv?.invoiceNumber || `INV-${String(inv._id || '').slice(-5).toUpperCase()}`,
        type: 'INFLOW',
        category: 'Sales Collection',
        description: `Invoice payment from ${clientName}`,
        method,
        provider: inv?.mobileProvider || '',
        inflow: paid,
        outflow: 0
      });
    }

    for (const pur of purchaseList) {
      const status = String(pur?.status || '').toLowerCase();
      if (status === 'cancelled') continue;
      const paid = Number(pur?.paidAmount || 0);
      if (paid <= 0) continue;

      const dt = parseDateSafe(pur?.createdAt || pur?.date);
      if (!dt) continue;

      const method = normalizeMethod(pur?.paymentMethod);
      const supName =
        pur?.supplier?.companyName || pur?.supplier?.name || 'Supplier';

      list.push({
        id: `pur-${pur._id}`,
        date: dt,
        refNo: pur?.purchaseNumber || `PO-${String(pur._id || '').slice(-5).toUpperCase()}`,
        type: 'OUTFLOW',
        category: 'Purchase Payment',
        description: `Purchase paid to ${supName}`,
        method,
        provider: pur?.mobileProvider || '',
        inflow: 0,
        outflow: paid
      });
    }

    for (const tx of txList) {
      if (tx?.paymentMethod === 'Adjustment') continue;
      const amt = Number(tx?.amount || 0);
      if (amt <= 0) continue;

      const dt = parseDateSafe(tx?.transactionDate || tx?.createdAt);
      if (!dt) continue;

      const method = normalizeMethod(tx?.paymentMethod);
      const entryType = tx?.entryType || 'OTHERS';

      const partyName =
        tx?.client?.name ||
        tx?.supplier?.companyName ||
        tx?.supplier?.name ||
        '';

      let inflow = 0;
      let outflow = 0;
      let type = 'INFLOW';

      if (entryType === 'INCOME' || entryType === 'DUE_COLLECTION') {
        inflow = amt;
        type = 'INFLOW';
      } else if (entryType === 'EXPENSE' || entryType === 'SUPPLIER_PAYMENT') {
        outflow = amt;
        type = 'OUTFLOW';
      } else {
        // OTHERS
        if (amt >= 0) {
          inflow = amt;
          type = 'INFLOW';
        } else {
          outflow = Math.abs(amt);
          type = 'OUTFLOW';
        }
      }

      list.push({
        id: `tx-${tx._id}`,
        date: dt,
        refNo: tx?.voucherNumber || `TX-${String(tx._id || '').slice(-5).toUpperCase()}`,
        type,
        category: tx?.category || entryType,
        description: `${tx?.title || entryType}${partyName ? ` (${partyName})` : ''}`,
        method,
        provider: tx?.mobileProvider || '',
        inflow,
        outflow
      });
    }

    list.sort((a, b) => a.date - b.date);
    return list;
  }, [invoiceList, purchaseList, txList]);

  // Calculate Opening (before fromDate) and Period Inflow/Outflow per method
  const report = useMemo(() => {
    const startBound = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const endBound = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

    const perMethod = {
      Cash: { opening: 0, inflow: 0, outflow: 0, closing: 0 },
      Bank: { opening: 0, inflow: 0, outflow: 0, closing: 0 },
      'Mobile Banking': { opening: 0, inflow: 0, outflow: 0, closing: 0 }
    };

    const periodEntries = [];

    for (const mv of allMovements) {
      const mKey = normalizeMethod(mv.method);
      const delta = Number(mv.inflow || 0) - Number(mv.outflow || 0);

      if (startBound && mv.date < startBound) {
        perMethod[mKey].opening += delta;
      } else if ((!startBound || mv.date >= startBound) && (!endBound || mv.date <= endBound)) {
        perMethod[mKey].inflow += Number(mv.inflow || 0);
        perMethod[mKey].outflow += Number(mv.outflow || 0);
        periodEntries.push(mv);
      }
    }

    for (const mKey of METHODS) {
      const row = perMethod[mKey];
      row.closing = row.opening + row.inflow - row.outflow;
    }

    const total = {
      opening: METHODS.reduce((s, k) => s + perMethod[k].opening, 0),
      inflow: METHODS.reduce((s, k) => s + perMethod[k].inflow, 0),
      outflow: METHODS.reduce((s, k) => s + perMethod[k].outflow, 0),
      closing: METHODS.reduce((s, k) => s + perMethod[k].closing, 0)
    };

    return { perMethod, total, periodEntries };
  }, [allMovements, fromDate, toDate]);

  const filteredDayBook = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return report.periodEntries
      .filter(item => {
        const matchesMethod =
          methodFilter === 'ALL' || item.method === methodFilter;
        const matchesQuery =
          !q ||
          (item.refNo || '').toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          (item.provider || '').toLowerCase().includes(q);
        return matchesMethod && matchesQuery;
      })
      .reverse(); // Newest first in Day Book table
  }, [report.periodEntries, methodFilter, searchTerm]);

  const periodLabel = useMemo(() => {
    if (fromDate && toDate) {
      return fromDate === toDate ? `Day Book: ${fromDate}` : `${fromDate} to ${toDate}`;
    }
    if (fromDate) return `From ${fromDate}`;
    if (toDate) return `Up to ${toDate}`;
    return 'All Dates';
  }, [fromDate, toDate]);

  const handleDownloadExcel = () => {
    const headers = [
      'Account / Channel',
      'Opening Balance (৳)',
      'Inflow (৳)',
      'Outflow (৳)',
      'Closing Balance (৳)'
    ];
    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const summaryRows = [
      ...METHODS.map(m => [
        m,
        report.perMethod[m].opening,
        report.perMethod[m].inflow,
        report.perMethod[m].outflow,
        report.perMethod[m].closing
      ]),
      [
        'TOTAL',
        report.total.opening,
        report.total.inflow,
        report.total.outflow,
        report.total.closing
      ]
    ];

    const dayBookHeaders = [
      'SL',
      'Date',
      'Time',
      'Ref #',
      'Channel',
      'Category',
      'Description',
      'Inflow (৳)',
      'Outflow (৳)'
    ];

    const dayBookRows = filteredDayBook.map((item, idx) => [
      idx + 1,
      item.date.toLocaleDateString(),
      item.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      item.refNo,
      item.provider ? `${item.method} (${item.provider})` : item.method,
      item.category,
      item.description,
      item.inflow,
      item.outflow
    ]);

    const csvContent =
      '\uFEFF' +
      [
        headers.map(escapeCsv).join(','),
        ...summaryRows.map(r => r.map(escapeCsv).join(',')),
        '',
        'DAY BOOK TRANSACTIONS',
        dayBookHeaders.map(escapeCsv).join(','),
        ...dayBookRows.map(r => r.map(escapeCsv).join(','))
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `CashFlow_DayBook_${fromDate || 'all'}_${toDate || 'now'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'height=750,width=1000');

    const summaryHtml = METHODS.map(m => {
      const r = report.perMethod[m];
      return `
        <tr>
          <td><strong>${m}</strong></td>
          <td class="text-right">৳${r.opening.toLocaleString()}</td>
          <td class="text-right">৳${r.inflow.toLocaleString()}</td>
          <td class="text-right">৳${r.outflow.toLocaleString()}</td>
          <td class="text-right"><strong>৳${r.closing.toLocaleString()}</strong></td>
        </tr>
      `;
    }).join('');

    const entriesHtml = filteredDayBook
      .map(
        (item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${item.date.toLocaleDateString()}</td>
          <td><strong>${item.refNo}</strong></td>
          <td>${item.provider ? `${item.method} (${item.provider})` : item.method}</td>
          <td><strong>${item.category}</strong> — ${item.description}</td>
          <td class="text-right">${item.inflow > 0 ? `৳${item.inflow.toLocaleString()}` : '—'}</td>
          <td class="text-right">${item.outflow > 0 ? `৳${item.outflow.toLocaleString()}` : '—'}</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Cash Flow & Day Book Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 16px; }
            h2 { margin: 0 0 4px 0; font-size: 20px; }
            h3 { margin: 20px 0 8px 0; font-size: 14px; }
            p { margin: 2px 0; font-size: 12px; color: #475569; }
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
              <h2>CASH FLOW & DAY BOOK</h2>
              <p><strong>Period:</strong> ${periodLabel}</p>
            </div>
            <div style="text-align:right">
              <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <h3>Channel Cash Flow Summary</h3>
          <table>
            <thead>
              <tr>
                <th>Account / Channel</th>
                <th class="text-right">Opening</th>
                <th class="text-right">Inflow (+)</th>
                <th class="text-right">Outflow (-)</th>
                <th class="text-right">Closing</th>
              </tr>
            </thead>
            <tbody>${summaryHtml}</tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td class="text-right">৳${report.total.opening.toLocaleString()}</td>
                <td class="text-right">৳${report.total.inflow.toLocaleString()}</td>
                <td class="text-right">৳${report.total.outflow.toLocaleString()}</td>
                <td class="text-right">৳${report.total.closing.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <h3>Day Book Entries (${filteredDayBook.length})</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Ref #</th>
                <th>Channel</th>
                <th>Details</th>
                <th class="text-right">Inflow</th>
                <th class="text-right">Outflow</th>
              </tr>
            </thead>
            <tbody>
              ${
                entriesHtml ||
                `<tr><td colspan="7" style="text-align:center;padding:16px;">No cash movements in this period.</td></tr>`
              }
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-box">Prepared By</div>
            <div class="sig-box">Cashier / Accounts</div>
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

  const methodIcon = (m) => {
    if (m === 'Bank') return <Landmark className="w-5 h-5 text-indigo-600" />;
    if (m === 'Mobile Banking') return <Smartphone className="w-5 h-5 text-violet-600" />;
    return <Banknote className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header & Export/Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            Cash Flow & Day Book
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Opening balance, cash/bank/mobile inflow & outflow, closing balance, and daily ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setFromDate(todayStr);
              setToDate(todayStr);
            }}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition"
          >
            Today
          </button>

          <button
            type="button"
            onClick={handleDownloadExcel}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm inline-flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" /> Excel
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-sm inline-flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4 text-indigo-600" /> Print
          </button>
        </div>
      </div>

      {/* Date Range Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200/70">
          <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Active: <strong className="text-slate-700">{periodLabel}</strong>
          </span>
        </div>
      </div>

      {/* Opening, Inflow, Outflow & Closing Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase">Opening Balance</p>
          <p className="text-lg sm:text-xl font-extrabold text-slate-800 mt-1">
            ৳ {report.total.opening.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Before {fromDate || 'start'}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Inflow (+)</p>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1">
            + ৳ {report.total.inflow.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Sales, Due Collection, Income</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Outflow (-)</p>
          <p className="text-lg sm:text-xl font-extrabold text-red-600 mt-1">
            - ৳ {report.total.outflow.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Purchases, Supplier Pay, Expense</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase">Closing Balance</p>
          <p className="text-lg sm:text-xl font-extrabold text-indigo-700 mt-1">
            ৳ {report.total.closing.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Cash + Bank + Mobile Banking</p>
        </div>
      </div>

      {/* Per-Channel Breakdown Cards (Cash / Bank / Mobile Banking) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {METHODS.map(m => {
          const r = report.perMethod[m];
          return (
            <div
              key={m}
              className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">{m}</h3>
                  <p className="text-[11px] text-slate-400">
                    {m === 'Mobile Banking' ? 'bKash / Nagad / Rocket' : `${m} account flow`}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  {methodIcon(m)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-slate-400 block">Opening</span>
                  <strong className="text-slate-700">৳ {r.opening.toLocaleString()}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Closing</span>
                  <strong className="text-indigo-700 text-sm">
                    ৳ {r.closing.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-emerald-600 block">Inflow (+)</span>
                  <strong className="text-emerald-700">
                    +৳ {r.inflow.toLocaleString()}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-red-500 block">Outflow (-)</span>
                  <strong className="text-red-600">-৳ {r.outflow.toLocaleString()}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Day Book Transactions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Day Book Entries ({filteredDayBook.length})
            </h3>
            <p className="text-xs text-slate-500">{periodLabel}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white text-slate-700 outline-none"
            >
              <option value="ALL">All Channels</option>
              <option value="Cash">Cash</option>
              <option value="Bank">Bank</option>
              <option value="Mobile Banking">Mobile Banking</option>
            </select>

            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search ref, category, details..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date & Ref</th>
                <th className="py-3.5 px-4">Channel</th>
                <th className="py-3.5 px-4">Particulars</th>
                <th className="py-3.5 px-4 text-right">Inflow (৳)</th>
                <th className="py-3.5 px-4 text-right">Outflow (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredDayBook.length > 0 ? (
                filteredDayBook.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-mono text-xs font-bold text-indigo-600">
                        {item.refNo}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.date.toLocaleDateString()}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {item.method}
                      {item.provider && (
                        <span className="block text-[11px] text-violet-700 font-semibold">
                          {item.provider}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800">
                        {item.inflow > 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />
                        )}
                        {item.category}
                      </span>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      {item.inflow > 0 ? `+৳ ${item.inflow.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-red-600">
                      {item.outflow > 0 ? `-৳ ${item.outflow.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 text-sm">
                    No cash movements recorded for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}