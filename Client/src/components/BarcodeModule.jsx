// import { useState, useMemo } from 'react';
// import {
//   Barcode,
//   Printer,
//   Search,
//   Copy,
//   Check,
//   Tag,
//   Layers
// } from 'lucide-react';
// import { DEFAULT_ERP_SETTINGS } from './Settings';

// // Code 128B প্যাটার্ন টেবিল (ASCII 32-126 এর জন্য)
// const CODE128B_PATTERNS = [
//   '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
//   '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
//   '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
//   '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
//   '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
//   '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
//   '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
//   '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
//   '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
//   '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
//   '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
// ];

// const START_B = 104;
// const STOP_CODE = 106;

// function buildCode128Bars(rawValue) {
//   const text = String(rawValue || '')
//     .replace(/[^\x20-\x7E]/g, '')
//     .trim();

//   if (!text) return [];

//   const codes = [START_B];
//   let checksum = START_B;

//   for (let i = 0; i < text.length; i += 1) {
//     const code = text.charCodeAt(i) - 32;
//     if (code >= 0 && code <= 94) {
//       codes.push(code);
//       checksum += code * (i + 1);
//     }
//   }

//   const checkDigit = checksum % 103;
//   codes.push(checkDigit);
//   codes.push(STOP_CODE);

//   const bars = [];
//   let x = 0;

//   codes.forEach(codeVal => {
//     const pattern = CODE128B_PATTERNS[codeVal] || CODE128B_PATTERNS[0];
//     for (let i = 0; i < pattern.length; i += 1) {
//       const width = Number(pattern[i]);
//       const isBar = i % 2 === 0;
//       if (isBar && width > 0) {
//         bars.push({ x, width });
//       }
//       x += width;
//     }
//   });

//   return bars;
// }

// function BarcodeSvg({ value, height = 42, barScale = 1.6 }) {
//   const bars = useMemo(() => buildCode128Bars(value), [value]);

//   if (!bars.length) {
//     return (
//       <div className="text-[11px] text-red-500 font-medium py-2">
//         Enter valid ASCII characters to generate barcode
//       </div>
//     );
//   }

//   const maxRight = bars.reduce((max, b) => Math.max(max, b.x + b.width), 0);
//   const totalWidth = Math.max(10, Math.round(maxRight * barScale));

//   return (
//     <svg
//       width="100%"
//       height={height}
//       viewBox={`0 0 ${totalWidth} ${height}`}
//       preserveAspectRatio="none"
//       className="block max-w-full"
//       aria-label={`Barcode ${value}`}
//     >
//       <rect x="0" y="0" width={totalWidth} height={height} fill="#ffffff" />
//       {bars.map((b, idx) => (
//         <rect
//           key={idx}
//           x={b.x * barScale}
//           y={0}
//           width={Math.max(1, b.width * barScale)}
//           height={height}
//           fill="#0f172a"
//         />
//       ))}
//     </svg>
//   );
// }

// export default function BarcodeModule({ products = [], settings }) {
//   const activeSettings = {
//     ...DEFAULT_ERP_SETTINGS,
//     ...(settings || {})
//   };
//   const currency = activeSettings.currencySymbol || '৳';
//   const companyTitle = (activeSettings.companyName || 'NEXUS ERP').trim();

//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedProductId, setSelectedProductId] = useState('');

//   const [codeValue, setCodeValue] = useState('PRD-1001');
//   const [productLabel, setProductLabel] = useState('Sample Product');
//   const [priceValue, setPriceValue] = useState('0');
//   const [copies, setCopies] = useState(6);

//   const [showCompany, setShowCompany] = useState(true);
//   const [showName, setShowName] = useState(true);
//   const [showPrice, setShowPrice] = useState(true);
//   const [copiedCode, setCopiedCode] = useState(false);

//   const filteredProducts = useMemo(() => {
//     const q = searchQuery.trim().toLowerCase();
//     if (!q) return products;
//     return products.filter(p => {
//       const name = String(p?.name || '').toLowerCase();
//       const sku = String(p?.sku || p?.barcode || '').toLowerCase();
//       const category = String(p?.category || '').toLowerCase();
//       return name.includes(q) || sku.includes(q) || category.includes(q);
//     });
//   }, [products, searchQuery]);

