
// import { useState, useEffect } from 'react';
// import {
//   Plus,
//   Trash2,
//   FileText,
//   ChevronLeft,
//   ChevronRight
// } from 'lucide-react';
// import { createInvoice, deleteInvoice } from '../services/api';

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

// export default function Invoices({
//   clients = [],
//   products = [],
//   invoices = [],
//   reloadData,
//   user
// }) {
//   const [selectedClient, setSelectedClient] = useState('');
//   const [cart, setCart] = useState([]);
//   const [selectedProduct, setSelectedProduct] = useState('');
//   const [qty, setQty] = useState(1);
//   const [discount, setDiscount] = useState(0);
//   const [paidAmount, setPaidAmount] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('Cash');
//   const [mobileProvider, setMobileProvider] = useState('bKash');
//   const [previewInvoice, setPreviewInvoice] = useState(null);
//   const [submitting, setSubmitting] = useState(false);

//   // Pagination State
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 6;

//   const currentUser = getEffectiveUser(user);
//   const isAdmin =
//     (currentUser?.userType || '').toLowerCase() === 'admin' ||
//     (currentUser?.role || '').toLowerCase() === 'admin';
//   const hasInvoicePermission = Boolean(currentUser?.permissions?.invoices);
//   const canDeleteInvoice = isAdmin || hasInvoicePermission;

//   const clientList = Array.isArray(clients) ? clients : [];
//   const productList = Array.isArray(products) ? products : [];
//   const invoiceList = Array.isArray(invoices) ? invoices : [];

//   useEffect(() => {
//     const totalPages = Math.max(1, Math.ceil(invoiceList.length / itemsPerPage));
//     if (currentPage > totalPages) {
//       setCurrentPage(totalPages);
//     }
//   }, [invoiceList.length, currentPage]);

//   const totalPages = Math.max(1, Math.ceil(invoiceList.length / itemsPerPage));
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const paginatedInvoices = invoiceList.slice(startIndex, startIndex + itemsPerPage);

//   // কার্টে প্রোডাক্ট যোগ করা (sellPrice প্রাধান্য পাবে)
//   const addToCart = () => {
//     if (!selectedProduct) return;
//     const prod = productList.find(p => p._id === selectedProduct);
//     if (!prod) return;

//     const requestedQty = Number(qty) || 1;
//     if (requestedQty <= 0) return;

//     const existing = cart.find(item => item.product === prod._id);
//     const totalRequested = (existing ? existing.quantity : 0) + requestedQty;

//     if (totalRequested > Number(prod.quantity || 0)) {
//       return alert(`স্টকে মাত্র ${prod.quantity} পিস আছে!`);
//     }

//     const unitSellPrice = Number(prod.sellPrice ?? prod.price ?? 0);

//     if (existing) {
//       setCart(
//         cart.map(item =>
//           item.product === prod._id
//             ? { ...item, quantity: item.quantity + requestedQty }
//             : item
//         )
//       );
//     } else {
//       setCart([
//         ...cart,
//         {
//           product: prod._id,
//           name: prod.name,
//           sku: prod.sku,
//           unitPrice: unitSellPrice,
//           quantity: requestedQty
//         }
//       ]);
//     }
//     setSelectedProduct('');
//     setQty(1);
//   };

//   const removeFromCart = (id) => {
//     setCart(cart.filter(item => item.product !== id));
//   };

//   const subTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
//   const grandTotal = Math.max(0, subTotal - (Number(discount) || 0));

//   // ইনভয়েস সাবমিট করা
//   const handleGenerateInvoice = async (e) => {
//     e.preventDefault();
//     if (!selectedClient || cart.length === 0) {
//       return alert('ক্লায়েন্ট এবং অন্তত একটি প্রোডাক্ট সিলেক্ট করুন!');
//     }

//     const numericDiscount = Math.max(0, Number(discount) || 0);
//     const numericPaid =
//       paidAmount === '' ? grandTotal : Math.max(0, Number(paidAmount) || 0);

//     const payload = {
//       client: selectedClient,
//       items: cart.map(({ product, quantity, unitPrice }) => ({
//         product,
//         quantity: Number(quantity),
//         unitPrice: Number(unitPrice)
//       })),
//       discount: numericDiscount,
//       paidAmount: numericPaid,
//       paymentMethod
//     };

//     if (paymentMethod === 'Mobile Banking' && mobileProvider) {
//       payload.mobileProvider = mobileProvider;
//     }

//     setSubmitting(true);
//     try {
//       await createInvoice(payload);
//       alert('Invoice Generated Successfully!');
//       setCart([]);
//       setSelectedClient('');
//       setDiscount(0);
//       setPaidAmount('');
//       setPaymentMethod('Cash');
//       setMobileProvider('bKash');
//       setCurrentPage(1);
//       reloadData?.();
//     } catch (err) {
//       const serverMsg =
//         err.response?.data?.message ||
//         err.response?.data?.error ||
//         'Error creating invoice';
//       alert(`400 / Error: ${serverMsg}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ডিলিট ফাংশন (স্টক ও কাস্টমার Due রিভার্স করবে)
//   const handleDeleteInvoice = async (inv) => {
//     if (
//       !confirm(
//         `Invoice ${inv.invoiceNumber} ডিলিট করলে স্টক (Sell OUT) এবং বকেয়া ব্যালেন্স রিভার্স হয়ে যাবে। আপনি কি নিশ্চিত?`
//       )
//     ) {
//       return;
//     }

//     try {
//       await deleteInvoice(inv._id);
//       if (previewInvoice?._id === inv._id) setPreviewInvoice(null);
//       reloadData?.();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Error deleting invoice');
//     }
//   };

