
import { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  Users,
  ShoppingCart,
  LayoutDashboard,
  FileText,
  Wallet,
  X,
  Boxes,
  LogOut,
  Shield,
  BookOpen,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  CalendarClock,
  FileSpreadsheet
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  user,
  onLogout
}) {
  const isAdmin =
    (user?.userType || '').toLowerCase() === 'admin' ||
    (user?.role || '').toLowerCase() === 'admin';

  const hasAccountsAccess = isAdmin || Boolean(user?.permissions?.accounts);
  const isAccountGroupActive =
      activeTab === 'accounts' ||
      activeTab === 'ledger' ||
      activeTab === 'pnl' ||
      activeTab === 'cashflow';

  const [accountsExpanded, setAccountsExpanded] = useState(isAccountGroupActive);

 useEffect(() => {
    if (isAccountGroupActive) {
      setAccountsExpanded(true);
    }
  }, [isAccountGroupActive]);

  const topMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    {
      id: 'products',
      label: 'Inventory Stock',
      icon: Package,
      show: isAdmin || Boolean(user?.permissions?.products)
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: Truck,
      show: isAdmin || Boolean(user?.permissions?.suppliers)
    },
    {
      id: 'clients',
      label: 'Clients & Customers',
      icon: Users,
      show: isAdmin || Boolean(user?.permissions?.clients)
    },
    {
      id: 'purchases',
      label: 'Purchase Orders',
      icon: ShoppingCart,
      show: isAdmin || Boolean(user?.permissions?.purchases)
    },
    {
      id: 'invoices',
      label: 'Sales & Invoices',
      icon: FileText,
      show: isAdmin || Boolean(user?.permissions?.invoices)
    }
  ].filter(item => item.show);

  const accountSubItems = [
    { id: 'accounts', label: 'Cash, Bank & Entries', icon: Wallet },
    { id: 'ledger', label: 'Party Ledger', icon: BookOpen },
    { id: 'pnl', label: 'Profit & Loss', icon: TrendingUp },
    { id: 'cashflow', label: 'Cash Flow & Day Book', icon: CalendarClock }
  ];

  const bottomMenuItems = [
    {
      id: 'reports',
      label: 'All Reports',
      icon: FileSpreadsheet,
      show: isAdmin || Boolean(user?.permissions?.reports)
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Shield,
      show: isAdmin || Boolean(user?.permissions?.users)
    }
  ].filter(item => item.show);

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'US';

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  const isAccountsParentActive = 
            activeTab === 'accounts' || 
            activeTab === 'ledger' ||
            activeTab === 'pnl' ||
            activeTab === 'cashflow';

  return (
    <>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5 text-white font-bold text-lg tracking-wide">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <span>
              NEXUS <span className="text-indigo-400">ERP</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Main Menu
          </p>

          {topMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
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

          {/* Accounts Parent + Sub-menu */}
          {hasAccountsAccess && (
            <div className="space-y-1 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  const nextExpanded = !accountsExpanded;
                  setAccountsExpanded(nextExpanded);
                  if (!isAccountsParentActive) {
                    handleSelectTab('accounts');
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isAccountsParentActive
                    ? 'bg-slate-800 text-white'
                    : 'hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Wallet
                    className={`w-5 h-5 ${
                      isAccountsParentActive ? 'text-indigo-400' : 'text-slate-400'
                    }`}
                  />
                  <span>Accounts</span>
                </span>
                {accountsExpanded ? (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {accountsExpanded && (
                <div className="pl-5 pr-1 space-y-1 border-l border-slate-800 ml-5">
                  {accountSubItems.map(sub => {
                    const SubIcon = sub.icon;
                    const isSubActive = activeTab === sub.id;
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSelectTab(sub.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          isSubActive
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <SubIcon className="w-4 h-4 shrink-0" />
                        <span>{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {bottomMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
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
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'User'}
              </p>
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 uppercase ${
                  isAdmin
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {user?.userType || user?.role || 'Staff'}
              </span>
            </div>
          </div>

          <button
            type="button"
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