//   const handleSelectProduct = (product) => {
//     if (!product) return;
//     setSelectedProductId(product._id || '');
//     const derivedCode =
//       String(product.sku || product.barcode || '').trim() ||
//       `PRD-${String(product._id || '').slice(-6).toUpperCase() || '1001'}`;
//     const derivedPrice = Number(product.sellPrice ?? product.price ?? product.unitPrice ?? 0);

//     setCodeValue(derivedCode);
//     setProductLabel(product.name || 'Product');
//     setPriceValue(String(derivedPrice));
//   };

//   const handleCopyCode = async () => {
//     if (!codeValue.trim()) return;
//     try {
//       await navigator.clipboard.writeText(codeValue.trim());
//       setCopiedCode(true);
//       setTimeout(() => setCopiedCode(false), 1800);
//     } catch {
//       alert(`Code: ${codeValue.trim()}`);
//     }
//   };

//   const safeCopies = Math.min(100, Math.max(1, Number(copies) || 1));

//   const renderLabelCardHtml = (isPos = false) => {
//     const priceNum = Number(priceValue || 0);
//     const priceText = `${currency} ${priceNum.toLocaleString()}`;
//     const cleanCode = String(codeValue || '').trim() || 'CODE128';

//     const bars = buildCode128Bars(cleanCode);
//     const maxRight = bars.reduce((max, b) => Math.max(max, b.x + b.width), 0);
//     const scale = isPos ? 1.5 : 1.4;
//     const svgW = Math.max(10, Math.round(maxRight * scale));
//     const svgH = isPos ? 36 : 38;

//     const svgMarkup = bars.length
//       ? `<svg width="100%" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="none">
//           <rect x="0" y="0" width="${svgW}" height="${svgH}" fill="#fff" />
//           ${bars
//             .map(
//               b =>
//                 `<rect x="${b.x * scale}" y="0" width="${Math.max(
//                   1,
//                   b.width * scale
//                 )}" height="${svgH}" fill="#000" />`
//             )
//             .join('')}
//         </svg>`
//       : `<div style="font-size:10px;color:#b91c1c;">Invalid Code</div>`;

//     return `
//       <div class="${isPos ? 'pos-label' : 'sheet-label'}">
//         ${showCompany ? `<div class="lbl-company">${companyTitle}</div>` : ''}
//         ${showName ? `<div class="lbl-name">${productLabel || 'Product'}</div>` : ''}
//         <div class="lbl-barcode">${svgMarkup}</div>
//         <div class="lbl-code">${cleanCode}</div>
//         ${showPrice ? `<div class="lbl-price">${priceText}</div>` : ''}
//       </div>
//     `;
//   };

//   const handlePrintSheet = () => {
//     if (!String(codeValue || '').trim()) {
//       alert('Please enter or select a barcode / SKU value first.');
//       return;
//     }

//     const printWindow = window.open('', '_blank', 'height=750,width=900');
//     if (!printWindow) return;

//     const labelsHtml = Array.from({ length: safeCopies })
//       .map(() => renderLabelCardHtml(false))
//       .join('');

//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Barcode Labels - ${codeValue}</title>
//           <style>
//             @page { size: A4 portrait; margin: 10mm; }
//             body {
//               font-family: Arial, sans-serif;
//               margin: 0;
//               padding: 0;
//               color: #0f172a;
//             }
//             .grid {
//               display: grid;
//               grid-template-columns: repeat(3, 1fr);
//               gap: 8px;
//             }
//             .sheet-label {
//               border: 1px dashed #94a3b8;
//               border-radius: 6px;
//               padding: 7px 8px;
//               text-align: center;
//               break-inside: avoid;
//             }
//             .lbl-company {
//               font-size: 9px;
//               font-weight: bold;
//               text-transform: uppercase;
//               color: #475569;
//               white-space: nowrap;
//               overflow: hidden;
//               text-overflow: ellipsis;
//             }
//             .lbl-name {
//               font-size: 11px;
//               font-weight: bold;
//               margin: 1px 0 3px 0;
//               white-space: nowrap;
//               overflow: hidden;
//               text-overflow: ellipsis;
//             }
//             .lbl-barcode {
//               display: flex;
//               justify-content: center;
//               align-items: center;
//             }
//             .lbl-code {
//               font-family: 'Courier New', monospace;
//               font-size: 10px;
//               font-weight: bold;
//               letter-spacing: 1px;
//               margin-top: 2px;
//             }
//             .lbl-price {
//               font-size: 11px;
//               font-weight: bold;
//               margin-top: 1px;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="grid">${labelsHtml}</div>
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

