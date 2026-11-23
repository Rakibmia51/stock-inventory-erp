// import { useState, useMemo } from 'react';
// import {
//   FileSpreadsheet,
//   Printer,
//   Download,
//   Calendar,
//   TrendingUp,
//   ShoppingCart,
//   Package,
//   Users,
//   BarChart3,
//   Wallet
// } from 'lucide-react';

// const formatDateInput = (dateObj) => {
//   const d = new Date(dateObj);
//   const year = d.getFullYear();
//   const month = String(d.getMonth() + 1).padStart(2, '0');
//   const day = String(d.getDate()).padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

// const isWithinRange = (rawDate, fromStr, toStr) => {
//   if (!fromStr && !toStr) return true;
//   if (!rawDate) return false;
//   const d = new Date(rawDate);
//   if (Number.isNaN(d.getTime())) return false;

//   if (fromStr && d < new Date(`${fromStr}T00:00:00`)) return false;
//   if (toStr && d > new Date(`${toStr}T23:59:59.999`)) return false;
//   return true;
// };

// const REPORT_TABS = [
//   { id: 'SALES', label: 'Sales Report', icon: TrendingUp },
//   { id: 'PURCHASES', label: 'Purchase Report', icon: ShoppingCart },
//   { id: 'STOCK', label: 'Stock Valuation', icon: Package },
//   { id: 'DUES', label: 'Receivable & Payable', icon: Users },
//   { id: 'PNL', label: 'Profit & Loss', icon: BarChart3 },
//   { id: 'CASHFLOW', label: 'Cash & Bank Flow', icon: Wallet }
// ];

// export default function AllReports({
//   products = [],
//   suppliers = [],
//   clients = [],
//   invoices = [],
//   purchases = [],
//   transactions = [],
//   accountTransactions = []
// }) {
//   const now = new Date();
//   const monthStartStr = formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
//   const todayStr = formatDateInput(now);

//   const [activeReport, setActiveReport] = useState('SALES');
//   const [fromDate, setFromDate] = useState(monthStartStr);
//   const [toDate, setToDate] = useState(todayStr);

//   const productList = Array.isArray(products) ? products : [];
//   const supplierList = Array.isArray(suppliers) ? suppliers : [];
//   const clientList = Array.isArray(clients) ? clients : [];
//   const invoiceList = Array.isArray(invoices) ? invoices : [];
//   const purchaseList = Array.isArray(purchases) ? purchases : [];
//   const txList = Array.isArray(transactions)
//     ? transactions
//     : Array.isArray(accountTransactions)
//     ? accountTransactions
//     : [];

//   const periodLabel = useMemo(() => {
//     if (fromDate && toDate) return `${fromDate} to ${toDate}`;
//     if (fromDate) return `From ${fromDate}`;
//     if (toDate) return `Up to ${toDate}`;
//     return 'All Time';
//   }, [fromDate, toDate]);

//   // 1. Sales Report Data
//   const salesData = useMemo(() => {
//     const rows = invoiceList.filter(inv => {
//       const st = String(inv?.status || '').toLowerCase();
//       if (st === 'cancelled' || st === 'void') return false;
//       return isWithinRange(inv?.createdAt || inv?.date, fromDate, toDate);
//     });

//     const total = rows.reduce((s, i) => s + Number(i.grandTotal ?? i.totalAmount ?? 0), 0);
//     const paid = rows.reduce((s, i) => s + Number(i.paidAmount ?? 0), 0);
//     const due = rows.reduce((s, i) => s + Number(i.dueAmount ?? 0), 0);
//     return { rows, total, paid, due };
//   }, [invoiceList, fromDate, toDate]);

//   // 2. Purchase Report Data
//   const purchaseData = useMemo(() => {
//     const rows = purchaseList.filter(pur => {
//       if (String(pur?.status || '').toLowerCase() === 'cancelled') return false;
//       return isWithinRange(pur?.createdAt || pur?.date, fromDate, toDate);
//     });

//     const total = rows.reduce((s, p) => s + Number(p.totalAmount ?? 0), 0);
//     const paid = rows.reduce((s, p) => s + Number(p.paidAmount ?? 0), 0);
//     const due = rows.reduce((s, p) => s + Number(p.dueAmount ?? 0), 0);
//     return { rows, total, paid, due };
//   }, [purchaseList, fromDate, toDate]);

//   // 3. Stock Valuation Data
//   const stockData = useMemo(() => {
//     let totalUnits = 0;
//     let totalBuyValue = 0;
//     let totalSellValue = 0;

//     const rows = productList.map(p => {
//       const qty = Math.max(0, Number(p.quantity ?? 0));
//       const buyPrice = Number(p.buyPrice ?? 0);
//       const sellPrice = Number(p.sellPrice ?? p.price ?? 0);
//       const buyVal = qty * buyPrice;
//       const sellVal = qty * sellPrice;
//       const expProfit = sellVal - buyVal;

//       totalUnits += qty;
//       totalBuyValue += buyVal;
//       totalSellValue += sellVal;

//       return {
//         ...p,
//         qty,
//         buyPrice,
//         sellPrice,
//         buyVal,
//         sellVal,
//         expProfit,
//         isLow: qty <= Number(p.minStockLevel ?? 5)
//       };
//     });

//     return {
//       rows,
//       totalUnits,
//       totalBuyValue,
//       totalSellValue,
//       expectedProfit: totalSellValue - totalBuyValue
//     };
//   }, [productList]);

//   // 4. Receivable & Payable Data
//   const dueData = useMemo(() => {
//     const receivables = clientList
//       .filter(c => Number(c.dueBalance || 0) > 0)
//       .sort((a, b) => Number(b.dueBalance || 0) - Number(a.dueBalance || 0));

//     const payables = supplierList
//       .filter(s => Number(s.dueBalance || 0) > 0)
//       .sort((a, b) => Number(b.dueBalance || 0) - Number(a.dueBalance || 0));

//     const totalReceivable = receivables.reduce((s, c) => s + Number(c.dueBalance || 0), 0);
//     const totalPayable = payables.reduce((s, sup) => s + Number(sup.dueBalance || 0), 0);

//     return { receivables, payables, totalReceivable, totalPayable };
//   }, [clientList, supplierList]);

//   // 5. P&L Data
//   const pnlData = useMemo(() => {
//     const prodMap = new Map(productList.map(p => [String(p._id), p]));
//     let cogs = 0;

//     for (const inv of salesData.rows) {
//       const items = Array.isArray(inv?.items) ? inv.items : [];
//       for (const line of items) {
//         const qty = Number(line?.quantity ?? line?.qty ?? 0);
//         const prodId = typeof line?.product === 'string' ? line.product : line?.product?._id;
//         const catalog = prodId ? prodMap.get(String(prodId)) : null;
//         const buyUnit = Number(
//           line?.buyPrice ?? line?.buyPriceAtSale ?? line?.product?.buyPrice ?? catalog?.buyPrice ?? 0
//         );
//         cogs += qty * buyUnit;
//       }
//     }

//     const periodTx = txList.filter(tx =>
//       isWithinRange(tx?.transactionDate || tx?.createdAt, fromDate, toDate)
//     );

