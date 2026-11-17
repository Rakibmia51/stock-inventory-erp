import { useState } from 'react';
import { addSupplier } from '../services/api';

export default function Suppliers({ suppliers, reloadData }) {
  const [form, setForm] = useState({ name: '', companyName: '', phone: '', email: '', address: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addSupplier(form);
    setForm({ name: '', companyName: '', phone: '', email: '', address: '' });
    reloadData();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Supplier Management</h2>
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input placeholder="Contact Person Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border p-2.5 rounded-lg text-sm" required />
        <input placeholder="Company Name" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} className="border p-2.5 rounded-lg text-sm" required />
        <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="border p-2.5 rounded-lg text-sm" required />
        <input placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="border p-2.5 rounded-lg text-sm" />
        <button type="submit" className="sm:col-span-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 text-sm">Add Supplier</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-gray-50 border-b text-sm text-gray-600">
            <tr><th className="p-4">Company</th><th className="p-4">Contact Person</th><th className="p-4">Phone</th><th className="p-4">Email</th></tr>
          </thead>
          <tbody className="divide-y text-sm">
            {suppliers.map(s => (
              <tr key={s._id}>
                <td className="p-4 font-bold text-gray-800">{s.companyName}</td>
                <td className="p-4">{s.name}</td>
                <td className="p-4">{s.phone}</td>
                <td className="p-4 text-gray-500">{s.email || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}