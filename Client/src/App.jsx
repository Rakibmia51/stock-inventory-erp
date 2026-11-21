// import { useState, useEffect } from 'react';
// import { Menu } from 'lucide-react';
// import Sidebar from './components/Sidebar';
// import Dashboard from './components/Dashboard';
// import Products from './components/Products';
// import Suppliers from './components/Suppliers';
// import Clients from './components/Clients';
// import Purchases from './components/Purchases';
// import Invoices from './components/Invoices';
// import UserManagement from './components/UserManagement';
// import Auth from './components/Auth';
// import Accounts from './components/Accounts';
// import { getProducts, getSuppliers, getClients, getPurchases, getInvoices, getAccountTransactions } from './services/api';

// export default function App() {
//   // LocalStorage থেকে ইউজার স্টেট লোড করা
//   const [user, setUser] = useState(() => {
//     const saved = localStorage.getItem('nexusUser');
//     return saved ? JSON.parse(saved) : null;
//   });

//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   const [products, setProducts] = useState([]);
//   const [suppliers, setSuppliers] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [purchases, setPurchases] = useState([]);
//   const [invoices, setInvoices] = useState([]);
//   const [accountTransactions, setAccountTransactions] = useState([]);


//   const loadData = async () => {
//     if (!user) return;
//     try {
//       // প্রতিটি API কলের সাথে .catch যুক্ত করা হয়েছে যাতে কোনো একটিতে 403 ফেইল করলে অন্যগুলো আটকে না যায়
//       const [prodRes, suppRes, clientRes, purRes, invRes, accTransRes] = await Promise.all([
//         getProducts().catch(() => ({ data: [] })),
//         getSuppliers().catch(() => ({ data: [] })),
//         getClients().catch(() => ({ data: [] })),
//         getPurchases().catch(() => ({ data: [] })),
//         getInvoices().catch(() => ({ data: [] })),
//         getAccountTransactions().catch(() => ({ data: [] }))
//       ]);
//       setProducts(prodRes.data);
//       setSuppliers(suppRes.data);
//       setClients(clientRes.data);
//       setPurchases(purRes.data);
//       setInvoices(Array.isArray(invRes.data) ? invRes.data : []);
//       setAccountTransactions(accTransRes.data);
//     } catch (err) {
//       console.error('Error fetching data:', err);
//     }
//   };

//   useEffect(() => {
//     if (user) {
//       loadData();
//     }
//   }, [user]);

//   const handleLogout = () => {
//     localStorage.removeItem('nexusUser');
//     setUser(null);
//   };

//   // ইউজার লগইন না থাকলে Login/Register পেজ দেখাবে
//   if (!user) {
//     return <Auth onLoginSuccess={(userData) => setUser(userData)} />;
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
//       {/* Left Sidebar */}
//       <Sidebar 
//         activeTab={activeTab} 
//         setActiveTab={setActiveTab} 
//         isOpen={sidebarOpen} 
//         setIsOpen={setSidebarOpen}
//         user={user}
//         onLogout={handleLogout}
//       />

//       {/* Right Content Wrapper */}
//       <div className="flex-1 flex flex-col min-w-0">
//         {/* Top Mobile Header */}
//         <header className="lg:hidden bg-white border-b border-slate-200 h-16 px-4 flex items-center justify-between sticky top-0 z-30">
//           <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
//             <Menu className="w-6 h-6" />
//           </button>
//           <span className="font-bold text-slate-800">NEXUS ERP</span>
//           <div className="w-8" />
//         </header>

//         {/* Main Workspace */}
//         <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
//           {activeTab === 'dashboard' && 
//             <Dashboard 
//               products={products} 
//               suppliers={suppliers} 
//               clients={clients} 
//               invoices={invoices}
//               purchases={purchases}
//               user={user} 
//             />}
//           {activeTab === 'products' && 
//             <Products 
//               products={products} 
//               reloadData={loadData} 
//               user={user} 
//             />}
//           {activeTab === 'suppliers' && 
//             <Suppliers 
//               suppliers={suppliers} 
//               reloadData={loadData} 
//               user={user} 
//             />}
//           {activeTab === 'clients' && 
//             <Clients 
//               clients={clients} 
//               reloadData={loadData} 
//               user={user} 
//             />}
//           {activeTab === 'purchases' && 
//             <Purchases 
//               suppliers={suppliers} 
//               products={products} 
//               purchases={purchases} 
//               reloadData={loadData} 
//               user={user} 
//             />}
//           {activeTab === 'invoices' && 
//             <Invoices 
//               clients={clients} 
//               products={products} 
//               invoices={invoices} 
//               reloadData={loadData} 
//               user={user} 
//             />}
//           {activeTab === 'users' && 
//             <UserManagement 
//               currentUser={user} 
//               reloadData={loadData} 
//               user={user} 
//             />}
//           {activeTab === 'accounts' && 
//             <Accounts 
//               clients={clients}
//               suppliers={suppliers}
//               products={products}
//               purchases={purchases}
//               invoices={invoices}
//               accountTransactions={accountTransactions}
//               reloadData={loadData}
//               user={user}
//             />}
//         </main>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect, useCallback } from 'react';
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
import Accounts from './components/Accounts';

