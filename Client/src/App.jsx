


// import { useState, useEffect, useCallback } from 'react';
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
// import PartyLedger from './components/PartyLedger';
// import ProfitLoss from './components/ProfitLoss';
// import CashFlowDayBook from './components/CashFlowDayBook';
// import AllReports from './components/AllReports';
// import Settings, {
//   DEFAULT_ERP_SETTINGS,
//   fetchErpSettings
// } from './components/Settings';
// import {
//   getProducts,
//   getSuppliers,
//   getClients,
//   getPurchases,
//   getInvoices,
//   getAccountTransactions
// } from './services/api';
// import ChangePasswordModal from './components/ChangePasswordModal';

// const normalizeArray = (res, key) => {
//   const payload = res?.data;
//   if (Array.isArray(payload)) return payload;
//   if (key && Array.isArray(payload?.[key])) return payload[key];
//   if (Array.isArray(payload?.data)) return payload.data;
//   return [];
// };

// export default function App() {
//   const [user, setUser] = useState(() => {
//     try {
//       const saved = localStorage.getItem('nexusUser') || localStorage.getItem('user');
//       return saved ? JSON.parse(saved) : null;
//     } catch {
//       return null;
//     }
//   });

//   const [activeTab, setActiveTab] = useState('dashboard');
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [erpSettings, setErpSettings] = useState(() => ({ ...DEFAULT_ERP_SETTINGS }));

//   const [products, setProducts] = useState([]);
//   const [suppliers, setSuppliers] = useState([]);
//   const [clients, setClients] = useState([]);
//   const [purchases, setPurchases] = useState([]);
//   const [invoices, setInvoices] = useState([]);
//   const [accountTransactions, setAccountTransactions] = useState([]);

//   const syncSettings = useCallback(async () => {
//     const latest = await fetchErpSettings();
//     if (latest) {
//       setErpSettings({ ...DEFAULT_ERP_SETTINGS, ...latest });
//     }
//   }, []);

//   const loadData = useCallback(async () => {
//     if (!user) return;
//     try {
//       const [
//         prodRes,
//         suppRes,
//         clientRes,
//         purRes,
//         invRes,
//         accTransRes
//       ] = await Promise.all([
//         getProducts().catch(() => ({ data: [] })),
//         getSuppliers().catch(() => ({ data: [] })),
//         getClients().catch(() => ({ data: [] })),
//         getPurchases().catch(() => ({ data: [] })),
//         getInvoices().catch(() => ({ data: [] })),
//         getAccountTransactions().catch(() => ({ data: [] }))
//       ]);

//       setProducts(normalizeArray(prodRes, 'products'));
//       setSuppliers(normalizeArray(suppRes, 'suppliers'));
//       setClients(normalizeArray(clientRes, 'clients'));
//       setPurchases(normalizeArray(purRes, 'purchases'));
//       setInvoices(normalizeArray(invRes, 'invoices'));
//       setAccountTransactions(normalizeArray(accTransRes, 'transactions'));

//       await syncSettings();
//     } catch (err) {
//       console.error('Error fetching data:', err);
//     }
//   }, [user, syncSettings]);

//   useEffect(() => {
//     if (user) {
//       loadData();
//     }
//   }, [user, loadData]);

//   const handleLogout = () => {
//     localStorage.removeItem('nexusUser');
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     setUser(null);
//   };

//   if (!user) {
//     return (
//       <Auth
//         onLoginSuccess={(userData) => {
//           localStorage.setItem('nexusUser', JSON.stringify(userData));
//           setUser(userData);
//         }}
//       />
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
//       <Sidebar
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//         isOpen={sidebarOpen}
//         setIsOpen={setSidebarOpen}
//         user={user}
//         onLogout={handleLogout}
//         settings={erpSettings}
//       />

//       <div className="flex-1 flex flex-col min-w-0">
//         <header className="lg:hidden bg-white border-b border-slate-200 h-16 px-4 flex items-center justify-between sticky top-0 z-30">
//           <button
//             type="button"
//             onClick={() => setSidebarOpen(true)}
//             className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
//             aria-label="Open Menu"
//           >
//             <Menu className="w-6 h-6" />
//           </button>
//           <span className="font-bold text-slate-800">
//             {erpSettings.companyName || 'NEXUS ERP'}
//           </span>
//           <div className="w-8" />
//         </header>

