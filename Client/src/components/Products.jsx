import { useState } from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Search, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { addProduct, updateStock, deleteProduct } from '../services/api';

export default function Products({ products, reloadData, user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [form, setForm] = useState({ name: '', sku: '', category: '', quantity: '', price: '', minStockLevel: 5 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addProduct(form);
    setForm({ name: '', sku: '', category: '', quantity: '', price: '', minStockLevel: 5 });
    setIsModalOpen(false);
    reloadData();
  };

  const handleStock = async (id, type) => {
    const amount = prompt(`কত পিস স্টক ${type === 'IN' ? 'যোগ (IN)' : 'বাদ (OUT)'} করতে চান?`, '1');
    if (!amount || isNaN(amount)) return;
    try {
      await updateStock(id, { type, amount: Number(amount) });
      reloadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating stock');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('আপনি কি নিশ্চিত এটি ডিলিট করতে চান?')) return;
    await deleteProduct(id);
    reloadData();
  };

  // Search Filter
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventory Stock</h2>
          <p className="text-sm text-slate-500">Manage your products, pricing, and real-time stock levels.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by product name, SKU, or category..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none text-slate-700 placeholder-slate-400"
        />
      </div>

      {/* Modern Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Product & SKU</th>
                <th className="py-3.5 px-5">Category</th>
                <th className="py-3.5 px-5">Unit Price</th>
                <th className="py-3.5 px-5">Stock Qty</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredProducts.map(p => {
                const isLow = p.quantity <= p.minStockLevel;
                return (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-5">
                      <p className="font-semibold text-slate-800">{p.name}</p>
                      <span className="text-xs font-mono text-slate-400">{p.sku}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-medium text-slate-700">৳ {p.price.toLocaleString()}</td>
                    <td className="py-4 px-5 font-bold text-slate-800">{p.quantity} pcs</td>
                    <td className="py-4 px-5">
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
                   <td className="py-4 px-5">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                      //onClick={} 
                      title="Stock In" className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
                        <ArrowUpRight className="w-3.5 h-3.5" /> In
                      </button>
                      <button 
                      // onClick={} 
                      title="Stock Out" className="bg-amber-50 hover:bg-amber-100 text-amber-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition">
                        <ArrowDownRight className="w-3.5 h-3.5" /> Out
                      </button>
                      
                      {/* শুধুমাত্র Admin হলেই Delete বাটন দেখাবে */}
                      {user?.role === 'Admin' && (
                        <button onClick={() => handleDelete(p._id)} title="Delete Product" className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-lg transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-800">Add New Product</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name</label>
                <input placeholder="e.g. Wireless Mouse" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">SKU Code</label>
                  <input placeholder="WM-101" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                  <input placeholder="Electronics" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Qty</label>
                  <input type="number" placeholder="0" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Price (৳)</label>
                  <input type="number" placeholder="500" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Alert Level</label>
                  <input type="number" value={form.minStockLevel} onChange={e => setForm({...form, minStockLevel: e.target.value})} className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium transition">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}