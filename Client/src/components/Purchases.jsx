import { useState } from 'react';
import { addPurchase } from '../services/api';

export default function Purchases({ suppliers, products, purchases, reloadData }) {
  const [form, setForm] = useState({ supplier: '', product: '', quantity: 1, purchasePrice: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPurchase({
        supplier: form.supplier,
        items: [{ product: form.product, quantity: Number(form.quantity), purchasePrice: Number(form.purchasePrice) }]
      });
      alert('Purchase Order created & Stock updated!');
      setForm({ supplier: '', product: '', quantity: 1, purchasePrice: 0 });
      reloadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating purchase order');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Purchase Order (Stock In)</h2>
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border grid grid-cols-1 sm:grid-cols-2 gap-4">
        <select value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} className="border p-2.5 rounded-lg text-sm bg-white" required>
          <option value="">Select Supplier</option>
          {suppliers.map(s => <option key={s._id} value={s._id}>{s.companyName} ({s.name})</option>)}
        </select>

        <select value={form.product} onChange={e => setForm({...form, product: e.target.value})} className="border p-2.5 rounded-lg text-sm bg-white" required>
          <option value="">Select Product</option>
          {products.map(p => <option key={p._id} value={p._id}>{p.name} (SKU: {p.sku})</option>)}
        </select>

        <input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="border p-2.5 rounded-lg text-sm" min="1" required />
        <input type="number" placeholder="Unit Purchase Price (৳)" value={form.purchasePrice} onChange={e => setForm({...form, purchasePrice: e.target.value})} className="border p-2.5 rounded-lg text-sm" required />
        
        <button type="submit" className="sm:col-span-2 bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 text-sm">Confirm Purchase & Update Stock</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <h3 className="p-4 font-bold border-b text-gray-800">Purchase History</h3>
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-gray-50 border-b text-sm text-gray-600">
            <tr><th className="p-4">Supplier</th><th className="p-4">Total Amount</th><th className="p-4">Status</th><th className="p-4">Date</th></tr>
          </thead>
          <tbody className="divide-y text-sm">
            {purchases.map(pur => (
              <tr key={pur._id}>
                <td className="p-4 font-bold">{pur.supplier?.companyName || 'Unknown'}</td>
                <td className="p-4 font-bold text-emerald-600">৳ {pur.totalAmount}</td>
                <td className="p-4"><span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded text-xs font-semibold">{pur.status}</span></td>
                <td className="p-4 text-gray-500">{new Date(pur.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}