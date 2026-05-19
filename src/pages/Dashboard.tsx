import React, { useState, useEffect } from 'react';
import { 
  Users, CheckCircle2, AlertTriangle, IndianRupee, Banknote, 
  MessageSquare, RefreshCw, Radio, Zap, HeartPulse, HardDrive,
  TrendingUp, CircleAlert
} from 'lucide-react';
import { motion } from 'motion/react';
import { Stats } from '../types';
import api from '../api/client';
import { StatCard } from '../components/StatCard';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, CartesianGrid 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setErrorStatus(null);
    try {
      const response = await api.get('/dashboard/stats');
      console.log('[Dashboard] API response payload:', response.data);
      // Fallback check to support both nested data structure styles
      const metrics = response.data.data || response.data;
      setStats(metrics);
    } catch (error: any) {
      console.error('[Dashboard] Error fetching analytics data:', error);
      setErrorStatus('Failed to fetch real-time stats metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Format currency securely
  const formatCurrency = (val: number | undefined) => {
    const rawVal = val || 0;
    return `৳ ${rawVal.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const statCardsData = [
    {
      title: 'Total Customers',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      trend: 'Registered',
      trendType: 'neutral' as const
    },
    {
      title: 'Active Customers',
      value: stats?.activeUsers ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: 'Online',
      trendType: 'up' as const
    },
    {
      title: 'Suspended Customers',
      value: stats?.suspendedUsers ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      trend: 'Action needed',
      trendType: 'down' as const
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats?.totalRevenue),
      icon: IndianRupee,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      trend: 'Collection cycle',
      trendType: 'up' as const
    },
    {
      title: 'Unpaid Bills',
      value: formatCurrency(stats?.totalDue),
      icon: Banknote,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      trend: 'Outstanding',
      trendType: 'neutral' as const
    },
    {
      title: 'Open Tickets',
      value: stats?.openTickets ?? 0,
      icon: MessageSquare,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: 'Support Helpdesk',
      trendType: 'down' as const
    }
  ];

  // Static performance analytics dataset for ISP graphs
  const bandwidthData = [
    { hour: '00:00', upload: 120, download: 340, latency: 12 },
    { hour: '04:00', upload: 90, download: 280, latency: 10 },
    { hour: '08:00', upload: 220, download: 510, latency: 15 },
    { hour: '12:00', upload: 340, download: 810, latency: 14 },
    { hour: '16:00', upload: 410, download: 960, latency: 18 },
    { hour: '20:00', upload: 550, download: 1250, latency: 22 },
    { hour: '24:00', upload: 190, download: 620, latency: 14 }
  ];

  return (
    <div id="dashboard-core" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Title & Header Control Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Core Command Centric
            <span className="hidden md:block w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
          </h1>
          <p className="text-slate-500 text-sm font-semibold italic mt-1">Real-time FTTH connectivity, SLA health, & payment collections</p>
        </div>
        <button 
          id="btn-sync-stats"
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Sync Diagnostics
        </button>
      </div>

      {errorStatus && (
        <div id="dashboard-error" className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CircleAlert size={16} />
          {errorStatus}
        </div>
      )}

      {/* Stats Bento Grid Layout */}
      <div id="stats-bento-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {statCardsData.map((card, index) => (
          <StatCard
            key={index}
            id={`dashboard-stat-card-${index}`}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            bg={card.bg}
            trend={card.trend}
            trendType={card.trendType}
            loading={loading}
          />
        ))}
      </div>

      {/* Middle Interactive Section: Bandwidth & Service health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Bandwidth Usage Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm overflow-hidden relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight flex items-center gap-3">
                <TrendingUp className="text-indigo-600 animate-bounce" size={20} />
                Network Traffic Metrics (Gbps)
              </h3>
              <p className="text-[10px] font-bold text-slate-400 italic">24-hour total aggregated uplink / downlink curves</p>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                Downlink
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Uplink
              </span>
            </div>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bandwidthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="downlinkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="uplinkGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="hour" tickLine={false} style={{ fontSize: '10px', fill: '#94A3B8', fontWeight: 'bold' }} stroke="#E2E8F0" />
                <YAxis tickLine={false} style={{ fontSize: '10px', fill: '#94A3B8', fontWeight: 'bold' }} stroke="#E2E8F0" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: 'none', borderRadius: '16px', color: '#fff' }}
                  itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="download" stroke="#4F46E5" strokeWidth={3.5} fillOpacity={1} fill="url(#downlinkGrad)" />
                <Area type="monotone" dataKey="upload" stroke="#10B981" strokeWidth={3.5} fillOpacity={1} fill="url(#uplinkGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time OLT/POP Service Statuses */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          
          <h3 className="font-black text-white text-lg uppercase tracking-tight mb-8 flex items-center gap-3 relative z-10">
            <Radio className="text-indigo-400" size={20} />
            OLT Node Telemetry
          </h3>
          
          <div className="space-y-6 relative z-10">
            {[
              { node: 'OLT-Dhaka-01', location: 'Mirpur Sector 10', pings: '4ms', load: '42%', status: 'nominal' },
              { node: 'OLT-Uttara-04', location: 'Sector 4 Highrise', pings: '3ms', load: '71%', status: 'nominal' },
              { node: 'OLT-Dhanmondi-02', location: 'Satmasjid Rd Node', pings: '7ms', load: '22%', status: 'nominal' },
              { node: 'OLT-Gulshan-01', location: 'Circle 1 Hub', pings: '5ms', load: '89%', status: 'warning' },
            ].map((olt, idx) => (
              <div key={idx} className="flex gap-4 group/olt-item items-start justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                    <HardDrive size={16} className={olt.status === 'warning' ? 'text-amber-400' : 'text-indigo-400'} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-200 leading-tight">{olt.node}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{olt.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-tight ${
                    olt.status === 'warning' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {olt.status === 'warning' ? 'Peak Load' : 'Stable'}
                  </span>
                  <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">Delay: {olt.pings} • Load: {olt.load}</p>
                </div>
              </div>
            ))}
          </div>

          <button id="btn-diagnostic-panel" className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all duration-300 cursor-pointer">
            Launch Diagnostic Matrix
          </button>
        </div>
      </div>

      {/* Auxiliary Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Support Helpdesk Overview */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight mb-6 flex items-center gap-3">
            <MessageSquare className="text-indigo-600" size={20} />
            Support Helpdesk Priority Tickets
          </h3>
          <div className="space-y-3">
            {[
              { id: '1092', subject: 'Total outage in Banani Block F', user: 'Fahad Bin Karim', time: '12 mins ago', severity: 'Critical' },
              { id: '1088', subject: 'Packet loss during night gaming hours', user: 'Imran Chowdhury', time: '44 mins ago', severity: 'Medium' }
            ].map(tick => (
              <div key={tick.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-200 text-xs">#{tick.id}</div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-tight">{tick.subject}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight mt-1 italic">
                      Client: {tick.user} • {tick.time}
                    </p>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${
                  tick.severity === 'Critical' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {tick.severity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Diagnostics Status */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight mb-6 flex items-center gap-3">
            <HeartPulse className="text-emerald-500 animate-pulse" size={20} />
            Service SLA Metrics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'PPPoE Tunnel Auth', status: 'Online', val: '99.98% SLA' },
              { label: 'Payment Gateway (BKash)', status: 'Online', val: 'Active integration' },
              { label: 'DHCP IP Allocator', status: 'Online', val: '1,280 Leases' },
              { label: 'Radius Sync Cluster', status: 'Online', val: 'Active synchrony' }
            ].map(pop => (
              <div key={pop.label} className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/50 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-800 tracking-tight leading-none">{pop.label}</p>
                  <p className="text-[10px] text-slate-500 mt-1.5 font-bold uppercase">{pop.status} • <span className="text-emerald-600 font-black">{pop.val}</span></p>
                </div>
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
