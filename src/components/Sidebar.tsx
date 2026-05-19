import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, Package, CreditCard, MessageSquare, 
  Settings, Power, LayoutDashboard, Shield, Zap, X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface SidebarProps {
  id?: string;
  isOpen: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  id,
  isOpen,
  onClose,
  isMobile = false,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'customers', label: 'Customers', icon: Users, path: '/admin/users' },
    { id: 'packages', label: 'Packages', icon: Package, path: '/admin/packages' },
    { id: 'billing', label: 'Billing', icon: CreditCard, path: '/admin/billing' },
    { id: 'payments', label: 'Payments', icon: CreditCard, path: '/admin/payments' },
    { id: 'tickets', label: 'Tickets', icon: MessageSquare, path: '/admin/tickets' },
  ];

  return (
    <aside 
      id={id || "sidebar-container"}
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-[#0F172A] text-white border-r border-slate-800 transition-all duration-300 lg:static lg:translate-x-0 overflow-hidden flex flex-col",
        isOpen ? "w-[280px]" : "w-0 lg:w-20 translate-x-[-100%]"
      )}
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden p-1 shadow-lg">
            <img 
              src="/src/assets/images/shoktinet_logo_1779223049145.png" 
              alt="Logo" 
              className="w-full h-full object-contain" 
              referrerPolicy="no-referrer" 
            />
          </div>
          {isOpen && (
            <div className="whitespace-nowrap transition-all duration-300">
              <h2 className="text-sm font-black text-white uppercase tracking-wider italic">SHOKTINET</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Broadband Core</p>
            </div>
          )}
        </div>
        {isMobile && onClose && (
          <button onClick={onClose} id="close-sidebar-mobile" className="p-1 hover:bg-slate-800 rounded-lg text-slate-400">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Main Navigation Section */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            id={`nav-item-${item.id}`}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group overflow-hidden relative",
              isActive 
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/10 font-bold" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} className={cn("shrink-0 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-400")} />
                {isOpen && <span className="text-sm whitespace-nowrap">{item.label}</span>}
                {isActive && isOpen && (
                  <motion.div layoutId="activeNavIndicator" className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Sidebar Footer Info + Logout button */}
      <div className="p-4 border-t border-slate-800 bg-[#0B0F19]">
        {isOpen && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center relative shrink-0">
              <Zap size={16} className="text-emerald-500" />
              <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-wide">Infrastructure</p>
              <p className="text-[9px] font-medium text-emerald-400">All POPs Active</p>
            </div>
          </div>
        )}
        <button 
          onClick={handleLogout}
          id="btn-sidebar-logout"
          className="w-full flex items-center justify-center gap-3 p-3 bg-red-950/20 border border-red-900/30 text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-900/30 hover:border-red-500/45 transition-all duration-300 group"
        >
          <Power size={16} className="group-hover:rotate-90 transition-transform duration-500" />
          {isOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