//         <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
//           {activeTab === 'dashboard' && (
//             <Dashboard
//               products={products}
//               suppliers={suppliers}
//               clients={clients}
//               invoices={invoices}
//               purchases={purchases}
//               transactions={accountTransactions}
//               accountTransactions={accountTransactions}
//               settings={erpSettings}
//               reloadData={loadData}
//               user={user}
//             />
//           )}

//           {activeTab === 'products' && (
//             <Products
//               products={products}
//               suppliers={suppliers}
//               clients={clients}
//               settings={erpSettings}
//               reloadData={loadData}
//               user={user}
//             />
//           )}

//           {activeTab === 'suppliers' && (
//             <Suppliers
//               suppliers={suppliers}
//               settings={erpSettings}
//               reloadData={loadData}
//               user={user}
//             />
//           )}

//           {activeTab === 'clients' && (
//             <Clients
//               clients={clients}
//               settings={erpSettings}
//               reloadData={loadData}
//               user={user}
//             />
//           )}

//           {activeTab === 'purchases' && (
//             <Purchases
//               suppliers={suppliers}
//               products={products}
//               purchases={purchases}
//               settings={erpSettings}
//               reloadData={loadData}
//               user={user}
//             />
//           )}

//           {activeTab === 'invoices' && (
//             <Invoices
//               clients={clients}
//               products={products}
//               invoices={invoices}
//               settings={erpSettings}
//               reloadData={loadData}
//               user={user}
//             />
//           )}

//           {activeTab === 'users' && (
//             <UserManagement
//               currentUser={user}
//               reloadData={loadData}
//               user={user}
//             />
//           )}

//           {activeTab === 'accounts' && (
//             <Accounts
//               transactions={accountTransactions}
//               accountTransactions={accountTransactions}
//               clients={clients}
//               suppliers={suppliers}
//               products={products}
//               purchases={purchases}
//               invoices={invoices}
//               settings={erpSettings}
//               reloadData={loadData}
//               user={user}
//             />
//           )}

//           {activeTab === 'ledger' && (
//             <PartyLedger
//               clients={clients}
//               suppliers={suppliers}
//               invoices={invoices}
//               purchases={purchases}
//               transactions={accountTransactions}
//               accountTransactions={accountTransactions}
//               settings={erpSettings}
//               reloadData={loadData}
//               user={user}
//             />
//           )}

//           {activeTab === 'pnl' && (
//             <ProfitLoss
//               invoices={invoices}
//               products={products}
//               transactions={accountTransactions}
//               accountTransactions={accountTransactions}
//               settings={erpSettings}
//               reloadData={loadData}
//               user={user}
//             />
//           )}

//           {activeTab === 'cashflow' && (
//             <CashFlowDayBook
//               invoices={invoices}
//               purchases={purchases}
//               transactions={accountTransactions}
//               accountTransactions={accountTransactions}
//               settings={erpSettings}
//               reloadData={loadData}
//               user={user}
//             />
//           )}

//           {activeTab === 'reports' && (
//             <AllReports
//               products={products}
//               suppliers={suppliers}
//               clients={clients}
//               invoices={invoices}
//               purchases={purchases}
//               transactions={accountTransactions}
//               accountTransactions={accountTransactions}
//               settings={erpSettings}
//               reloadData={loadData}
//               user={user}
//             />
//           )}

//           {activeTab === 'settings' && (
//             <Settings
//               products={products}
//               suppliers={suppliers}
//               clients={clients}
//               purchases={purchases}
//               invoices={invoices}
//               transactions={accountTransactions}
//               accountTransactions={accountTransactions}
//               settings={erpSettings}
//               onSettingsChange={setErpSettings}
//               reloadData={loadData}
//               user={user}
//             />
//           )}

