import { useState } from 'react';
import { Package, Truck, Users, ShoppingCart, LayoutDashboard, Menu, X } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'purchases', label: 'Purchase Order', icon: ShoppingCart },
  ];

  return (
    <header className="bg-indigo-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Package className="w-6 h-6" /> Stock Inventory ERP
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === item.id ? 'bg-indigo-900 text-white' : 'hover:bg-indigo-600 text-indigo-100'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-indigo-600">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-indigo-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                  activeTab === item.id ? 'bg-indigo-900 text-white' : 'hover:bg-indigo-600 text-indigo-100'
                }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}