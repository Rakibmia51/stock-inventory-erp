

// import { useState, useEffect } from 'react';
// import {
//   Plus,
//   Pencil,
//   Trash2,
//   Search,
//   X,
//   AlertTriangle,
//   CheckCircle2,
//   RotateCcw,
//   History,
//   Printer,
//   Download,
//   ChevronLeft,
//   ChevronRight,
//   Sparkles,
//   Camera
// } from 'lucide-react';
// import {
//   addProduct,
//   updateProduct,
//   deleteProduct,
//   createReturn,
//   getReturns
// } from '../services/api';
// import { DEFAULT_ERP_SETTINGS } from './Settings';
// import CameraScannerModal from './CameraScannerModal';

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

// const generateUniqueSku = (existingProducts = [], prefix = 'PRD', excludeId = null) => {
//   const list = Array.isArray(existingProducts) ? existingProducts : [];
//   const used = new Set(
//     list
//       .filter(p => !excludeId || p?._id !== excludeId)
//       .flatMap(p => [p?.sku, p?.barcode])
//       .map(v => String(v || '').trim().toUpperCase())
//       .filter(Boolean)
//   );

//   const baseNum = list.length + 1001;
//   let candidate = `${prefix}-${baseNum}`;
//   let counter = 0;

//   while (used.has(candidate.toUpperCase())) {
//     counter += 1;
//     const rand = Math.floor(100 + Math.random() * 900);
//     candidate = `${prefix}-${baseNum + counter}-${rand}`;
//   }

//   return candidate;
// };

// const EMPTY_FORM = {
//   name: '',
//   sku: '',
//   category: '',
//   openingStock: '',
//   buyPrice: '',
//   sellPrice: '',
//   minStockLevel: 5
// };

// export default function Products({ products = [], suppliers, reloadData, settings, user }) {
//   const activeSettings = {
//     ...DEFAULT_ERP_SETTINGS,
//     ...(settings || {})
//   };
//   const currency = activeSettings.currencySymbol || '৳';
//   const companyTitle = (activeSettings.companyName || 'NEXUS ERP').trim();

//   const productList = Array.isArray(products) ? products : [];

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [editingProductId, setEditingProductId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('ALL');
//   const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | LOW | IN_STOCK
//   const [loading, setLoading] = useState(false);

//   // Camera Scanner State ('search' | 'form')
//   const [showCameraScanner, setShowCameraScanner] = useState(false);
//   const [scanTarget, setScanTarget] = useState('search');

//   // Pagination State
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 8;

//   // Add / Edit Product Form State
//   const [form, setForm] = useState(EMPTY_FORM);

//   // Return Modal State
//   const [returnModal, setReturnModal] = useState({ open: false, product: null });
//   const [returnForm, setReturnForm] = useState({
//     returnType: 'SALES_RETURN',
//     amount: '',
//     reason: ''
//   });

//   // Return History Modal State
//   const [historyModalOpen, setHistoryModalOpen] = useState(false);
//   const [returnHistory, setReturnHistory] = useState([]);
//   const [loadingHistory, setLoadingHistory] = useState(false);

//   const [historyFromDate, setHistoryFromDate] = useState('');
//   const [historyToDate, setHistoryToDate] = useState('');

//   const currentUser = getEffectiveUser(user);
//   const isAdmin =
//     (currentUser?.userType || '').toLowerCase() === 'admin' ||
//     (currentUser?.role || '').toLowerCase() === 'admin';

//   // const canEditProduct = isAdmin || Boolean(currentUser?.permissions?.products);
//   // const canDeleteProduct = isAdmin || Boolean(currentUser?.permissions?.products);

//   // Stock Ledger Metrics Helper
//   const getStockMetrics = (p) => {
//     const opening = Number(p.openingStock ?? 0);
//     const purchased = Number(p.purchasedQty ?? 0);
//     const sold = Number(p.soldQty ?? 0);
//     const returned = Number(p.returnedQty ?? 0);
//     const current = Math.max(
//       0,
//       Number(p.quantity ?? opening + purchased - sold + returned)
//     );
//     const isLow = current <= Number(p.minStockLevel ?? 5);
//     return { opening, purchased, sold, returned, current, isLow };
//   };

//   // Unique Categories
//   const categories = Array.from(
//     new Set(
//       productList
//         .map(p => (p.category || '').trim())
//         .filter(Boolean)
//     )
//   );

//   // Filter Logic (Search + Category + Stock Status)
//   const filteredProducts = productList.filter(p => {
//     const q = searchTerm.trim().toLowerCase();
//     const matchesSearch =
//       !q ||
//       (p.name || '').toLowerCase().includes(q) ||
//       (p.sku || '').toLowerCase().includes(q) ||
//       (p.barcode || '').toLowerCase().includes(q) ||
//       (p.category || '').toLowerCase().includes(q);

//     const matchesCategory =
//       categoryFilter === 'ALL' ||
//       (p.category || '').toLowerCase() === categoryFilter.toLowerCase();

//     const { isLow } = getStockMetrics(p);
//     const matchesStatus =
//       statusFilter === 'ALL' ||
//       (statusFilter === 'LOW' && isLow) ||
//       (statusFilter === 'IN_STOCK' && !isLow);

//     return matchesSearch && matchesCategory && matchesStatus;
//   });

//   // Total Stock Summary Value
//   const stockSummary = filteredProducts.reduce(
//     (acc, p) => {
//       const { opening, purchased, sold, returned, current } = getStockMetrics(p);
//       const buyVal = Number(p.buyPrice ?? 0);
//       const sellVal = Number(p.sellPrice ?? p.price ?? 0);

//       acc.totalOpening += opening;
//       acc.totalPurchased += purchased;
//       acc.totalSold += sold;
//       acc.totalReturned += returned;
//       acc.totalUnits += current;
//       acc.totalBuyValue += current * buyVal;
//       acc.totalSellValue += current * sellVal;
//       return acc;
//     },
//     {
//       totalOpening: 0,
//       totalPurchased: 0,
//       totalSold: 0,
//       totalReturned: 0,
//       totalUnits: 0,
//       totalBuyValue: 0,
//       totalSellValue: 0
//     }
//   );

//   const expectedProfit = stockSummary.totalSellValue - stockSummary.totalBuyValue;

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, categoryFilter, statusFilter, productList.length]);

//   const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
//   const safeCurrentPage = Math.min(currentPage, totalPages);
//   const startIndex = (safeCurrentPage - 1) * itemsPerPage;
//   const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

//   const closeProductModal = () => {
//     setIsModalOpen(false);
//     setEditingProductId(null);
//     setForm(EMPTY_FORM);
//   };

//   const openAddProductModal = (prefilledSku = '') => {
//     const cleanSku = String(prefilledSku || '').trim();
//     setEditingProductId(null);
//     setForm({
//       ...EMPTY_FORM,
//       sku: cleanSku || generateUniqueSku(productList, 'PRD')
//     });
//     setIsModalOpen(true);
//   };

//   const openEditProductModal = (product) => {
//     if (!product) return;
//     const { current } = getStockMetrics(product);
//     setEditingProductId(product._id);
//     setForm({
//       name: product.name || '',
//       sku: product.sku || product.barcode || '',
//       category: product.category || 'General',
//       openingStock: current,
//       buyPrice: product.buyPrice ?? 0,
//       sellPrice: product.sellPrice ?? product.price ?? 0,
//       minStockLevel: product.minStockLevel ?? 5
//     });
//     setIsModalOpen(true);
//   };

//   // ক্যামেরা বারকোড স্ক্যান হ্যান্ডলার
//   const handleCameraScanSuccess = (scannedCode) => {
//     const cleanCode = String(scannedCode || '').trim();
//     if (!cleanCode) return;

//     if (scanTarget === 'form' && isModalOpen) {
//       setForm(prev => ({ ...prev, sku: cleanCode }));
//       return;
//     }

//     const normalized = cleanCode.toLowerCase();
//     const matched = productList.find(p => {
//       const sku = String(p?.sku || '').trim().toLowerCase();
//       const barcode = String(p?.barcode || '').trim().toLowerCase();
//       return sku === normalized || barcode === normalized;
//     });

//     if (matched) {
//       setSearchTerm(cleanCode);
//       setCategoryFilter('ALL');
//       setStatusFilter('ALL');
//       setCurrentPage(1);
//     } else {
//       openAddProductModal(cleanCode);
//     }
//   };

//   // ১. নতুন প্রোডাক্ট যোগ বা বিদ্যমান প্রোডাক্ট আপডেট করা
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const stockNum = Math.max(0, Number(form.openingStock) || 0);
//       const buyNum = Math.max(0, Number(form.buyPrice) || 0);
//       const sellNum = Math.max(0, Number(form.sellPrice) || 0);
//       const cleanSku =
//         String(form.sku || '').trim() ||
//         generateUniqueSku(productList, 'PRD', editingProductId);

//       if (editingProductId) {
//         await updateProduct(editingProductId, {
//           name: String(form.name || '').trim(),
//           sku: cleanSku,
//           barcode: cleanSku,
//           category: String(form.category || '').trim() || 'General',
//           buyPrice: buyNum,
//           sellPrice: sellNum,
//           price: sellNum,
//           quantity: stockNum,
//           minStockLevel: Math.max(0, Number(form.minStockLevel) || 5)
//         });
//       } else {
//         await addProduct({
//           name: String(form.name || '').trim(),
//           sku: cleanSku,
//           barcode: cleanSku,
//           category: String(form.category || '').trim() || 'General',
//           openingStock: stockNum,
//           quantity: stockNum,
//           buyPrice: buyNum,
//           sellPrice: sellNum,
//           price: sellNum,
//           minStockLevel: Math.max(0, Number(form.minStockLevel) || 5)
//         });
//       }

