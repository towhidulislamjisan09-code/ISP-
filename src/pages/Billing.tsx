import React, { useState, useEffect } from 'react';
import { 
  DollarSign, FileText, CheckCircle2, AlertCircle, 
  Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  Printer, ArrowUpRight, Wallet, Calendar, Download
} from 'lucide-react';
import api from '../api/client';
import { Bill } from '../types';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Billing = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await api.get('/billing');
      const data = response.data.data !== undefined ? response.data.data : response.data;
      setBills(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('[Billing] Failed to load ledger:', error);
      toast.error(error.response?.data?.error || 'Failed to load ledger');
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    const month = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!window.confirm(`Initiate mass billing for ${month}?`)) return;
    
    setGenerating(true);
    try {
      await api.post('/billing/generate', { month });
      toast.success('Billing cycle initialized');
      fetchBills();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate bills');
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkAsPaid = async (id: number) => {
    try {
      await api.patch(`/billing/${id}/pay`);
      toast.success('Transaction reconciled');
      fetchBills();
    } catch (error) {
      toast.error('Reconciliation failed');
    }
  };

  const filteredBills = bills.filter(b => 
    b.user_name?.toLowerCase().includes(search.toLowerCase()) || 
    b.billing_month.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4 uppercase tracking-tighter">
            Revenue Ledger
            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
          </h1>
          <p className="text-slate-500 font-medium italic mt-2 uppercase tracking-tight font-bold italic opacity-60">Monitor monthly receivables and reconcile accounts</p>
        </div>
        <button 
          onClick={handleGenerate}
          disabled={generating}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-brand-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-600/20 hover:bg-brand-700 hover:-translate-y-1 transition-all disabled:opacity-50"
        >
          {generating ? <RefreshCw size={18} className="animate-spin" /> : <Calendar size={18} />}
          Run Billing Cycle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">Total Receivables</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter tabular-nums">৳ {bills.reduce((acc, b) => b.status !== 'Paid' ? acc + Number(b.amount) : acc, 0).toLocaleString()}</h3>
            <div className="flex items-center gap-1.5 mt-3 text-rose-500 font-bold text-[10px] uppercase">
               <AlertCircle size={12} /> Pending Reconciliation
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">Collection Rate</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter tabular-nums">
              {bills.length > 0 ? Math.round((bills.filter(b => b.status === 'Paid').length / bills.length) * 100) : 0}%
            </h3>
            <div className="flex items-center gap-1.5 mt-3 text-emerald-500 font-bold text-[10px] uppercase">
               <TrendingUp size={12} className="hidden" /> Synchronized Output
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">Active Nodes</p>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter tabular-nums">{new Set(bills.map(b => b.user_id)).size} Units</h3>
            <div className="flex items-center gap-1.5 mt-3 text-brand-500 font-bold text-[10px] uppercase italic">
               <CheckCircle2 size={12} /> Billing Ready
            </div>
         </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center italic font-bold">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder="Audit by user name or billing month..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium"
           />
        </div>
        <button onClick={fetchBills} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg">
           <RefreshCw size={18} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger Entry</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Allocation Context</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Security Amount</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Phase Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Commit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse h-20"><td colSpan={5} className="px-8"></td></tr>
                ))
              ) : filteredBills.map((bill) => (
                <tr key={bill.id} className="group hover:bg-slate-50/80 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                          <FileText size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-800 leading-none mb-1 tracking-tight uppercase tracking-tighter">{bill.user_name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight italic">Index: {bill.user_username}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-tight italic">{bill.billing_month}</p>
                    <p className="text-[10px] text-slate-400 font-bold italic mt-1 uppercase tracking-tighter">Due sequence: {new Date(bill.due_date).toLocaleDateString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-900 group-hover:text-brand-600 transition-colors uppercase italic tabular-nums tracking-tighter">৳ {Number(bill.amount).toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-widest",
                      bill.status === 'Paid' 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : "bg-rose-50 text-rose-500 border-rose-100"
                    )}>
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    {bill.status !== 'Paid' ? (
                      <button 
                        onClick={() => handleMarkAsPaid(bill.id)}
                        className="px-4 py-2 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-emerald-500/20"
                      >
                         Mark Paid
                      </button>
                    ) : (
                      <button className="p-2.5 bg-slate-50 text-slate-300 rounded-xl cursor-default">
                         <Printer size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TrendingUp = ({ className, size = 12 }: { className?: string, size?: number }) => <ArrowUpRight className={className} size={size} />;
