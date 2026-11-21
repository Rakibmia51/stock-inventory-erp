import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PackageMinus,
  PlusCircle,
  MinusCircle,
  Printer,
  Download,
  Calendar
} from 'lucide-react';

const formatDateInput = (dateObj) => {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getPresetRange = (preset) => {
  const now = new Date();
  const todayStr = formatDateInput(now);

  if (preset === 'THIS_MONTH') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { fromDate: formatDateInput(start), toDate: todayStr };
  }
  if (preset === 'LAST_30_DAYS') {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return { fromDate: formatDateInput(start), toDate: todayStr };
  }
  if (preset === 'THIS_YEAR') {
    const start = new Date(now.getFullYear(), 0, 1);
    return { fromDate: formatDateInput(start), toDate: todayStr };
  }
  return { fromDate: '', toDate: '' };
};

const isWithinRange = (rawDate, fromStr, toStr) => {
  if (!fromStr && !toStr) return true;
  if (!rawDate) return false;
  const d = new Date(rawDate);
  if (Number.isNaN(d.getTime())) return false;

  if (fromStr) {
    const start = new Date(`${fromStr}T00:00:00`);
    if (d < start) return false;
  }
  if (toStr) {
    const end = new Date(`${toStr}T23:59:59.999`);
    if (d > end) return false;
  }
  return true;
};