//           {activeTab === 'profile' && (
//             <ChangePasswordModal 
//               currentUser={currentUser}
//               reloadData={loadData}
//               user={user}
//             />
//             )}
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
import PartyLedger from './components/PartyLedger';
import ProfitLoss from './components/ProfitLoss';
import CashFlowDayBook from './components/CashFlowDayBook';
import AllReports from './components/AllReports';
import Settings, {
  DEFAULT_ERP_SETTINGS,
  fetchErpSettings
} from './components/Settings';
import {
  getProducts,
  getSuppliers,
  getClients,
  getPurchases,
  getInvoices,
  getAccountTransactions
} from './services/api';
import ChangePasswordModal from './components/ChangePasswordModal';

const normalizeArray = (res, key) => {
  const payload = res?.data;
  if (Array.isArray(payload)) return payload;
  if (key && Array.isArray(payload?.[key])) return payload[key];
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function App() {
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
  const [erpSettings, setErpSettings] = useState(() => ({ ...DEFAULT_ERP_SETTINGS }));

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [clients, setClients] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [accountTransactions, setAccountTransactions] = useState([]);

  const syncSettings = useCallback(async () => {
    const latest = await fetchErpSettings();
    if (latest) {
      setErpSettings({ ...DEFAULT_ERP_SETTINGS, ...latest });
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [
        prodRes,
        suppRes,
        clientRes,
        purRes,
        invRes,
        accTransRes
      ] = await Promise.all([
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

      await syncSettings();
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [user, syncSettings]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('nexusUser', JSON.stringify(userData));
    if (userData?.token) {
      localStorage.setItem('token', userData.token);
    }
    setUser(userData);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('nexusUser');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        user={user}
        onLogout={handleLogout}
        settings={erpSettings}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden bg-white border-b border-slate-200 h-16 px-4 flex items-center justify-between sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Open Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-800 truncate">
            {erpSettings.companyName || 'NEXUS ERP'}
          </span>
          <div className="w-8" />
        </header>

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
              settings={erpSettings}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'products' && (
            <Products
              products={products}
              suppliers={suppliers}
              clients={clients}
              settings={erpSettings}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'suppliers' && (
            <Suppliers
              suppliers={suppliers}
              settings={erpSettings}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'clients' && (
            <Clients
              clients={clients}
              settings={erpSettings}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'purchases' && (
            <Purchases
              suppliers={suppliers}
              products={products}
              purchases={purchases}
              settings={erpSettings}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'invoices' && (
            <Invoices
              clients={clients}
              products={products}
              invoices={invoices}
              settings={erpSettings}
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
              settings={erpSettings}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'ledger' && (
            <PartyLedger
              clients={clients}
              suppliers={suppliers}
              invoices={invoices}
              purchases={purchases}
              transactions={accountTransactions}
              accountTransactions={accountTransactions}
              settings={erpSettings}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'pnl' && (
            <ProfitLoss
              invoices={invoices}
              products={products}
              transactions={accountTransactions}
              accountTransactions={accountTransactions}
              settings={erpSettings}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'cashflow' && (
            <CashFlowDayBook
              invoices={invoices}
              purchases={purchases}
              transactions={accountTransactions}
              accountTransactions={accountTransactions}
              settings={erpSettings}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'reports' && (
            <AllReports
              products={products}
              suppliers={suppliers}
              clients={clients}
              invoices={invoices}
              purchases={purchases}
              transactions={accountTransactions}
              accountTransactions={accountTransactions}
              settings={erpSettings}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              products={products}
              suppliers={suppliers}
              clients={clients}
              purchases={purchases}
              invoices={invoices}
              transactions={accountTransactions}
              accountTransactions={accountTransactions}
              settings={erpSettings}
              onSettingsChange={setErpSettings}
              reloadData={loadData}
              user={user}
            />
          )}

          {activeTab === 'profile' && (
            <ChangePasswordModal
              isOpen={true}
              onClose={() => setActiveTab('dashboard')}
              currentUser={user}
              reloadData={loadData}
              user={user}
            />
          )}
        </main>
      </div>
    </div>
  );
}