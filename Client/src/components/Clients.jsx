import { useState } from 'react';
import { addClient } from '../services/api';

export default function Clients({ clients, reloadData }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', dueBalance: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addClient(form);
    setForm({ name: '', phone: '', email: '', address: '', dueBalance: 0 });
    reloadData();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Client Management</h2>
      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow-sm border grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input placeholder="Client Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border p-2.5 rounded-lg text-sm" required />
        <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="border p-2.5 rounded-lg text-sm" required />
        <input placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="border p-2.5 rounded-lg text-sm" />
        <input placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="border p-2.5 rounded-lg text-sm" />
        <button type="submit" className="sm:col-span-2 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 text-sm">Add Client</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead className="bg-gray-50 border-b text-sm text-gray-600">
            <tr><th className="p-4">Name</th><th className="p-4">Phone</th><th className="p-4">Email</th><th className="p-4">Address</th></tr>
          </thead>
          <tbody className="divide-y text-sm">
            {clients.map(c => (
              <tr key={c._id}>
                <td className="p-4 font-bold text-gray-800">{c.name}</td>
                <td className="p-4">{c.phone}</td>
                <td className="p-4 text-gray-500">{c.email || 'N/A'}</td>
                <td className="p-4 text-gray-500">{c.address || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}