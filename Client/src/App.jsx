import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Suppliers from './components/Suppliers';
import Clients from './components/Clients';
import Purchases from './components/Purchases';
import Invoices from './components/Invoices';
import UserManagement from './components/UserManagement';
import Auth from './components/Auth';
import { getProducts, getSuppliers, getClients, getPurchases, getInvoices } from './services/api';

export default function App() {
  // LocalStorage থেকে ইউজার স্টেট লোড করা
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nexusUser');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [clients, setClients] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const loadData = async () => {
    if (!user) return;
    try {
      // প্রতিটি API কলের সাথে .catch যুক্ত করা হয়েছে যাতে কোনো একটিতে 403 ফেইল করলে অন্যগুলো আটকে না যায়
      const [prodRes, suppRes, clientRes, purRes, invRes] = await Promise.all([
        getProducts().catch(() => ({ data: [] })),
        getSuppliers().catch(() => ({ data: [] })),
        getClients().catch(() => ({ data: [] })),
        getPurchases().catch(() => ({ data: [] })),
        getInvoices().catch(() => ({ data: [] }))
      ]);
      setProducts(prodRes.data);
      setSuppliers(suppRes.data);
      setClients(clientRes.data);
      setPurchases(purRes.data);
      setInvoices(Array.isArray(invRes.data) ? invRes.data : []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('nexusUser');
    setUser(null);
  };

  // ইউজার লগইন না থাকলে Login/Register পেজ দেখাবে
  if (!user) {
    return <Auth onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* Left Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />

      {/* Right Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 h-16 px-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-800">NEXUS ERP</span>
          <div className="w-8" />
        </header>

        {/* Main Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && <Dashboard products={products} suppliers={suppliers} clients={clients} />}
          {activeTab === 'products' && <Products products={products} reloadData={loadData} user={user} />}
          {activeTab === 'suppliers' && <Suppliers suppliers={suppliers} reloadData={loadData} />}
          {activeTab === 'clients' && <Clients clients={clients} reloadData={loadData} />}
          {activeTab === 'purchases' && <Purchases suppliers={suppliers} products={products} purchases={purchases} reloadData={loadData} />}
          {activeTab === 'invoices' && <Invoices clients={clients} products={products} invoices={invoices} reloadData={loadData} />}
          {activeTab === 'users' && <UserManagement currentUser={user} />}
        </main>
      </div>
    </div>
  );
}