//     const otherIncome = periodTx
//       .filter(t => t?.entryType === 'INCOME')
//       .reduce((s, t) => s + Number(t.amount || 0), 0);

//     const expenses = periodTx
//       .filter(t => t?.entryType === 'EXPENSE')
//       .reduce((s, t) => s + Number(t.amount || 0), 0);

//     const grossProfit = salesData.total - cogs;
//     const netProfit = grossProfit + otherIncome - expenses;

//     return {
//       salesRevenue: salesData.total,
//       cogs,
//       grossProfit,
//       otherIncome,
//       expenses,
//       netProfit
//     };
//   }, [productList, salesData, txList, fromDate, toDate]);

//   // 6. Cash Flow by Channel
//   const cashFlowData = useMemo(() => {
//     const channels = ['Cash', 'Bank', 'Mobile Banking'];
//     const summary = {
//       Cash: { opening: 0, inflow: 0, outflow: 0, closing: 0 },
//       Bank: { opening: 0, inflow: 0, outflow: 0, closing: 0 },
//       'Mobile Banking': { opening: 0, inflow: 0, outflow: 0, closing: 0 }
//     };

//     const startBound = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
//     const endBound = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

//     const record = (rawDate, rawMethod, inflow, outflow) => {
//       const m = channels.includes(rawMethod) ? rawMethod : 'Cash';
//       const dt = rawDate ? new Date(rawDate) : null;
//       if (!dt || Number.isNaN(dt.getTime())) return;

//       if (startBound && dt < startBound) {
//         summary[m].opening += inflow - outflow;
//       } else if ((!startBound || dt >= startBound) && (!endBound || dt <= endBound)) {
//         summary[m].inflow += inflow;
//         summary[m].outflow += outflow;
//       }
//     };

//     for (const inv of invoiceList) {
//       const st = String(inv?.status || '').toLowerCase();
//       if (st === 'cancelled' || st === 'void') continue;
//       const paid = Number(inv?.paidAmount || 0);
//       if (paid > 0) record(inv?.createdAt || inv?.date, inv?.paymentMethod, paid, 0);
//     }

//     for (const pur of purchaseList) {
//       if (String(pur?.status || '').toLowerCase() === 'cancelled') continue;
//       const paid = Number(pur?.paidAmount || 0);
//       if (paid > 0) record(pur?.createdAt || pur?.date, pur?.paymentMethod, 0, paid);
//     }

//     for (const tx of txList) {
//       if (tx?.paymentMethod === 'Adjustment') continue;
//       const amt = Number(tx?.amount || 0);
//       if (amt <= 0) continue;
//       const dt = tx?.transactionDate || tx?.createdAt;
//       if (tx.entryType === 'INCOME' || tx.entryType === 'DUE_COLLECTION') {
//         record(dt, tx.paymentMethod, amt, 0);
//       } else if (tx.entryType === 'EXPENSE' || tx.entryType === 'SUPPLIER_PAYMENT') {
//         record(dt, tx.paymentMethod, 0, amt);
//       }
//     }

//     for (const ch of channels) {
//       summary[ch].closing = summary[ch].opening + summary[ch].inflow - summary[ch].outflow;
//     }

//     return { channels, summary };
//   }, [invoiceList, purchaseList, txList, fromDate, toDate]);

//   // Excel (.csv) Export for Active Report
//   const handleExportCsv = () => {
//     const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
//     let headers = [];
//     let rows = [];

//     if (activeReport === 'SALES') {
//       headers = ['Invoice #', 'Date', 'Client', 'Method', 'Grand Total', 'Paid', 'Due'];
//       rows = salesData.rows.map(inv => [
//         inv.invoiceNumber,
//         inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '',
//         inv.client?.companyName || inv.client?.name || 'Walk-in',
//         inv.paymentMethod || 'Cash',
//         Number(inv.grandTotal || 0),
//         Number(inv.paidAmount || 0),
//         Number(inv.dueAmount || 0)
//       ]);
//     } else if (activeReport === 'PURCHASES') {
//       headers = ['Purchase #', 'Date', 'Supplier', 'Method', 'Total Amount', 'Paid', 'Due'];
//       rows = purchaseData.rows.map(pur => [
//         pur.purchaseNumber || String(pur._id).slice(-6).toUpperCase(),
//         pur.createdAt ? new Date(pur.createdAt).toLocaleDateString() : '',
//         pur.supplier?.companyName || pur.supplier?.name || 'Supplier',
//         pur.paymentMethod || 'Cash',
//         Number(pur.totalAmount || 0),
//         Number(pur.paidAmount || 0),
//         Number(pur.dueAmount || 0)
//       ]);
//     } else if (activeReport === 'STOCK') {
//       headers = ['SKU', 'Product', 'Stock Qty', 'Buy Price', 'Sell Price', 'Buy Value', 'Sell Value', 'Expected Profit'];
//       rows = stockData.rows.map(p => [
//         p.sku,
//         p.name,
//         p.qty,
//         p.buyPrice,
//         p.sellPrice,
//         p.buyVal,
//         p.sellVal,
//         p.expProfit
//       ]);
//     } else if (activeReport === 'DUES') {
//       headers = ['Party Type', 'Name', 'Phone', 'Due Balance (৳)'];
//       rows = [
//         ...dueData.receivables.map(c => ['Client (Receivable)', c.companyName || c.name, c.phone || '', Number(c.dueBalance || 0)]),
//         ...dueData.payables.map(s => ['Supplier (Payable)', s.companyName || s.name, s.phone || '', Number(s.dueBalance || 0)])
//       ];
//     } else if (activeReport === 'PNL') {
//       headers = ['Particulars', 'Amount (৳)'];
//       rows = [
//         ['Sales Revenue', pnlData.salesRevenue],
//         ['Cost of Goods Sold (COGS)', -pnlData.cogs],
//         ['Gross Profit', pnlData.grossProfit],
//         ['Other Income', pnlData.otherIncome],
//         ['Operating Expenses', -pnlData.expenses],
//         ['Net Profit / (Loss)', pnlData.netProfit]
//       ];
//     } else if (activeReport === 'CASHFLOW') {
//       headers = ['Channel', 'Opening', 'Inflow (+)', 'Outflow (-)', 'Closing'];
//       rows = cashFlowData.channels.map(ch => [
//         ch,
//         cashFlowData.summary[ch].opening,
//         cashFlowData.summary[ch].inflow,
//         cashFlowData.summary[ch].outflow,
//         cashFlowData.summary[ch].closing
//       ]);
//     }

//     const csv =
//       '\uFEFF' +
//       [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n');
//     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.setAttribute('download', `ERP_${activeReport}_Report_${todayStr}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   // Print Active Report Section
//   const handlePrintReport = () => {
//     const content = document.getElementById('printable-all-reports')?.innerHTML || '';
//     const title = REPORT_TABS.find(t => t.id === activeReport)?.label || 'ERP Report';
//     const win = window.open('', '_blank', 'height=750,width=980');