//   // প্রিন্ট ফাংশন (সিগনেচার ও পরিচ্ছন্ন লেআউটসহ)
//   const handlePrint = () => {
//     if (!previewInvoice) return;
//     const printContent = document.getElementById('printable-invoice-area')?.innerHTML || '';
//     const printWindow = window.open('', '_blank', 'height=700,width=800');

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Invoice - ${previewInvoice.invoiceNumber}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 25px; color: #1e293b; margin: 0; }
//             h3 { margin: 0 0 5px 0; font-size: 22px; color: #0f172a; }
//             p { margin: 3px 0; font-size: 13px; color: #475569; }
//             .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 15px; }
//             .flex-between { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 13px; }
//             table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
//             th, td { border-bottom: 1px solid #cbd5e1; padding: 8px; text-align: left; }
//             th { background-color: #f1f5f9; color: #334155; }
//             .text-right { text-align: right; }
//             .summary { text-align: right; font-size: 13px; line-height: 1.6; margin-bottom: 40px; }
//             .grand-total { font-size: 15px; font-weight: bold; color: #0f172a; }
//             .signature-section { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 10px; }
//             .signature-box { width: 180px; text-align: center; border-top: 1px solid #64748b; font-size: 12px; font-weight: bold; color: #475569; padding-top: 5px; }
//           </style>
//         </head>
//         <body>
//           ${printContent}
//         </body>
//       </html>
//     `);

//     printWindow.document.close();
//     printWindow.focus();
//     setTimeout(() => {
//       printWindow.print();
//       printWindow.close();
//     }, 500);
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Sales & Billing (Invoices)</h2>
//         <p className="text-xs sm:text-sm text-slate-500">
//           Create customer invoices and automatically deduct inventory stock.
//         </p>
//       </div>

//       {/* Invoice Builder Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left: Item Selection */}
//         <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
//           <h3 className="font-bold text-slate-800 border-b pb-3">
//             1. Select Client & Add Products
//           </h3>

//           <div>
//             <label className="block text-xs font-semibold text-slate-600 mb-1">
//               Customer / Client
//             </label>
//             <select
//               value={selectedClient}
//               onChange={e => setSelectedClient(e.target.value)}
//               className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white"
//             >
//               <option value="">-- Select Client --</option>
//               {clientList.map(c => (
//                 <option key={c._id} value={c._id}>
//                   {c.companyName || c.name} ({c.phone})
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end pt-2">
//             <div className="sm:col-span-2">
//               <label className="block text-xs font-semibold text-slate-600 mb-1">
//                 Product
//               </label>
//               <select
//                 value={selectedProduct}
//                 onChange={e => setSelectedProduct(e.target.value)}
//                 className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white"
//               >
//                 <option value="">-- Select Product --</option>
//                 {productList
//                   .filter(p => Number(p.quantity || 0) > 0)
//                   .map(p => {
//                     const unitSell = Number(p.sellPrice ?? p.price ?? 0);
//                     return (
//                       <option key={p._id} value={p._id}>
//                         {p.name} (৳{unitSell.toLocaleString()} | Stock: {p.quantity})
//                       </option>
//                     );
//                   })}
//               </select>
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">Qty</label>
//               <input
//                 type="number"
//                 min="1"
//                 value={qty}
//                 onChange={e => setQty(e.target.value)}
//                 className="w-full border border-slate-200 p-2.5 rounded-xl text-sm"
//               />
//             </div>
//             <button
//               type="button"
//               onClick={addToCart}
//               className="bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition"
//             >
//               <Plus className="w-4 h-4" /> Add Item
//             </button>
//           </div>

//           {/* Cart Table */}
//           {cart.length > 0 && (
//             <div className="pt-4 overflow-x-auto">
//               <table className="w-full text-left text-sm border-collapse min-w-[440px]">
//                 <thead>
//                   <tr className="bg-slate-50 text-xs text-slate-500 uppercase border-b">
//                     <th className="p-3">Product</th>
//                     <th className="p-3">Price</th>
//                     <th className="p-3">Qty</th>
//                     <th className="p-3">Total</th>
//                     <th className="p-3"></th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y">
//                   {cart.map(item => (
//                     <tr key={item.product}>
//                       <td className="p-3 font-medium">{item.name}</td>
//                       <td className="p-3">৳{Number(item.unitPrice).toLocaleString()}</td>
//                       <td className="p-3">{item.quantity}</td>
//                       <td className="p-3 font-bold">
//                         ৳{(item.unitPrice * item.quantity).toLocaleString()}
//                       </td>
//                       <td className="p-3 text-right">
//                         <button
//                           type="button"
//                           onClick={() => removeFromCart(item.product)}
//                           className="text-red-500 hover:text-red-700"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>

//         {/* Right: Payment Summary */}
//         <form
//           onSubmit={handleGenerateInvoice}
//           className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4"
//         >
//           <div className="space-y-4">
//             <h3 className="font-bold text-slate-800 border-b pb-3">2. Billing Summary</h3>
//             <div className="flex justify-between text-sm text-slate-600">
//               <span>Subtotal:</span>
//               <span className="font-semibold">৳ {subTotal.toLocaleString()}</span>
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">
//                 Discount (৳)
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 value={discount}
//                 onChange={e => setDiscount(e.target.value)}
//                 className="w-full border border-slate-200 p-2 rounded-xl text-sm"
//               />
//             </div>
//             <div className="flex justify-between text-base font-bold text-slate-800 pt-2 border-t">
//               <span>Grand Total:</span>
//               <span className="text-indigo-600">৳ {grandTotal.toLocaleString()}</span>
//             </div>
//             <div>
//               <label className="block text-xs font-semibold text-slate-600 mb-1">
//                 Paid Amount (৳)
//               </label>
//               <input
//                 type="number"
//                 min="0"
//                 max={grandTotal}
//                 placeholder={`Full: ${grandTotal}`}
//                 value={paidAmount}
//                 onChange={e => setPaidAmount(e.target.value)}
//                 className="w-full border border-slate-200 p-2 rounded-xl text-sm"
//               />
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">
//                   Payment Method
//                 </label>
//                 <select
//                   value={paymentMethod}
//                   onChange={e => setPaymentMethod(e.target.value)}
//                   className="w-full border border-slate-200 p-2 rounded-xl text-sm bg-white"
//                 >
//                   <option value="Cash">Cash</option>
//                   <option value="Bank">Bank</option>
//                   <option value="Mobile Banking">Mobile Banking</option>
//                 </select>
//               </div>