//   const handlePrintPosLabels = () => {
//     if (!String(codeValue || '').trim()) {
//       alert('Please enter or select a barcode / SKU value first.');
//       return;
//     }

//     const posWindow = window.open('', '_blank', 'height=680,width=380');
//     if (!posWindow) return;

//     const labelsHtml = Array.from({ length: safeCopies })
//       .map(() => renderLabelCardHtml(true))
//       .join('');

//     posWindow.document.write(`
//       <html>
//         <head>
//           <title>POS Barcode - ${codeValue}</title>
//           <style>
//             @page { size: 80mm auto; margin: 0; }
//             body {
//               font-family: Arial, sans-serif;
//               width: 76mm;
//               margin: 0 auto;
//               padding: 4mm 2mm;
//               color: #000;
//             }
//             .pos-label {
//               border-bottom: 1px dashed #333;
//               padding: 6px 2px;
//               text-align: center;
//             }
//             .pos-label:last-child {
//               border-bottom: none;
//             }
//             .lbl-company {
//               font-size: 9px;
//               font-weight: bold;
//               text-transform: uppercase;
//             }
//             .lbl-name {
//               font-size: 10.5px;
//               font-weight: bold;
//               margin: 1px 0 3px 0;
//             }
//             .lbl-code {
//               font-family: 'Courier New', monospace;
//               font-size: 10px;
//               font-weight: bold;
//               letter-spacing: 1px;
//               margin-top: 2px;
//             }
//             .lbl-price {
//               font-size: 11px;
//               font-weight: bold;
//               margin-top: 1px;
//             }
//           </style>
//         </head>
//         <body>
//           ${labelsHtml}
//         </body>
//       </html>
//     `);

//     posWindow.document.close();
//     posWindow.focus();
//     setTimeout(() => {
//       posWindow.print();
//       posWindow.close();
//     }, 400);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div className="flex items-start gap-3">
//           <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0 mt-0.5">
//             <Barcode className="w-6 h-6" />
//           </div>
//           <div>
//             <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
//               Barcode Generator & Label Print
//             </h2>
//             <p className="text-xs sm:text-sm text-slate-500">
//               Generate Code 128 barcodes from inventory products or custom codes and print labels.
//             </p>
//           </div>
//         </div>

//         <div className="flex flex-wrap items-center gap-2">
//           <button
//             type="button"
//             onClick={handlePrintSheet}
//             className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition"
//           >
//             <Printer className="w-4 h-4" /> Print Labels
//           </button>

//           <button
//             type="button"
//             onClick={handlePrintPosLabels}
//             className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition"
//           >
//             <Layers className="w-4 h-4" /> POS Thermal Print
//           </button>
//         </div>
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
//         {/* Left: Generator Form & Product Picker */}
//         <div className="lg:col-span-6 space-y-5">
//           {/* Product Picker */}
//           <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
//             <div className="flex items-center justify-between">
//               <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
//                 <Tag className="w-4 h-4 text-indigo-600" /> Pick from Inventory Products
//               </h3>
//               <span className="text-xs text-slate-400">{filteredProducts.length} items</span>
//             </div>

//             <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/30">
//               <Search className="w-4 h-4 text-slate-400 shrink-0" />
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={e => setSearchQuery(e.target.value)}
//                 placeholder="Search product by name, SKU, or category..."
//                 className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-700"
//               />
//             </div>

//             <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
//               {filteredProducts.length > 0 ? (
//                 filteredProducts.map(prod => {
//                   const isSelected = selectedProductId === prod._id;
//                   const codeText = prod.sku || prod.barcode || 'Auto SKU';
//                   const priceNum = Number(prod.sellPrice ?? prod.price ?? prod.unitPrice ?? 0);

