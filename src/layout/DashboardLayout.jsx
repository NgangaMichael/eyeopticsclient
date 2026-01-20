import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Receipt, ShoppingCart, 
  UsersRound, BarChart3, Package, Users,
  LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Overview', path: 'overview', icon: <LayoutDashboard size={20} />, color: 'text-blue-400' },
    { name: 'Expenses', path: 'expenses', icon: <Receipt size={20} />, color: 'text-red-400' },
    { name: 'Orders', path: 'orders', icon: <ShoppingCart size={20} />, color: 'text-amber-400' },
    { name: 'Patients', path: 'patients', icon: <UsersRound size={20} />, color: 'text-emerald-400' },
    { name: 'Sales', path: 'sales', icon: <BarChart3 size={20} />, color: 'text-purple-400' },
    { name: 'Stocks', path: 'stocks', icon: <Package size={20} />, color: 'text-orange-400' },
    { name: 'Users', path: 'users', icon: <Users size={20} />, color: 'text-pink-400' },
  ];

  const handleLogout = () => {
    // Add any cleanup like clearing localStorage here
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-slate-50 transition-all duration-300">
      {/* Sidebar */}
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-900 text-slate-300 flex flex-col shadow-xl transition-all duration-300 relative`}>
        
        {/* Collapse Toggle Button */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-10 bg-indigo-600 text-white rounded-full p-1 border-2 border-slate-50 hover:bg-indigo-700 z-50"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <div className="p-6 border-b border-slate-800 mb-4">
          <h1 className="text-xl font-bold text-white flex items-center gap-3 overflow-hidden">
            <span className="min-w-[32px] w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white italic shrink-0">E</span>
            {!isCollapsed && <span className="whitespace-nowrap">EyeOptics</span>}
          </h1>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={`/dashboard/${item.path}`}
              className={({ isActive }) =>
                `flex items-center gap-4 px-3 py-3 text-sm font-medium rounded-xl transition-all ${
                  isActive 
                  ? 'bg-slate-800 text-white shadow-inner border-l-4 border-indigo-500' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`
              }
            >
              <span className={`${item.color}`}>{item.icon}</span>
              {!isCollapsed && <span className="transition-opacity duration-300">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout Button Section */}
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 w-full px-3 py-3 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
          >
            <LogOut size={20} className="text-red-400" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center px-8 justify-between">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            {location.pathname.split('/').pop()?.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-3">
             <span className="text-sm font-medium text-slate-600">Admin User</span>
             <div className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                M
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-slate-50">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 min-h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;