//     win.document.write(`
//       <html>
//         <head>
//           <title>${title} - NEXUS ERP</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
//             .print-header { display: flex; justify-content: space-between; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-bottom: 18px; }
//             h2 { margin: 0 0 4px 0; font-size: 20px; }
//             p { margin: 2px 0; font-size: 12px; color: #475569; }
//             table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
//             th, td { border-bottom: 1px solid #cbd5e1; padding: 8px 6px; text-align: left; }
//             th { background: #f1f5f9; font-weight: bold; }
//             .text-right { text-align: right; }
//             .signatures { display: flex; justify-content: space-between; margin-top: 55px; }
//             .sig-box { width: 180px; border-top: 1px solid #64748b; text-align: center; padding-top: 5px; font-size: 11px; color: #475569; }
//           </style>
//         </head>
//         <body>
//           <div class="print-header">
//             <div>
//               <h2>NEXUS ERP — ${title.toUpperCase()}</h2>
//               <p><strong>Period:</strong> ${periodLabel}</p>
//             </div>
//             <div style="text-align:right">
//               <p><strong>Printed:</strong> ${new Date().toLocaleDateString()}</p>
//             </div>
//           </div>
//           ${content}
//           <div class="signatures">
//             <div class="sig-box">Prepared By</div>
//             <div class="sig-box">Accounts Officer</div>
//             <div class="sig-box">Authorized Signature</div>
//           </div>
//         </body>
//       </html>
//     `);

//     win.document.close();
//     win.focus();
//     setTimeout(() => {
//       win.print();
//       win.close();
//     }, 400);
//   };

//   return (
//     <div className="space-y-5 sm:space-y-6">
//       {/* Header & Actions */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div>
//           <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
//             <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
//             All Business Reports
//           </h2>
//           <p className="text-xs sm:text-sm text-slate-500">
//             Sales, Purchases, Stock Valuation, Dues, Profit & Loss, and Cash Flow in one place.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           <button
//             type="button"
//             onClick={handleExportCsv}
//             className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm inline-flex items-center gap-1.5 transition"
//           >
//             <Download className="w-4 h-4" /> Excel
//           </button>

//           <button
//             type="button"
//             onClick={handlePrintReport}
//             className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-sm inline-flex items-center gap-1.5 transition"
//           >
//             <Printer className="w-4 h-4 text-indigo-600" /> Print Report
//           </button>
//         </div>
//       </div>

//       {/* Report Selector Tabs */}
//       <div className="flex flex-wrap gap-2">
//         {REPORT_TABS.map(tab => {
//           const Icon = tab.icon;
//           const isActive = activeReport === tab.id;
//           return (
//             <button
//               key={tab.id}
//               type="button"
//               onClick={() => setActiveReport(tab.id)}
//               className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
//                 isActive
//                   ? 'bg-indigo-600 text-white shadow-sm'
//                   : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
//               }`}
//             >
//               <Icon className="w-4 h-4" />
//               {tab.label}
//             </button>
//           );
//         })}
//       </div>

