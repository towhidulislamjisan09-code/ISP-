import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, Bell, Search, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Retrieve user payload from store
  const rawUser = localStorage.getItem('user');
  const user = rawUser ? JSON.parse(rawUser) : { name: 'System Admin', role: 'admin' };

  useEffect(() => {
    const handleResize = () => {
      const mobileStatus = window.innerWidth < 1024;
      setIsMobile(mobileStatus);
      if (mobileStatus) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div id="layout-root" className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Mobile Sidebar backdrop */}
      <AnimatePresence>
        {isMobile && isSidebarOpen && (
          <motion.div 
            id="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-45 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Component */}
      <Sidebar 
        id="layout-sidebar"
        isOpen={isSidebarOpen} 
        isMobile={isMobile} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main content viewport */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar Header */}
        <header id="layout-header" className="h-20 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 z-30 shadow-sm shadow-slate-100/30">
          <div className="flex items-center gap-4 flex-1">
            <button 
              id="btn-sidebar-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <Menu size={20} className="text-slate-600" />
            </button>
            <div className="hidden md:flex relative max-w-sm w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                id="header-global-search"
                type="text" 
                placeholder="Search customers, bills, IPs..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-2 text-xs focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-semibold text-slate-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-5 ml-4">
            {/* Status indicators */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100 text-[10px] font-black uppercase text-emerald-800 tracking-wide">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              API Connect Good
            </div>

            <button id="header-notifications" className="relative p-2.5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group border border-slate-100">
              <Bell size={18} className="text-slate-500 group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-500 rounded-full ring-2 ring-white" />
            </button>
            
            <div className="h-8 w-[1px] bg-slate-200" />

            {/* Profile widget */}
            <div 
              id="header-profile-widget"
              className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-800 leading-tight tracking-tight">{user.name}</p>
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-0.5 block">{user.role}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black overflow-hidden border-2 border-slate-100 shadow-sm select-none shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop" 
                  className="w-full h-full object-cover" 
                  alt="admin pic"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page view wrapper with scrolling container */}
        <div id="layout-page-content" className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F8FAFC] custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
export default Layout;
