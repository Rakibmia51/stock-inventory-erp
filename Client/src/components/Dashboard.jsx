import { Package, DollarSign, Users, AlertTriangle } from 'lucide-react';

export default function Dashboard({ products, suppliers, clients }) {
  const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.quantity), 0);
  const lowStockItems = products.filter(p => p.quantity <= p.minStockLevel);

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Inventory Value', value: `৳ ${totalStockValue.toLocaleString()}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Active Partners', value: `${suppliers.length} Sup / ${clients.length} Cli`, icon: Users, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Low Stock Alerts', value: lowStockItems.length, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Executive Dashboard</h2>
        <p className="text-sm text-slate-500">Real-time overview of your inventory and business operations.</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-4">
              <div className={`p-3.5 rounded-xl ${stat.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" /> Critical Low Stock Items
        </h3>
        {lowStockItems.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">All stock levels are healthy!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                  <th className="pb-3">SKU</th>
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Available</th>
                  <th className="pb-3">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {lowStockItems.map(item => (
                  <tr key={item._id}>
                    <td className="py-3 font-mono text-slate-500">{item.sku}</td>
                    <td className="py-3 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-3 text-red-600 font-bold">{item.quantity} pcs</td>
                    <td className="py-3 text-slate-500">{item.minStockLevel} pcs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}