//       {/* Date Filter Bar */}
//       {activeReport !== 'STOCK' && activeReport !== 'DUES' && (
//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">From Date</label>
//             <input
//               type="date"
//               value={fromDate}
//               onChange={e => setFromDate(e.target.value)}
//               className="w-full border border-slate-200 p-2 rounded-xl text-sm outline-none"
//             />
//           </div>
//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">To Date</label>
//             <input
//               type="date"
//               value={toDate}
//               onChange={e => setToDate(e.target.value)}
//               className="w-full border border-slate-200 p-2 rounded-xl text-sm outline-none"
//             />
//           </div>
//           <div className="flex items-center justify-between gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/70 text-xs text-slate-600">
//             <span className="inline-flex items-center gap-1.5">
//               <Calendar className="w-4 h-4 text-indigo-600" />
//               <strong>{periodLabel}</strong>
//             </span>
//             <button
//               type="button"
//               onClick={() => {
//                 setFromDate('');
//                 setToDate('');
//               }}
//               className="text-indigo-600 font-semibold hover:underline"
//             >
//               All Time
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Printable Report Body */}
//       <div id="printable-all-reports" className="space-y-4">
//         {/* 1. SALES REPORT */}
//         {activeReport === 'SALES' && (
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
//             <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
//               <h3 className="font-bold text-slate-800">
//                 Sales Report ({salesData.rows.length} Invoices)
//               </h3>
//               <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
//                 <span>
//                   Total: <strong className="text-slate-900">৳{salesData.total.toLocaleString()}</strong>
//                 </span>
//                 <span>
//                   Paid: <strong className="text-emerald-700">৳{salesData.paid.toLocaleString()}</strong>
//                 </span>
//                 <span>
//                   Due: <strong className="text-red-600">৳{salesData.due.toLocaleString()}</strong>
//                 </span>
//               </div>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse min-w-[650px]">
//                 <thead>
//                   <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
//                     <th className="py-3 px-4">Invoice #</th>
//                     <th className="py-3 px-4">Date</th>
//                     <th className="py-3 px-4">Client</th>
//                     <th className="py-3 px-4">Method</th>
//                     <th className="py-3 px-4 text-right">Total</th>
//                     <th className="py-3 px-4 text-right">Paid</th>
//                     <th className="py-3 px-4 text-right">Due</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100 text-sm">
//                   {salesData.rows.map(inv => (
//                     <tr key={inv._id}>
//                       <td className="py-3 px-4 font-mono font-bold text-indigo-600">{inv.invoiceNumber}</td>
//                       <td className="py-3 px-4 text-xs text-slate-500">
//                         {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : ''}
//                       </td>
//                       <td className="py-3 px-4 font-medium">
//                         {inv.client?.companyName || inv.client?.name || 'Walk-in'}
//                       </td>
//                       <td className="py-3 px-4 text-xs text-slate-600">{inv.paymentMethod || 'Cash'}</td>
//                       <td className="py-3 px-4 text-right font-bold">
//                         ৳{Number(inv.grandTotal || 0).toLocaleString()}
//                       </td>
//                       <td className="py-3 px-4 text-right text-emerald-700">
//                         ৳{Number(inv.paidAmount || 0).toLocaleString()}
//                       </td>
//                       <td className="py-3 px-4 text-right text-red-600">
//                         ৳{Number(inv.dueAmount || 0).toLocaleString()}
//                       </td>
//                     </tr>
//                   ))}
//                   {salesData.rows.length === 0 && (
//                     <tr>
//                       <td colSpan="7" className="py-8 text-center text-slate-400">
//                         No sales records in selected range.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* 2. PURCHASE REPORT */}
//         {activeReport === 'PURCHASES' && (
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
//             <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
//               <h3 className="font-bold text-slate-800">
//                 Purchase Report ({purchaseData.rows.length} Orders)
//               </h3>
//               <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
//                 <span>
//                   Total: <strong className="text-slate-900">৳{purchaseData.total.toLocaleString()}</strong>
//                 </span>
//                 <span>
//                   Paid: <strong className="text-emerald-700">৳{purchaseData.paid.toLocaleString()}</strong>
//                 </span>
//                 <span>
//                   Due: <strong className="text-red-600">৳{purchaseData.due.toLocaleString()}</strong>
//                 </span>
//               </div>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse min-w-[650px]">
//                 <thead>
//                   <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
//                     <th className="py-3 px-4">PO #</th>
//                     <th className="py-3 px-4">Date</th>
//                     <th className="py-3 px-4">Supplier</th>
//                     <th className="py-3 px-4">Method</th>
//                     <th className="py-3 px-4 text-right">Total</th>
//                     <th className="py-3 px-4 text-right">Paid</th>
//                     <th className="py-3 px-4 text-right">Due</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100 text-sm">
//                   {purchaseData.rows.map(pur => (
//                     <tr key={pur._id}>
//                       <td className="py-3 px-4 font-mono font-bold text-indigo-600">
//                         {pur.purchaseNumber || `PO-${String(pur._id).slice(-5).toUpperCase()}`}
//                       </td>
//                       <td className="py-3 px-4 text-xs text-slate-500">
//                         {pur.createdAt ? new Date(pur.createdAt).toLocaleDateString() : ''}
//                       </td>
//                       <td className="py-3 px-4 font-medium">
//                         {pur.supplier?.companyName || pur.supplier?.name || 'Supplier'}
//                       </td>
//                       <td className="py-3 px-4 text-xs text-slate-600">{pur.paymentMethod || 'Cash'}</td>
//                       <td className="py-3 px-4 text-right font-bold">
//                         ৳{Number(pur.totalAmount || 0).toLocaleString()}
//                       </td>
//                       <td className="py-3 px-4 text-right text-emerald-700">
//                         ৳{Number(pur.paidAmount || 0).toLocaleString()}
//                       </td>
//                       <td className="py-3 px-4 text-right text-red-600">
//                         ৳{Number(pur.dueAmount || 0).toLocaleString()}
//                       </td>
//                     </tr>
//                   ))}
//                   {purchaseData.rows.length === 0 && (
//                     <tr>
//                       <td colSpan="7" className="py-8 text-center text-slate-400">
//                         No purchase records in selected range.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* 3. STOCK VALUATION REPORT */}
//         {activeReport === 'STOCK' && (
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
//             <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
//               <h3 className="font-bold text-slate-800">
//                 Inventory Stock & Valuation ({stockData.totalUnits.toLocaleString()} Units)
//               </h3>
//               <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
//                 <span>
//                   Buy Value: <strong className="text-slate-900">৳{stockData.totalBuyValue.toLocaleString()}</strong>
//                 </span>
//                 <span>
//                   Sell Value: <strong className="text-indigo-700">৳{stockData.totalSellValue.toLocaleString()}</strong>
//                 </span>
//                 <span>
//                   Expected Profit:{' '}
//                   <strong className="text-emerald-700">
//                     ৳{stockData.expectedProfit.toLocaleString()}
//                   </strong>
//                 </span>
//               </div>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse min-w-[700px]">
//                 <thead>
//                   <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
//                     <th className="py-3 px-4">SKU</th>
//                     <th className="py-3 px-4">Product</th>
//                     <th className="py-3 px-4 text-right">Stock</th>
//                     <th className="py-3 px-4 text-right">Buy / Sell</th>
//                     <th className="py-3 px-4 text-right">Buy Value</th>
//                     <th className="py-3 px-4 text-right">Sell Value</th>
//                     <th className="py-3 px-4 text-right">Exp. Profit</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100 text-sm">
//                   {stockData.rows.map(p => (
//                     <tr key={p._id}>
//                       <td className="py-3 px-4 font-mono text-xs text-slate-500">{p.sku}</td>
//                       <td className="py-3 px-4 font-semibold text-slate-800">
//                         {p.name}{' '}
//                         {p.isLow && (
//                           <span className="ml-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
//                             Low
//                           </span>
//                         )}
//                       </td>
//                       <td className="py-3 px-4 text-right font-bold">{p.qty}</td>
//                       <td className="py-3 px-4 text-right text-xs text-slate-500">
//                         ৳{p.buyPrice.toLocaleString()} / ৳{p.sellPrice.toLocaleString()}
//                       </td>
//                       <td className="py-3 px-4 text-right">৳{p.buyVal.toLocaleString()}</td>
//                       <td className="py-3 px-4 text-right">৳{p.sellVal.toLocaleString()}</td>
//                       <td className="py-3 px-4 text-right font-bold text-emerald-700">
//                         ৳{p.expProfit.toLocaleString()}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* 4. RECEIVABLE & PAYABLE REPORT */}
//         {activeReport === 'DUES' && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//             <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
//               <div className="p-4 sm:px-5 border-b border-slate-100 flex items-center justify-between">
//                 <h3 className="font-bold text-slate-800">
//                   Client Receivable ({dueData.receivables.length})
//                 </h3>
//                 <span className="text-sm font-extrabold text-amber-700">
//                   ৳{dueData.totalReceivable.toLocaleString()}
//                 </span>
//               </div>
//               <table className="w-full text-left border-collapse text-sm">
//                 <thead>
//                   <tr className="bg-slate-50 border-b text-xs text-slate-500 uppercase">
//                     <th className="py-3 px-4">Client</th>
//                     <th className="py-3 px-4">Phone</th>
//                     <th className="py-3 px-4 text-right">Due Balance</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {dueData.receivables.map(c => (
//                     <tr key={c._id}>
//                       <td className="py-3 px-4 font-semibold">{c.companyName || c.name}</td>
//                       <td className="py-3 px-4 text-xs text-slate-500">{c.phone || '—'}</td>
//                       <td className="py-3 px-4 text-right font-bold text-amber-700">
//                         ৳{Number(c.dueBalance || 0).toLocaleString()}
//                       </td>
//                     </tr>
//                   ))}
//                   {dueData.receivables.length === 0 && (
//                     <tr>
//                       <td colSpan="3" className="py-6 text-center text-slate-400">
//                         No client receivables.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
//               <div className="p-4 sm:px-5 border-b border-slate-100 flex items-center justify-between">
//                 <h3 className="font-bold text-slate-800">
//                   Supplier Payable ({dueData.payables.length})
//                 </h3>
//                 <span className="text-sm font-extrabold text-red-600">
//                   ৳{dueData.totalPayable.toLocaleString()}
//                 </span>
//               </div>
//               <table className="w-full text-left border-collapse text-sm">
//                 <thead>
//                   <tr className="bg-slate-50 border-b text-xs text-slate-500 uppercase">
//                     <th className="py-3 px-4">Supplier</th>
//                     <th className="py-3 px-4">Phone</th>
//                     <th className="py-3 px-4 text-right">Due Balance</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {dueData.payables.map(s => (
//                     <tr key={s._id}>
//                       <td className="py-3 px-4 font-semibold">{s.companyName || s.name}</td>
//                       <td className="py-3 px-4 text-xs text-slate-500">{s.phone || '—'}</td>
//                       <td className="py-3 px-4 text-right font-bold text-red-600">
//                         ৳{Number(s.dueBalance || 0).toLocaleString()}
//                       </td>
//                     </tr>
//                   ))}
//                   {dueData.payables.length === 0 && (
//                     <tr>
//                       <td colSpan="3" className="py-6 text-center text-slate-400">
//                         No supplier payables.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* 5. PROFIT & LOSS REPORT */}
//         {activeReport === 'PNL' && (
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
//             <div className="p-4 sm:px-6 border-b border-slate-100">
//               <h3 className="font-bold text-slate-800">Profit & Loss Statement ({periodLabel})</h3>
//             </div>
//             <div className="divide-y divide-slate-100 text-sm">
//               <div className="px-6 py-3.5 flex justify-between">
//                 <span>Sales Revenue</span>
//                 <strong>৳ {pnlData.salesRevenue.toLocaleString()}</strong>
//               </div>
//               <div className="px-6 py-3.5 flex justify-between text-amber-700">
//                 <span>Less: Cost of Goods Sold (COGS)</span>
//                 <strong>- ৳ {pnlData.cogs.toLocaleString()}</strong>
//               </div>
//               <div className="px-6 py-3.5 flex justify-between bg-slate-50 font-bold">
//                 <span>Gross Profit</span>
//                 <span className="text-indigo-700">৳ {pnlData.grossProfit.toLocaleString()}</span>
//               </div>
//               <div className="px-6 py-3.5 flex justify-between text-emerald-700">
//                 <span>Add: Other Income</span>
//                 <strong>+ ৳ {pnlData.otherIncome.toLocaleString()}</strong>
//               </div>
//               <div className="px-6 py-3.5 flex justify-between text-red-600">
//                 <span>Less: Operating Expenses</span>
//                 <strong>- ৳ {pnlData.expenses.toLocaleString()}</strong>
//               </div>
//               <div className="px-6 py-4 flex justify-between bg-slate-100 font-extrabold text-base">
//                 <span>Net {pnlData.netProfit >= 0 ? 'Profit' : 'Loss'}</span>
//                 <span className={pnlData.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'}>
//                   {pnlData.netProfit >= 0 ? '' : '-'}৳ {Math.abs(pnlData.netProfit).toLocaleString()}
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* 6. CASH & BANK FLOW REPORT */}
//         {activeReport === 'CASHFLOW' && (
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
//             <div className="p-4 sm:px-6 border-b border-slate-100">
//               <h3 className="font-bold text-slate-800">Cash, Bank & Mobile Flow ({periodLabel})</h3>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-collapse min-w-[600px]">
//                 <thead>
//                   <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
//                     <th className="py-3 px-4">Channel</th>
//                     <th className="py-3 px-4 text-right">Opening</th>
//                     <th className="py-3 px-4 text-right">Inflow (+)</th>
//                     <th className="py-3 px-4 text-right">Outflow (-)</th>
//                     <th className="py-3 px-4 text-right">Closing</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100 text-sm">
//                   {cashFlowData.channels.map(ch => {
//                     const row = cashFlowData.summary[ch];
//                     return (
//                       <tr key={ch}>
//                         <td className="py-3.5 px-4 font-bold text-slate-800">{ch}</td>
//                         <td className="py-3.5 px-4 text-right">৳{row.opening.toLocaleString()}</td>
//                         <td className="py-3.5 px-4 text-right text-emerald-700 font-semibold">
//                           +৳{row.inflow.toLocaleString()}
//                         </td>
//                         <td className="py-3.5 px-4 text-right text-red-600 font-semibold">
//                           -৳{row.outflow.toLocaleString()}
//                         </td>
//                         <td className="py-3.5 px-4 text-right font-extrabold text-indigo-700">
//                           ৳{row.closing.toLocaleString()}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Wallet
} from 'lucide-react';
import { DEFAULT_ERP_SETTINGS } from './Settings';

