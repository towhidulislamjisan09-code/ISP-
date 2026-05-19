import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, DollarSign, CreditCard, 
  MessageSquare, Activity, Zap, ArrowUpRight, 
  TrendingUp, Wallet, Clock, RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { Stats } from '../types';
import api from '../api/client';
import { cn, formatCurrency } from '../lib/utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+4.2%' },
    { label: 'Active Users', value: stats?.activeUsers || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '92.1%' },
    { label: 'Total Revenue', value: `৳ ${stats?.totalRevenue?.toLocaleString() || 0}`, icon: DollarSign, color: 'text-brand-600', bg: 'bg-brand-50', trend: '+12.5%' },
    { label: 'Unpaid Dues', value: `৳ ${stats?.totalDue?.toLocaleString() || 0}`, icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50', trend: 'Across 12' },
    { label: 'Open Tickets', value: stats?.openTickets || 0, icon: MessageSquare, color: 'text-rose-600', bg: 'bg-rose-50', trend: '4 Urgent' },
    { label: 'Suspended', value: stats?.suspendedUsers || 0, icon: Activity, color: 'text-slate-600', bg: 'bg-slate-50', trend: '-2% MoM' },
  ];

  const chartData = [
    { name: 'Jan', rev: 4000, users: 240 },
    { name: 'Feb', rev: 3000, users: 298 },
    { name: 'Mar', rev: 2000, users: 380 },
    { name: 'Apr', rev: 2780, users: 390 },
    { name: 'May', rev: 1890, users: 480 },
    { name: 'Jun', rev: 2390, users: 520 },
    { name: 'Jul', rev: 3490, users: 610 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
             Command Center
             <span className="hidden md:block w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
           </h1>
           <p className="text-slate-500 font-medium italic mt-1">Real-time system health and financial overview</p>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} />
          Sync Data
        </button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between h-[180px] group hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/5 transition-all cursor-default"
          >
            <div className="flex justify-between items-start">
               <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6", stat.bg)}>
                  <stat.icon className={stat.color} size={24} />
               </div>
               <div className={cn("text-[9px] font-black uppercase px-2 py-1 rounded-lg tracking-tighter", 
                 stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
               )}>
                 {stat.trend}
               </div>
            </div>
            <div>
               <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 italic opacity-60">{stat.label}</p>
               <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{loading ? '...' : stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm overflow-hidden relative">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight flex items-center gap-3">
                  <TrendingUp className="text-brand-600" size={20} />
                  Revenue Velocity
                </h3>
                <p className="text-[10px] font-bold text-slate-400 italic">Projected income vs actual collections</p>
              </div>
              <div className="flex gap-2">
                 <button className="px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black uppercase rounded-lg tracking-widest">Monthly</button>
                 <button className="px-3 py-1.5 bg-slate-50 text-slate-400 text-[9px] font-black uppercase rounded-lg tracking-widest hover:text-slate-800 transition-colors">Quarterly</button>
              </div>
           </div>
           
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={chartData}>
                 <defs>
                   <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                     <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff' }}
                   itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                 />
                 <Area type="monotone" dataKey="rev" stroke="#4F46E5" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Real-time Logs / Activity */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 blur-[100px] -mr-32 -mt-32" />
           
           <h3 className="font-black text-white text-lg uppercase tracking-tight mb-8 flex items-center gap-3 relative z-10">
             <Zap className="text-brand-400" size={20} />
             System Heat
           </h3>
           
           <div className="space-y-6 relative z-10">
              {[
                { label: 'BK-9921 Payment Received', time: '2 mins ago', status: 'verified', user: 'Abir Hussain' },
                { label: 'POP Sector 4 High Traffic', time: '15 mins ago', status: 'alert', user: 'Node #AF3' },
                { label: 'Ticket #1029 Created', time: '1h ago', status: 'new', user: 'Naimul S.' },
                { label: 'User #882 Suspended', time: '2h ago', status: 'auto', user: 'System Bot' },
              ].map((log, idx) => (
                <div key={idx} className="flex gap-4 group/item">
                   <div className="w-1 bg-slate-700 rounded-full group-hover/item:bg-brand-500 transition-colors" />
                   <div>
                     <p className="text-xs font-black text-slate-300 tracking-tight">{log.label}</p>
                     <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold flex items-center gap-2">
                        {log.time} • <span className="text-brand-400 italic italic">{log.user}</span>
                     </p>
                   </div>
                </div>
              ))}
           </div>

           <button className="mt-12 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all">
              Launch Diagnostic Console
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Active Tickets */}
         <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight mb-6 flex items-center gap-3">
               <MessageSquare className="text-rose-600" size={20} />
               High Priority Tickets
            </h3>
            <div className="space-y-3">
               {[1, 2].map(i => (
                 <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-200">#</div>
                       <div>
                         <p className="text-sm font-bold text-slate-800 leading-tight">Slow Browsing Issue</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight italic">User: Zakir Ahmed • 4h ago</p>
                       </div>
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-1 bg-rose-100 text-rose-600 rounded-lg">High</span>
                 </div>
               ))}
            </div>
            <button className="mt-6 text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline">Teleport to Helpdesk</button>
         </div>

         {/* Maintenance / Alerts */}
         <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight mb-6 flex items-center gap-3">
               <Activity className="text-amber-600" size={20} />
               POP Infrastructure
            </h3>
            <div className="grid grid-cols-2 gap-4">
               {['Sector 4', 'Sector 9', 'Uttara', 'Airport'].map(pop => (
                 <div key={pop} className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div>
                       <p className="text-xs font-black text-slate-800 tracking-tight">{pop}</p>
                       <p className="text-[10px] text-emerald-600 font-bold uppercase">Online</p>
                    </div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};
