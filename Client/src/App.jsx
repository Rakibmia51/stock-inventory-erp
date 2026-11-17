// import './App.css'

// function App() {


//   return (
//     <>
//      <h1>Stock Inventory ERP</h1>
//     </>
//   )
// }

// export default App



import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: '', sku: '', category: '', quantity: '', price: '', minStockLevel: 5
  });

  // ব্যাকএন্ড থেকে সব প্রোডাক্ট লোড করা
  const fetchProducts = async () => {
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // নতুন প্রোডাক্ট সাবমিট করার ফাংশন
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, form);
      setForm({ name: '', sku: '', category: '', quantity: '', price: '', minStockLevel: 5 });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding product');
    }
  };

  // স্টক ইন (+ ইন) অথবা আউট (- আউট) করার ফাংশন
  const handleStockChange = async (id, type) => {
    const amount = prompt(`কত পিস স্টক ${type === 'IN' ? 'যোগ (IN)' : 'বাদ (OUT)'} করতে চান?`, 1);
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;

    try {
      await axios.patch(`${API_URL}/${id}/stock`, { type, amount: Number(amount) });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'স্টক আপডেট ব্যর্থ হয়েছে');
    }
  };

  // প্রোডাক্ট ডিলিট করার ফাংশন
  const handleDelete = async (id) => {
    if (!window.confirm('আপনি কি নিশ্চিত এটি ডিলিট করতে চান?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  // ড্যাশবোর্ডের হিসাব-নিকাশ
  const totalValue = products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const lowStockCount = products.filter(item => item.quantity <= item.minStockLevel).length;

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', fontFamily: 'sans-serif', padding: '0 15px' }}>
      <h2>📦 Stock Inventory ERP Dashboard</h2>

      {/* সামারি কার্ড */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={{ padding: '15px', background: '#e3f2fd', borderRadius: '8px', flex: 1 }}>
          <h4>মোট প্রোডাক্ট</h4>
          <p style={{ fontSize: '22px', fontWeight: 'bold' }}>{products.length} টি</p>
        </div>
        <div style={{ padding: '15px', background: '#e8f5e9', borderRadius: '8px', flex: 1 }}>
          <h4>মোট স্টক মূল্য</h4>
          <p style={{ fontSize: '22px', fontWeight: 'bold' }}>৳ {totalValue.toLocaleString()}</p>
        </div>
        <div style={{ padding: '15px', background: '#ffebee', borderRadius: '8px', flex: 1 }}>
          <h4>লো-স্টক অ্যালার্ট</h4>
          <p style={{ fontSize: '22px', fontWeight: 'bold', color: 'red' }}>{lowStockCount} টি</p>
        </div>
      </div>

      {/* প্রোডাক্ট যোগ করার ফর্ম */}
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <input placeholder="প্রোডাক্টের নাম" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input placeholder="SKU কোড (যেমন: TS-01)" value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} required />
        <input placeholder="ক্যাটাগরি" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required />
        <input type="number" placeholder="শুরুর স্টক (Quantity)" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} required />
        <input type="number" placeholder="একক মূল্য (Price)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
        <input type="number" placeholder="Min Stock Level (ডিফল্ট 5)" value={form.minStockLevel} onChange={e => setForm({...form, minStockLevel: e.target.value})} />
        <button type="submit" style={{ gridColumn: 'span 3', padding: '10px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          + নতুন প্রোডাক্ট যোগ করুন
        </button>
      </form>

      {/* ইনভেন্টরি টেবিল */}
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th>SKU</th>
            <th>নাম</th>
            <th>ক্যাটাগরি</th>
            <th>মূল্য</th>
            <th>বর্তমান স্টক</th>
            <th>স্ট্যাটাস</th>
            <th>অ্যাকশন</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>কোনো প্রোডাক্ট পাওয়া যায়নি।</td>
            </tr>
          ) : (
            products.map((p) => {
              const isLow = p.quantity <= p.minStockLevel;
              return (
                <tr key={p._id} style={{ background: isLow ? '#fff5f5' : 'white' }}>
                  <td>{p.sku}</td>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.category}</td>
                  <td>৳ {p.price}</td>
                  <td style={{ fontWeight: 'bold' }}>{p.quantity}</td>
                  <td>
                    {isLow 
                      ? <span style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Low Stock</span> 
                      : <span style={{ color: 'green' }}>✅ In Stock</span>}
                  </td>
                  <td>
                    <button onClick={() => handleStockChange(p._id, 'IN')} style={{ marginRight: '5px', background: '#4caf50', color: 'white', border: 'none', padding: '5px 8px', cursor: 'pointer' }}>+ In</button>
                    <button onClick={() => handleStockChange(p._id, 'OUT')} style={{ marginRight: '5px', background: '#ff9800', color: 'white', border: 'none', padding: '5px 8px', cursor: 'pointer' }}>- Out</button>
                    <button onClick={() => handleDelete(p._id)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 8px', cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App; // (Vite এর ক্ষেত্রে export default App; হবে)