import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Activity, ArrowUpRight, ArrowDownRight, Wifi, Package, Calendar, Loader2 } from 'lucide-react';
import { AppState } from '@/src/types';
import { formatCurrency, cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface OverviewProps {
  state: AppState;
}

export const Overview: React.FC<OverviewProps> = ({ state }) => {
  return (
    <div className="space-y-6 pb-24">
      {/* Status Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-brand-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-brand-300 text-sm font-medium mb-1">Welcome back,</p>
              <h2 className="text-2xl font-bold">{state.user.name}</h2>
            </div>
            <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              {state.user.status}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
              <p className="text-brand-300 text-xs mb-1">Current Balance</p>
              <h3 className="text-xl font-bold">{formatCurrency(state.user.balance)}</h3>
            </div>
            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm border border-white/5">
              <p className="text-brand-300 text-xs mb-1">Active Package</p>
              <h3 className="text-xl font-bold">{state.user.currentPackage}</h3>
            </div>
          </div>
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-brand-700/30 rounded-full blur-3xl" />
      </motion.div>

      {/* Usage Analytics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Internet Usage</h3>
              <p className="text-xs text-slate-500">Last 7 days (GB)</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-800">{state.usage.total} GB</p>
            <p className="text-xs text-emerald-600 font-medium">+12% from last week</p>
          </div>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={state.usage.history}>
              <defs>
                <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0e8ce4" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#0e8ce4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#94a3b8', fontSize: 10}}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#0e8ce4" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorUsage)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Speed Test', icon: Wifi, color: 'bg-indigo-50 text-indigo-600' },
          { label: 'Package Upgrade', icon: Package, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Payment History', icon: Calendar, color: 'bg-amber-50 text-amber-600' },
          { label: 'Support Bot', icon: Loader2, color: 'bg-rose-50 text-rose-600' },
        ].map((item, idx) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + idx * 0.05 }}
            className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col items-center gap-3 active:bg-slate-50 transition-colors group shadow-sm"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90", item.color)}>
              <item.icon size={24} />
            </div>
            <span className="text-sm font-medium text-slate-700">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