const formatDateInput = (dateObj) => {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isWithinRange = (rawDate, fromStr, toStr) => {
  if (!fromStr && !toStr) return true;
  if (!rawDate) return false;
  const d = new Date(rawDate);
  if (Number.isNaN(d.getTime())) return false;

  if (fromStr && d < new Date(`${fromStr}T00:00:00`)) return false;
  if (toStr && d > new Date(`${toStr}T23:59:59.999`)) return false;
  return true;
};

const REPORT_TABS = [
  { id: 'SALES', label: 'Sales Report', icon: TrendingUp },
  { id: 'PURCHASES', label: 'Purchase Report', icon: ShoppingCart },
  { id: 'STOCK', label: 'Stock Valuation', icon: Package },
  { id: 'DUES', label: 'Receivable & Payable', icon: Users },
  { id: 'PNL', label: 'Profit & Loss', icon: BarChart3 },
  { id: 'CASHFLOW', label: 'Cash & Bank Flow', icon: Wallet }
];

export default function AllReports({
  products = [],
  suppliers = [],
  clients = [],
  invoices = [],
  purchases = [],
  transactions = [],
  accountTransactions = [],
  settings
}) {
  const activeSettings = useMemo(
    () => ({
      ...DEFAULT_ERP_SETTINGS,
      ...(settings || {})
    }),
    [settings]
  );

  const currencySymbol = activeSettings.currencySymbol || '৳';
  const companyName = (activeSettings.companyName || 'NEXUS ERP').trim();
  const minStockFallback = Math.max(0, Number(activeSettings.defaultMinStock ?? 5));

  const formatMoney = (amount) => `${currencySymbol}${Number(amount || 0).toLocaleString()}`;

  const now = new Date();
  const monthStartStr = formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
  const todayStr = formatDateInput(now);

  const [activeReport, setActiveReport] = useState('SALES');
  const [fromDate, setFromDate] = useState(monthStartStr);
  const [toDate, setToDate] = useState(todayStr);

  const productList = Array.isArray(products) ? products : [];
  const supplierList = Array.isArray(suppliers) ? suppliers : [];
  const clientList = Array.isArray(clients) ? clients : [];
  const invoiceList = Array.isArray(invoices) ? invoices : [];
  const purchaseList = Array.isArray(purchases) ? purchases : [];
  const txList = Array.isArray(transactions)
    ? transactions
    : Array.isArray(accountTransactions)
    ? accountTransactions
    : [];

  const periodLabel = useMemo(() => {
    if (fromDate && toDate) return `${fromDate} to ${toDate}`;
    if (fromDate) return `From ${fromDate}`;
    if (toDate) return `Up to ${toDate}`;
    return 'All Time';
  }, [fromDate, toDate]);

  // 1. Sales Report Data
  const salesData = useMemo(() => {
    const rows = invoiceList.filter(inv => {
      const st = String(inv?.status || '').toLowerCase();
      if (st === 'cancelled' || st === 'void') return false;
      return isWithinRange(inv?.createdAt || inv?.date, fromDate, toDate);
    });

    const total = rows.reduce((s, i) => s + Number(i.grandTotal ?? i.totalAmount ?? 0), 0);
    const paid = rows.reduce((s, i) => s + Number(i.paidAmount ?? 0), 0);
    const due = rows.reduce((s, i) => s + Number(i.dueAmount ?? 0), 0);
    return { rows, total, paid, due };
  }, [invoiceList, fromDate, toDate]);

  // 2. Purchase Report Data
  const purchaseData = useMemo(() => {
    const rows = purchaseList.filter(pur => {
      if (String(pur?.status || '').toLowerCase() === 'cancelled') return false;
      return isWithinRange(pur?.createdAt || pur?.date, fromDate, toDate);
    });

    const total = rows.reduce((s, p) => s + Number(p.totalAmount ?? 0), 0);
    const paid = rows.reduce((s, p) => s + Number(p.paidAmount ?? 0), 0);
    const due = rows.reduce((s, p) => s + Number(p.dueAmount ?? 0), 0);
    return { rows, total, paid, due };
  }, [purchaseList, fromDate, toDate]);

  // 3. Stock Valuation Data
  const stockData = useMemo(() => {
    let totalUnits = 0;
    let totalBuyValue = 0;
    let totalSellValue = 0;

    const rows = productList.map(p => {
      const qty = Math.max(0, Number(p.quantity ?? 0));
      const buyPrice = Number(p.buyPrice ?? 0);
      const sellPrice = Number(p.sellPrice ?? p.price ?? 0);
      const buyVal = qty * buyPrice;
      const sellVal = qty * sellPrice;
      const expProfit = sellVal - buyVal;
      const threshold = Number(p.minStockLevel ?? minStockFallback);

      totalUnits += qty;
      totalBuyValue += buyVal;
      totalSellValue += sellVal;

      return {
        ...p,
        qty,
        buyPrice,
        sellPrice,
        buyVal,
        sellVal,
        expProfit,
        isLow: qty <= threshold
      };
    });

    return {
      rows,
      totalUnits,
      totalBuyValue,
      totalSellValue,
      expectedProfit: totalSellValue - totalBuyValue
    };
  }, [productList, minStockFallback]);

  // 4. Receivable & Payable Data
  const dueData = useMemo(() => {
    const receivables = clientList
      .filter(c => Number(c.dueBalance || 0) > 0)
      .sort((a, b) => Number(b.dueBalance || 0) - Number(a.dueBalance || 0));

    const payables = supplierList
      .filter(s => Number(s.dueBalance || 0) > 0)
      .sort((a, b) => Number(b.dueBalance || 0) - Number(a.dueBalance || 0));

    const totalReceivable = receivables.reduce((s, c) => s + Number(c.dueBalance || 0), 0);
    const totalPayable = payables.reduce((s, sup) => s + Number(sup.dueBalance || 0), 0);

    return { receivables, payables, totalReceivable, totalPayable };
  }, [clientList, supplierList]);

  // 5. P&L Data
  const pnlData = useMemo(() => {
    const prodMap = new Map(productList.map(p => [String(p._id), p]));
    let cogs = 0;

    for (const inv of salesData.rows) {
      const items = Array.isArray(inv?.items) ? inv.items : [];
      for (const line of items) {
        const qty = Number(line?.quantity ?? line?.qty ?? 0);
        const prodId = typeof line?.product === 'string' ? line.product : line?.product?._id;
        const catalog = prodId ? prodMap.get(String(prodId)) : null;
        const buyUnit = Number(
          line?.buyPrice ?? line?.buyPriceAtSale ?? line?.product?.buyPrice ?? catalog?.buyPrice ?? 0
        );
        cogs += qty * buyUnit;
      }
    }

    const periodTx = txList.filter(tx =>
      isWithinRange(tx?.transactionDate || tx?.createdAt, fromDate, toDate)
    );

    const otherIncome = periodTx
      .filter(t => t?.entryType === 'INCOME')
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    const expenses = periodTx
      .filter(t => t?.entryType === 'EXPENSE')
      .reduce((s, t) => s + Number(t.amount || 0), 0);

    const grossProfit = salesData.total - cogs;
    const netProfit = grossProfit + otherIncome - expenses;

    return {
      salesRevenue: salesData.total,
      cogs,
      grossProfit,
      otherIncome,
      expenses,
      netProfit
    };
  }, [productList, salesData, txList, fromDate, toDate]);

  // 6. Cash Flow by Channel
  const cashFlowData = useMemo(() => {
    const channels = ['Cash', 'Bank', 'Mobile Banking'];
    const summary = {
      Cash: { opening: 0, inflow: 0, outflow: 0, closing: 0 },
      Bank: { opening: 0, inflow: 0, outflow: 0, closing: 0 },
      'Mobile Banking': { opening: 0, inflow: 0, outflow: 0, closing: 0 }
    };

    const startBound = fromDate ? new Date(`${fromDate}T00:00:00`) : null;
    const endBound = toDate ? new Date(`${toDate}T23:59:59.999`) : null;

    const record = (rawDate, rawMethod, inflow, outflow) => {
      const m = channels.includes(rawMethod) ? rawMethod : 'Cash';
      const dt = rawDate ? new Date(rawDate) : null;
      if (!dt || Number.isNaN(dt.getTime())) return;

      if (startBound && dt < startBound) {
        summary[m].opening += inflow - outflow;
      } else if ((!startBound || dt >= startBound) && (!endBound || dt <= endBound)) {
        summary[m].inflow += inflow;
        summary[m].outflow += outflow;
      }
    };

    for (const inv of invoiceList) {
      const st = String(inv?.status || '').toLowerCase();
      if (st === 'cancelled' || st === 'void') continue;
      const paid = Number(inv?.paidAmount || 0);
      if (paid > 0) record(inv?.createdAt || inv?.date, inv?.paymentMethod, paid, 0);
    }

    for (const pur of purchaseList) {
      if (String(pur?.status || '').toLowerCase() === 'cancelled') continue;
      const paid = Number(pur?.paidAmount || 0);
      if (paid > 0) record(pur?.createdAt || pur?.date, pur?.paymentMethod, 0, paid);
    }

    for (const tx of txList) {
      if (tx?.paymentMethod === 'Adjustment') continue;
      const amt = Number(tx?.amount || 0);
      if (amt <= 0) continue;
      const dt = tx?.transactionDate || tx?.createdAt;
      if (tx.entryType === 'INCOME' || tx.entryType === 'DUE_COLLECTION') {
        record(dt, tx.paymentMethod, amt, 0);
      } else if (tx.entryType === 'EXPENSE' || tx.entryType === 'SUPPLIER_PAYMENT') {
        record(dt, tx.paymentMethod, 0, amt);
      }
    }

    for (const ch of channels) {
      summary[ch].closing = summary[ch].opening + summary[ch].inflow - summary[ch].outflow;
    }

    return { channels, summary };
  }, [invoiceList, purchaseList, txList, fromDate, toDate]);

  // Excel (.csv) Export for Active Report
  const handleExportCsv = () => {
    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    let headers = [];
    let rows = [];

    if (activeReport === 'SALES') {
      headers = [
        'Invoice #',
        'Date',
        'Client',
        'Method',
        `Grand Total (${currencySymbol})`,
        `Paid (${currencySymbol})`,
        `Due (${currencySymbol})`
      ];
      rows = salesData.rows.map(inv => [
        inv.invoiceNumber,
        inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '',
        inv.client?.companyName || inv.client?.name || 'Walk-in',
        inv.paymentMethod || 'Cash',
        Number(inv.grandTotal || 0),
        Number(inv.paidAmount || 0),
        Number(inv.dueAmount || 0)
      ]);
    } else if (activeReport === 'PURCHASES') {
      headers = [
        'Purchase #',
        'Date',
        'Supplier',
        'Method',
        `Total Amount (${currencySymbol})`,
        `Paid (${currencySymbol})`,
        `Due (${currencySymbol})`
      ];
      rows = purchaseData.rows.map(pur => [
        pur.purchaseNumber || String(pur._id).slice(-6).toUpperCase(),
        pur.createdAt ? new Date(pur.createdAt).toLocaleDateString() : '',
        pur.supplier?.companyName || pur.supplier?.name || 'Supplier',
        pur.paymentMethod || 'Cash',
        Number(pur.totalAmount || 0),
        Number(pur.paidAmount || 0),
        Number(pur.dueAmount || 0)
      ]);
    } else if (activeReport === 'STOCK') {
      headers = [
        'SKU',
        'Product',
        'Stock Qty',
        `Buy Price (${currencySymbol})`,
        `Sell Price (${currencySymbol})`,
        `Buy Value (${currencySymbol})`,
        `Sell Value (${currencySymbol})`,
        `Expected Profit (${currencySymbol})`
      ];
      rows = stockData.rows.map(p => [
        p.sku,
        p.name,
        p.qty,
        p.buyPrice,
        p.sellPrice,
        p.buyVal,
        p.sellVal,
        p.expProfit
      ]);
    } else if (activeReport === 'DUES') {
      headers = ['Party Type', 'Name', 'Phone', `Due Balance (${currencySymbol})`];
      rows = [
        ...dueData.receivables.map(c => [
          'Client (Receivable)',
          c.companyName || c.name,
          c.phone || '',
          Number(c.dueBalance || 0)
        ]),
        ...dueData.payables.map(s => [
          'Supplier (Payable)',
          s.companyName || s.name,
          s.phone || '',
          Number(s.dueBalance || 0)
        ])
      ];
    } else if (activeReport === 'PNL') {
      headers = ['Particulars', `Amount (${currencySymbol})`];
      rows = [
        ['Sales Revenue', pnlData.salesRevenue],
        ['Cost of Goods Sold (COGS)', -pnlData.cogs],
        ['Gross Profit', pnlData.grossProfit],
        ['Other Income', pnlData.otherIncome],
        ['Operating Expenses', -pnlData.expenses],
        ['Net Profit / (Loss)', pnlData.netProfit]
      ];
    } else if (activeReport === 'CASHFLOW') {
      headers = [
        'Channel',
        `Opening (${currencySymbol})`,
        `Inflow (+ ${currencySymbol})`,
        `Outflow (- ${currencySymbol})`,
        `Closing (${currencySymbol})`
      ];
      rows = cashFlowData.channels.map(ch => [
        ch,
        cashFlowData.summary[ch].opening,
        cashFlowData.summary[ch].inflow,
        cashFlowData.summary[ch].outflow,
        cashFlowData.summary[ch].closing
      ]);
    }

    const csv =
      '\uFEFF' +
      [headers.map(escapeCsv).join(','), ...rows.map(r => r.map(escapeCsv).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeCompany = companyName.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `${safeCompany}_${activeReport}_Report_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Print Active Report Section
  const handlePrintReport = () => {
    const content = document.getElementById('printable-all-reports')?.innerHTML || '';
    const title = REPORT_TABS.find(t => t.id === activeReport)?.label || 'ERP Report';
    const win = window.open('', '_blank', 'height=750,width=980');
    if (!win) return;

    const metaParts = [
      activeSettings.address,
      activeSettings.phone && `Phone: ${activeSettings.phone}`,
      activeSettings.email && `Email: ${activeSettings.email}`,
      activeSettings.taxId && `BIN/Tax: ${activeSettings.taxId}`
    ].filter(Boolean);

    const logoHtml = activeSettings.logoUrl
      ? `<img src="${activeSettings.logoUrl}" alt="${companyName}" style="height:44px;width:44px;object-fit:contain;border-radius:8px;border:1px solid #e2e8f0;padding:3px;" />`
      : '';

    const signaturesHtml = activeSettings.showSignatureOnPrint
      ? `
        <div class="signatures">
          <div class="sig-box">Prepared By</div>
          <div class="sig-box">Accounts Officer</div>
          <div class="sig-box">Authorized Signature (${companyName})</div>
        </div>
      `
      : '';

    win.document.write(`
      <html>
        <head>
          <title>${title} - ${companyName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            .print-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 18px; gap: 16px; }
            .brand-row { display: flex; align-items: center; gap: 12px; }
            h2 { margin: 0 0 4px 0; font-size: 20px; }
            p { margin: 2px 0; font-size: 12px; color: #475569; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
            th, td { border-bottom: 1px solid #cbd5e1; padding: 8px 6px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; }
            .text-right { text-align: right; }
            .signatures { display: flex; justify-content: space-between; margin-top: 55px; }
            .sig-box { width: 190px; border-top: 1px solid #64748b; text-align: center; padding-top: 5px; font-size: 11px; color: #475569; }
          </style>
        </head>
        <body>
          <div class="print-header">
            <div class="brand-row">
              ${logoHtml}
              <div>
                <h2>${companyName} — ${title.toUpperCase()}</h2>
                ${metaParts.length ? `<p>${metaParts.join(' • ')}</p>` : ''}
                <p><strong>Period:</strong> ${periodLabel}</p>
              </div>
            </div>
            <div style="text-align:right">
              <p><strong>Printed:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          ${content}
          ${signaturesHtml}
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 400);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            All Business Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sales, Purchases, Stock Valuation, Dues, Profit & Loss, and Cash Flow in one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm inline-flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" /> Excel
          </button>

          <button
            type="button"
            onClick={handlePrintReport}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-sm inline-flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4 text-indigo-600" /> Print Report
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {REPORT_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveReport(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Date Filter Bar */}
      {activeReport !== 'STOCK' && activeReport !== 'DUES' && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="w-full border border-slate-200 p-2 rounded-xl text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="w-full border border-slate-200 p-2 rounded-xl text-sm outline-none"
            />
          </div>
          <div className="flex items-center justify-between gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/70 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <strong>{periodLabel}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
              className="text-indigo-600 font-semibold hover:underline"
            >
              All Time
            </button>
          </div>
        </div>
      )}

      {/* Printable Report Body */}
      <div id="printable-all-reports" className="space-y-4">
        {/* 1. SALES REPORT */}
        {activeReport === 'SALES' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-slate-800">
                Sales Report ({salesData.rows.length} Invoices)
              </h3>
              <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
                <span>
                  Total: <strong className="text-slate-900">{formatMoney(salesData.total)}</strong>
                </span>
                <span>
                  Paid: <strong className="text-emerald-700">{formatMoney(salesData.paid)}</strong>
                </span>
                <span>
                  Due: <strong className="text-red-600">{formatMoney(salesData.due)}</strong>
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right">Paid</th>
                    <th className="py-3 px-4 text-right">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {salesData.rows.map(inv => (
                    <tr key={inv._id}>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : ''}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {inv.client?.companyName || inv.client?.name || 'Walk-in'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{inv.paymentMethod || 'Cash'}</td>
                      <td className="py-3 px-4 text-right font-bold">
                        {formatMoney(inv.grandTotal)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-700">
                        {formatMoney(inv.paidAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600">
                        {formatMoney(inv.dueAmount)}
                      </td>
                    </tr>
                  ))}
                  {salesData.rows.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No sales records in selected range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. PURCHASE REPORT */}
        {activeReport === 'PURCHASES' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-slate-800">
                Purchase Report ({purchaseData.rows.length} Orders)
              </h3>
              <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
                <span>
                  Total: <strong className="text-slate-900">{formatMoney(purchaseData.total)}</strong>
                </span>
                <span>
                  Paid: <strong className="text-emerald-700">{formatMoney(purchaseData.paid)}</strong>
                </span>
                <span>
                  Due: <strong className="text-red-600">{formatMoney(purchaseData.due)}</strong>
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
                    <th className="py-3 px-4">PO #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right">Paid</th>
                    <th className="py-3 px-4 text-right">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {purchaseData.rows.map(pur => (
                    <tr key={pur._id}>
                      <td className="py-3 px-4 font-mono font-bold text-indigo-600">
                        {pur.purchaseNumber || `PO-${String(pur._id).slice(-5).toUpperCase()}`}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {pur.createdAt ? new Date(pur.createdAt).toLocaleDateString() : ''}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {pur.supplier?.companyName || pur.supplier?.name || 'Supplier'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600">{pur.paymentMethod || 'Cash'}</td>
                      <td className="py-3 px-4 text-right font-bold">
                        {formatMoney(pur.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-emerald-700">
                        {formatMoney(pur.paidAmount)}
                      </td>
                      <td className="py-3 px-4 text-right text-red-600">
                        {formatMoney(pur.dueAmount)}
                      </td>
                    </tr>
                  ))}
                  {purchaseData.rows.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400">
                        No purchase records in selected range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. STOCK VALUATION REPORT */}
        {activeReport === 'STOCK' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-slate-800">
                Inventory Stock & Valuation ({stockData.totalUnits.toLocaleString()} Units)
              </h3>
              <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
                <span>
                  Buy Value:{' '}
                  <strong className="text-slate-900">{formatMoney(stockData.totalBuyValue)}</strong>
                </span>
                <span>
                  Sell Value:{' '}
                  <strong className="text-indigo-700">{formatMoney(stockData.totalSellValue)}</strong>
                </span>
                <span>
                  Expected Profit:{' '}
                  <strong className="text-emerald-700">
                    {formatMoney(stockData.expectedProfit)}
                  </strong>
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4 text-right">Stock</th>
                    <th className="py-3 px-4 text-right">Buy / Sell</th>
                    <th className="py-3 px-4 text-right">Buy Value</th>
                    <th className="py-3 px-4 text-right">Sell Value</th>
                    <th className="py-3 px-4 text-right">Exp. Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {stockData.rows.map(p => (
                    <tr key={p._id}>
                      <td className="py-3 px-4 font-mono text-xs text-slate-500">{p.sku}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {p.name}{' '}
                        {p.isLow && (
                          <span className="ml-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                            Low
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-bold">{p.qty}</td>
                      <td className="py-3 px-4 text-right text-xs text-slate-500">
                        {formatMoney(p.buyPrice)} / {formatMoney(p.sellPrice)}
                      </td>
                      <td className="py-3 px-4 text-right">{formatMoney(p.buyVal)}</td>
                      <td className="py-3 px-4 text-right">{formatMoney(p.sellVal)}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {formatMoney(p.expProfit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. RECEIVABLE & PAYABLE REPORT */}
        {activeReport === 'DUES' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-4 sm:px-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">
                  Client Receivable ({dueData.receivables.length})
                </h3>
                <span className="text-sm font-extrabold text-amber-700">
                  {formatMoney(dueData.totalReceivable)}
                </span>
              </div>
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b text-xs text-slate-500 uppercase">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4 text-right">Due Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dueData.receivables.map(c => (
                    <tr key={c._id}>
                      <td className="py-3 px-4 font-semibold">{c.companyName || c.name}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{c.phone || '—'}</td>
                      <td className="py-3 px-4 text-right font-bold text-amber-700">
                        {formatMoney(c.dueBalance)}
                      </td>
                    </tr>
                  ))}
                  {dueData.receivables.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-6 text-center text-slate-400">
                        No client receivables.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-4 sm:px-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-800">
                  Supplier Payable ({dueData.payables.length})
                </h3>
                <span className="text-sm font-extrabold text-red-600">
                  {formatMoney(dueData.totalPayable)}
                </span>
              </div>
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b text-xs text-slate-500 uppercase">
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4 text-right">Due Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dueData.payables.map(s => (
                    <tr key={s._id}>
                      <td className="py-3 px-4 font-semibold">{s.companyName || s.name}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{s.phone || '—'}</td>
                      <td className="py-3 px-4 text-right font-bold text-red-600">
                        {formatMoney(s.dueBalance)}
                      </td>
                    </tr>
                  ))}
                  {dueData.payables.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-6 text-center text-slate-400">
                        No supplier payables.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. PROFIT & LOSS REPORT */}
        {activeReport === 'PNL' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Profit & Loss Statement</h3>
              <span className="text-xs text-slate-500">{periodLabel}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-slate-700">Sales Revenue</td>
                    <td className="py-3.5 px-6 text-right font-bold text-slate-900">
                      {formatMoney(pnlData.salesRevenue)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-slate-700">
                      Cost of Goods Sold (COGS)
                    </td>
                    <td className="py-3.5 px-6 text-right font-semibold text-red-600">
                      - {formatMoney(pnlData.cogs)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50/70">
                    <td className="py-3.5 px-6 font-bold text-slate-800">Gross Profit</td>
                    <td className="py-3.5 px-6 text-right font-extrabold text-indigo-700">
                      {formatMoney(pnlData.grossProfit)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-slate-700">Other Income</td>
                    <td className="py-3.5 px-6 text-right font-semibold text-emerald-700">
                      + {formatMoney(pnlData.otherIncome)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-6 font-medium text-slate-700">Operating Expenses</td>
                    <td className="py-3.5 px-6 text-right font-semibold text-red-600">
                      - {formatMoney(pnlData.expenses)}
                    </td>
                  </tr>
                  <tr className="bg-slate-100/80">
                    <td className="py-4 px-6 font-extrabold text-slate-900 text-base">
                      Net Profit / (Loss)
                    </td>
                    <td
                      className={`py-4 px-6 text-right font-extrabold text-base ${
                        pnlData.netProfit >= 0 ? 'text-emerald-700' : 'text-red-600'
                      }`}
                    >
                      {formatMoney(pnlData.netProfit)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. CASH & BANK FLOW REPORT */}
        {activeReport === 'CASHFLOW' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Cash, Bank & Mobile Banking Flow</h3>
              <span className="text-xs text-slate-500">{periodLabel}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px] text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4 text-right">Opening</th>
                    <th className="py-3 px-4 text-right">Inflow (+)</th>
                    <th className="py-3 px-4 text-right">Outflow (-)</th>
                    <th className="py-3 px-4 text-right">Closing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cashFlowData.channels.map(ch => {
                    const row = cashFlowData.summary[ch];
                    return (
                      <tr key={ch}>
                        <td className="py-3 px-4 font-bold text-slate-800">{ch}</td>
                        <td className="py-3 px-4 text-right text-slate-600">
                          {formatMoney(row.opening)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                          {formatMoney(row.inflow)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-red-600">
                          {formatMoney(row.outflow)}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                          {formatMoney(row.closing)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}