import {
  getProducts,
  getSuppliers,
  getClients,
  getPurchases,
  getInvoices,
  getAccountTransactions
} from './services/api';
import PartyLedger from './components/PartyLedger';
import ProfitLoss from './components/ProfitLoss';
import CashFlowDayBook from './components/CashFlowDayBook';

const normalizeArray = (res, key) => {
  const payload = res?.data;
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function App() {
  // LocalStorage থেকে ইউজার স্টেট লোড করা
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nexusUser') || localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [clients, setClients] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [accountTransactions, setAccountTransactions] = useState([]);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      // প্রতিটি API কলের সাথে .catch যুক্ত করা হয়েছে যাতে কোনো একটিতে 403 ফেইল করলে অন্যগুলো আটকে না যায়
      const [prodRes, suppRes, clientRes, purRes, invRes, accTransRes] = await Promise.all([
        getProducts().catch(() => ({ data: [] })),
        getSuppliers().catch(() => ({ data: [] })),
        getClients().catch(() => ({ data: [] })),
        getPurchases().catch(() => ({ data: [] })),
        getInvoices().catch(() => ({ data: [] })),
        getAccountTransactions().catch(() => ({ data: [] }))
      ]);

      setProducts(normalizeArray(prodRes, 'products'));
      setSuppliers(normalizeArray(suppRes, 'suppliers'));
      setClients(normalizeArray(clientRes, 'clients'));
      setPurchases(normalizeArray(purRes, 'purchases'));
      setInvoices(normalizeArray(invRes, 'invoices'));
      setAccountTransactions(normalizeArray(accTransRes, 'transactions'));
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleLogout = () => {
    localStorage.removeItem('nexusUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  // ইউজার লগইন না থাকলে Login/Register পেজ দেখাবে
  if (!user) {
    return (
      <Auth
        onLoginSuccess={(userData) => {
          localStorage.setItem('nexusUser', JSON.stringify(userData));
          setUser(userData);
        }}
      />
    );
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
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-800">NEXUS ERP</span>
          <div className="w-8" />
        </header>

        {/* Main Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard
              products={products}
              suppliers={suppliers}
              clients={clients}
              invoices={invoices}
              purchases={purchases}
              transactions={accountTransactions}
              accountTransactions={accountTransactions}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'products' && (
            <Products
              products={products}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'suppliers' && (
            <Suppliers
              suppliers={suppliers}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'clients' && (
            <Clients
              clients={clients}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'purchases' && (
            <Purchases
              suppliers={suppliers}
              products={products}
              purchases={purchases}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'invoices' && (
            <Invoices
              clients={clients}
              products={products}
              invoices={invoices}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'users' && (
            <UserManagement
              currentUser={user}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'accounts' && (
            <Accounts
              transactions={accountTransactions}
              accountTransactions={accountTransactions}
              clients={clients}
              suppliers={suppliers}
              products={products}
              purchases={purchases}
              invoices={invoices}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'ledger' && (
            <PartyLedger
              //ledger={ledger}
              clients={clients}
              suppliers={suppliers}
              invoices={invoices}
              purchases={purchases}
              transactions={accountTransactions}
              accountTransactions={accountTransactions}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'pnl' && (
            <ProfitLoss
              products={products}
              
              clients={clients}
              suppliers={suppliers}

              invoices={invoices}
              purchases={purchases}

              transactions={accountTransactions}
              accountTransactions={accountTransactions}

              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'cashflow' && (
            <CashFlowDayBook
              products={products}

              clients={clients}
              suppliers={suppliers}

              invoices={invoices}
              purchases={purchases}

              transactions={accountTransactions}
              accountTransactions={accountTransactions}
              
              reloadData={loadData}
              user={user}
            />
          )}
        </main>
      </div>
    </div>
  );
}