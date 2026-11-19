// import { Package, DollarSign, Users, AlertTriangle } from 'lucide-react';

// export default function Dashboard({ products, suppliers, clients }) {
//   const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
//   const lowStockItems = products.filter(p => p.quantity <= p.minStockLevel);

//   const stats = [
//     { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
//     { label: 'Inventory Value', value: `৳ ${totalStockValue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
//     { label: 'Active Partners', value: `${suppliers.length} Sup / ${clients.length} Cli`, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
//     { label: 'Low Stock Alerts', value: lowStockItems.length, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-2xl font-bold text-slate-800">Executive Dashboard</h2>
//         <p className="text-sm text-slate-500">Real-time overview of your inventory and business operations.</p>
//       </div>
      
//       {/* KPI Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//         {stats.map((stat, i) => {
//           const Icon = stat.icon;
//           return (
//             <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-4">
//               <div className={`p-3.5 rounded-xl ${stat.color}`}>
//                 <Icon className="w-6 h-6" />
//               </div>
//               <div>
//                 <p className="text-xs font-medium text-slate-500">{stat.label}</p>
//                 <p className="text-xl font-bold text-slate-800 mt-0.5">{stat.value}</p>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Low Stock Table */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
//         <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
//           <AlertTriangle className="w-5 h-5 text-red-500" /> Critical Low Stock Items
//         </h3>
//         {lowStockItems.length === 0 ? (
//           <div className="text-center py-8 text-slate-400 text-sm">All stock levels are healthy!</div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse min-w-[500px]">
//               <thead>
//                 <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
//                   <th className="pb-3">SKU</th>
//                   <th className="pb-3">Product Name</th>
//                   <th className="pb-3">Available</th>
//                   <th className="pb-3">Threshold</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100 text-sm">
//                 {lowStockItems.map(item => (
//                   <tr key={item._id}>
//                     <td className="py-3 font-mono text-slate-500">{item.sku}</td>
//                     <td className="py-3 font-semibold text-slate-800">{item.name}</td>
//                     <td className="py-3 text-red-600 font-bold">{item.quantity} pcs</td>
//                     <td className="py-3 text-slate-500">{item.minStockLevel} pcs</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// import {
//   Package,
//   DollarSign,
//   Users,
//   AlertTriangle,
//   TrendingUp,
//   ShoppingBag,
//   Wallet,
//   Layers
// } from 'lucide-react';

// export default function Dashboard({
//   products = [],
//   suppliers = [],
//   clients = [],
//   invoices = [],
//   purchases = []
// }) {
//   const productList = Array.isArray(products) ? products : [];
//   const supplierList = Array.isArray(suppliers) ? suppliers : [];
//   const clientList = Array.isArray(clients) ? clients : [];
//   const invoiceList = Array.isArray(invoices) ? invoices : [];
//   const purchaseList = Array.isArray(purchases) ? purchases : [];



//   // Stock Buy Value, Sell Value & Expected Profit
//   const stockValuation = productList.reduce(
//     (acc, p) => {
//       const qty = Math.max(0, Number(p.quantity ?? 0));
//       const buyVal = Number(p.buyPrice ?? 0);
//       const sellVal = Number(p.sellPrice ?? p.price ?? 0);

//       acc.totalUnits += qty;
//       acc.buyValue += qty * buyVal;
//       acc.sellValue += qty * sellVal;
//       return acc;
//     },
//     { totalUnits: 0, buyValue: 0, sellValue: 0 }
//   );

//   const expectedStockProfit = stockValuation.sellValue - stockValuation.buyValue;


//   // Sales & Purchase Totals
//   const totalSalesRevenue = invoiceList.reduce(
//     (sum, inv) => sum + Number(inv.grandTotal ?? inv.totalAmount ?? 0),
//     0
//   );

//   const totalPurchaseAmount = purchaseList.reduce(
//     (sum, pur) => sum + Number(pur.totalAmount ?? 0),
//     0
//   );

//   const totalClientDue = clientList.reduce(
//     (sum, c) => sum + Number(c.dueBalance ?? 0),
//     0
//   );

//   const lowStockItems = productList.filter(
//     p => Number(p.quantity ?? 0) <= Number(p.minStockLevel ?? 5)
//   );