//               {paymentMethod === 'Mobile Banking' && (
//                 <div>
//                   <label className="block text-xs font-semibold text-slate-600 mb-1">
//                     Provider
//                   </label>
//                   <select
//                     value={mobileProvider}
//                     onChange={e => setMobileProvider(e.target.value)}
//                     className="w-full border border-slate-200 p-2 rounded-xl text-sm bg-white"
//                   >
//                     <option value="bKash">bKash</option>
//                     <option value="Nagad">Nagad</option>
//                     <option value="Rocket">Rocket</option>
//                     <option value="Upay">Upay</option>
//                   </select>
//                 </div>
//               )}
//             </div>
//           </div>

//           <button
//             type="submit"
//             disabled={submitting}
//             className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-xl font-semibold text-sm shadow-sm transition"
//           >
//             {submitting ? 'Generating...' : 'Generate Invoice & Complete Sale'}
//           </button>
//         </form>
//       </div>

//       {/* Invoice History Container */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
//         <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
//           <h3 className="font-bold text-slate-800">Recent Invoices</h3>
//           <span className="text-xs text-slate-500">
//             Total: <strong className="text-slate-700">{invoiceList.length}</strong>
//           </span>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse min-w-[760px]">
//             <thead>
//               <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
//                 <th className="py-3.5 px-5">Invoice #</th>
//                 <th className="py-3.5 px-5">Client</th>
//                 <th className="py-3.5 px-5">Grand Total</th>
//                 <th className="py-3.5 px-5">Paid / Due</th>
//                 <th className="py-3.5 px-5">Method</th>
//                 <th className="py-3.5 px-5">Status</th>
//                 <th className="py-3.5 px-5 text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100 text-sm">
//               {paginatedInvoices.length > 0 ? (
//                 paginatedInvoices.map(inv => (
//                   <tr key={inv._id} className="hover:bg-slate-50">
//                     <td className="py-3.5 px-5 font-mono font-bold text-indigo-600">
//                       {inv.invoiceNumber}
//                     </td>
//                     <td className="py-3.5 px-5 font-medium">
//                       {inv.client?.companyName || inv.client?.name || 'Walk-in'}
//                     </td>
//                     <td className="py-3.5 px-5 font-bold">
//                       ৳ {Number(inv.grandTotal || 0).toLocaleString()}
//                     </td>
//                     <td className="py-3.5 px-5 text-xs">
//                       <span className="text-emerald-600 font-semibold">
//                         Paid: ৳{Number(inv.paidAmount || 0).toLocaleString()}
//                       </span>{' '}
//                       |{' '}
//                       <span className="text-red-500 font-semibold">
//                         Due: ৳{Number(inv.dueAmount || 0).toLocaleString()}
//                       </span>
//                     </td>
//                     <td className="py-3.5 px-5 text-xs text-slate-600 font-medium">
//                       {inv.paymentMethod || 'Cash'}
//                       {inv.mobileProvider ? ` (${inv.mobileProvider})` : ''}
//                     </td>
//                     <td className="py-3.5 px-5">
//                       <span
//                         className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
//                           inv.paymentStatus === 'Paid'
//                             ? 'bg-emerald-50 text-emerald-600'
//                             : inv.paymentStatus === 'Partial'
//                             ? 'bg-amber-50 text-amber-600'
//                             : 'bg-red-50 text-red-600'
//                         }`}
//                       >
//                         {inv.paymentStatus}
//                       </span>
//                     </td>
//                     <td className="py-3.5 px-5 text-right space-x-2 whitespace-nowrap">
//                       <button
//                         type="button"
//                         onClick={() => setPreviewInvoice(inv)}
//                         className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1"
//                       >
//                         <FileText className="w-3.5 h-3.5" /> View / Print
//                       </button>

//                       {canDeleteInvoice && (
//                         <button
//                           type="button"
//                           onClick={() => handleDeleteInvoice(inv)}
//                           className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1"
//                           title="Delete Invoice"
//                         >
//                           <Trash2 className="w-3.5 h-3.5" />
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" className="text-center py-8 text-slate-400 text-sm">
//                     কোনো ইনভয়েস পাওয়া যায়নি।
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination Controls */}
//         {invoiceList.length > itemsPerPage && (
//           <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm">
//             <p className="text-slate-500">
//               Showing <strong className="text-slate-700">{startIndex + 1}</strong> to{' '}
//               <strong className="text-slate-700">
//                 {Math.min(startIndex + itemsPerPage, invoiceList.length)}
//               </strong>{' '}
//               of <strong className="text-slate-700">{invoiceList.length}</strong>
//             </p>
//             <div className="flex items-center gap-1.5">
//               <button
//                 type="button"
//                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                 disabled={currentPage === 1}
//                 className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
//               >
//                 <ChevronLeft className="w-4 h-4" />
//               </button>
//               <span className="px-2.5 font-semibold text-slate-700">
//                 {currentPage} / {totalPages}
//               </span>
//               <button
//                 type="button"
//                 onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                 disabled={currentPage === totalPages}
//                 className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
//               >
//                 <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Printable Invoice Modal */}
//       {previewInvoice && (
//         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
//             <div id="printable-invoice-area" className="space-y-4">
//               <div className="header flex justify-between items-center border-b pb-3">
//                 <div>
//                   <h3>NEXUS ERP INVOICE</h3>
//                   <p className="text-xs text-slate-500">
//                     Invoice No: {previewInvoice.invoiceNumber}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex-between text-sm flex justify-between">
//                 <div>
//                   <p className="text-slate-400 text-xs">Billed To:</p>
//                   <p className="font-bold text-slate-800">
//                     {previewInvoice.client?.companyName || previewInvoice.client?.name}
//                   </p>
//                   <p className="text-slate-600 text-xs">{previewInvoice.client?.phone}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-slate-400 text-xs">Date:</p>
//                   <p className="font-medium">
//                     {previewInvoice.createdAt
//                       ? new Date(previewInvoice.createdAt).toLocaleDateString()
//                       : ''}
//                   </p>
//                 </div>
//               </div>