//       closeProductModal();
//       reloadData?.();
//     } catch (err) {
//       alert(err.response?.data?.message || err.message || 'Error saving product');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ২. Return সাবমিট করা
//   const handleReturnSubmit = async (e) => {
//     e.preventDefault();
//     if (!returnModal.product) return;
//     setLoading(true);
//     try {
//       await createReturn({
//         productId: returnModal.product._id,
//         returnType: returnForm.returnType,
//         amount: Number(returnForm.amount),
//         reason: returnForm.reason
//       });
//       setReturnModal({ open: false, product: null });
//       setReturnForm({ returnType: 'SALES_RETURN', amount: '', reason: '' });
//       reloadData?.();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Error processing return');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ৩. Return History লোড করা
//   const handleOpenHistory = async () => {
//     setHistoryModalOpen(true);
//     setLoadingHistory(true);
//     try {
//       const { data } = await getReturns();
//       setReturnHistory(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error('Error fetching return history:', err);
//     } finally {
//       setLoadingHistory(false);
//     }
//   };

//   // ৪. প্রোডাক্ট ডিলিট করা
//   const handleDelete = async (id) => {
//     if (!confirm('আপনি কি নিশ্চিত এটি ডিলিট করতে চান?')) return;
//     try {
//       await deleteProduct(id);
//       reloadData?.();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Error deleting product');
//     }
//   };

//   // ৫. Excel (.csv with UTF-8 BOM) Download + Total Stock Summary
//   const handleDownloadExcel = () => {
//     const headers = [
//       'Product Name',
//       'SKU',
//       'Category',
//       'Buy Price',
//       'Sell Price',
//       'Opening Stock',
//       'Purchase (IN)',
//       'Sell (OUT)',
//       'Return',
//       'Current Stock',
//       'Stock Buy Value',
//       'Stock Sell Value',
//       'Status'
//     ];

//     const escapeCsv = (val) => {
//       const str = String(val ?? '');
//       return `"${str.replace(/"/g, '""')}"`;
//     };

//     const rows = filteredProducts.map(p => {
//       const { opening, purchased, sold, returned, current, isLow } = getStockMetrics(p);
//       const buyVal = Number(p.buyPrice ?? 0);
//       const sellVal = Number(p.sellPrice ?? p.price ?? 0);
//       return [
//         escapeCsv(p.name),
//         escapeCsv(p.sku),
//         escapeCsv(p.category),
//         escapeCsv(buyVal),
//         escapeCsv(sellVal),
//         escapeCsv(opening),
//         escapeCsv(purchased),
//         escapeCsv(sold),
//         escapeCsv(returned),
//         escapeCsv(current),
//         escapeCsv(current * buyVal),
//         escapeCsv(current * sellVal),
//         escapeCsv(isLow ? 'Low Stock' : 'In Stock')
//       ].join(',');
//     });

//     const totalRow = [
//       escapeCsv('TOTAL SUMMARY'),
//       escapeCsv(''),
//       escapeCsv(`${filteredProducts.length} Items`),
//       escapeCsv(''),
//       escapeCsv(''),
//       escapeCsv(stockSummary.totalOpening),
//       escapeCsv(stockSummary.totalPurchased),
//       escapeCsv(stockSummary.totalSold),
//       escapeCsv(stockSummary.totalReturned),
//       escapeCsv(stockSummary.totalUnits),
//       escapeCsv(stockSummary.totalBuyValue),
//       escapeCsv(stockSummary.totalSellValue),
//       escapeCsv(`Profit: ${expectedProfit}`)
//     ].join(',');

//     const csvContent =
//       '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows, totalRow].join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     const dateStr = new Date().toISOString().slice(0, 10);
//     link.href = url;
//     link.setAttribute('download', `Stock_Ledger_${dateStr}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url);
//   };

//   // ৬. Print Filtered / All Products with Total Stock Summary
//   const handlePrintProducts = () => {
//     const printWindow = window.open('', '_blank', 'height=750,width=1050');
//     if (!printWindow) return;

//     const filterSummary = [
//       categoryFilter !== 'ALL' ? `Category: ${categoryFilter}` : 'All Categories',
//       statusFilter === 'LOW'
//         ? 'Status: Low Stock'
//         : statusFilter === 'IN_STOCK'
//         ? 'Status: In Stock'
//         : 'All Status',
//       searchTerm.trim() ? `Search: "${searchTerm.trim()}"` : ''
//     ]
//       .filter(Boolean)
//       .join(' | ');

//     const rowsHtml = filteredProducts
//       .map((p, idx) => {
//         const { opening, purchased, sold, returned, current, isLow } = getStockMetrics(p);
//         const buyVal = Number(p.buyPrice ?? 0);
//         const sellVal = Number(p.sellPrice ?? p.price ?? 0);
//         return `
//           <tr>
//             <td>${idx + 1}</td>
//             <td><strong>${p.name}</strong><br/><small>${p.sku || ''}</small></td>
//             <td>${p.category || '-'}</td>
//             <td class="text-right">${currency}${buyVal.toLocaleString()}</td>
//             <td class="text-right">${currency}${sellVal.toLocaleString()}</td>
//             <td class="text-right">${opening}</td>
//             <td class="text-right">+${purchased}</td>
//             <td class="text-right">-${sold}</td>
//             <td class="text-right">${returned >= 0 ? `+${returned}` : returned}</td>
//             <td class="text-right"><strong>${current}</strong></td>
//             <td class="text-right">${currency}${(current * buyVal).toLocaleString()}</td>
//             <td class="text-right">${currency}${(current * sellVal).toLocaleString()}</td>
//             <td>${isLow ? 'Low Stock' : 'In Stock'}</td>
//           </tr>
//         `;
//       })
//       .join('');

//     const metaParts = [
//       activeSettings.address,
//       activeSettings.phone && `Phone: ${activeSettings.phone}`,
//       activeSettings.email && `Email: ${activeSettings.email}`,
//       activeSettings.taxId && `BIN/VAT: ${activeSettings.taxId}`
//     ].filter(Boolean);

//     const logoHtml =
//       activeSettings.logoUrl && activeSettings.logoUrl.trim()
//         ? `<img src="${activeSettings.logoUrl}" alt="${companyTitle}" style="width:44px;height:44px;object-fit:contain;border:1px solid #e2e8f0;border-radius:8px;padding:3px;" />`
//         : '';

//     const signaturesHtml =
//       activeSettings.showSignatureOnPrint !== false
//         ? `
//           <div class="signatures">
//             <div class="sig-box">Prepared By</div>
//             <div class="sig-box">Checked By</div>
//             <div class="sig-box">Authorized Signature (${companyTitle})</div>
//           </div>
//         `
//         : '';

//     const footerHtml = activeSettings.invoiceFooter
//       ? `<div class="footer-note">${activeSettings.invoiceFooter}</div>`
//       : '';

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Inventory Stock Ledger Report - ${companyTitle}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
//             .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; gap: 12px; }
//             .brand-row { display: flex; align-items: flex-start; gap: 10px; }
//             h2 { margin: 0 0 4px 0; font-size: 20px; }
//             p { margin: 2px 0; font-size: 12px; color: #475569; }
//             .summary-grid { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 16px; }
//             .summary-box { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; background: #f8fafc; font-size: 12px; }
//             .summary-box strong { display: block; font-size: 14px; margin-top: 2px; color: #0f172a; }
//             table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
//             th, td { border-bottom: 1px solid #cbd5e1; padding: 6px 5px; text-align: left; }
//             th { background: #f1f5f9; font-weight: bold; }
//             tfoot td { background: #f8fafc; font-weight: bold; border-top: 2px solid #94a3b8; }
//             .text-right { text-align: right; }
//             .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
//             .sig-box { width: 190px; border-top: 1px solid #64748b; text-align: center; padding-top: 5px; font-size: 11px; color: #475569; }
//             .footer-note { margin-top: 24px; padding-top: 10px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 11px; color: #64748b; }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <div class="brand-row">
//               ${logoHtml}
//               <div>
//                 <h2>${companyTitle} — INVENTORY STOCK LEDGER</h2>
//                 ${metaParts.length ? `<p>${metaParts.join(' • ')}</p>` : ''}
//                 <p>${filterSummary} • Total Products: ${filteredProducts.length}</p>
//               </div>
//             </div>
//             <div style="text-align:right">
//               <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
//             </div>
//           </div>

//           <div class="summary-grid">
//             <div class="summary-box">Total Stock Qty<strong>${stockSummary.totalUnits.toLocaleString()} pcs</strong></div>
//             <div class="summary-box">Total Buy Value<strong>${currency}${stockSummary.totalBuyValue.toLocaleString()}</strong></div>
//             <div class="summary-box">Total Sell Value<strong>${currency}${stockSummary.totalSellValue.toLocaleString()}</strong></div>
//             <div class="summary-box">Expected Profit<strong>${expectedProfit >= 0 ? '+' : ''}${currency}${expectedProfit.toLocaleString()}</strong></div>
//           </div>