//                   return (
//                     <button
//                       key={prod._id}
//                       type="button"
//                       onClick={() => handleSelectProduct(prod)}
//                       className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 text-xs transition ${
//                         isSelected
//                           ? 'bg-indigo-50 text-indigo-900 font-semibold'
//                           : 'hover:bg-slate-50 text-slate-700'
//                       }`}
//                     >
//                       <div className="min-w-0">
//                         <p className="font-semibold truncate">{prod.name}</p>
//                         <p className="text-[11px] font-mono text-slate-400 truncate">{codeText}</p>
//                       </div>
//                       <span className="font-bold text-slate-800 shrink-0">
//                         {currency} {priceNum.toLocaleString()}
//                       </span>
//                     </button>
//                   );
//                 })
//               ) : (
//                 <div className="p-4 text-center text-xs text-slate-400">
//                   No inventory products found. You can still type a custom barcode below.
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Barcode & Label Settings */}
//           <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
//             <h3 className="text-sm font-bold text-slate-800">Label Details & Count</h3>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">
//                   Barcode / SKU Value *
//                 </label>
//                 <div className="flex gap-1.5">
//                   <input
//                     type="text"
//                     value={codeValue}
//                     onChange={e => setCodeValue(e.target.value)}
//                     placeholder="e.g. PRD-1001"
//                     className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500"
//                   />
//                   <button
//                     type="button"
//                     onClick={handleCopyCode}
//                     className="px-3 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
//                     title="Copy Code"
//                   >
//                     {copiedCode ? (
//                       <Check className="w-4 h-4 text-emerald-600" />
//                     ) : (
//                       <Copy className="w-4 h-4" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">
//                   Number of Copies (1–100)
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   max="100"
//                   value={copies}
//                   onChange={e => setCopies(e.target.value)}
//                   className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">
//                   Product Name on Label
//                 </label>
//                 <input
//                   type="text"
//                   value={productLabel}
//                   onChange={e => setProductLabel(e.target.value)}
//                   placeholder="Product name"
//                   className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-semibold text-slate-600 mb-1">
//                   Price ({currency})
//                 </label>
//                 <input
//                   type="number"
//                   step="any"
//                   value={priceValue}
//                   onChange={e => setPriceValue(e.target.value)}
//                   placeholder="0"
//                   className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
//                 />
//               </div>
//             </div>

//             <div className="flex flex-wrap gap-3 pt-1">
//               <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={showCompany}
//                   onChange={e => setShowCompany(e.target.checked)}
//                   className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
//                 />
//                 Company Name
//               </label>

//               <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={showName}
//                   onChange={e => setShowName(e.target.checked)}
//                   className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
//                 />
//                 Product Name
//               </label>

//               <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={showPrice}
//                   onChange={e => setShowPrice(e.target.checked)}
//                   className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
//                 />
//                 Price Tag
//               </label>
//             </div>
//           </div>
//         </div>

//         {/* Right: Live Label Preview */}
//         <div className="lg:col-span-6">
//           <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
//             <div className="flex items-center justify-between border-b border-slate-100 pb-3">
//               <h3 className="text-sm font-bold text-slate-800">
//                 Live Label Preview ({safeCopies} {safeCopies === 1 ? 'Copy' : 'Copies'})
//               </h3>
//               <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
//                 Code 128
//               </span>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto p-1">
//               {Array.from({ length: safeCopies }).map((_, idx) => (
//                 <div
//                   key={idx}
//                   className="border border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50/50 flex flex-col justify-between space-y-1.5"
//                 >
//                   {showCompany && (
//                     <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
//                       {companyTitle}
//                     </p>
//                   )}

//                   {showName && (
//                     <p className="text-xs font-bold text-slate-800 truncate">
//                       {productLabel || 'Product'}
//                     </p>
//                   )}

//                   <div className="bg-white border border-slate-200/70 rounded-lg px-2 py-1">
//                     <BarcodeSvg value={codeValue} height={40} barScale={1.5} />
//                   </div>

//                   <p className="text-[11px] font-mono font-bold tracking-widest text-slate-700 truncate">
//                     {codeValue || 'CODE128'}
//                   </p>

//                   {showPrice && (
//                     <p className="text-xs font-extrabold text-indigo-700">
//                       {currency} {Number(priceValue || 0).toLocaleString()}
//                     </p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState, useMemo } from 'react';
import {
  Barcode,
  Printer,
  Search,
  Copy,
  Check,
  Tag,
  Layers,
  Camera
} from 'lucide-react';
import { DEFAULT_ERP_SETTINGS } from './Settings';
import CameraScannerModal from './CameraScannerModal';

// Code 128B প্যাটার্ন টেবিল (ASCII 32-126 এর জন্য)
const CODE128B_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

const START_B = 104;
const STOP_CODE = 106;

