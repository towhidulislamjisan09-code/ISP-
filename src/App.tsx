/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Home, Package, CreditCard, MessageCircle, User, Bell, Menu } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Overview } from './components/Overview';
import { Billing } from './components/Billing';
import { Packages } from './components/Packages';
import { Support } from './components/Support';
import { AppState } from './types';
import { Login } from './components/Login';

import { AdminPanel } from './components/AdminPanel';

const navItems = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'packages', icon: Package, label: 'Plans' },
  { id: 'billing', icon: CreditCard, label: 'Bills' },
  { id: 'support', icon: MessageCircle, label: 'Support' },
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'packages' | 'billing' | 'support'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Initial Mock State
  const [state, setState] = useState<AppState>({
    user: {
      name: "Admin User",
      id: "admin",
      status: 'Active',
      currentPackage: 'Master Access',
      balance: 1200
    },
    usage: {
      total: 154,
      limit: null,
      history: [
        { date: 'Mon', value: 12 },
        { date: 'Tue', value: 18 },
        { date: 'Wed', value: 15 },
        { date: 'Thu', value: 24 },
        { date: 'Fri', value: 19 },
        { date: 'Sat', value: 32 },
        { date: 'Sun', value: 28 },
      ]
    }
  });

  const handleLogin = (username: string) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, id: username, name: username === 'admin' ? "System Admin" : "User" }
    }));
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setState(prev => ({
      ...prev,
      user: { ...prev.user, id: "guest", name: "Guest" }
    }));
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto min-h-screen bg-slate-50">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  // Admin View
  if (state.user.id === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="sticky top-0 z-[100] bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
              <span className="font-black text-xl italic tracking-tighter">TR</span>
            </div>
            <div>
              <h1 className="font-black text-slate-800 leading-none tracking-tight uppercase">Triangle</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Management Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-slate-800">System Administrator</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Master Access</p>
            </div>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all border border-slate-200"
              title="Logout"
            >
              <User size={20} />
            </button>
          </div>
        </header>
        <AdminPanel onLogout={handleLogout} />
      </div>
    );
  }

  // Customer View
  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 font-sans relative overflow-x-hidden">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <span className="font-black text-xl italic tracking-tighter">TR</span>
          </div>
          <div>
            <h1 className="font-black text-slate-800 leading-none tracking-tight">TRIANGLE</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Broadband Service</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 relative active:scale-90 transition-all">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 active:scale-90 transition-all"
          >
            <User size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-6 pt-6 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'home' && <Overview state={state} />}
            {activeTab === 'packages' && <Packages />}
            {activeTab === 'billing' && <Billing />}
            {activeTab === 'support' && <Support />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 z-50 max-w-[calc(theme(maxWidth.md)-3rem)] mx-auto">
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-2 flex items-center justify-between shadow-2xl shadow-slate-950/40">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "relative flex flex-col items-center justify-center py-2 px-4 rounded-2xl transition-all duration-300",
                  isActive ? "bg-white text-slate-950 shadow-inner" : "text-slate-400 hover:text-white"
                )}
              >
                <item.icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn(
                  "text-[10px] font-bold mt-1 tracking-wider uppercase transition-opacity duration-300",
                  isActive ? "opacity-100" : "opacity-0 absolute"
                )}>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>
      
      {/* Footer safe area bg */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none z-40" />
    </div>
  );
}