//               <table className="w-full text-left text-xs border-y py-2">
//                 <thead>
//                   <tr className="border-b text-slate-500">
//                     <th className="py-2">Item</th>
//                     <th className="py-2">Qty</th>
//                     <th className="py-2">Price</th>
//                     <th className="py-2 text-right">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y">
//                   {(previewInvoice.items || []).map((item, idx) => {
//                     const lineTotal =
//                       item.lineTotal ?? item.total ?? item.quantity * item.unitPrice;
//                     return (
//                       <tr key={idx}>
//                         <td className="py-2 font-medium">{item.product?.name || 'Item'}</td>
//                         <td className="py-2">{item.quantity}</td>
//                         <td className="py-2">৳{Number(item.unitPrice || 0).toLocaleString()}</td>
//                         <td className="py-2 text-right font-semibold">
//                           ৳{Number(lineTotal || 0).toLocaleString()}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>

//               <div className="summary text-sm space-y-1 text-right">
//                 <p className="text-slate-500">
//                   Subtotal: ৳{Number(previewInvoice.subTotal || 0).toLocaleString()}
//                 </p>
//                 <p className="text-slate-500">
//                   Discount: -৳{Number(previewInvoice.discount || 0).toLocaleString()}
//                 </p>
//                 <p className="grand-total text-base font-bold text-slate-800">
//                   Grand Total: ৳{Number(previewInvoice.grandTotal || 0).toLocaleString()}
//                 </p>
//                 <p className="text-xs text-emerald-600 font-semibold">
//                   Paid: ৳{Number(previewInvoice.paidAmount || 0).toLocaleString()} | Due: ৳
//                   {Number(previewInvoice.dueAmount || 0).toLocaleString()}
//                 </p>
//               </div>

//               <div
//                 className="signature-section"
//                 style={{
//                   display: 'flex',
//                   justifyContent: 'space-between',
//                   marginTop: '50px',
//                   paddingTop: '10px'
//                 }}
//               >
//                 <div
//                   className="signature-box"
//                   style={{
//                     width: '180px',
//                     textAlign: 'center',
//                     borderTop: '1px solid #64748b',
//                     fontSize: '12px',
//                     fontWeight: 'bold',
//                     color: '#475569',
//                     paddingTop: '5px'
//                   }}
//                 >
//                   Customer Signature
//                 </div>
//                 <div
//                   className="signature-box"
//                   style={{
//                     width: '180px',
//                     textAlign: 'center',
//                     borderTop: '1px solid #64748b',
//                     fontSize: '12px',
//                     fontWeight: 'bold',
//                     color: '#475569',
//                     paddingTop: '5px'
//                   }}
//                 >
//                   Authorized Signature
//                 </div>
//               </div>
//             </div>

//             <div className="pt-3 flex gap-3 print:hidden border-t">
//               <button
//                 type="button"
//                 onClick={handlePrint}
//                 className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
//               >
//                 Print Invoice
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setPreviewInvoice(null)}
//                 className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Printer,
  Receipt
} from 'lucide-react';
import { createInvoice, deleteInvoice } from '../services/api';
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