//   const primaryStats = [
//     {
//       label: 'Total Products',
//       subLabel: `${stockValuation.totalUnits.toLocaleString()} pcs in stock`,
//       value: productList.length,
//       icon: Package,
//       color: 'bg-blue-50 text-blue-600'
//     },
//     {
//       label: 'Stock Buy Value',
//       subLabel: `Sell Value: ৳${stockValuation.sellValue.toLocaleString()}`,
//       value: `৳ ${stockValuation.buyValue.toLocaleString()}`,
//       icon: DollarSign,
//       color: 'bg-emerald-50 text-emerald-600'
//     },
//     {
//       label: 'Expected Stock Profit',
//       subLabel: 'Sell value minus buy value',
//       value: `${expectedStockProfit >= 0 ? '+' : ''}৳ ${expectedStockProfit.toLocaleString()}`,
//       icon: Layers,
//       color:
//         expectedStockProfit >= 0
//           ? 'bg-teal-50 text-teal-600'
//           : 'bg-red-50 text-red-600'
//     },
//     {
//       label: 'Low Stock Alerts',
//       subLabel: 'Items at or below min level',
//       value: lowStockItems.length,
//       icon: AlertTriangle,
//       color: 'bg-red-50 text-red-600'
//     }
//   ];

//   const businessStats = [
//     {
//       label: 'Total Sales Revenue',
//       value: `৳ ${totalSalesRevenue.toLocaleString()}`,
//       meta: `${invoiceList.length} Invoices`,
//       icon: TrendingUp,
//       color: 'bg-indigo-50 text-indigo-600'
//     },
//     {
//       label: 'Total Purchases',
//       value: `৳ ${totalPurchaseAmount.toLocaleString()}`,
//       meta: `${purchaseList.length} Orders`,
//       icon: ShoppingBag,
//       color: 'bg-amber-50 text-amber-600'
//     },
//     {
//       label: 'Client Due Balance',
//       value: `৳ ${totalClientDue.toLocaleString()}`,
//       meta: `${clientList.length} Clients`,
//       icon: Wallet,
//       color: 'bg-rose-50 text-rose-600'
//     },
//     {
//       label: 'Active Partners',
//       value: `${supplierList.length} Sup / ${clientList.length} Cli`,
//       meta: 'Suppliers & Clients',
//       icon: Users,
//       color: 'bg-slate-100 text-slate-700'
//     }
//   ];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Executive Dashboard</h2>
//         <p className="text-xs sm:text-sm text-slate-500">
//           Real-time overview of inventory valuation, sales, purchases, and low stock alerts.
//         </p>
//       </div>

//       {/* Primary Inventory KPI Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
//         {primaryStats.map((stat, i) => {
//           const Icon = stat.icon;
//           return (
//             <div
//               key={i}
//               className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-4"
//             >
//               <div className={`p-3.5 rounded-xl shrink-0 ${stat.color}`}>
//                 <Icon className="w-6 h-6" />
//               </div>
//               <div className="min-w-0">
//                 <p className="text-xs font-medium text-slate-500 truncate">{stat.label}</p>
//                 <p className="text-lg sm:text-xl font-bold text-slate-800 mt-0.5 truncate">
//                   {stat.value}
//                 </p>
//                 <p className="text-[11px] text-slate-400 mt-0.5 truncate">{stat.subLabel}</p>
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Secondary Business & Cashflow Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
//         {businessStats.map((stat, i) => {
//           const Icon = stat.icon;
//           return (
//             <div
//               key={i}
//               className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3"
//             >
//               <div className="min-w-0">
//                 <p className="text-xs font-medium text-slate-500 truncate">{stat.label}</p>
//                 <p className="text-lg font-bold text-slate-800 mt-1 truncate">{stat.value}</p>
//                 <p className="text-[11px] text-slate-400 mt-0.5">{stat.meta}</p>
//               </div>
//               <div className={`p-3 rounded-xl shrink-0 ${stat.color}`}>
//                 <Icon className="w-5 h-5" />
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Critical Low Stock Items */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
//             <AlertTriangle className="w-5 h-5 text-red-500" /> Critical Low Stock Items
//           </h3>
//           <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
//             {lowStockItems.length} Alerts
//           </span>
//         </div>

