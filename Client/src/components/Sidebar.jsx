import { Package, Truck, Users, ShoppingCart, LayoutDashboard, FileText, X, Boxes, LogOut, Shield } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, user, onLogout }) {

const isAdmin = (user?.userType || '').toLowerCase() === 'admin' || (user?.role || '').toLowerCase() === 'admin';

const allMenuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
  { id: 'products', label: 'Inventory Stock', icon: Package, show: isAdmin || user?.permissions?.products },
  { id: 'suppliers', label: 'Suppliers', icon: Truck, show: isAdmin || user?.permissions?.suppliers },
  { id: 'clients', label: 'Clients & Customers', icon: Users, show: isAdmin || user?.permissions?.clients },
  { id: 'purchases', label: 'Purchase Orders', icon: ShoppingCart, show: isAdmin || user?.permissions?.purchases },
  { id: 'invoices', label: 'Sales & Invoices', icon: FileText, show: isAdmin || user?.permissions?.invoices },
  // Admin অথবা যাকে 'users' পারমিশন দেওয়া হয়েছে সে দেখতে পাবে
  { id: 'users', label: 'User Management', icon: Shield, show: isAdmin || user?.permissions?.users },
];

  // যেগুলোর show === true শুধু সেগুলোই দেখাবে
  const menuItems = allMenuItems.filter(item => item.show);

  // ইউজারের নামের প্রথম অক্ষর বের করা
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US';

  return (
    <>
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)} 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-white font-bold text-lg tracking-wide">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <span>NEXUS <span className="text-indigo-400">ERP</span></span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Main Menu</p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                    : 'hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom User Profile & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 bg-slate-800/60 p-3 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 uppercase ${
                isAdmin ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {user?.userType || user?.role || 'Staff'}
              </span>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}