export default function Invoices({
  clients = [],
  products = [],
  invoices = [],
  settings,
  reloadData,
  user
}) {
  const activeSettings = {
    ...DEFAULT_ERP_SETTINGS,
    ...(settings || {})
  };

  const [selectedClient, setSelectedClient] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [qty, setQty] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(
    activeSettings.defaultPaymentMethod || 'Cash'
  );
  const [mobileProvider, setMobileProvider] = useState(
    activeSettings.defaultMobileProvider || 'bKash'
  );
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (settings?.defaultPaymentMethod) {
      setPaymentMethod(settings.defaultPaymentMethod);
    }
    if (settings?.defaultMobileProvider) {
      setMobileProvider(settings.defaultMobileProvider);
    }
  }, [settings?.defaultPaymentMethod, settings?.defaultMobileProvider]);

  useEffect(() => {
    setLogoError(false);
  }, [activeSettings.logoUrl, previewInvoice]);

  const currentUser = getEffectiveUser(user);
  const isAdmin =
    (currentUser?.userType || '').toLowerCase() === 'admin' ||
    (currentUser?.role || '').toLowerCase() === 'admin';
  const hasInvoicePermission = Boolean(currentUser?.permissions?.invoices);
  const canDeleteInvoice = isAdmin || hasInvoicePermission;

  const clientList = Array.isArray(clients) ? clients : [];
  const productList = Array.isArray(products) ? products : [];
  const invoiceList = Array.isArray(invoices) ? invoices : [];

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(invoiceList.length / itemsPerPage));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [invoiceList.length, currentPage]);

  const totalPages = Math.max(1, Math.ceil(invoiceList.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = invoiceList.slice(startIndex, startIndex + itemsPerPage);

  // কার্টে প্রোডাক্ট যোগ করা (sellPrice প্রাধান্য পাবে)
  const addToCart = () => {
    if (!selectedProduct) return;
    const prod = productList.find(p => p._id === selectedProduct);
    if (!prod) return;

    const requestedQty = Number(qty) || 1;
    if (requestedQty <= 0) return;

    const existing = cart.find(item => item.product === prod._id);
    const totalRequested = (existing ? existing.quantity : 0) + requestedQty;

    if (totalRequested > Number(prod.quantity || 0)) {
      return alert(`স্টকে মাত্র ${prod.quantity} পিস আছে!`);
    }

    const unitSellPrice = Number(prod.sellPrice ?? prod.price ?? 0);

    if (existing) {
      setCart(
        cart.map(item =>
          item.product === prod._id
            ? { ...item, quantity: item.quantity + requestedQty }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          product: prod._id,
          name: prod.name,
          sku: prod.sku,
          unitPrice: unitSellPrice,
          quantity: requestedQty
        }
      ]);
    }
    setSelectedProduct('');
    setQty(1);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.product !== id));
  };

  const subTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const grandTotal = Math.max(0, subTotal - (Number(discount) || 0));

  // ইনভয়েস সাবমিট করা
  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!selectedClient || cart.length === 0) {
      return alert('ক্লায়েন্ট এবং অন্তত একটি প্রোডাক্ট সিলেক্ট করুন!');
    }

    const numericDiscount = Math.max(0, Number(discount) || 0);
    const numericPaid =
      paidAmount === '' ? grandTotal : Math.max(0, Number(paidAmount) || 0);

    const payload = {
      client: selectedClient,
      items: cart.map(({ product, quantity, unitPrice }) => ({
        product,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice)
      })),
      discount: numericDiscount,
      paidAmount: numericPaid,
      paymentMethod
    };

    if (paymentMethod === 'Mobile Banking' && mobileProvider) {
      payload.mobileProvider = mobileProvider;
    }

    setSubmitting(true);
    try {
      await createInvoice(payload);
      alert('Invoice Generated Successfully!');
      setCart([]);
      setSelectedClient('');
      setDiscount(0);
      setPaidAmount('');
      setPaymentMethod(activeSettings.defaultPaymentMethod || 'Cash');
      setMobileProvider(activeSettings.defaultMobileProvider || 'bKash');
      setCurrentPage(1);
      if (activeSettings.autoReloadAfterAction !== false) {
        reloadData?.();
      }
    } catch (err) {
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error creating invoice';
      alert(`400 / Error: ${serverMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ডিলিট ফাংশন (স্টক ও কাস্টমার Due রিভার্স করবে)
  const handleDeleteInvoice = async (inv) => {
    if (
      !confirm(
        `Invoice ${inv.invoiceNumber} ডিলিট করলে স্টক (Sell OUT) এবং বকেয়া ব্যালেন্স রিভার্স হয়ে যাবে। আপনি কি নিশ্চিত?`
      )
    ) {
      return;
    }

    try {
      await deleteInvoice(inv._id);
      if (previewInvoice?._id === inv._id) setPreviewInvoice(null);
      reloadData?.();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting invoice');
    }
  };

  // প্রিন্ট ফাংশন (কোম্পানির তথ্য, লোগো, ফুটার ও সিগনেচারসহ)
  // const handlePrint = () => {
  //   if (!previewInvoice) return;
  //   const printContent = document.getElementById('printable-invoice-area')?.innerHTML || '';
  //   const printWindow = window.open('', '_blank', 'height=700,width=800');
  //   if (!printWindow) return;

  //   printWindow.document.write(`
  //     <html>
  //       <head>
  //         <title>Invoice - ${previewInvoice.invoiceNumber}</title>
  //         <style>
  //           body { font-family: Arial, sans-serif; padding: 25px; color: #1e293b; margin: 0; }
  //           h3 { margin: 0 0 4px 0; font-size: 20px; color: #0f172a; }
  //           p { margin: 2px 0; font-size: 12px; color: #475569; }
  //           .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 15px; gap: 12px; }
  //           .brand-box { display: flex; align-items: flex-start; gap: 10px; }
  //           .brand-logo { width: 46px; height: 46px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 8px; padding: 3px; }
  //           .flex-between { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 13px; }
  //           table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
  //           th, td { border-bottom: 1px solid #cbd5e1; padding: 8px; text-align: left; }
  //           th { background-color: #f1f5f9; color: #334155; }
  //           .text-right { text-align: right; }
  //           .summary { text-align: right; font-size: 13px; line-height: 1.6; margin-bottom: 30px; }
  //           .grand-total { font-size: 15px; font-weight: bold; color: #0f172a; }
  //           .footer-note { text-align: center; font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
  //           .signature-section { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 10px; }
  //           .signature-box { width: 180px; text-align: center; border-top: 1px solid #64748b; font-size: 12px; font-weight: bold; color: #475569; padding-top: 5px; }
  //         </style>
  //       </head>
  //       <body>
  //         ${printContent}
  //       </body>
  //     </html>
  //   `);

  //   printWindow.document.close();
  //   printWindow.focus();
  //   setTimeout(() => {
  //     printWindow.print();
  //     printWindow.close();
  //   }, 500);
  // };

  // Standard / A4 প্রিন্ট ফাংশন (কোম্পানির তথ্য, লোগো, ফুটার ও সিগনেচারসহ)
  const handlePrint = () => {
    if (!previewInvoice) return;
    const printContent = document.getElementById('printable-invoice-area')?.innerHTML || '';
    const printWindow = window.open('', '_blank', 'height=700,width=800');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${previewInvoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 25px; color: #1e293b; margin: 0; }
            h3 { margin: 0 0 4px 0; font-size: 20px; color: #0f172a; }
            p { margin: 2px 0; font-size: 12px; color: #475569; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 15px; gap: 12px; }
            .brand-box { display: flex; align-items: flex-start; gap: 10px; }
            .brand-logo { width: 46px; height: 46px; object-fit: contain; border: 1px solid #e2e8f0; border-radius: 8px; padding: 3px; }
            .flex-between { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            th, td { border-bottom: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background-color: #f1f5f9; color: #334155; }
            .text-right { text-align: right; }
            .summary { text-align: right; font-size: 13px; line-height: 1.6; margin-bottom: 30px; }
            .grand-total { font-size: 15px; font-weight: bold; color: #0f172a; }
            .footer-note { text-align: center; font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px dashed #cbd5e1; padding-top: 10px; }
            .signature-section { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 10px; }
            .signature-box { width: 180px; text-align: center; border-top: 1px solid #64748b; font-size: 12px; font-weight: bold; color: #475569; padding-top: 5px; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  // POS Thermal Printer (80mm) ফাংশন
  const handlePosPrint = () => {
    if (!previewInvoice) return;

    const activeSettings = {
      ...DEFAULT_ERP_SETTINGS,
      ...(settings || {})
    };
    const currency = activeSettings.currencySymbol || '৳';
    const companyTitle = (activeSettings.companyName || 'NEXUS ERP').trim();

    const posWindow = window.open('', '_blank', 'height=680,width=380');
    if (!posWindow) return;

    const items = Array.isArray(previewInvoice.items) ? previewInvoice.items : [];
    const itemsHtml = items
      .map(item => {
        const qty = Number(item.quantity ?? item.qty ?? 0);
        const unitPrice = Number(item.unitPrice ?? item.price ?? item.sellPrice ?? 0);
        const lineTotal = Number(item.total ?? item.lineTotal ?? qty * unitPrice);
        const prodName = item.product?.name || item.name || 'Item';

        return `
          <tr>
            <td colspan="3" class="item-name">${prodName}</td>
          </tr>
          <tr class="item-meta">
            <td>${qty} x ${currency}${unitPrice.toLocaleString()}</td>
            <td></td>
            <td class="text-right">${currency}${lineTotal.toLocaleString()}</td>
          </tr>
        `;
      })
      .join('');

    const subTotal = Number(previewInvoice.subTotal ?? previewInvoice.totalAmount ?? 0);
    const discount = Number(previewInvoice.discount ?? 0);
    const tax = Number(previewInvoice.tax ?? previewInvoice.vat ?? 0);
    const grandTotal = Number(
      previewInvoice.grandTotal ?? previewInvoice.totalAmount ?? subTotal - discount + tax
    );
    const paidAmount = Number(previewInvoice.paidAmount ?? 0);
    const dueAmount = Math.max(0, Number(previewInvoice.dueAmount ?? grandTotal - paidAmount));

    const methodText =
      previewInvoice.paymentMethod === 'Mobile Banking' && previewInvoice.mobileProvider
        ? `${previewInvoice.paymentMethod} (${previewInvoice.mobileProvider})`
        : previewInvoice.paymentMethod || 'Cash';

    const logoHtml =
      activeSettings.logoUrl && activeSettings.logoUrl.trim()
        ? `<img src="${activeSettings.logoUrl}" alt="${companyTitle}" class="pos-logo" />`
        : '';

    const footerNote = activeSettings.invoiceFooter || 'Thank you for your business!';

    posWindow.document.write(`
      <html>
        <head>
          <title>POS Receipt - ${previewInvoice.invoiceNumber}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 76mm;
              max-width: 100%;
              margin: 0 auto;
              padding: 6mm 3mm;
              color: #000;
              font-size: 11px;
              line-height: 1.35;
            }
            .center { text-align: center; }
            .right, .text-right { text-align: right; }
            .bold { font-weight: bold; }
            .pos-logo {
              max-width: 44px;
              max-height: 44px;
              object-fit: contain;
              display: block;
              margin: 0 auto 4px auto;
            }
            .shop-name { font-size: 15px; font-weight: bold; margin: 0; }
            .muted { font-size: 10px; margin: 1px 0; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; font-size: 10.5px; margin: 2px 0; }
            table { width: 100%; border-collapse: collapse; margin: 4px 0; }
            .item-name { font-weight: bold; font-size: 11px; padding-top: 4px; }
            .item-meta td { font-size: 10px; padding-bottom: 4px; border-bottom: 1px dotted #999; }
            .total-row { font-size: 12.5px; font-weight: bold; margin-top: 4px; }
            .footer { text-align: center; font-size: 10px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="center">
            ${logoHtml}
            <p class="shop-name">${companyTitle}</p>
            ${activeSettings.address ? `<p class="muted">${activeSettings.address}</p>` : ''}
            ${activeSettings.phone ? `<p class="muted">Tel: ${activeSettings.phone}</p>` : ''}
            ${activeSettings.taxId ? `<p class="muted">BIN/VAT: ${activeSettings.taxId}</p>` : ''}
          </div>

          <div class="divider"></div>

          <div class="row">
            <span><strong>Inv:</strong> ${previewInvoice.invoiceNumber || '-'}</span>
            <span>${
              previewInvoice.createdAt
                ? new Date(previewInvoice.createdAt).toLocaleDateString()
                : new Date().toLocaleDateString()
            }</span>
          </div>
          <div class="row">
            <span><strong>Client:</strong> ${previewInvoice.client?.name || 'Walk-in'}</span>
            <span>${methodText}</span>
          </div>

          <div class="divider"></div>

          <table>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="divider"></div>

          <div class="row">
            <span>Subtotal:</span>
            <span>${currency}${subTotal.toLocaleString()}</span>
          </div>
          ${
            discount > 0
              ? `<div class="row"><span>Discount:</span><span>-${currency}${discount.toLocaleString()}</span></div>`
              : ''
          }
          ${
            tax > 0
              ? `<div class="row"><span>Tax/VAT:</span><span>+${currency}${tax.toLocaleString()}</span></div>`
              : ''
          }
          <div class="row total-row">
            <span>GRAND TOTAL:</span>
            <span>${currency}${grandTotal.toLocaleString()}</span>
          </div>
          <div class="row">
            <span>Paid:</span>
            <span>${currency}${paidAmount.toLocaleString()}</span>
          </div>
          <div class="row bold">
            <span>Due:</span>
            <span>${currency}${dueAmount.toLocaleString()}</span>
          </div>

          <div class="divider"></div>

          <div class="footer">
            <p>${footerNote}</p>
            <p class="muted">Powered by ${companyTitle}</p>
          </div>
        </body>
      </html>
    `);

    posWindow.document.close();
    posWindow.focus();
    setTimeout(() => {
      posWindow.print();
      posWindow.close();
    }, 400);
  };


  const currency = activeSettings.currencySymbol || '৳';
  const companyTitle = activeSettings.companyName || 'NEXUS ERP';
  const hasLogo = Boolean(activeSettings.logoUrl && activeSettings.logoUrl.trim()) && !logoError;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Sales & Billing (Invoices)</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Create customer invoices and automatically deduct inventory stock.
        </p>
      </div>

      {/* Invoice Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Item Selection */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <h3 className="font-bold text-slate-800 border-b pb-3">
            1. Select Client & Add Products
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Customer / Client
            </label>
            <select
              value={selectedClient}
              onChange={e => setSelectedClient(e.target.value)}
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white"
            >
              <option value="">-- Select Client --</option>
              {clientList.map(c => (
                <option key={c._id} value={c._id}>
                  {c.companyName || c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end pt-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Product
              </label>
              <select
                value={selectedProduct}
                onChange={e => setSelectedProduct(e.target.value)}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white"
              >
                <option value="">-- Select Product --</option>
                {productList
                  .filter(p => Number(p.quantity || 0) > 0)
                  .map(p => {
                    const unitSell = Number(p.sellPrice ?? p.price ?? 0);
                    return (
                      <option key={p._id} value={p._id}>
                        {p.name} ({currency}{unitSell.toLocaleString()} | Stock: {p.quantity})
                      </option>
                    );
                  })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Qty</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={e => setQty(e.target.value)}
                className="w-full border border-slate-200 p-2.5 rounded-xl text-sm"
              />
            </div>
            <button
              type="button"
              onClick={addToCart}
              className="bg-slate-800 hover:bg-slate-900 text-white py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-1 transition"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          {/* Cart Table */}
          {cart.length > 0 && (
            <div className="pt-4 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse min-w-[440px]">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase border-b">
                    <th className="p-3">Product</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Total</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {cart.map(item => (
                    <tr key={item.product}>
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">{currency}{Number(item.unitPrice).toLocaleString()}</td>
                      <td className="p-3">{item.quantity}</td>
                      <td className="p-3 font-bold">
                        {currency}{(item.unitPrice * item.quantity).toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Payment Summary */}
        <form
          onSubmit={handleGenerateInvoice}
          className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4"
        >
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 border-b pb-3">2. Billing Summary</h3>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold">{currency} {subTotal.toLocaleString()}</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Discount ({currency})
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                className="w-full border border-slate-200 p-2 rounded-xl text-sm"
              />
            </div>
            <div className="flex justify-between text-base font-bold text-slate-800 pt-2 border-t">
              <span>Grand Total:</span>
              <span className="text-indigo-600">{currency} {grandTotal.toLocaleString()}</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Paid Amount ({currency})
              </label>
              <input
                type="number"
                min="0"
                max={grandTotal}
                placeholder={`Full: ${grandTotal}`}
                value={paidAmount}
                onChange={e => setPaidAmount(e.target.value)}
                className="w-full border border-slate-200 p-2 rounded-xl text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full border border-slate-200 p-2 rounded-xl text-sm bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="Mobile Banking">Mobile Banking</option>
                </select>
              </div>

              {paymentMethod === 'Mobile Banking' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Provider
                  </label>
                  <select
                    value={mobileProvider}
                    onChange={e => setMobileProvider(e.target.value)}
                    className="w-full border border-slate-200 p-2 rounded-xl text-sm bg-white"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Upay">Upay</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 rounded-xl font-semibold text-sm shadow-sm transition"
          >
            {submitting ? 'Generating...' : 'Generate Invoice & Complete Sale'}
          </button>
        </form>
      </div>

      {/* Invoice History Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Recent Invoices</h3>
          <span className="text-xs text-slate-500">
            Total: <strong className="text-slate-700">{invoiceList.length}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="bg-slate-50 border-b text-xs font-semibold text-slate-500 uppercase">
                <th className="py-3.5 px-5">Invoice #</th>
                <th className="py-3.5 px-5">Client</th>
                <th className="py-3.5 px-5">Grand Total</th>
                <th className="py-3.5 px-5">Paid / Due</th>
                <th className="py-3.5 px-5">Method</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map(inv => (
                  <tr key={inv._id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-5 font-mono font-bold text-indigo-600">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-5 font-medium">
                      {inv.client?.companyName || inv.client?.name || 'Walk-in'}
                    </td>
                    <td className="py-3.5 px-5 font-bold">
                      {currency} {Number(inv.grandTotal || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-xs">
                      <span className="text-emerald-600 font-semibold">
                        Paid: {currency}{Number(inv.paidAmount || 0).toLocaleString()}
                      </span>{' '}
                      |{' '}
                      <span className="text-red-500 font-semibold">
                        Due: {currency}{Number(inv.dueAmount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 font-medium">
                      {inv.paymentMethod || 'Cash'}
                      {inv.mobileProvider ? ` (${inv.mobileProvider})` : ''}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          inv.paymentStatus === 'Paid'
                            ? 'bg-emerald-50 text-emerald-600'
                            : inv.paymentStatus === 'Partial'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setPreviewInvoice(inv)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" /> View / Print
                      </button>


                      {canDeleteInvoice && (
                        <button
                          type="button"
                          onClick={() => handleDeleteInvoice(inv)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg text-xs font-medium inline-flex items-center gap-1"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-400 text-sm">
                    কোনো ইনভয়েস পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {invoiceList.length > itemsPerPage && (
          <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm">
            <p className="text-slate-500">
              Showing <strong className="text-slate-700">{startIndex + 1}</strong> to{' '}
              <strong className="text-slate-700">
                {Math.min(startIndex + itemsPerPage, invoiceList.length)}
              </strong>{' '}
              of <strong className="text-slate-700">{invoiceList.length}</strong>
            </p>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2.5 font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Printable Invoice Modal */}
      {previewInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div id="printable-invoice-area" className="space-y-4">
              <div className="header flex justify-between items-start border-b pb-3 gap-4">
                <div className="brand-box flex items-start gap-3">
                  {hasLogo && (
                    <img
                      src={activeSettings.logoUrl}
                      alt={companyTitle}
                      onError={() => setLogoError(true)}
                      className="brand-logo w-12 h-12 rounded-xl object-contain border border-slate-200 bg-white p-1 shrink-0"
                    />
                  )}
                  <div>
                    <h3>{companyTitle} INVOICE</h3>
                    {activeSettings.address && (
                      <p className="text-xs text-slate-600">{activeSettings.address}</p>
                    )}
                    {activeSettings.phone && (
                      <p className="text-xs text-slate-600">Phone: {activeSettings.phone}</p>
                    )}
                    {activeSettings.taxId && (
                      <p className="text-xs text-slate-500">BIN/VAT: {activeSettings.taxId}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-indigo-600">
                    {previewInvoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-slate-500">
                    Date:{' '}
                    {previewInvoice.createdAt
                      ? new Date(previewInvoice.createdAt).toLocaleDateString()
                      : ''}
                  </p>
                </div>
              </div>

              <div className="flex-between text-sm flex justify-between">
                <div>
                  <p className="text-slate-400 text-xs">Billed To:</p>
                  <p className="font-bold text-slate-800">
                    {previewInvoice.client?.companyName || previewInvoice.client?.name}
                  </p>
                  <p className="text-slate-600 text-xs">{previewInvoice.client?.phone}</p>
                </div>
              </div>

              <table className="w-full text-left text-xs border-y py-2">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="py-2">Item</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(previewInvoice.items || []).map((item, idx) => {
                    const lineTotal =
                      item.lineTotal ?? item.total ?? item.quantity * item.unitPrice;
                    return (
                      <tr key={idx}>
                        <td className="py-2 font-medium">{item.product?.name || 'Item'}</td>
                        <td className="py-2">{item.quantity}</td>
                        <td className="py-2">
                          {currency}{Number(item.unitPrice || 0).toLocaleString()}
                        </td>
                        <td className="py-2 text-right font-semibold">
                          {currency}{Number(lineTotal || 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="summary text-sm space-y-1 text-right">
                <p className="text-slate-500">
                  Subtotal: {currency}{Number(previewInvoice.subTotal || 0).toLocaleString()}
                </p>
                <p className="text-slate-500">
                  Discount: -{currency}{Number(previewInvoice.discount || 0).toLocaleString()}
                </p>
                <p className="grand-total text-base font-bold text-slate-800">
                  Grand Total: {currency}{Number(previewInvoice.grandTotal || 0).toLocaleString()}
                </p>
                <p className="text-xs text-emerald-600 font-semibold">
                  Paid: {currency}{Number(previewInvoice.paidAmount || 0).toLocaleString()} | Due:{' '}
                  {currency}{Number(previewInvoice.dueAmount || 0).toLocaleString()}
                </p>
              </div>

              {activeSettings.showSignatureOnPrint !== false && (
                <div
                  className="signature-section"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '50px',
                    paddingTop: '10px'
                  }}
                >
                  <div
                    className="signature-box"
                    style={{
                      width: '180px',
                      textAlign: 'center',
                      borderTop: '1px solid #64748b',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#475569',
                      paddingTop: '5px'
                    }}
                  >
                    Customer Signature
                  </div>
                  <div
                    className="signature-box"
                    style={{
                      width: '180px',
                      textAlign: 'center',
                      borderTop: '1px solid #64748b',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: '#475569',
                      paddingTop: '5px'
                    }}
                  >
                    Authorized Signature
                  </div>
                </div>
              )}

              {activeSettings.invoiceFooter && (
                <p className="footer-note text-center text-xs text-slate-500 pt-3 border-t border-dashed">
                  {activeSettings.invoiceFooter}
                </p>
              )}
            </div>

            <div className="pt-3 flex gap-3 print:hidden border-t">
              {/* <button
                type="button"
                onClick={handlePrint}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
              >
                Print Invoice
              </button> */}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" /> Print Invoice
                </button>

                <button
                  type="button"
                  onClick={handlePosPrint}
                  className="bg-slate-800 hover:bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition"
                >
                  <Receipt className="w-4 h-4" /> POS Print
                </button>
              </div>



              <button
                type="button"
                onClick={() => setPreviewInvoice(null)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}