//         {lowStockItems.length === 0 ? (
//           <div className="text-center py-8 text-slate-400 text-sm">
//             All stock levels are healthy!
//           </div>
//         ) : (
//           <>
//             {/* Desktop Table View */}
//             <div className="hidden sm:block overflow-x-auto">
//               <table className="w-full text-left border-collapse min-w-[600px]">
//                 <thead>
//                   <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
//                     <th className="pb-3">SKU</th>
//                     <th className="pb-3">Product Name</th>
//                     <th className="pb-3 text-right">Buy / Sell</th>
//                     <th className="pb-3 text-right">Available</th>
//                     <th className="pb-3 text-right">Threshold</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-100 text-sm">
//                   {lowStockItems.map(item => {
//                     const buyVal = Number(item.buyPrice ?? 0);
//                     const sellVal = Number(item.sellPrice ?? item.price ?? 0);
//                     return (
//                       <tr key={item._id} className="hover:bg-slate-50/70">
//                         <td className="py-3 font-mono text-xs text-slate-500">{item.sku}</td>
//                         <td className="py-3 font-semibold text-slate-800">{item.name}</td>
//                         <td className="py-3 text-right text-xs text-slate-600">
//                           ৳{buyVal.toLocaleString()} / ৳{sellVal.toLocaleString()}
//                         </td>
//                         <td className="py-3 text-right text-red-600 font-bold">
//                           {item.quantity} pcs
//                         </td>
//                         <td className="py-3 text-right text-slate-500">
//                           {item.minStockLevel ?? 5} pcs
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile Card View */}
//             <div className="sm:hidden divide-y divide-slate-100">
//               {lowStockItems.map(item => (
//                 <div key={item._id} className="py-3 flex items-center justify-between gap-2">
//                   <div>
//                     <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
//                     <p className="text-xs font-mono text-slate-400">{item.sku}</p>
//                   </div>
//                   <div className="text-right">
//                     <span className="text-xs font-bold text-red-600 block">
//                       {item.quantity} pcs left
//                     </span>
//                     <span className="text-[11px] text-slate-400">
//                       Min: {item.minStockLevel ?? 5}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState } from 'react';
import {
  Package,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Wallet,
  Layers,
  Calendar,
  CalendarDays,
  CalendarRange,
  BarChart3
} from 'lucide-react';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const getSalesAnalytics = (invoices = []) => {
  const list = Array.isArray(invoices) ? invoices : [];
  const now = new Date();

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  let todaySales = 0;
  let todayCount = 0;

  let monthlySales = 0;
  let monthlyCount = 0;

  let yearlySales = 0;
  let yearlyCount = 0;

  // চলতি বছরের ১২ মাসের হিসাব
  const monthlySeries = MONTH_NAMES.map((label, idx) => ({
    label,
    monthIndex: idx,
    amount: 0,
    count: 0
  }));

  // শেষ ৭ দিনের হিসাব
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth, currentDate - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    last7Days.push({ key, label, amount: 0, count: 0 });
  }
  const dayMap = new Map(last7Days.map(d => [d.key, d]));

  for (const inv of list) {
    if (!inv?.createdAt) continue;
    const invDate = new Date(inv.createdAt);
    if (Number.isNaN(invDate.getTime())) continue;

    const amount = Number(inv.grandTotal ?? inv.totalAmount ?? inv.subTotal ?? 0);
    const y = invDate.getFullYear();
    const m = invDate.getMonth();
    const d = invDate.getDate();

    const sameYear = y === currentYear;
    const sameMonth = sameYear && m === currentMonth;
    const sameDay = sameMonth && d === currentDate;

    if (sameYear) {
      yearlySales += amount;
      yearlyCount += 1;
      monthlySeries[m].amount += amount;
      monthlySeries[m].count += 1;
    }

    if (sameMonth) {
      monthlySales += amount;
      monthlyCount += 1;
    }

    if (sameDay) {
      todaySales += amount;
      todayCount += 1;
    }

    const dayKey = `${y}-${m}-${d}`;
    if (dayMap.has(dayKey)) {
      const targetDay = dayMap.get(dayKey);
      targetDay.amount += amount;
      targetDay.count += 1;
    }
  }

  return {
    todaySales,
    todayCount,
    monthlySales,
    monthlyCount,
    yearlySales,
    yearlyCount,
    last7Days,
    monthlySeries
  };
};