function buildCode128Bars(rawValue) {
  const text = String(rawValue || '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim();

  if (!text) return [];

  const codes = [START_B];
  let checksum = START_B;

  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i) - 32;
    if (code >= 0 && code <= 94) {
      codes.push(code);
      checksum += code * (i + 1);
    }
  }

  const checkDigit = checksum % 103;
  codes.push(checkDigit);
  codes.push(STOP_CODE);

  const bars = [];
  let x = 0;

  codes.forEach(codeVal => {
    const pattern = CODE128B_PATTERNS[codeVal] || CODE128B_PATTERNS[0];
    for (let i = 0; i < pattern.length; i += 1) {
      const width = Number(pattern[i]);
      const isBar = i % 2 === 0;
      if (isBar && width > 0) {
        bars.push({ x, width });
      }
      x += width;
    }
  });

  return bars;
}

function BarcodeSvg({ value, height = 42, barScale = 1.6 }) {
  const bars = useMemo(() => buildCode128Bars(value), [value]);

  if (!bars.length) {
    return (
      <div className="text-[11px] text-red-500 font-medium py-2">
        Enter valid ASCII characters to generate barcode
      </div>
    );
  }

  const maxRight = bars.reduce((max, b) => Math.max(max, b.x + b.width), 0);
  const totalWidth = Math.max(10, Math.round(maxRight * barScale));

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${totalWidth} ${height}`}
      preserveAspectRatio="none"
      className="block max-w-full"
      aria-label={`Barcode ${value}`}
    >
      <rect x="0" y="0" width={totalWidth} height={height} fill="#ffffff" />
      {bars.map((b, idx) => (
        <rect
          key={idx}
          x={b.x * barScale}
          y={0}
          width={Math.max(1, b.width * barScale)}
          height={height}
          fill="#0f172a"
        />
      ))}
    </svg>
  );
}

export default function BarcodeModule({ products = [], settings }) {
  const activeSettings = {
    ...DEFAULT_ERP_SETTINGS,
    ...(settings || {})
  };
  const currency = activeSettings.currencySymbol || '৳';
  const companyTitle = (activeSettings.companyName || 'NEXUS ERP').trim();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  const [codeValue, setCodeValue] = useState('PRD-1001');
  const [productLabel, setProductLabel] = useState('Sample Product');
  const [priceValue, setPriceValue] = useState('0');
  const [copies, setCopies] = useState(6);
  const [posWidth, setPosWidth] = useState('80mm'); // '80mm' | '58mm'

  const [showCompany, setShowCompany] = useState(true);
  const [showName, setShowName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCameraScanner, setShowCameraScanner] = useState(false);

  const productList = Array.isArray(products) ? products : [];

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return productList;
    return productList.filter(p => {
      const name = String(p?.name || '').toLowerCase();
      const sku = String(p?.sku || p?.barcode || '').toLowerCase();
      const category = String(p?.category || '').toLowerCase();
      return name.includes(q) || sku.includes(q) || category.includes(q);
    });
  }, [productList, searchQuery]);

  const handleSelectProduct = (product) => {
    if (!product) return;
    setSelectedProductId(product._id || '');
    const derivedCode =
      String(product.sku || product.barcode || '').trim() ||
      `PRD-${String(product._id || '').slice(-6).toUpperCase() || '1001'}`;
    const derivedPrice = Number(product.sellPrice ?? product.price ?? product.unitPrice ?? 0);

    setCodeValue(derivedCode);
    setProductLabel(product.name || 'Product');
    setPriceValue(String(derivedPrice));
  };

  const handleScannedBarcode = (scannedCode) => {
    const clean = String(scannedCode || '').trim();
    if (!clean) return;

    const normalized = clean.toLowerCase();
    const matched = productList.find(p => {
      const sku = String(p?.sku || '').trim().toLowerCase();
      const barcode = String(p?.barcode || '').trim().toLowerCase();
      return sku === normalized || barcode === normalized;
    });

    if (matched) {
      handleSelectProduct(matched);
      setSearchQuery(clean);
    } else {
      setSelectedProductId('');
      setCodeValue(clean);
      setProductLabel(clean);
    }
  };

  const handleCopyCode = async () => {
    if (!codeValue.trim()) return;
    try {
      await navigator.clipboard.writeText(codeValue.trim());
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      alert(`Code: ${codeValue.trim()}`);
    }
  };

  const safeCopies = Math.min(100, Math.max(1, Number(copies) || 1));

  const renderLabelCardHtml = (isPos = false) => {
    const priceNum = Number(priceValue || 0);
    const priceText = `${currency} ${priceNum.toLocaleString()}`;
    const cleanCode = String(codeValue || '').trim() || 'CODE128';

    const bars = buildCode128Bars(cleanCode);
    const maxRight = bars.reduce((max, b) => Math.max(max, b.x + b.width), 0);
    const is58mm = isPos && posWidth === '58mm';
    const scale = isPos ? (is58mm ? 1.1 : 1.5) : 1.4;
    const svgW = Math.max(10, Math.round(maxRight * scale));
    const svgH = isPos ? (is58mm ? 30 : 36) : 38;

    const svgMarkup = bars.length
      ? `<svg width="100%" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" preserveAspectRatio="none">
          <rect x="0" y="0" width="${svgW}" height="${svgH}" fill="#fff" />
          ${bars
            .map(
              b =>
                `<rect x="${b.x * scale}" y="0" width="${Math.max(
                  1,
                  b.width * scale
                )}" height="${svgH}" fill="#000" />`
            )
            .join('')}
        </svg>`
      : `<div style="font-size:10px;color:#b91c1c;">Invalid Code</div>`;

    return `
      <div class="${isPos ? 'pos-label' : 'sheet-label'}">
        ${showCompany ? `<div class="lbl-company">${companyTitle}</div>` : ''}
        ${showName ? `<div class="lbl-name">${productLabel || 'Product'}</div>` : ''}
        <div class="lbl-barcode">${svgMarkup}</div>
        <div class="lbl-code">${cleanCode}</div>
        ${showPrice ? `<div class="lbl-price">${priceText}</div>` : ''}
      </div>
    `;
  };

  const handlePrintSheet = () => {
    if (!String(codeValue || '').trim()) {
      alert('Please enter or select a barcode / SKU value first.');
      return;
    }

    const printWindow = window.open('', '_blank', 'height=750,width=900');
    if (!printWindow) return;

    const labelsHtml = Array.from({ length: safeCopies })
      .map(() => renderLabelCardHtml(false))
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Barcode Labels - ${codeValue}</title>
          <style>
            @page { size: A4 portrait; margin: 10mm; }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: #0f172a;
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
            }
            .sheet-label {
              border: 1px dashed #94a3b8;
              border-radius: 6px;
              padding: 7px 8px;
              text-align: center;
              break-inside: avoid;
            }
            .lbl-company {
              font-size: 9px;
              font-weight: bold;
              text-transform: uppercase;
              color: #475569;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .lbl-name {
              font-size: 11px;
              font-weight: bold;
              margin: 1px 0 3px 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .lbl-barcode {
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .lbl-code {
              font-family: 'Courier New', monospace;
              font-size: 10px;
              font-weight: bold;
              letter-spacing: 1px;
              margin-top: 2px;
            }
            .lbl-price {
              font-size: 11px;
              font-weight: bold;
              margin-top: 1px;
            }
          </style>
        </head>
        <body>
          <div class="grid">${labelsHtml}</div>
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

  const handlePrintPosLabels = () => {
    if (!String(codeValue || '').trim()) {
      alert('Please enter or select a barcode / SKU value first.');
      return;
    }

    const posWindow = window.open('', '_blank', 'height=680,width=380');
    if (!posWindow) return;

    const labelsHtml = Array.from({ length: safeCopies })
      .map(() => renderLabelCardHtml(true))
      .join('');

    const is58mm = posWidth === '58mm';
    const pageSize = is58mm ? '58mm auto' : '80mm auto';
    const bodyWidth = is58mm ? '54mm' : '76mm';

    posWindow.document.write(`
      <html>
        <head>
          <title>POS Barcode (${posWidth}) - ${codeValue}</title>
          <style>
            @page { size: ${pageSize}; margin: 0; }
            body {
              font-family: Arial, sans-serif;
              width: ${bodyWidth};
              margin: 0 auto;
              padding: 4mm 2mm;
              color: #000;
            }
            .pos-label {
              border-bottom: 1px dashed #333;
              padding: 5px 2px;
              text-align: center;
            }
            .pos-label:last-child {
              border-bottom: none;
            }
            .lbl-company {
              font-size: 8.5px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .lbl-name {
              font-size: 10px;
              font-weight: bold;
              margin: 1px 0 3px 0;
            }
            .lbl-code {
              font-family: 'Courier New', monospace;
              font-size: 9.5px;
              font-weight: bold;
              letter-spacing: 0.8px;
              margin-top: 2px;
            }
            .lbl-price {
              font-size: 10.5px;
              font-weight: bold;
              margin-top: 1px;
            }
          </style>
        </head>
        <body>
          ${labelsHtml}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0 mt-0.5">
            <Barcode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Barcode Generator & Label Print
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Generate Code 128 barcodes from inventory products or custom codes and print labels.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCameraScanner(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 shadow-sm transition"
          >
            <Camera className="w-4 h-4" /> Scan Camera
          </button>

          <button
            type="button"
            onClick={handlePrintSheet}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition"
          >
            <Printer className="w-4 h-4" /> Print Labels
          </button>

          <button
            type="button"
            onClick={handlePrintPosLabels}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition"
          >
            <Layers className="w-4 h-4" /> POS ({posWidth})
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Generator Form & Product Picker */}
        <div className="lg:col-span-6 space-y-5">
          {/* Product Picker */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" /> Pick from Inventory Products
              </h3>
              <span className="text-xs text-slate-400">{filteredProducts.length} items</span>
            </div>

            <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/60 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/30">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search product by name, SKU, or category..."
                className="w-full text-xs sm:text-sm bg-transparent outline-none text-slate-700"
              />
            </div>

            <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
              {filteredProducts.length > 0 ? (
                filteredProducts.map(prod => {
                  const isSelected = selectedProductId === prod._id;
                  const codeText = prod.sku || prod.barcode || 'Auto SKU';
                  const priceNum = Number(prod.sellPrice ?? prod.price ?? prod.unitPrice ?? 0);

                  return (
                    <button
                      key={prod._id}
                      type="button"
                      onClick={() => handleSelectProduct(prod)}
                      className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-2 text-xs transition ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{prod.name}</p>
                        <p className="text-[11px] font-mono text-slate-400 truncate">{codeText}</p>
                      </div>
                      <span className="font-bold text-slate-800 shrink-0">
                        {currency} {priceNum.toLocaleString()}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  No inventory products found. You can still type a custom barcode below.
                </div>
              )}
            </div>
          </div>

          {/* Barcode & Label Settings */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-800">Label Details & Count</h3>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setPosWidth('80mm')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition ${
                    posWidth === '80mm'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  80mm
                </button>
                <button
                  type="button"
                  onClick={() => setPosWidth('58mm')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition ${
                    posWidth === '58mm'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  58mm
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Barcode / SKU Value *
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={codeValue}
                    onChange={e => setCodeValue(e.target.value)}
                    placeholder="e.g. PRD-1001"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="px-3 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                    title="Copy Code"
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Number of Copies (1–100)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={copies}
                  onChange={e => setCopies(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Product Name on Label
                </label>
                <input
                  type="text"
                  value={productLabel}
                  onChange={e => setProductLabel(e.target.value)}
                  placeholder="Product name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Price ({currency})
                </label>
                <input
                  type="number"
                  step="any"
                  value={priceValue}
                  onChange={e => setPriceValue(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCompany}
                  onChange={e => setShowCompany(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Company Name
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showName}
                  onChange={e => setShowName(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Product Name
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPrice}
                  onChange={e => setShowPrice(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Price Tag
              </label>
            </div>
          </div>
        </div>

        {/* Right: Live Label Preview */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800">
                Live Label Preview ({safeCopies} {safeCopies === 1 ? 'Copy' : 'Copies'})
              </h3>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                Code 128
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[460px] overflow-y-auto p-1">
              {Array.from({ length: safeCopies }).map((_, idx) => (
                <div
                  key={idx}
                  className="border border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50/50 flex flex-col justify-between space-y-1.5"
                >
                  {showCompany && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
                      {companyTitle}
                    </p>
                  )}

                  {showName && (
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {productLabel || 'Product'}
                    </p>
                  )}

                  <div className="bg-white border border-slate-200/70 rounded-lg px-2 py-1">
                    <BarcodeSvg value={codeValue} height={40} barScale={1.5} />
                  </div>

                  <p className="text-[11px] font-mono font-bold tracking-widest text-slate-700 truncate">
                    {codeValue || 'CODE128'}
                  </p>

                  {showPrice && (
                    <p className="text-xs font-extrabold text-indigo-700">
                      {currency} {Number(priceValue || 0).toLocaleString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Camera Barcode Scanner Modal */}
      <CameraScannerModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
        title="Scan Barcode to Load Label"
        onScanSuccess={handleScannedBarcode}
      />
    </div>
  );
}