export default function ProfitLoss({
  invoices = [],
  products = [],
  transactions = [],
  accountTransactions = []
}) {
  const initialRange = getPresetRange('THIS_MONTH');
  const [preset, setPreset] = useState('THIS_MONTH');
  const [fromDate, setFromDate] = useState(initialRange.fromDate);
  const [toDate, setToDate] = useState(initialRange.toDate);

  const invoiceList = Array.isArray(invoices) ? invoices : [];
  const productList = Array.isArray(products) ? products : [];
  const txList = Array.isArray(transactions)
    ? transactions
    : Array.isArray(accountTransactions)
    ? accountTransactions
    : [];

  const handlePresetClick = (nextPreset) => {
    setPreset(nextPreset);
    const range = getPresetRange(nextPreset);
    setFromDate(range.fromDate);
    setToDate(range.toDate);
  };

  // Lookup map for product buyPrice fallback
  const productById = useMemo(() => {
    const map = new Map();
    for (const p of productList) {
      if (p?._id) map.set(String(p._id), p);
    }
    return map;
  }, [productList]);

  const pnl = useMemo(() => {
    const filteredInvoices = invoiceList.filter(inv => {
      const status = String(inv?.status || '').toLowerCase();
      if (status === 'cancelled' || status === 'void') return false;
      return isWithinRange(inv?.createdAt || inv?.date, fromDate, toDate);
    });

    let salesRevenue = 0;
    let cogs = 0;
    const itemBreakdownMap = new Map();

    for (const inv of filteredInvoices) {
      const lineItems = Array.isArray(inv?.items) ? inv.items : [];

      if (lineItems.length > 0) {
        let invoiceItemsTotal = 0;

        for (const line of lineItems) {
          const qty = Number(line?.quantity ?? line?.qty ?? 0);
          const sellUnit = Number(
            line?.sellPrice ?? line?.unitPrice ?? line?.price ?? 0
          );
          const lineRevenue =
            line?.total !== undefined && line?.total !== null
              ? Number(line.total)
              : qty * sellUnit;

          invoiceItemsTotal += lineRevenue;

          const rawProdId =
            typeof line?.product === 'string'
              ? line.product
              : line?.product?._id || '';
          const catalogProd = rawProdId ? productById.get(String(rawProdId)) : null;

          const buyUnit = Number(
            line?.buyPrice ??
              line?.costPrice ??
              line?.product?.buyPrice ??
              catalogProd?.buyPrice ??
              0
          );
          const lineCogs = qty * buyUnit;
          cogs += lineCogs;

          const prodName =
            line?.product?.name ||
            line?.name ||
            catalogProd?.name ||
            'Product Item';
          const key = rawProdId || prodName;

          const existing = itemBreakdownMap.get(key) || {
            name: prodName,
            qty: 0,
            revenue: 0,
            cogs: 0
          };
          existing.qty += qty;
          existing.revenue += lineRevenue;
          existing.cogs += lineCogs;
          itemBreakdownMap.set(key, existing);
        }

        // If invoice has a discount or explicit grandTotal/totalAmount, respect invoice total while keeping line COGS
        const explicitInvTotal =
          inv?.grandTotal ?? inv?.totalAmount ?? inv?.subTotal;
        if (explicitInvTotal !== undefined && explicitInvTotal !== null) {
          salesRevenue += Number(explicitInvTotal);
        } else {
          salesRevenue += invoiceItemsTotal;
        }
      } else {
        const invAmt = Number(inv?.grandTotal ?? inv?.totalAmount ?? inv?.subTotal ?? 0);
        salesRevenue += invAmt;
      }
    }

    const filteredTx = txList.filter(tx =>
      isWithinRange(tx?.transactionDate || tx?.createdAt, fromDate, toDate)
    );

    const incomeEntries = filteredTx.filter(tx => tx?.entryType === 'INCOME');
    const expenseEntries = filteredTx.filter(tx => tx?.entryType === 'EXPENSE');

    const otherIncome = incomeEntries.reduce(
      (sum, tx) => sum + Number(tx?.amount || 0),
      0
    );
    const totalExpenses = expenseEntries.reduce(
      (sum, tx) => sum + Number(tx?.amount || 0),
      0
    );

    const grossProfit = salesRevenue - cogs;
    const netProfit = grossProfit + otherIncome - totalExpenses;
    const grossMarginPct =
      salesRevenue > 0 ? ((grossProfit / salesRevenue) * 100).toFixed(1) : '0.0';
    const netMarginPct =
      salesRevenue > 0 ? ((netProfit / salesRevenue) * 100).toFixed(1) : '0.0';

    const topProducts = Array.from(itemBreakdownMap.values())
      .map(p => ({
        ...p,
        profit: p.revenue - p.cogs
      }))
      .sort((a, b) => b.profit - a.profit);

    return {
      invoiceCount: filteredInvoices.length,
      salesRevenue,
      cogs,
      grossProfit,
      otherIncome,
      incomeCount: incomeEntries.length,
      totalExpenses,
      expenseCount: expenseEntries.length,
      netProfit,
      grossMarginPct,
      netMarginPct,
      topProducts
    };
  }, [invoiceList, productById, txList, fromDate, toDate]);

  const periodLabel = useMemo(() => {
    if (fromDate && toDate) return `${fromDate} to ${toDate}`;
    if (fromDate) return `From ${fromDate}`;
    if (toDate) return `Up to ${toDate}`;
    return 'All Time';
  }, [fromDate, toDate]);

  const handleDownloadExcel = () => {
    const headers = ['Particulars', 'Details', 'Amount (৳)'];
    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = [
      ['Sales Revenue', `${pnl.invoiceCount} Invoices`, pnl.salesRevenue],
      ['Less: Cost of Goods Sold (COGS)', 'Based on product buyPrice', -pnl.cogs],
      ['Gross Profit', `Margin ${pnl.grossMarginPct}%`, pnl.grossProfit],
      ['Add: Other Income', `${pnl.incomeCount} Entries`, pnl.otherIncome],
      ['Less: Operating Expenses', `${pnl.expenseCount} Entries`, -pnl.totalExpenses],
      ['Net Profit / (Loss)', `Margin ${pnl.netMarginPct}%`, pnl.netProfit]
    ];

    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join(
        '\n'
      );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Profit_And_Loss_${fromDate || 'all'}_${toDate || 'now'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'height=750,width=950');

    const productRowsHtml = pnl.topProducts
      .slice(0, 15)
      .map(
        (p, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${p.name}</td>
          <td class="text-right">${p.qty}</td>
          <td class="text-right">৳${Number(p.revenue || 0).toLocaleString()}</td>
          <td class="text-right">৳${Number(p.cogs || 0).toLocaleString()}</td>
          <td class="text-right">৳${Number(p.profit || 0).toLocaleString()}</td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Profit & Loss Statement</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 18px; }
            h2 { margin: 0 0 4px 0; font-size: 20px; }
            h3 { margin: 22px 0 8px 0; font-size: 14px; }
            p { margin: 2px 0; font-size: 12px; color: #475569; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border-bottom: 1px solid #e2e8f0; padding: 8px 6px; text-align: left; }
            th { background: #f8fafc; font-weight: bold; }
            .row-bold td { font-weight: bold; background: #f8fafc; }
            .row-net td { font-weight: bold; font-size: 13px; border-top: 2px solid #0f172a; border-bottom: 2px solid #0f172a; background: #f1f5f9; }
            .text-right { text-align: right; }
            .signatures { display: flex; justify-content: space-between; margin-top: 55px; }
            .sig-box { width: 180px; border-top: 1px solid #64748b; text-align: center; padding-top: 5px; font-size: 11px; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>PROFIT & LOSS STATEMENT</h2>
              <p><strong>Period:</strong> ${periodLabel}</p>
            </div>
            <div style="text-align:right">
              <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Particulars</th>
                <th>Notes</th>
                <th class="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sales Revenue</td>
                <td>${pnl.invoiceCount} invoices</td>
                <td class="text-right">৳${pnl.salesRevenue.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Less: Cost of Goods Sold (COGS)</td>
                <td>Product buyPrice</td>
                <td class="text-right">(৳${pnl.cogs.toLocaleString()})</td>
              </tr>
              <tr class="row-bold">
                <td>Gross Profit</td>
                <td>Gross Margin: ${pnl.grossMarginPct}%</td>
                <td class="text-right">৳${pnl.grossProfit.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Add: Other Income</td>
                <td>${pnl.incomeCount} entries</td>
                <td class="text-right">৳${pnl.otherIncome.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Less: Operating Expenses</td>
                <td>${pnl.expenseCount} entries</td>
                <td class="text-right">(৳${pnl.totalExpenses.toLocaleString()})</td>
              </tr>
              <tr class="row-net">
                <td>Net ${pnl.netProfit >= 0 ? 'Profit' : 'Loss'}</td>
                <td>Net Margin: ${pnl.netMarginPct}%</td>
                <td class="text-right">৳${pnl.netProfit.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          ${
            pnl.topProducts.length > 0
              ? `
            <h3>Item-wise Gross Profit Breakdown</h3>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th class="text-right">Sold Qty</th>
                  <th class="text-right">Sales</th>
                  <th class="text-right">COGS</th>
                  <th class="text-right">Gross Profit</th>
                </tr>
              </thead>
              <tbody>${productRowsHtml}</tbody>
            </table>
          `
              : ''
          }

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

  const isNetPositive = pnl.netProfit >= 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header & Export/Print */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            Profit & Loss Statement
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sales revenue minus product buyPrice COGS, plus other income, minus expenses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
            <Printer className="w-4 h-4 text-indigo-600" /> Print Report
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'THIS_MONTH', label: 'This Month' },
            { id: 'LAST_30_DAYS', label: 'Last 30 Days' },
            { id: 'THIS_YEAR', label: 'This Year' },
            { id: 'ALL_TIME', label: 'All Time' }
          ].map(item => (
            <button
              key={item.id}
              type="button"
              onClick={() => handlePresetClick(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                preset === item.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              From Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={fromDate}
                onChange={e => {
                  setPreset('CUSTOM');
                  setFromDate(e.target.value);
                }}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={e => {
                setPreset('CUSTOM');
                setToDate(e.target.value);
              }}
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200/70">
            <Calendar className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Active Range: <strong className="text-slate-700">{periodLabel}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Sales Revenue</p>
            <p className="text-lg sm:text-xl font-extrabold text-slate-900 mt-1">
              ৳ {pnl.salesRevenue.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{pnl.invoiceCount} invoices</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">COGS (buyPrice)</p>
            <p className="text-lg sm:text-xl font-extrabold text-amber-700 mt-1">
              ৳ {pnl.cogs.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Gross Profit: ৳{pnl.grossProfit.toLocaleString()}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
            <PackageMinus className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Other Income</p>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1">
              ৳ {pnl.otherIncome.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{pnl.incomeCount} entries</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
            <PlusCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Expenses</p>
            <p className="text-lg sm:text-xl font-extrabold text-red-600 mt-1">
              ৳ {pnl.totalExpenses.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{pnl.expenseCount} entries</p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-red-600 shrink-0">
            <MinusCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Statement Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Income & Expenditure Summary</h3>
            <p className="text-xs text-slate-500">Period: {periodLabel}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              isNetPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {isNetPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            {isNetPositive ? 'Net Profit' : 'Net Loss'}: ৳ {Math.abs(pnl.netProfit).toLocaleString()}
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-sm">
          <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800">Sales Revenue</p>
              <p className="text-xs text-slate-400">{pnl.invoiceCount} sales invoices</p>
            </div>
            <span className="font-bold text-slate-900">
              ৳ {pnl.salesRevenue.toLocaleString()}
            </span>
          </div>

          <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-700">Less: Cost of Goods Sold (COGS)</p>
              <p className="text-xs text-slate-400">Calculated from product buyPrice</p>
            </div>
            <span className="font-semibold text-amber-700">
              - ৳ {pnl.cogs.toLocaleString()}
            </span>
          </div>

          <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between bg-slate-50/80">
            <div>
              <p className="font-bold text-slate-900">Gross Profit</p>
              <p className="text-xs text-slate-500">Gross Margin: {pnl.grossMarginPct}%</p>
            </div>
            <span
              className={`font-extrabold ${
                pnl.grossProfit >= 0 ? 'text-indigo-700' : 'text-red-600'
              }`}
            >
              ৳ {pnl.grossProfit.toLocaleString()}
            </span>
          </div>

          <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-700">Add: Other Income</p>
              <p className="text-xs text-slate-400">{pnl.incomeCount} income entries</p>
            </div>
            <span className="font-semibold text-emerald-700">
              + ৳ {pnl.otherIncome.toLocaleString()}
            </span>
          </div>

          <div className="px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-700">Less: Operating Expenses</p>
              <p className="text-xs text-slate-400">{pnl.expenseCount} expense entries</p>
            </div>
            <span className="font-semibold text-red-600">
              - ৳ {pnl.totalExpenses.toLocaleString()}
            </span>
          </div>

          <div
            className={`px-4 sm:px-6 py-4 flex items-center justify-between ${
              isNetPositive ? 'bg-emerald-50/60' : 'bg-red-50/60'
            }`}
          >
            <div>
              <p className="font-extrabold text-base text-slate-900">
                Net {isNetPositive ? 'Profit' : 'Loss'}
              </p>
              <p className="text-xs text-slate-500">Net Margin: {pnl.netMarginPct}%</p>
            </div>
            <span
              className={`text-lg sm:text-xl font-extrabold ${
                isNetPositive ? 'text-emerald-700' : 'text-red-600'
              }`}
            >
              {isNetPositive ? '' : '-'}৳ {Math.abs(pnl.netProfit).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Product Gross Profit Breakdown */}
      {pnl.topProducts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-base">
              Product-wise Gross Profit ({periodLabel})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4 text-right">Sold Qty</th>
                  <th className="py-3 px-4 text-right">Sales</th>
                  <th className="py-3 px-4 text-right">COGS</th>
                  <th className="py-3 px-4 text-right">Gross Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {pnl.topProducts.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-3 px-4 text-right text-slate-600">{item.qty}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-800">
                      ৳ {Number(item.revenue || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-amber-700">
                      ৳ {Number(item.cogs || 0).toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        item.profit >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      ৳ {Number(item.profit || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}