//           <table>
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Product & SKU</th>
//                 <th>Category</th>
//                 <th class="text-right">Buy</th>
//                 <th class="text-right">Sell</th>
//                 <th class="text-right">Open</th>
//                 <th class="text-right">IN</th>
//                 <th class="text-right">OUT</th>
//                 <th class="text-right">Ret</th>
//                 <th class="text-right">Stock</th>
//                 <th class="text-right">Buy Val</th>
//                 <th class="text-right">Sell Val</th>
//                 <th>Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${
//                 rowsHtml ||
//                 `<tr><td colspan="13" style="text-align:center;padding:16px;">No products to display.</td></tr>`
//               }
//             </tbody>
//             <tfoot>
//               <tr>
//                 <td colspan="5">TOTAL</td>
//                 <td class="text-right">${stockSummary.totalOpening}</td>
//                 <td class="text-right">+${stockSummary.totalPurchased}</td>
//                 <td class="text-right">-${stockSummary.totalSold}</td>
//                 <td class="text-right">${stockSummary.totalReturned}</td>
//                 <td class="text-right">${stockSummary.totalUnits}</td>
//                 <td class="text-right">${currency}${stockSummary.totalBuyValue.toLocaleString()}</td>
//                 <td class="text-right">${currency}${stockSummary.totalSellValue.toLocaleString()}</td>
//                 <td></td>
//               </tr>
//             </tfoot>
//           </table>

//           ${signaturesHtml}
//           ${footerHtml}
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

//   const parseDateBound = (dateStr, endOfDay = false) => {
//     if (!dateStr) return null;
//     const [y, m, d] = dateStr.split('-').map(Number);
//     if (!y || !m || !d) return null;
//     return endOfDay
//       ? new Date(y, m - 1, d, 23, 59, 59, 999)
//       : new Date(y, m - 1, d, 0, 0, 0, 0);
//   };

//   const filteredReturnHistory = (Array.isArray(returnHistory) ? returnHistory : []).filter(item => {
//     const fromBound = parseDateBound(historyFromDate, false);
//     const toBound = parseDateBound(historyToDate, true);
//     if (!fromBound && !toBound) return true;

//     const rawDate = item?.createdAt || item?.returnDate || item?.date;
//     if (!rawDate) return false;
//     const dt = new Date(rawDate);
//     if (Number.isNaN(dt.getTime())) return false;

//     if (fromBound && dt < fromBound) return false;
//     if (toBound && dt > toBound) return false;
//     return true;
//   });

//   const salesReturnQty = filteredReturnHistory
//     .filter(r => r.returnType === 'SALES_RETURN')
//     .reduce((sum, r) => sum + Number(r.quantity || 0), 0);

//   const purchaseReturnQty = filteredReturnHistory
//     .filter(r => r.returnType !== 'SALES_RETURN')
//     .reduce((sum, r) => sum + Number(r.quantity || 0), 0);

//   const returnPeriodText =
//     historyFromDate && historyToDate
//       ? `${historyFromDate} to ${historyToDate}`
//       : historyFromDate
//       ? `From ${historyFromDate}`
//       : historyToDate
//       ? `Up to ${historyToDate}`
//       : 'All Dates';

//   const handlePrintReturnHistory = () => {
//     const printWindow = window.open('', '_blank', 'height=750,width=980');
//     if (!printWindow) return;

//     const rowsHtml = filteredReturnHistory
//       .map((item, idx) => {
//         const isSalesRet = item.returnType === 'SALES_RETURN';
//         const typeLabel = isSalesRet ? 'Sales Return (+)' : 'Purchase Return (-)';
//         const dateFormatted = item.createdAt
//           ? new Date(item.createdAt).toLocaleDateString()
//           : '-';

//         return `
//           <tr>
//             <td>${idx + 1}</td>
//             <td class="mono"><strong>${item.returnNumber || '-'}</strong></td>
//             <td>
//               <strong>${item.product?.name || 'Deleted Product'}</strong>
//               ${item.product?.sku ? `<br/><small>${item.product.sku}</small>` : ''}
//             </td>
//             <td>${typeLabel}</td>
//             <td class="text-right"><strong>${Number(item.quantity || 0).toLocaleString()}</strong></td>
//             <td>${item.reason || '-'}</td>
//             <td>${dateFormatted}</td>
//           </tr>
//         `;
//       })
//       .join('');

//     const metaParts = [
//       activeSettings.address,
//       activeSettings.phone && `Phone: ${activeSettings.phone}`,
//       activeSettings.email && `Email: ${activeSettings.email}`,
//       activeSettings.taxId && `BIN/VAT: ${activeSettings.taxId}`
//     ].filter(Boolean);

//     const logoHtml =
//       activeSettings.logoUrl && activeSettings.logoUrl.trim()
//         ? `<img src="${activeSettings.logoUrl}" alt="${companyTitle}" style="width:44px;height:44px;object-fit:contain;border:1px solid #e2e8f0;border-radius:8px;padding:3px;" />`
//         : '';

//     const signaturesHtml =
//       activeSettings.showSignatureOnPrint !== false
//         ? `
//           <div class="signatures">
//             <div class="sig-box">Prepared By</div>
//             <div class="sig-box">Store / Checked By</div>
//             <div class="sig-box">Authorized Signature (${companyTitle})</div>
//           </div>
//         `
//         : '';

//     const footerHtml = activeSettings.invoiceFooter
//       ? `<div class="footer-note">${activeSettings.invoiceFooter}</div>`
//       : '';

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Stock Return History - ${companyTitle}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
//             .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 14px; gap: 12px; }
//             .brand-row { display: flex; align-items: flex-start; gap: 10px; }
//             h2 { margin: 0 0 4px 0; font-size: 19px; }
//             p { margin: 2px 0; font-size: 12px; color: #475569; }
//             .summary-bar { display: flex; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
//             .summary-card { flex: 1; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 10px; background: #f8fafc; font-size: 11.5px; }
//             .summary-card strong { display: block; font-size: 13px; margin-top: 2px; color: #0f172a; }
//             table { width: 100%; border-collapse: collapse; font-size: 12px; }
//             th, td { border-bottom: 1px solid #cbd5e1; padding: 7px 6px; text-align: left; }
//             th { background: #f1f5f9; font-weight: bold; }
//             .mono { font-family: monospace; }
//             .text-right { text-align: right; }
//             .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
//             .sig-box { width: 190px; border-top: 1px solid #64748b; text-align: center; padding-top: 5px; font-size: 11px; color: #475569; }
//             .footer-note { margin-top: 24px; padding-top: 10px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 11px; color: #64748b; }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <div class="brand-row">
//               ${logoHtml}
//               <div>
//                 <h2>${companyTitle} — STOCK RETURN HISTORY</h2>
//                 ${metaParts.length ? `<p>${metaParts.join(' • ')}</p>` : ''}
//                 <p><strong>Date Range:</strong> ${returnPeriodText} • <strong>Records:</strong> ${filteredReturnHistory.length}</p>
//               </div>
//             </div>
//             <div style="text-align:right">
//               <p><strong>Printed:</strong> ${new Date().toLocaleDateString()}</p>
//             </div>
//           </div>

//           <div class="summary-bar">
//             <div class="summary-card">Total Returns<strong>${filteredReturnHistory.length} entries</strong></div>
//             <div class="summary-card">Sales Return Qty (+)<strong>${salesReturnQty.toLocaleString()} pcs</strong></div>
//             <div class="summary-card">Purchase Return Qty (-)<strong>${purchaseReturnQty.toLocaleString()} pcs</strong></div>
//           </div>

//           <table>
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Return #</th>
//                 <th>Product</th>
//                 <th>Type</th>
//                 <th class="text-right">Qty</th>
//                 <th>Reason</th>
//                 <th>Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${
//                 rowsHtml ||
//                 `<tr><td colspan="7" style="text-align:center;padding:16px;">No return records found for selected dates.</td></tr>`
//               }
//             </tbody>
//           </table>

//           ${signaturesHtml}
//           ${footerHtml}
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
//       {/* Header & Action Bar */}
//       <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//         <div>
//           <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Inventory Stock Ledger</h2>
//           <p className="text-xs sm:text-sm text-slate-500">
//             Track buy/sell prices, stock summary values, ledger movements, and returns.
//           </p>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           <button
//             type="button"
//             onClick={handleDownloadExcel}
//             className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1.5 transition"
//           >
//             <Download className="w-4 h-4" /> Excel
//           </button>

//           <button
//             type="button"
//             onClick={handlePrintProducts}
//             className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition"
//           >
//             <Printer className="w-4 h-4 text-slate-700" /> Print ({filteredProducts.length})
//           </button>

//           <button
//             type="button"
//             onClick={handleOpenHistory}
//             className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition"
//           >
//             <History className="w-4 h-4 text-indigo-600" /> Return History
//           </button>

//           <button
//             type="button"
//             onClick={() => openAddProductModal('')}
//             className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition"
//           >
//             <Plus className="w-4 h-4" /> Add Product
//           </button>
//         </div>
//       </div>

//       {/* Total Stock Summary Value Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
//           <p className="text-xs font-semibold text-slate-500 uppercase">Total Stock Qty</p>
//           <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
//             {stockSummary.totalUnits.toLocaleString()}{' '}
//             <span className="text-xs font-medium text-slate-500">pcs</span>
//           </p>
//           <p className="text-[11px] text-slate-400 mt-1">
//             Across {filteredProducts.length} filtered items
//           </p>
//         </div>

//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
//           <p className="text-xs font-semibold text-slate-500 uppercase">Stock Value (Buy Price)</p>
//           <p className="text-xl sm:text-2xl font-extrabold text-amber-700 mt-1">
//             {currency} {stockSummary.totalBuyValue.toLocaleString()}
//           </p>
//           <p className="text-[11px] text-slate-400 mt-1">Total invested stock cost</p>
//         </div>

