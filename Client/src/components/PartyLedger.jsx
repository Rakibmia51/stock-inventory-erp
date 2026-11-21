import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Truck,
  Search,
  Printer,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  ShoppingCart,
  HandCoins,
  Receipt
} from 'lucide-react';

const todayInputDate = () => new Date().toISOString().slice(0, 10);

const getClientIdFromDoc = (doc) => {
  if (!doc) return '';
  if (typeof doc.client === 'string') return doc.client;
  return doc.client?._id || doc.clientId || '';
};

const getSupplierIdFromDoc = (doc) => {
  if (!doc) return '';
  if (typeof doc.supplier === 'string') return doc.supplier;
  return doc.supplier?._id || doc.supplierId || '';
};

export default function PartyLedger({
  clients = [],
  suppliers = [],
  invoices = [],
  purchases = [],
  transactions = [],
  accountTransactions = []
}) {
  const [partyMode, setPartyMode] = useState('CLIENT'); // 'CLIENT' | 'SUPPLIER'
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [partySearch, setPartySearch] = useState('');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const clientList = Array.isArray(clients) ? clients : [];
  const supplierList = Array.isArray(suppliers) ? suppliers : [];
  const invoiceList = Array.isArray(invoices) ? invoices : [];
  const purchaseList = Array.isArray(purchases) ? purchases : [];
  const txList = Array.isArray(transactions)
    ? transactions
    : Array.isArray(accountTransactions)
    ? accountTransactions
    : [];

  const activeParties = partyMode === 'CLIENT' ? clientList : supplierList;

  const filteredPartyList = useMemo(() => {
    const q = partySearch.trim().toLowerCase();
    if (!q) return activeParties;
    return activeParties.filter(p => {
      const name = (p.companyName || p.name || '').toLowerCase();
      const contact = (p.name || '').toLowerCase();
      const phone = (p.phone || '').toLowerCase();
      return name.includes(q) || contact.includes(q) || phone.includes(q);
    });
  }, [activeParties, partySearch]);

  // Keep selected party valid when switching mode or list updates
  useEffect(() => {
    if (filteredPartyList.length === 0) {
      setSelectedPartyId('');
      return;
    }
    const exists = filteredPartyList.some(p => p._id === selectedPartyId);
    if (!exists) {
      setSelectedPartyId(filteredPartyList[0]._id);
    }
  }, [filteredPartyList, selectedPartyId]);

  const selectedParty = useMemo(
    () => activeParties.find(p => p._id === selectedPartyId) || null,
    [activeParties, selectedPartyId]
  );

  // Build chronological ledger rows for selected Client or Supplier
  const ledgerEntries = useMemo(() => {
    if (!selectedParty) return [];

    const rows = [];

    if (partyMode === 'CLIENT') {
      // 1. Client Sales Invoices (Debit / Due +)
      for (const inv of invoiceList) {
        if (getClientIdFromDoc(inv) !== selectedParty._id) continue;
        const totalAmt = Number(inv.grandTotal ?? inv.totalAmount ?? inv.subTotal ?? 0);
        const paidAmt = Number(inv.paidAmount ?? 0);
        const dueAmt =
          inv.dueAmount !== undefined
            ? Number(inv.dueAmount || 0)
            : Math.max(0, totalAmt - paidAmt);

        rows.push({
          id: `inv-${inv._id}`,
          date: inv.createdAt || inv.date || new Date().toISOString(),
          refNo: inv.invoiceNumber || `INV-${String(inv._id || '').slice(-5).toUpperCase()}`,
          kind: 'INVOICE',
          label: 'Sales Invoice',
          description: `Invoice total ৳${totalAmt.toLocaleString()} (Paid: ৳${paidAmt.toLocaleString()})`,
          method: inv.paymentMethod || 'Cash',
          debit: totalAmt,
          credit: paidAmt,
          dueImpact: dueAmt
        });
      }

      // 2. Client Due Collections (Credit / Due -)
      for (const tx of txList) {
        if (tx.entryType !== 'DUE_COLLECTION') continue;
        if (getClientIdFromDoc(tx) !== selectedParty._id) continue;
        const amt = Number(tx.amount || 0);
        const providerText =
          tx.paymentMethod === 'Mobile Banking' && tx.mobileProvider
            ? ` (${tx.mobileProvider})`
            : '';

        rows.push({
          id: `tx-${tx._id}`,
          date: tx.transactionDate || tx.createdAt || new Date().toISOString(),
          refNo: tx.voucherNumber || `MR-${String(tx._id || '').slice(-5).toUpperCase()}`,
          kind: 'DUE_COLLECTION',
          label: 'Due Collection',
          description: tx.title || tx.category || 'Client due collected',
          method: `${tx.paymentMethod || 'Cash'}${providerText}`,
          debit: 0,
          credit: amt,
          dueImpact: -amt
        });
      }
    } else {
      // 1. Supplier Purchases (Credit / Payable +)
      for (const pur of purchaseList) {
        if (getSupplierIdFromDoc(pur) !== selectedParty._id) continue;
        if (pur.status === 'Cancelled') continue;

        const totalAmt = Number(pur.totalAmount || 0);
        const paidAmt = Number(pur.paidAmount || 0);
        const dueAmt =
          pur.dueAmount !== undefined
            ? Number(pur.dueAmount || 0)
            : Math.max(0, totalAmt - paidAmt);

        rows.push({
          id: `pur-${pur._id}`,
          date: pur.createdAt || new Date().toISOString(),
          refNo: pur.purchaseNumber || `PO-${String(pur._id || '').slice(-5).toUpperCase()}`,
          kind: 'PURCHASE',
          label: 'Purchase Bill',
          description: `Bill ৳${totalAmt.toLocaleString()} (Paid: ৳${paidAmt.toLocaleString()})`,
          method: pur.paymentMethod || 'Cash',
          debit: paidAmt,
          credit: totalAmt,
          dueImpact: dueAmt
        });
      }

      // 2. Supplier Payments (Debit / Payable -)
      for (const tx of txList) {
        if (tx.entryType !== 'SUPPLIER_PAYMENT') continue;
        if (getSupplierIdFromDoc(tx) !== selectedParty._id) continue;
        const amt = Number(tx.amount || 0);
        const providerText =
          tx.paymentMethod === 'Mobile Banking' && tx.mobileProvider
            ? ` (${tx.mobileProvider})`
            : '';

        rows.push({
          id: `tx-${tx._id}`,
          date: tx.transactionDate || tx.createdAt || new Date().toISOString(),
          refNo: tx.voucherNumber || `PV-${String(tx._id || '').slice(-5).toUpperCase()}`,
          kind: 'SUPPLIER_PAYMENT',
          label: 'Supplier Payment',
          description: tx.title || tx.category || 'Payment made to supplier',
          method: `${tx.paymentMethod || 'Cash'}${providerText}`,
          debit: amt,
          credit: 0,
          dueImpact: -amt
        });
      }
    }

    // Sort oldest -> newest to calculate running balance accurately, then show newest first if desired
    rows.sort((a, b) => new Date(a.date) - new Date(b.date));

    const openingDue = Number(selectedParty.openingBalance || 0);
    let runningDue = openingDue;

    const withRunning = rows.map(r => {
      runningDue += Number(r.dueImpact || 0);
      return {
        ...r,
        runningDue
      };
    });

    return withRunning.reverse();
  }, [selectedParty, partyMode, invoiceList, purchaseList, txList]);

  const filteredEntries = useMemo(() => {
    const q = ledgerSearch.trim().toLowerCase();
    if (!q) return ledgerEntries;
    return ledgerEntries.filter(
      e =>
        (e.refNo || '').toLowerCase().includes(q) ||
        (e.label || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q) ||
        (e.method || '').toLowerCase().includes(q)
    );
  }, [ledgerEntries, ledgerSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [partyMode, selectedPartyId, ledgerSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedEntries = filteredEntries.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Summary KPIs for selected party
  const summary = useMemo(() => {
    const currentDue = Number(selectedParty?.dueBalance ?? 0);
    if (partyMode === 'CLIENT') {
      const totalInvoiced = ledgerEntries
        .filter(e => e.kind === 'INVOICE')
        .reduce((s, e) => s + Number(e.debit || 0), 0);
      const totalCollected = ledgerEntries.reduce(
        (s, e) => s + Number(e.credit || 0),
        0
      );
      return {
        primaryLabel: 'Total Invoiced',
        primaryValue: totalInvoiced,
        secondaryLabel: 'Total Received',
        secondaryValue: totalCollected,
        dueLabel: 'Current Receivable Due',
        dueValue: currentDue
      };
    } else {
      const totalPurchased = ledgerEntries
        .filter(e => e.kind === 'PURCHASE')
        .reduce((s, e) => s + Number(e.credit || 0), 0);
      const totalPaid = ledgerEntries.reduce(
        (s, e) => s + Number(e.debit || 0),
        0
      );
      return {
        primaryLabel: 'Total Purchased',
        primaryValue: totalPurchased,
        secondaryLabel: 'Total Paid',
        secondaryValue: totalPaid,
        dueLabel: 'Current Payable Due',
        dueValue: currentDue
      };
    }
  }, [selectedParty, partyMode, ledgerEntries]);

  const partyDisplayName = selectedParty
    ? selectedParty.companyName || selectedParty.name || 'Party'
    : 'No Party Selected';

  const handleDownloadExcel = () => {
    if (!selectedParty) return;
    const headers = [
      'SL',
      'Date',
      'Ref #',
      'Type',
      'Description',
      'Method',
      'Debit (৳)',
      'Credit (৳)',
      'Running Due (৳)'
    ];

    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;

    const rows = filteredEntries.map((row, idx) =>
      [
        escapeCsv(idx + 1),
        escapeCsv(row.date ? new Date(row.date).toLocaleDateString() : ''),
        escapeCsv(row.refNo),
        escapeCsv(row.label),
        escapeCsv(row.description),
        escapeCsv(row.method),
        escapeCsv(Number(row.debit || 0)),
        escapeCsv(Number(row.credit || 0)),
        escapeCsv(Number(row.runningDue || 0))
      ].join(',')
    );

    const csvContent =
      '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = partyDisplayName.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.href = url;
    link.setAttribute('download', `${partyMode}_Ledger_${safeName}_${todayInputDate()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrintLedger = () => {
    if (!selectedParty) return;
    const printWindow = window.open('', '_blank', 'height=750,width=1000');

    const rowsHtml = filteredEntries
      .map(
        (row, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${row.date ? new Date(row.date).toLocaleDateString() : '-'}</td>
          <td><strong>${row.refNo}</strong></td>
          <td>${row.label}</td>
          <td>${row.description}</td>
          <td>${row.method}</td>
          <td class="text-right">৳${Number(row.debit || 0).toLocaleString()}</td>
          <td class="text-right">৳${Number(row.credit || 0).toLocaleString()}</td>
          <td class="text-right"><strong>৳${Number(row.runningDue || 0).toLocaleString()}</strong></td>
        </tr>
      `
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${partyMode === 'CLIENT' ? 'Customer' : 'Supplier'} Ledger Statement</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; }
            h2 { margin: 0 0 4px 0; font-size: 20px; }
            p { margin: 2px 0; font-size: 12px; color: #475569; }
            .kpis { display: flex; gap: 10px; margin-bottom: 16px; }
            .kpi { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; background: #f8fafc; font-size: 12px; }
            .kpi strong { display: block; font-size: 14px; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border-bottom: 1px solid #cbd5e1; padding: 7px 6px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; }
            .text-right { text-align: right; }
            .signatures { display: flex; justify-content: space-between; margin-top: 55px; }
            .sig-box { width: 180px; border-top: 1px solid #64748b; text-align: center; padding-top: 5px; font-size: 11px; color: #475569; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>${partyMode === 'CLIENT' ? 'CUSTOMER' : 'SUPPLIER'} LEDGER STATEMENT</h2>
              <p><strong>Party:</strong> ${partyDisplayName} ${
                selectedParty.phone ? `• Phone: ${selectedParty.phone}` : ''
              }</p>
              ${selectedParty.address ? `<p>Address: ${selectedParty.address}</p>` : ''}
            </div>
            <div style="text-align:right">
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p>Entries: ${filteredEntries.length}</p>
            </div>
          </div>

          <div class="kpis">
            <div class="kpi">${summary.primaryLabel}<strong>৳${summary.primaryValue.toLocaleString()}</strong></div>
            <div class="kpi">${summary.secondaryLabel}<strong>৳${summary.secondaryValue.toLocaleString()}</strong></div>
            <div class="kpi">${summary.dueLabel}<strong>৳${summary.dueValue.toLocaleString()}</strong></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Ref #</th>
                <th>Type</th>
                <th>Description</th>
                <th>Method</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Credit</th>
                <th class="text-right">Running Due</th>
              </tr>
            </thead>
            <tbody>
              ${
                rowsHtml ||
                `<tr><td colspan="9" style="text-align:center;padding:16px;">No ledger transactions found.</td></tr>`
              }
            </tbody>
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

  const renderKindBadge = (kind) => {
    switch (kind) {
      case 'INVOICE':
        return (
          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" /> Invoice
          </span>
        );
      case 'PURCHASE':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <ShoppingCart className="w-3.5 h-3.5" /> Purchase
          </span>
        );
      case 'DUE_COLLECTION':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <HandCoins className="w-3.5 h-3.5" /> Collection
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
            <Receipt className="w-3.5 h-3.5" /> Payment
          </span>
        );
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header & Mode Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            Customer & Supplier Ledger
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Inspect receivables, payables, invoice/purchase/payment history, and print party statements.
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-white border border-slate-200 p-1 shadow-sm self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPartyMode('CLIENT')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition ${
              partyMode === 'CLIENT'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> Customers
          </button>
          <button
            type="button"
            onClick={() => setPartyMode('SUPPLIER')}
            className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition ${
              partyMode === 'SUPPLIER'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Truck className="w-4 h-4" /> Suppliers
          </button>
        </div>
      </div>

      {/* Party Selector Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Filter {partyMode === 'CLIENT' ? 'Customer' : 'Supplier'}
          </label>
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Name or phone..."
              value={partySearch}
              onChange={e => setPartySearch(e.target.value)}
              className="w-full text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Select {partyMode === 'CLIENT' ? 'Customer' : 'Supplier'} *
          </label>
          <select
            value={selectedPartyId}
            onChange={e => setSelectedPartyId(e.target.value)}
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {filteredPartyList.length === 0 ? (
              <option value="">No matching party</option>
            ) : (
              filteredPartyList.map(p => (
                <option key={p._id} value={p._id}>
                  {p.companyName || p.name} ({p.phone}) — Due: ৳
                  {Number(p.dueBalance || 0).toLocaleString()}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex flex-wrap md:justify-end gap-2">
          <button
            type="button"
            onClick={handleDownloadExcel}
            disabled={!selectedParty}
            className="bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 text-emerald-700 border border-emerald-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm inline-flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" /> Excel
          </button>

          <button
            type="button"
            onClick={handlePrintLedger}
            disabled={!selectedParty}
            className="bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm shadow-sm inline-flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4 text-indigo-600" /> Print Ledger
          </button>
        </div>
      </div>

      {/* Selected Party Summary Cards */}
      {selectedParty && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              {summary.primaryLabel}
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              ৳ {summary.primaryValue.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{partyDisplayName}</p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              {summary.secondaryLabel}
            </p>
            <p className="text-xl sm:text-2xl font-extrabold text-emerald-700 mt-1">
              ৳ {summary.secondaryValue.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Invoices/Bills + Account settlements
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              {summary.dueLabel}
            </p>
            <p
              className={`text-xl sm:text-2xl font-extrabold mt-1 ${
                summary.dueValue > 0 ? 'text-red-600' : 'text-emerald-700'
              }`}
            >
              ৳ {summary.dueValue.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Phone: {selectedParty.phone || 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Ledger Entries Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {partyDisplayName} — Ledger Statement
            </h3>
            <p className="text-xs text-slate-500">
              {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
            </p>
          </div>

          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search ref #, description, method..."
              value={ledgerSearch}
              onChange={e => setLedgerSearch(e.target.value)}
              className="w-full text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Date & Ref</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4 text-right">Debit (৳)</th>
                <th className="py-3.5 px-4 text-right">Credit (৳)</th>
                <th className="py-3.5 px-4 text-right">Running Due (৳)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedEntries.length > 0 ? (
                paginatedEntries.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-mono text-xs font-bold text-indigo-600">
                        {row.refNo}
                      </p>
                      <p className="text-xs text-slate-500">
                        {row.date ? new Date(row.date).toLocaleDateString() : ''}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">{renderKindBadge(row.kind)}</td>
                    <td className="py-3.5 px-4 text-slate-700">{row.description}</td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      {row.method}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                      {row.debit > 0 ? `৳ ${Number(row.debit).toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-700">
                      {row.credit > 0 ? `৳ ${Number(row.credit).toLocaleString()}` : '—'}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-extrabold ${
                        row.runningDue > 0 ? 'text-red-600' : 'text-slate-700'
                      }`}
                    >
                      ৳ {Number(row.runningDue || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 text-sm">
                    No ledger entries found for this party.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedEntries.length > 0 ? (
            paginatedEntries.map(row => (
              <div key={row.id} className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-indigo-600">
                      {row.refNo}
                    </span>
                    <p className="text-xs text-slate-400">
                      {row.date ? new Date(row.date).toLocaleDateString() : ''} • {row.method}
                    </p>
                  </div>
                  {renderKindBadge(row.kind)}
                </div>

                <p className="text-xs text-slate-700">{row.description}</p>

                <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 block">Debit</span>
                    <strong className="text-slate-800">
                      ৳{Number(row.debit || 0).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Credit</span>
                    <strong className="text-emerald-700">
                      ৳{Number(row.credit || 0).toLocaleString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Due</span>
                    <strong
                      className={row.runningDue > 0 ? 'text-red-600' : 'text-slate-700'}
                    >
                      ৳{Number(row.runningDue || 0).toLocaleString()}
                    </strong>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              No ledger entries found for this party.
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredEntries.length > 0 && (
          <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <p className="text-slate-500">
              Showing <span className="font-semibold text-slate-700">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">
                {Math.min(startIndex + itemsPerPage, filteredEntries.length)}
              </span>{' '}
              of <span className="font-semibold text-slate-700">{filteredEntries.length}</span>{' '}
              entries
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
    </div>
  );
}