export default function Dashboard({
  products = [],
  suppliers = [],
  clients = [],
  invoices = [],
  purchases = []
}) {
  const [chartMode, setChartMode] = useState('monthly'); // 'monthly' | 'weekly'
  const [hoveredBar, setHoveredBar] = useState(null);

  const productList = Array.isArray(products) ? products : [];
  const supplierList = Array.isArray(suppliers) ? suppliers : [];
  const clientList = Array.isArray(clients) ? clients : [];
  const invoiceList = Array.isArray(invoices) ? invoices : [];
  const purchaseList = Array.isArray(purchases) ? purchases : [];

  const {
    todaySales,
    todayCount,
    monthlySales,
    monthlyCount,
    yearlySales,
    yearlyCount,
    last7Days,
    monthlySeries
  } = getSalesAnalytics(invoiceList);

  // Stock Buy Value, Sell Value & Expected Profit
  const stockValuation = productList.reduce(
    (acc, p) => {
      const qty = Math.max(0, Number(p.quantity ?? 0));
      const buyVal = Number(p.buyPrice ?? 0);
      const sellVal = Number(p.sellPrice ?? p.price ?? 0);

      acc.totalUnits += qty;
      acc.buyValue += qty * buyVal;
      acc.sellValue += qty * sellVal;
      return acc;
    },
    { totalUnits: 0, buyValue: 0, sellValue: 0 }
  );

  const expectedStockProfit = stockValuation.sellValue - stockValuation.buyValue;

  const totalSalesRevenue = invoiceList.reduce(
    (sum, inv) => sum + Number(inv.grandTotal ?? inv.totalAmount ?? 0),
    0
  );

  const totalPurchaseAmount = purchaseList.reduce(
    (sum, pur) => sum + Number(pur.totalAmount ?? 0),
    0
  );

  const totalClientDue = clientList.reduce(
    (sum, c) => sum + Number(c.dueBalance ?? 0),
    0
  );

  const lowStockItems = productList.filter(
    p => Number(p.quantity ?? 0) <= Number(p.minStockLevel ?? 5)
  );

  const salesPeriodCards = [
    {
      label: "Today's Sales",
      value: `৳ ${todaySales.toLocaleString()}`,
      meta: `${todayCount} ${todayCount === 1 ? 'Invoice' : 'Invoices'} today`,
      icon: Calendar,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      label: 'Monthly Sales',
      value: `৳ ${monthlySales.toLocaleString()}`,
      meta: `${monthlyCount} ${monthlyCount === 1 ? 'Invoice' : 'Invoices'} this month`,
      icon: CalendarDays,
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      label: 'Yearly Sales',
      value: `৳ ${yearlySales.toLocaleString()}`,
      meta: `${yearlyCount} ${yearlyCount === 1 ? 'Invoice' : 'Invoices'} this year`,
      icon: CalendarRange,
      color: 'bg-violet-50 text-violet-600'
    }
  ];

  const primaryStats = [
    {
      label: 'Total Products',
      subLabel: `${stockValuation.totalUnits.toLocaleString()} pcs in stock`,
      value: productList.length,
      icon: Package,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      label: 'Stock Buy Value',
      subLabel: `Sell Value: ৳${stockValuation.sellValue.toLocaleString()}`,
      value: `৳ ${stockValuation.buyValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      label: 'Expected Stock Profit',
      subLabel: 'Sell value minus buy value',
      value: `${expectedStockProfit >= 0 ? '+' : ''}৳ ${expectedStockProfit.toLocaleString()}`,
      icon: Layers,
      color:
        expectedStockProfit >= 0
          ? 'bg-teal-50 text-teal-600'
          : 'bg-red-50 text-red-600'
    },
    {
      label: 'Low Stock Alerts',
      subLabel: 'Items at or below min level',
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600'
    }
  ];

  const businessStats = [
    {
      label: 'Total Sales Revenue',
      value: `৳ ${totalSalesRevenue.toLocaleString()}`,
      meta: `${invoiceList.length} Invoices`,
      icon: TrendingUp,
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      label: 'Total Purchases',
      value: `৳ ${totalPurchaseAmount.toLocaleString()}`,
      meta: `${purchaseList.length} Orders`,
      icon: ShoppingBag,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      label: 'Client Due Balance',
      value: `৳ ${totalClientDue.toLocaleString()}`,
      meta: `${clientList.length} Clients`,
      icon: Wallet,
      color: 'bg-rose-50 text-rose-600'
    },
    {
      label: 'Active Partners',
      value: `${supplierList.length} Sup / ${clientList.length} Cli`,
      meta: 'Suppliers & Clients',
      icon: Users,
      color: 'bg-slate-100 text-slate-700'
    }
  ];

  const activeSeries = chartMode === 'monthly' ? monthlySeries : last7Days;
  const maxBarValue = Math.max(
    1,
    ...activeSeries.map(item => Number(item.amount || 0))
  );
  const chartTotal = activeSeries.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Executive Dashboard</h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Real-time overview of sales performance, inventory valuation, and low stock alerts.
        </p>
      </div>

      {/* Today / Monthly / Yearly Sales Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {salesPeriodCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500 uppercase truncate">
                  {card.label}
                </p>
                <p className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1 truncate">
                  {card.value}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{card.meta}</p>
              </div>
              <div className={`p-3.5 rounded-xl shrink-0 ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>
      {/* Primary Inventory KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {primaryStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-4"
            >
              <div className={`p-3.5 rounded-xl shrink-0 ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 truncate">{stat.label}</p>
                <p className="text-lg sm:text-xl font-bold text-slate-800 mt-0.5 truncate">
                  {stat.value}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{stat.subLabel}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Business & Cashflow Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {businessStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 truncate">{stat.label}</p>
                <p className="text-lg font-bold text-slate-800 mt-1 truncate">{stat.value}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{stat.meta}</p>
              </div>
              <div className={`p-3 rounded-xl shrink-0 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Critical Low Stock Items */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Critical Low Stock Items
          </h3>
          <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
            {lowStockItems.length} Alerts
          </span>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            All stock levels are healthy!
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3 text-right">Buy / Sell</th>
                    <th className="pb-3 text-right">Available</th>
                    <th className="pb-3 text-right">Threshold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {lowStockItems.map(item => {
                    const buyVal = Number(item.buyPrice ?? 0);
                    const sellVal = Number(item.sellPrice ?? item.price ?? 0);
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/70">
                        <td className="py-3 font-mono text-xs text-slate-500">{item.sku}</td>
                        <td className="py-3 font-semibold text-slate-800">{item.name}</td>
                        <td className="py-3 text-right text-xs text-slate-600">
                          ৳{buyVal.toLocaleString()} / ৳{sellVal.toLocaleString()}
                        </td>
                        <td className="py-3 text-right text-red-600 font-bold">
                          {item.quantity} pcs
                        </td>
                        <td className="py-3 text-right text-slate-500">
                          {item.minStockLevel ?? 5} pcs
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden divide-y divide-slate-100">
              {lowStockItems.map(item => (
                <div key={item._id} className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                    <p className="text-xs font-mono text-slate-400">{item.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-red-600 block">
                      {item.quantity} pcs left
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Min: {item.minStockLevel ?? 5}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Sales Graph Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              {chartMode === 'monthly'
                ? `Monthly Sales Graph (${new Date().getFullYear()})`
                : 'Last 7 Days Sales Graph'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Period Total: <strong className="text-indigo-700">৳ {chartTotal.toLocaleString()}</strong>
            </p>
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMode('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                chartMode === 'weekly'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Last 7 Days
            </button>
            <button
              type="button"
              onClick={() => setChartMode('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                chartMode === 'monthly'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Monthly ({new Date().getFullYear()})
            </button>
          </div>
        </div>

        {/* Responsive Bar Chart */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[540px] pt-8">
            <div className="h-52 flex items-end justify-between gap-2 sm:gap-3 px-2 border-b border-slate-200 relative">
              {activeSeries.map((item, index) => {
                const heightPercent =
                  item.amount > 0 ? Math.max(8, Math.round((item.amount / maxBarValue) * 100)) : 2;
                const isHovered = hoveredBar === index;

                return (
                  <div
                    key={item.label}
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                    className="flex-1 h-full flex flex-col items-center justify-end group relative cursor-pointer"
                  >
                    {/* Hover Tooltip */}
                    {isHovered && (
                      <div className=" -top-12 absolute z-10 bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
                        <div className="font-bold">৳ {Number(item.amount || 0).toLocaleString()}</div>
                        <div className="text-slate-300 text-[10px]">
                          {item.count} {item.count === 1 ? 'sale' : 'sales'}
                        </div>
                      </div>
                    )}

                    {/* Value Label Above Bar */}
                    <span className="text-[10px] font-semibold text-slate-500 mb-1 truncate max-w-full">
                      {item.amount > 0 ? `৳${Number(item.amount).toLocaleString()}` : '৳0'}
                    </span>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[38px] rounded-t-lg transition-all duration-300 ${
                        item.amount > 0
                          ? isHovered
                            ? 'bg-indigo-700 shadow-md'
                            : 'bg-indigo-500/90 group-hover:bg-indigo-600'
                          : 'bg-slate-200'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="flex items-center justify-between gap-2 sm:gap-3 px-2 pt-2.5">
              {activeSeries.map(item => (
                <div
                  key={item.label}
                  className="flex-1 text-center text-[11px] font-semibold text-slate-600 truncate"
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}