//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
//           <p className="text-xs font-semibold text-slate-500 uppercase">Stock Value (Sell Price)</p>
//           <p className="text-xl sm:text-2xl font-extrabold text-indigo-700 mt-1">
//             {currency} {stockSummary.totalSellValue.toLocaleString()}
//           </p>
//           <p className="text-[11px] text-slate-400 mt-1">Potential total sales value</p>
//         </div>

//         <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
//           <p className="text-xs font-semibold text-slate-500 uppercase">Expected Stock Profit</p>
//           <p
//             className={`text-xl sm:text-2xl font-extrabold mt-1 ${
//               expectedProfit >= 0 ? 'text-emerald-600' : 'text-red-600'
//             }`}
//           >
//             {expectedProfit >= 0 ? '+' : ''}{currency} {expectedProfit.toLocaleString()}
//           </p>
//           <p className="text-[11px] text-slate-400 mt-1">Sell value minus buy value</p>
//         </div>
//       </div>

//       {/* Search & Filter Bar */}
//       <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-3">
//         <div className="md:col-span-6 flex items-center gap-2">
//           <div className="flex-1 flex items-center gap-2.5 border border-slate-200 rounded-xl px-3 py-2">
//             <Search className="w-4 h-4 text-slate-400 shrink-0" />
//             <input
//               type="text"
//               placeholder="Search by product name, SKU, barcode, or category..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full text-sm outline-none text-slate-700 placeholder-slate-400 bg-transparent"
//             />
//           </div>
//           <button
//             type="button"
//             onClick={() => {
//               setScanTarget('search');
//               setShowCameraScanner(true);
//             }}
//             className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 transition"
//             title="Scan Barcode to Find Product"
//           >
//             <Camera className="w-4 h-4" /> Scan
//           </button>
//         </div>

//         <div className="md:col-span-3">
//           <select
//             value={categoryFilter}
//             onChange={(e) => setCategoryFilter(e.target.value)}
//             className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="ALL">All Categories</option>
//             {categories.map(cat => (
//               <option key={cat} value={cat}>
//                 {cat}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="md:col-span-3">
//           <select
//             value={statusFilter}
//             onChange={(e) => setStatusFilter(e.target.value)}
//             className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
//           >
//             <option value="ALL">All Stock Status</option>
//             <option value="IN_STOCK">In Stock Only</option>
//             <option value="LOW">Low Stock Only</option>
//           </select>
//         </div>
//       </div>

//       {/* Stock Ledger Container */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
//         {/* Desktop Table View */}
//         <div className="hidden lg:block overflow-x-auto">
//           <table className="w-full text-left border-collapse min-w-[1180px]">
//             <thead>
//               <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
//                 <th className="py-3.5 px-4">Product & SKU</th>
//                 <th className="py-3.5 px-4">Category</th>
//                 <th className="py-3.5 px-4 text-right">Buy Price</th>
//                 <th className="py-3.5 px-4 text-right">Sell Price</th>
//                 <th className="py-3.5 px-4 text-right">Opening</th>
//                 <th className="py-3.5 px-4 text-right">Purchase (IN)</th>
//                 <th className="py-3.5 px-4 text-right">Sell (OUT)</th>
//                 <th className="py-3.5 px-4 text-right">Return</th>
//                 <th className="py-3.5 px-4 text-right">Current Stock</th>
//                 <th className="py-3.5 px-4 text-right">Stock Value</th>
//                 <th className="py-3.5 px-4">Status</th>
//                 <th className="py-3.5 px-4 text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 text-sm">
//               {paginatedProducts.length > 0 ? (
//                 paginatedProducts.map(p => {
//                   const { opening, purchased, sold, returned, current, isLow } = getStockMetrics(p);
//                   const buyVal = Number(p.buyPrice ?? 0);
//                   const sellVal = Number(p.sellPrice ?? p.price ?? 0);
//                   const rowStockValue = current * sellVal;

//                   return (
//                     <tr key={p._id} className="hover:bg-slate-50 transition">
//                       <td className="py-3.5 px-4">
//                         <div className="font-bold text-slate-800">{p.name}</div>
//                         <div className="text-xs font-mono text-slate-500">{p.sku || '-'}</div>
//                       </td>
//                       <td className="py-3.5 px-4 text-xs">
//                         <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
//                           {p.category || 'General'}
//                         </span>
//                       </td>
//                       <td className="py-3.5 px-4 text-right text-slate-600">
//                         {currency} {buyVal.toLocaleString()}
//                       </td>
//                       <td className="py-3.5 px-4 text-right font-semibold text-indigo-700">
//                         {currency} {sellVal.toLocaleString()}
//                       </td>
//                       <td className="py-3.5 px-4 text-right text-slate-600">{opening}</td>
//                       <td className="py-3.5 px-4 text-right text-emerald-700 font-medium">
//                         +{purchased}
//                       </td>
//                       <td className="py-3.5 px-4 text-right text-amber-700 font-medium">
//                         -{sold}
//                       </td>
//                       <td className="py-3.5 px-4 text-right text-slate-700 font-medium">
//                         {returned >= 0 ? `+${returned}` : returned}
//                       </td>
//                       <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
//                         {current}
//                       </td>
//                       <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
//                         {currency} {rowStockValue.toLocaleString()}
//                       </td>
//                       <td className="py-3.5 px-4">
//                         {isLow ? (
//                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">
//                             <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
//                           </span>
//                         ) : (
//                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
//                             <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
//                           </span>
//                         )}
//                       </td>
//                       <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
//                         {isAdmin && (
//                           <button
//                             type="button"
//                             onClick={() => openEditProductModal(p)}
//                             className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
//                             title="Edit Product"
//                           >
//                             <Pencil className="w-3.5 h-3.5" /> Edit
//                           </button>
//                         )}

//                         <button
//                           type="button"
//                           onClick={() => {
//                             setReturnModal({ open: true, product: p });
//                             setReturnForm({
//                               returnType: 'SALES_RETURN',
//                               amount: '',
//                               reason: ''
//                             });
//                           }}
//                           className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition"
//                           title="Record Stock Return"
//                         >
//                           <RotateCcw className="w-3.5 h-3.5" /> Return
//                         </button>

//                         {isAdmin && (
//                           <button
//                             type="button"
//                             onClick={() => handleDelete(p._id)}
//                             className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition"
//                             title="Delete Product"
//                           >
//                             <Trash2 className="w-3.5 h-3.5" />
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan="12" className="py-10 text-center text-slate-400 text-sm">
//                     কোনো প্রোডাক্ট পাওয়া যায়নি।
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Mobile / Tablet Card View */}
//         <div className="lg:hidden divide-y divide-slate-100">
//           {paginatedProducts.length > 0 ? (
//             paginatedProducts.map(p => {
//               const { opening, purchased, sold, returned, current, isLow } = getStockMetrics(p);
//               const buyVal = Number(p.buyPrice ?? 0);
//               const sellVal = Number(p.sellPrice ?? p.price ?? 0);

//               return (
//                 <div key={p._id} className="p-4 space-y-3">
//                   <div className="flex items-start justify-between gap-2">
//                     <div>
//                       <p className="font-bold text-slate-800 text-sm">{p.name}</p>
//                       <p className="text-xs font-mono text-slate-500">
//                         {p.sku || '-'} • {p.category || 'General'}
//                       </p>
//                     </div>
//                     {isLow ? (
//                       <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 text-red-600 shrink-0">
//                         Low Stock
//                       </span>
//                     ) : (
//                       <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 shrink-0">
//                         In Stock
//                       </span>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
//                     <div>
//                       <span className="text-slate-400 block">Buy / Sell</span>
//                       <span className="font-semibold text-slate-700">
//                         {currency}{buyVal} / {currency}{sellVal}
//                       </span>
//                     </div>
//                     <div>
//                       <span className="text-slate-400 block">Current Stock</span>
//                       <span className="font-extrabold text-slate-900">{current} pcs</span>
//                     </div>
//                     <div>
//                       <span className="text-slate-400 block">Stock Value</span>
//                       <span className="font-bold text-indigo-700">
//                         {currency}{(current * sellVal).toLocaleString()}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
//                     <span>Open: {opening}</span>
//                     <span className="text-emerald-700">IN: +{purchased}</span>
//                     <span className="text-amber-700">OUT: -{sold}</span>
//                     <span>Ret: {returned}</span>
//                   </div>

//                   <div className="flex items-center justify-end gap-2 pt-1">
//                     {isAdmin && (
//                       <button
//                         type="button"
//                         onClick={() => openEditProductModal(p)}
//                         className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
//                       >
//                         <Pencil className="w-3.5 h-3.5" /> Edit
//                       </button>
//                     )}
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setReturnModal({ open: true, product: p });
//                         setReturnForm({
//                           returnType: 'SALES_RETURN',
//                           amount: '',
//                           reason: ''
//                         });
//                       }}
//                       className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
//                     >
//                       <RotateCcw className="w-3.5 h-3.5" /> Return
//                     </button>
//                     {isAdmin && (
//                       <button
//                         type="button"
//                         onClick={() => handleDelete(p._id)}
//                         className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
//                       >
//                         <Trash2 className="w-3.5 h-3.5" /> Delete
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               );
//             })
//           ) : (
//             <div className="py-10 text-center text-slate-400 text-sm">
//               কোনো প্রোডাক্ট পাওয়া যায়নি।
//             </div>
//           )}
//         </div>

