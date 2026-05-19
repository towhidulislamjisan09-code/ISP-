import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield, Users, Package, CreditCard, MessageSquare, 
  Bell, Settings, Power, LayoutDashboard, Menu, X, Zap,
  Search, ChevronRight, DollarSign
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'packages', label: 'Packages', icon: Package, path: '/admin/packages' },
    { id: 'billing', label: 'Billing', icon: DollarSign, path: '/admin/billing' },
    { id: 'payments', label: 'Payments', icon: CreditCard, path: '/admin/payments' },
    { id: 'tickets', label: 'Tickets', icon: MessageSquare, path: '/admin/tickets' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transition-all duration-300 lg:static lg:translate-x-0 overflow-hidden flex flex-col",
          isSidebarOpen ? "w-[280px]" : "w-0 lg:w-20 translate-x-[-100%]"
        )}
      >
        <div className="p-6 flex items-center justify-between">
           <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-600/20">
                <Shield className="text-white" size={20} />
              </div>
              {isSidebarOpen && (
                <div className="whitespace-nowrap">
                   <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight leading-none italic uppercase">TRIANGLE</h2>
                   <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest leading-none">Management</p>
                </div>
              )}
           </div>
           {isMobile && <button onClick={() => setIsSidebarOpen(false)}><X size={20} className="text-slate-400" /></button>}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
           {navItems.map((item) => (
             <NavLink
               key={item.id}
               to={item.path}
               end={item.path === '/admin'}
               className={({ isActive }) => cn(
                 "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group overflow-hidden relative",
                 isActive 
                   ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" 
                   : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
               )}
             >
               {({ isActive }) => (
                 <>
                   <item.icon size={20} className={cn("shrink-0", isActive ? "text-brand-400" : "group-hover:scale-110 transition-transform")} />
                   {isSidebarOpen && <span className="font-bold text-sm whitespace-nowrap">{item.label}</span>}
                   {isActive && isSidebarOpen && (
                     <motion.div layoutId="activeNav" className="absolute right-4 w-1.5 h-1.5 rounded-full bg-brand-400" />
                   )}
                 </>
               )}
             </NavLink>
           ))}
        </nav>

        <div className="p-4 mt-auto">
           <div className={cn(
             "bg-slate-50 rounded-3xl p-4 border border-slate-100 transition-all",
             isSidebarOpen ? "opacity-100" : "opacity-0 invisible lg:opacity-100 lg:visible p-2"
           )}>
              {isSidebarOpen && (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center p-2 relative">
                       <Zap size={20} className="text-emerald-500" />
                       <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">System Live</p>
                      <p className="text-[10px] font-bold text-slate-400 italic">May 20, 2026</p>
                    </div>
                  </div>
                </>
              )}
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 p-3 bg-white border border-slate-200 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 hover:border-rose-200 transition-all group"
              >
                <Power size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                {isSidebarOpen && "Secure Terminate"}
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-4 flex-1">
             <button 
               onClick={() => setIsSidebarOpen(!isSidebarOpen)}
               className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
             >
               <Menu size={20} className="text-slate-500" />
             </button>
             <div className="hidden md:flex relative max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Global Terminal Search..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium"
                />
             </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6 ml-4">
             <button className="relative p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group">
                <Bell size={20} className="text-slate-500 group-hover:rotate-12 transition-transform" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full ring-2 ring-white" />
             </button>
             
             <div className="h-10 w-[1px] bg-slate-200 hidden md:block" />

             <div className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="text-right hidden sm:block">
                   <p className="text-sm font-black text-slate-800 tracking-tight leading-none">System Admin</p>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">SuperUser</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black group-hover:scale-105 transition-transform overflow-hidden border-2 border-slate-100">
                   <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=120&auto=format&fit=crop" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
             </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#F8FAFC] custom-scrollbar">
           <Outlet />
        </div>
      </main>
    </div>
  );
};