//         {/* Pagination Bar */}
//         {filteredProducts.length > itemsPerPage && (
//           <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm">
//             <p className="text-slate-500">
//               Showing <strong className="text-slate-700">{startIndex + 1}</strong> to{' '}
//               <strong className="text-slate-700">
//                 {Math.min(startIndex + itemsPerPage, filteredProducts.length)}
//               </strong>{' '}
//               of <strong className="text-slate-700">{filteredProducts.length}</strong>
//             </p>
//             <div className="flex items-center gap-1.5">
//               <button
//                 type="button"
//                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                 disabled={safeCurrentPage === 1}
//                 className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
//               >
//                 <ChevronLeft className="w-4 h-4" />
//               </button>
//               <span className="px-2.5 font-semibold text-slate-700">
//                 {safeCurrentPage} / {totalPages}
//               </span>
//               <button
//                 type="button"
//                 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                 disabled={safeCurrentPage === totalPages}
//                 className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Add / Edit Product Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex items-center justify-between border-b pb-3">
//               <h3 className="font-bold text-slate-800 text-base sm:text-lg">
//                 {editingProductId ? 'Edit Product' : 'Add New Product'}
//               </h3>
//               <button
//                 type="button"
//                 onClick={closeProductModal}
//                 className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Product Name *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     value={form.name}
//                     onChange={e => setForm({ ...form, name: e.target.value })}
//                     placeholder="e.g. Logitech Mouse"
//                     className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <div className="flex items-center justify-between gap-1 mb-1">
//                     <label className="text-xs font-semibold text-slate-600">
//                       SKU Code *
//                     </label>
//                     <div className="flex items-center gap-2">
//                       <button
//                         type="button"
//                         onClick={() => {
//                           setScanTarget('form');
//                           setShowCameraScanner(true);
//                         }}
//                         className="text-[11px] font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-0.5"
//                       >
//                         <Camera className="w-3 h-3 text-indigo-600" /> Scan
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setForm(prev => ({
//                             ...prev,
//                             sku: generateUniqueSku(productList, 'PRD', editingProductId)
//                           }))
//                         }
//                         className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-0.5"
//                       >
//                         <Sparkles className="w-3 h-3" /> Auto SKU
//                       </button>
//                     </div>
//                   </div>
//                   <input
//                     type="text"
//                     required
//                     value={form.sku}
//                     onChange={e => setForm({ ...form, sku: e.target.value })}
//                     placeholder="PRD-1001"
//                     className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Category *
//                   </label>
//                   <input
//                     type="text"
//                     required
//                     list="product-categories-list"
//                     value={form.category}
//                     onChange={e => setForm({ ...form, category: e.target.value })}
//                     placeholder="e.g. Electronics"
//                     className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                   <datalist id="product-categories-list">
//                     {categories.map(cat => (
//                       <option key={cat} value={cat} />
//                     ))}
//                   </datalist>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     {editingProductId ? 'Current Stock Qty' : 'Opening Stock'}
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     value={form.openingStock}
//                     onChange={e => setForm({ ...form, openingStock: e.target.value })}
//                     placeholder="0"
//                     className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Buy Price ({currency}) *
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     step="any"
//                     required
//                     value={form.buyPrice}
//                     onChange={e => setForm({ ...form, buyPrice: e.target.value })}
//                     placeholder="0"
//                     className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Sell Price ({currency}) *
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     step="any"
//                     required
//                     value={form.sellPrice}
//                     onChange={e => setForm({ ...form, sellPrice: e.target.value })}
//                     placeholder="0"
//                     className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Min Stock Alert
//                   </label>
//                   <input
//                     type="number"
//                     min="0"
//                     value={form.minStockLevel}
//                     onChange={e => setForm({ ...form, minStockLevel: e.target.value })}
//                     placeholder="5"
//                     className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>

//               <div className="flex justify-end gap-2 pt-3 border-t">
//                 <button
//                   type="button"
//                   onClick={closeProductModal}
//                   className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs sm:text-sm font-semibold transition"
//                 >
//                   {loading
//                     ? 'Saving...'
//                     : editingProductId
//                     ? 'Update Product'
//                     : 'Save Product'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Stock Return Modal */}
//       {returnModal.open && returnModal.product && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
//             <div className="flex items-center justify-between border-b pb-3">
//               <div>
//                 <h3 className="font-bold text-slate-800 text-base">Stock Return Entry</h3>
//                 <p className="text-xs text-slate-500">
//                   {returnModal.product.name} ({returnModal.product.sku})
//                 </p>
//               </div>
//               <button
//                 type="button"
//                 onClick={() => setReturnModal({ open: false, product: null })}
//                 className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleReturnSubmit} className="space-y-3.5">
//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">
//                   Return Type
//                 </label>
//                 <select
//                   value={returnForm.returnType}
//                   onChange={e =>
//                     setReturnForm({ ...returnForm, returnType: e.target.value })
//                   }
//                   className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="SALES_RETURN">Sales Return (Stock +)</option>
//                   <option value="PURCHASE_RETURN">Purchase Return (Stock -)</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">
//                   Return Quantity *
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   required
//                   value={returnForm.amount}
//                   onChange={e =>
//                     setReturnForm({ ...returnForm, amount: e.target.value })
//                   }
//                   placeholder="Enter quantity"
//                   className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">
//                   Reason / Note
//                 </label>
//                 <input
//                   type="text"
//                   value={returnForm.reason}
//                   onChange={e =>
//                     setReturnForm({ ...returnForm, reason: e.target.value })
//                   }
//                   placeholder="Damaged, expired, or customer return..."
//                   className="w-full border border-slate-200 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

//               <div className="flex justify-end gap-2 pt-3 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setReturnModal({ open: false, product: null })}
//                   className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white text-xs sm:text-sm font-semibold transition"
//                 >
//                   {loading ? 'Processing...' : 'Submit Return'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Return History Modal */}
//       {historyModalOpen && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
//             <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
//               <div>
//                 <h3 className="font-bold text-slate-800 text-base sm:text-lg">
//                   Stock Return History
//                 </h3>
//                 <p className="text-xs text-slate-500">
//                   Filter by date range and print or review sales/purchase returns.
//                 </p>
//               </div>

//               <div className="flex items-center gap-2">
//                 <button
//                   type="button"
//                   onClick={handlePrintReturnHistory}
//                   className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition"
//                 >
//                   <Printer className="w-4 h-4" /> Print History
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => setHistoryModalOpen(false)}
//                   className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>

//             {/* Date Filter Row */}
//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 items-end">
//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">
//                   From Date
//                 </label>
//                 <input
//                   type="date"
//                   value={historyFromDate}
//                   onChange={e => setHistoryFromDate(e.target.value)}
//                   className="w-full border border-slate-200 bg-white px-3 py-1.5 rounded-lg text-xs sm:text-sm"
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">
//                   To Date
//                 </label>
//                 <input
//                   type="date"
//                   value={historyToDate}
//                   onChange={e => setHistoryToDate(e.target.value)}
//                   className="w-full border border-slate-200 bg-white px-3 py-1.5 rounded-lg text-xs sm:text-sm"
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setHistoryFromDate('');
//                     setHistoryToDate('');
//                   }}
//                   className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700"
//                 >
//                   Clear Dates
//                 </button>
//               </div>
//             </div>

//             {/* Summary Strip */}
//             <div className="grid grid-cols-3 gap-3 text-xs">
//               <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3">
//                 <span className="text-slate-500 block">Total Records</span>
//                 <strong className="text-sm text-slate-800">
//                   {filteredReturnHistory.length}
//                 </strong>
//               </div>
//               <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3">
//                 <span className="text-emerald-700 block">Sales Return (+)</span>
//                 <strong className="text-sm text-emerald-800">
//                   {salesReturnQty.toLocaleString()} pcs
//                 </strong>
//               </div>
//               <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3">
//                 <span className="text-amber-700 block">Purchase Return (-)</span>
//                 <strong className="text-sm text-amber-800">
//                   {purchaseReturnQty.toLocaleString()} pcs
//                 </strong>
//               </div>
//             </div>

//             {/* Return Table */}
//             <div className="overflow-x-auto border border-slate-200 rounded-xl">
//               <table className="w-full text-left border-collapse min-w-[640px] text-xs sm:text-sm">
//                 <thead>
//                   <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
//                     <th className="py-3 px-4">Return #</th>
//                     <th className="py-3 px-4">Product</th>
//                     <th className="py-3 px-4">Type</th>
//                     <th className="py-3 px-4 text-right">Qty</th>
//                     <th className="py-3 px-4">Reason</th>
//                     <th className="py-3 px-4">Date</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100">
//                   {loadingHistory ? (
//                     <tr>
//                       <td colSpan="6" className="py-8 text-center text-slate-400">
//                         Loading return history...
//                       </td>
//                     </tr>
//                   ) : filteredReturnHistory.length > 0 ? (
//                     filteredReturnHistory.map((item, idx) => {
//                       const isSalesRet = item.returnType === 'SALES_RETURN';
//                       return (
//                         <tr key={item._id || idx} className="hover:bg-slate-50">
//                           <td className="py-3 px-4 font-mono font-semibold text-indigo-600">
//                             {item.returnNumber || '-'}
//                           </td>
//                           <td className="py-3 px-4 font-medium text-slate-800">
//                             {item.product?.name || 'Deleted Product'}
//                             {item.product?.sku && (
//                               <span className="block text-[11px] font-mono text-slate-400">
//                                 {item.product.sku}
//                               </span>
//                             )}
//                           </td>
//                           <td className="py-3 px-4">
//                             <span
//                               className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
//                                 isSalesRet
//                                   ? 'bg-emerald-50 text-emerald-700'
//                                   : 'bg-amber-50 text-amber-700'
//                               }`}
//                             >
//                               {isSalesRet ? 'Sales Return (+)' : 'Purchase Return (-)'}
//                             </span>
//                           </td>
//                           <td className="py-3 px-4 text-right font-bold">
//                             {Number(item.quantity || 0).toLocaleString()}
//                           </td>
//                           <td className="py-3 px-4 text-slate-600">{item.reason || '-'}</td>
//                           <td className="py-3 px-4 text-slate-500">
//                             {item.createdAt
//                               ? new Date(item.createdAt).toLocaleDateString()
//                               : '-'}
//                           </td>
//                         </tr>
//                       );
//                     })
//                   ) : (
//                     <tr>
//                       <td colSpan="6" className="py-8 text-center text-slate-400">
//                         কোনো রিটার্ন রেকর্ড পাওয়া যায়নি।
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Mobile Camera Barcode Scanner Modal */}
//       <CameraScannerModal
//         isOpen={showCameraScanner}
//         onClose={() => setShowCameraScanner(false)}
//         title={
//           scanTarget === 'form'
//             ? 'Scan Barcode for Product SKU'
//             : 'Scan Barcode to Find Product'
//         }
//         onScanSuccess={handleCameraScanSuccess}
//       />
//     </div>
//   );
// }








import { useState, useEffect } from 'react';
import {
  Plus,
  Pencil,
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
  ChevronRight,
  Sparkles,
  Camera
} from 'lucide-react';
import {
  addProduct,
  updateProduct,
  deleteProduct,
  createReturn,
  getReturns
} from '../services/api';
import { DEFAULT_ERP_SETTINGS } from './Settings';
import CameraScannerModal from './CameraScannerModal';

const PACK_UNIT_GROUPS = [
  {
    label: 'General & Count',
    options: [
      { value: 'unit', label: 'Unit (ইউনিট)' },
      { value: 'pcs', label: 'Pcs (পিস)' },
      { value: 'pair', label: 'Pair (জোড়া)' },
      { value: 'dozen', label: 'Dozen (ডজন)' },
      { value: 'set', label: 'Set (সেট)' }
    ]
  },
  {
    label: 'Packaging & Bulk',
    options: [
      { value: 'pack', label: 'Pack (প্যাক)' },
      { value: 'box', label: 'Box (বক্স)' },
      { value: 'carton', label: 'Carton (কার্টন)' },
      { value: 'bag', label: 'Bag (ব্যাগ)' },
      { value: 'sack', label: 'Sack (বস্তা)' },
      { value: 'bundle', label: 'Bundle (বান্ডিল)' },
      { value: 'roll', label: 'Roll (রোল)' },
      { value: 'packet', label: 'Packet (প্যাকেট)' },
      { value: 'pouch', label: 'Pouch (পাউচ)' },
      { value: 'jar', label: 'Jar (জার)' },
      { value: 'can', label: 'Can (ক্যান)' },
      { value: 'tin', label: 'Tin (টিন)' }
    ]
  },
  {
    label: 'Weight',
    options: [
      { value: 'kg', label: 'Kg (কিলোগ্রাম)' },
      { value: 'gm', label: 'Gm (গ্রাম)' },
      { value: 'mg', label: 'Mg (মিলিগ্রাম)' },
      { value: 'ton', label: 'Ton (টন)' },
      { value: 'quintal', label: 'Quintal (কুইন্টাল)' },
      { value: 'lb', label: 'Lb (পাউন্ড)' }
    ]
  },
  {
    label: 'Liquid & Volume',
    options: [
      { value: 'liter', label: 'Liter (লিটার)' },
      { value: 'ml', label: 'Ml (মিলিলিটার)' },
      { value: 'bottle', label: 'Bottle (বোতল)' },
      { value: 'gallon', label: 'Gallon (গ্যালন)' },
      { value: 'drum', label: 'Drum (ড্রাম)' }
    ]
  },
  {
    label: 'Pharma & Medical',
    options: [
      { value: 'strip', label: 'Strip (পাতা)' },
      { value: 'tablet', label: 'Tablet (ট্যাবলেট)' },
      { value: 'capsule', label: 'Capsule (ক্যাপসুল)' },
      { value: 'vial', label: 'Vial (ভায়াল)' },
      { value: 'ampoule', label: 'Ampoule (অ্যাম্পুল)' },
      { value: 'syrup', label: 'Syrup (সিরাপ)' },
      { value: 'tube', label: 'Tube (টিউব)' },
      { value: 'sachet', label: 'Sachet (স্যাশে)' },
      { value: 'drop', label: 'Drop (ড্রপ)' }
    ]
  },
  {
    label: 'Length & Area',
    options: [
      { value: 'meter', label: 'Meter (মিটার)' },
      { value: 'cm', label: 'Cm (সেন্টিমিটার)' },
      { value: 'feet', label: 'Feet (ফুট)' },
      { value: 'inch', label: 'Inch (ইঞ্চি)' },
      { value: 'yard', label: 'Yard (গজ)' },
      { value: 'sqft', label: 'Sq.Ft (বর্গফুট)' }
    ]
  },
  {
    label: 'Custom',
    options: [{ value: 'others', label: 'Others (অন্যান্য)' }]
  }
];

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

const generateUniqueSku = (existingProducts = [], prefix = 'PRD', excludeId = null) => {
  const list = Array.isArray(existingProducts) ? existingProducts : [];
  const used = new Set(
    list
      .filter(p => !excludeId || p?._id !== excludeId)
      .flatMap(p => [p?.sku, p?.barcode])
      .map(v => String(v || '').trim().toUpperCase())
      .filter(Boolean)
  );

  const baseNum = list.length + 1001;
  let candidate = `${prefix}-${baseNum}`;
  let counter = 0;

  while (used.has(candidate.toUpperCase())) {
    counter += 1;
    const rand = Math.floor(100 + Math.random() * 900);
    candidate = `${prefix}-${baseNum + counter}-${rand}`;
  }

  return candidate;
};

const EMPTY_FORM = {
  name: '',
  sku: '',
  category: '',
  packUnit: 'unit',
  customPackSize: '',
  packQuantity: 1,
  openingStock: '',
  buyPrice: '',
  sellPrice: '',
  minStockLevel: 5
};

const getPackLabel = (p) => {
  const unit =
    p?.packUnit === 'others' && String(p?.customPackSize || '').trim()
      ? String(p.customPackSize).trim()
      : p?.packUnit || 'unit';
  const qty = Number(p?.packQuantity) > 0 ? Number(p.packQuantity) : 1;
  return `${qty} ${unit}`;
};

export default function Products({ products = [], suppliers, reloadData, settings, user }) {
  const activeSettings = {
    ...DEFAULT_ERP_SETTINGS,
    ...(settings || {})
  };
  const currency = activeSettings.currencySymbol || '৳';
  const companyTitle = (activeSettings.companyName || 'NEXUS ERP').trim();

  const productList = Array.isArray(products) ? products : [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | LOW | IN_STOCK
  const [loading, setLoading] = useState(false);
  const [scannerNotice, setScannerNotice] = useState('');

  // Camera Scanner State ('search' | 'form')
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [scanTarget, setScanTarget] = useState('search');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add / Edit Product Form State
  const [form, setForm] = useState(EMPTY_FORM);

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
    const packQty = Number(p.packQuantity) > 0 ? Number(p.packQuantity) : 1;
    const totalPacks = Number((current / packQty).toFixed(2));
    const isLow = current <= Number(p.minStockLevel ?? 5);
    return { opening, purchased, sold, returned, current, packQty, totalPacks, isLow };
  };

  // Unique Categories
  const categories = Array.from(
    new Set(
      productList
        .map(p => (p.category || '').trim())
        .filter(Boolean)
    )
  );

  // Filter Logic (Search + Category + Stock Status)
  const filteredProducts = productList.filter(p => {
    const q = searchTerm.trim().toLowerCase();
    const packLabel = getPackLabel(p).toLowerCase();
    const matchesSearch =
      !q ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.barcode || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      packLabel.includes(q);

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

  // Total Stock Summary Value
  const stockSummary = filteredProducts.reduce(
    (acc, p) => {
      const { opening, purchased, sold, returned, current, totalPacks } = getStockMetrics(p);
      const buyVal = Number(p.buyPrice ?? 0);
      const sellVal = Number(p.sellPrice ?? p.price ?? 0);

      acc.totalOpening += opening;
      acc.totalPurchased += purchased;
      acc.totalSold += sold;
      acc.totalReturned += returned;
      acc.totalUnits += current;
      acc.totalPacks += totalPacks;
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
      totalPacks: 0,
      totalBuyValue: 0,
      totalSellValue: 0
    }
  );

  const expectedProfit = stockSummary.totalSellValue - stockSummary.totalBuyValue;

  // Reset to page 1 only when filter criteria change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (nextPage) => {
    const clamped = Math.min(Math.max(1, Number(nextPage) || 1), totalPages);
    setCurrentPage(clamped);
  };

  const closeProductModal = () => {
    setIsModalOpen(false);
    setEditingProductId(null);
    setForm(EMPTY_FORM);
    setScannerNotice('');
  };

  const openAddProductModal = (prefilledSku = '') => {
    const cleanSku = String(prefilledSku || '').trim();
    setEditingProductId(null);
    setForm({
      ...EMPTY_FORM,
      sku: cleanSku || generateUniqueSku(productList, 'PRD')
    });
    setScannerNotice('');
    setIsModalOpen(true);
  };

  const openEditProductModal = (product) => {
    if (!product) return;
    const { current } = getStockMetrics(product);
    setEditingProductId(product._id);
    setForm({
      name: product.name || '',
      sku: product.sku || product.barcode || '',
      category: product.category || 'General',
      packUnit: product.packUnit || 'unit',
      customPackSize: product.customPackSize || '',
      packQuantity: product.packQuantity ?? 1,
      openingStock: current,
      buyPrice: product.buyPrice ?? 0,
      sellPrice: product.sellPrice ?? product.price ?? 0,
      minStockLevel: product.minStockLevel ?? 5
    });
    setScannerNotice('');
    setIsModalOpen(true);
  };

  const openScanner = (target = 'search') => {
    setScanTarget(target);
    setShowCameraScanner(true);

    if (
      typeof window !== 'undefined' &&
      window.isSecureContext === false &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      setScannerNotice('Camera scan requires HTTPS or localhost.');
    } else {
      setScannerNotice('');
    }
  };

  // ক্যামেরা বারকোড স্ক্যান হ্যান্ডলার
  const handleCameraScanSuccess = (scannedValue) => {
    const raw =
      typeof scannedValue === 'string'
        ? scannedValue
        : scannedValue?.decodedText || scannedValue?.code || scannedValue?.text || '';
    const cleanCode = String(raw || '').trim();
    setShowCameraScanner(false);
    if (!cleanCode) return;

    if (scanTarget === 'form' && isModalOpen) {
      setForm(prev => ({ ...prev, sku: cleanCode }));
      return;
    }

    const normalized = cleanCode.toLowerCase();
    const matched = productList.find(p => {
      const sku = String(p?.sku || '').trim().toLowerCase();
      const barcode = String(p?.barcode || '').trim().toLowerCase();
      return sku === normalized || barcode === normalized;
    });

    if (matched) {
      setSearchTerm(cleanCode);
      setCategoryFilter('ALL');
      setStatusFilter('ALL');
      setCurrentPage(1);
    } else {
      openAddProductModal(cleanCode);
    }
  };

  // ১. নতুন প্রোডাক্ট যোগ বা বিদ্যমান প্রোডাক্ট আপডেট করা
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.packUnit === 'others' && !String(form.customPackSize || '').trim()) {
      alert('Please enter a custom pack size when "Others" is selected.');
      return;
    }

    setLoading(true);
    try {
      const stockNum = Math.max(0, Number(form.openingStock) || 0);
      const buyNum = Math.max(0, Number(form.buyPrice) || 0);
      const sellNum = Math.max(0, Number(form.sellPrice) || 0);
      const packQtyNum = Math.max(0.01, Number(form.packQuantity) || 1);
      const cleanCustomSize =
        form.packUnit === 'others' ? String(form.customPackSize || '').trim() : '';
      const cleanSku =
        String(form.sku || '').trim() ||
        generateUniqueSku(productList, 'PRD', editingProductId);

      const commonPayload = {
        name: String(form.name || '').trim(),
        sku: cleanSku,
        barcode: cleanSku,
        category: String(form.category || '').trim() || 'General',
        packUnit: form.packUnit || 'unit',
        customPackSize: cleanCustomSize,
        packQuantity: packQtyNum,
        buyPrice: buyNum,
        sellPrice: sellNum,
        price: sellNum,
        minStockLevel: Math.max(0, Number(form.minStockLevel) || 5)
      };

      if (editingProductId) {
        await updateProduct(editingProductId, {
          ...commonPayload,
          quantity: stockNum
        });
      } else {
        await addProduct({
          ...commonPayload,
          openingStock: stockNum,
          quantity: stockNum
        });
      }

      closeProductModal();
      reloadData?.();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Error saving product');
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
      reloadData?.();
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
      setReturnHistory(Array.isArray(data) ? data : []);
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
      reloadData?.();
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
      'Pack Unit',
      'Custom Pack Size',
      'Pack Quantity',
      'Buy Price',
      'Sell Price',
      'Opening Stock',
      'Purchase (IN)',
      'Sell (OUT)',
      'Return',
      'Current Stock',
      'Total Packs',
      'Stock Buy Value',
      'Stock Sell Value',
      'Status'
    ];

    const escapeCsv = (val) => {
      const str = String(val ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = filteredProducts.map(p => {
      const { opening, purchased, sold, returned, current, packQty, totalPacks, isLow } =
        getStockMetrics(p);
      const buyVal = Number(p.buyPrice ?? 0);
      const sellVal = Number(p.sellPrice ?? p.price ?? 0);
      return [
        escapeCsv(p.name),
        escapeCsv(p.sku),
        escapeCsv(p.category),
        escapeCsv(p.packUnit || 'unit'),
        escapeCsv(p.customPackSize || ''),
        escapeCsv(packQty),
        escapeCsv(buyVal),
        escapeCsv(sellVal),
        escapeCsv(opening),
        escapeCsv(purchased),
        escapeCsv(sold),
        escapeCsv(returned),
        escapeCsv(current),
        escapeCsv(totalPacks),
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
      escapeCsv(''),
      escapeCsv(''),
      escapeCsv(''),
      escapeCsv(stockSummary.totalOpening),
      escapeCsv(stockSummary.totalPurchased),
      escapeCsv(stockSummary.totalSold),
      escapeCsv(stockSummary.totalReturned),
      escapeCsv(stockSummary.totalUnits),
      escapeCsv(Number(stockSummary.totalPacks.toFixed(2))),
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
    const printWindow = window.open('', '_blank', 'height=750,width=1100');
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
        const { opening, purchased, sold, returned, current, totalPacks, isLow } =
          getStockMetrics(p);
        const buyVal = Number(p.buyPrice ?? 0);
        const sellVal = Number(p.sellPrice ?? p.price ?? 0);
        return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${p.name}</strong><br/><small>${p.sku || ''}</small></td>
            <td>${p.category || '-'}</td>
            <td>${getPackLabel(p)}</td>
            <td class="text-right">${currency}${buyVal.toLocaleString()}</td>
            <td class="text-right">${currency}${sellVal.toLocaleString()}</td>
            <td class="text-right">${opening}</td>
            <td class="text-right">+${purchased}</td>
            <td class="text-right">-${sold}</td>
            <td class="text-right">${returned >= 0 ? `+${returned}` : returned}</td>
            <td class="text-right"><strong>${current}</strong><br/><small>${totalPacks} pk</small></td>
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
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
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
            <div class="summary-box">Total Stock Qty<strong>${stockSummary.totalUnits.toLocaleString()} pcs (${Number(stockSummary.totalPacks.toFixed(2))} pk)</strong></div>
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
                <th>Pack Spec</th>
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
                `<tr><td colspan="14" style="text-align:center;padding:16px;">No products to display.</td></tr>`
              }
            </tbody>
            <tfoot>
              <tr>
                <td colspan="6">TOTAL</td>
                <td class="text-right">${stockSummary.totalOpening}</td>
                <td class="text-right">+${stockSummary.totalPurchased}</td>
                <td class="text-right">-${stockSummary.totalSold}</td>
                <td class="text-right">${stockSummary.totalReturned}</td>
                <td class="text-right">${stockSummary.totalUnits} (${Number(stockSummary.totalPacks.toFixed(2))} pk)</td>
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
            Track pack units, buy/sell prices, stock summary values, ledger movements, and returns.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadExcel}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4" /> Excel
          </button>

          <button
            type="button"
            onClick={handlePrintProducts}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-700" /> Print ({filteredProducts.length})
          </button>

          <button
            type="button"
            onClick={handleOpenHistory}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl font-medium text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <History className="w-4 h-4 text-indigo-600" /> Return History
          </button>

          <button
            type="button"
            onClick={() => openAddProductModal('')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-xs sm:text-sm shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {scannerNotice && (
        <div className="px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-center justify-between gap-2">
          <span>{scannerNotice}</span>
          <button
            type="button"
            onClick={() => setScannerNotice('')}
            className="text-amber-700 hover:text-amber-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Total Stock Summary Value Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Stock Qty</p>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            {stockSummary.totalUnits.toLocaleString()}{' '}
            <span className="text-xs font-medium text-slate-500">
              pcs ({Number(stockSummary.totalPacks.toFixed(2))} packs)
            </span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {filteredProducts.length} filtered items
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase">Stock Value (Buy Price)</p>
          <p className="text-xl sm:text-2xl font-extrabold text-amber-700 mt-1">
            {currency} {stockSummary.totalBuyValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Total invested stock cost</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase">Stock Value (Sell Price)</p>
          <p className="text-xl sm:text-2xl font-extrabold text-indigo-700 mt-1">
            {currency} {stockSummary.totalSellValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Potential total sales value</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
          <p className="text-xs font-semibold text-slate-500 uppercase">Expected Stock Profit</p>
          <p
            className={`text-xl sm:text-2xl font-extrabold mt-1 ${
              expectedProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {expectedProfit >= 0 ? '+' : ''}
            {currency} {expectedProfit.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Sell value minus buy value</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col md:flex-row gap-3 justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, SKU, barcode, category, pack..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={() => openScanner('search')}
            title="Scan Barcode"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer shrink-0"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">All Stock Status</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW">Low Stock</option>
          </select>
        </div>
      </div>

      {/* Mobile Responsive Card View (< md) */}
      <div className="space-y-3 md:hidden">
        {paginatedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center text-sm text-slate-500 border border-slate-200/80 shadow-sm">
            No products match the current filter.
          </div>
        ) : (
          paginatedProducts.map(p => {
            const { opening, purchased, sold, returned, current, totalPacks, isLow } =
              getStockMetrics(p);
            const buyVal = Number(p.buyPrice ?? 0);
            const sellVal = Number(p.sellPrice ?? p.price ?? 0);

            return (
              <div
                key={p._id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{p.name}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                      <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {p.sku || '-'}
                      </span>
                      <span>•</span>
                      <span>{p.category || 'General'}</span>
                      <span>•</span>
                      <span className="font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {getPackLabel(p)}
                      </span>
                    </div>
                  </div>

                  {isLow ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                      <AlertTriangle className="w-3 h-3" /> Low
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Ok
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="bg-slate-50 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Buy / Sell Price
                    </div>
                    <div className="font-bold text-slate-800 mt-0.5">
                      Sell: {currency}
                      {sellVal.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Buy: {currency}
                      {buyVal.toLocaleString()}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-2">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Current Stock
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                      {current} <span className="text-xs font-medium text-slate-500">pcs</span>
                    </div>
                    <div className="text-[11px] text-indigo-600 font-medium">
                      {totalPacks} packs
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] bg-slate-50/70 rounded-xl py-2 px-1 border border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-400">Open</div>
                    <div className="font-semibold text-slate-700">{opening}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">IN</div>
                    <div className="font-semibold text-emerald-700">+{purchased}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">OUT</div>
                    <div className="font-semibold text-rose-600">-{sold}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Ret</div>
                    <div className="font-semibold text-indigo-600">
                      {returned >= 0 ? `+${returned}` : returned}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setReturnModal({ open: true, product: p });
                      setReturnForm({ returnType: 'SALES_RETURN', amount: '', reason: '' });
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Return
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditProductModal(p)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleDelete(p._id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Stock Ledger Table (>= md) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase">
              <th className="py-3 px-3">Product</th>
              <th className="py-3 px-3">SKU / Cat</th>
              <th className="py-3 px-3">Pack</th>
              <th className="py-3 px-3 text-right">Buy / Sell</th>
              <th className="py-3 px-3 text-right">Open</th>
              <th className="py-3 px-3 text-right">IN</th>
              <th className="py-3 px-3 text-right">OUT</th>
              <th className="py-3 px-3 text-right">Ret</th>
              <th className="py-3 px-3 text-right">Stock</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {paginatedProducts.length === 0 ? (
              <tr>
                <td colSpan="11" className="py-8 text-center text-slate-500">
                  No products match the current filter.
                </td>
              </tr>
            ) : (
              paginatedProducts.map(p => {
                const { opening, purchased, sold, returned, current, totalPacks, isLow } =
                  getStockMetrics(p);
                const buyVal = Number(p.buyPrice ?? 0);
                const sellVal = Number(p.sellPrice ?? p.price ?? 0);

                return (
                  <tr key={p._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3 font-semibold text-slate-800">{p.name}</td>
                    <td className="py-3 px-3">
                      <div className="font-mono text-xs text-slate-700">{p.sku || '-'}</div>
                      <div className="text-[11px] text-slate-400">{p.category || 'General'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 whitespace-nowrap">
                        {getPackLabel(p)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="font-medium text-slate-800">
                        {currency}
                        {sellVal.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Buy: {currency}
                        {buyVal.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-600">{opening}</td>
                    <td className="py-3 px-3 text-right text-emerald-700 font-medium">
                      +{purchased}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-600 font-medium">-{sold}</td>
                    <td className="py-3 px-3 text-right text-indigo-600 font-medium">
                      {returned >= 0 ? `+${returned}` : returned}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="font-bold text-slate-900">{current}</div>
                      <div className="text-[11px] text-slate-400">{totalPacks} packs</div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> Low
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Ok
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setReturnModal({ open: true, product: p });
                            setReturnForm({ returnType: 'SALES_RETURN', amount: '', reason: '' });
                          }}
                          title="Record Return"
                          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/70 transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Return
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditProductModal(p)}
                          title="Edit Product"
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDelete(p._id)}
                            title="Delete Product"
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

      {/* Pagination Controls */}
      {filteredProducts.length > 0 && (
        <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-600">
          <span>
            Showing <strong>{startIndex + 1}</strong>–
            <strong>{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</strong> of{' '}
            <strong>{filteredProducts.length}</strong> products
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => goToPage(safeCurrentPage - 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="px-2 font-semibold text-slate-800">
              Page {safeCurrentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => goToPage(safeCurrentPage + 1)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={closeProductModal}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Napa Extend 665mg"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SKU / Barcode
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm(prev => ({
                          ...prev,
                          sku: generateUniqueSku(productList, 'PRD', editingProductId)
                        }))
                      }
                      title="Auto Generate SKU"
                      className="px-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openScanner('form')}
                      title="Scan Barcode"
                      className="px-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="General"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Pack Unit Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pack Unit
                  </label>
                  <select
                    value={form.packUnit}
                    onChange={(e) => {
                      const nextUnit = e.target.value;
                      setForm(prev => ({
                        ...prev,
                        packUnit: nextUnit,
                        customPackSize: nextUnit === 'others' ? prev.customPackSize : ''
                      }));
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {PACK_UNIT_GROUPS.map(group => (
                      <optgroup key={group.label} label={group.label}>
                        {group.options.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* Pack Quantity Input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pack Quantity (প্রতি প্যাকে কত) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    value={form.packQuantity}
                    onChange={(e) => setForm({ ...form, packQuantity: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Conditional Custom Pack Size Input when 'others' is selected */}
                {form.packUnit === 'others' && (
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Custom Pack Size / Unit (কাস্টম ইউনিট) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.customPackSize}
                      onChange={(e) => setForm({ ...form, customPackSize: e.target.value })}
                      placeholder="e.g. 10x10 strip, 250ml jar, combo pack"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Buy Price ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form.buyPrice}
                    onChange={(e) => setForm({ ...form, buyPrice: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sell Price ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={form.sellPrice}
                    onChange={(e) => setForm({ ...form, sellPrice: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {editingProductId ? 'Current Stock' : 'Opening Stock'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.openingStock}
                    onChange={(e) => setForm({ ...form, openingStock: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Min Stock Level
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.minStockLevel}
                    onChange={(e) => setForm({ ...form, minStockLevel: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-sm font-medium text-white cursor-pointer"
                >
                  {loading ? 'Saving...' : editingProductId ? 'Update Product' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {returnModal.open && returnModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-800">
                Stock Return — {returnModal.product.name}
              </h3>
              <button
                type="button"
                onClick={() => setReturnModal({ open: false, product: null })}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleReturnSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Return Type
                </label>
                <select
                  value={returnForm.returnType}
                  onChange={(e) =>
                    setReturnForm({ ...returnForm, returnType: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option value="SALES_RETURN">Sales Return (+ Stock)</option>
                  <option value="PURCHASE_RETURN">Purchase Return (- Stock)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={returnForm.amount}
                  onChange={(e) => setReturnForm({ ...returnForm, amount: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reason
                </label>
                <input
                  type="text"
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                  placeholder="Damaged, expired, customer return..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReturnModal({ open: false, product: null })}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium cursor-pointer"
                >
                  {loading ? 'Processing...' : 'Submit Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return History Modal */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Stock Return History</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintReturnHistory}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-3 text-xs">
              <label className="flex items-center gap-1.5 text-slate-600 font-medium">
                From:
                <input
                  type="date"
                  value={historyFromDate}
                  onChange={(e) => setHistoryFromDate(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2 py-1 bg-white"
                />
              </label>
              <label className="flex items-center gap-1.5 text-slate-600 font-medium">
                To:
                <input
                  type="date"
                  value={historyToDate}
                  onChange={(e) => setHistoryToDate(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2 py-1 bg-white"
                />
              </label>
              {(historyFromDate || historyToDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setHistoryFromDate('');
                    setHistoryToDate('');
                  }}
                  className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                >
                  Clear Dates
                </button>
              )}
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {loadingHistory ? (
                <p className="text-center text-slate-500 py-8">Loading return history...</p>
              ) : filteredReturnHistory.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No return records found.</p>
              ) : (
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-600">
                      <th className="py-2 px-2">Return #</th>
                      <th className="py-2 px-2">Product</th>
                      <th className="py-2 px-2">Type</th>
                      <th className="py-2 px-2 text-right">Qty</th>
                      <th className="py-2 px-2">Reason</th>
                      <th className="py-2 px-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredReturnHistory.map(r => (
                      <tr key={r._id}>
                        <td className="py-2 px-2 font-mono text-xs">{r.returnNumber || '-'}</td>
                        <td className="py-2 px-2 font-medium">{r.product?.name || 'Deleted Product'}</td>
                        <td className="py-2 px-2">{r.returnType}</td>
                        <td className="py-2 px-2 text-right font-bold">{r.quantity}</td>
                        <td className="py-2 px-2 text-slate-500">{r.reason || '-'}</td>
                        <td className="py-2 px-2 text-slate-500">
                          {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}
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

      {/* Camera Scanner Modal */}
      {showCameraScanner && (
        <div className="fixed inset-0 z-[70]">
          <CameraScannerModal
            isOpen={showCameraScanner}
            onClose={() => setShowCameraScanner(false)}
            onScanSuccess={handleCameraScanSuccess}
            onScan={handleCameraScanSuccess}
          />
        </div>
      )}
    </div>
  );
}