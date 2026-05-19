import React, { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle2, XCircle, Search, 
  Filter, RefreshCw, Smartphone, DollarSign,
  Clock, Hash, ArrowRight, Wallet, Info
} from 'lucide-react';
import api from '../api/client';
import { Payment } from '../types';
import { toast } from 'react-hot-toast';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments');
      setPayments(response.data.data);
    } catch (error) {
      toast.error('Failed to load transaction pool');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: number, status: 'Approved' | 'Rejected') => {
    const admin_notes = prompt(`Verification notes for this ${status.toLowerCase()}ed payment:`);
    try {
      await api.patch(`/payments/${id}/verify`, { status, admin_notes });
      toast.success(`Transaction successfully ${status.toLowerCase()}ed`);
      fetchPayments();
    } catch (error) {
      toast.error('Verification failed');
    }
  };

  const filteredPayments = payments.filter(p => 
    p.user_name?.toLowerCase().includes(search.toLowerCase()) || 
    p.transaction_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4 uppercase tracking-tighter italic font-bold">
            Liquidity Pool
            <div className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
          </h1>
          <p className="text-slate-500 font-medium italic mt-2 font-bold uppercase tracking-tight opacity-60">Audit and verify decentralized payment inputs (bKash/Nagad/Cash)</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full italic">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder="Audit by transaction ID or user identity..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium"
           />
        </div>
        <button onClick={fetchPayments} className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl">
           <RefreshCw size={18} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 font-black italic">Transmission Source</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 font-black italic">Protocol / TrxID</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 font-black italic">Payload Amount</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 font-black italic">Consensus Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 font-black italic text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic font-bold">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse h-24"><td colSpan={5} className="px-8"></td></tr>
                ))
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center text-slate-400 font-black italic uppercase tracking-widest">No pending transactions detected in pool</td>
                </tr>
              ) : filteredPayments.map((p) => (
                <tr key={p.id} className="group hover:bg-slate-50/80 transition-all">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3 italic font-bold">
                       <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                          <Smartphone size={20} />
                       </div>
                       <div>
                          <p className="text-sm font-black text-slate-800 leading-none mb-1 tracking-tight uppercase tracking-tighter font-bold">{p.user_name}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight italic">{new Date(p.payment_date).toLocaleString()}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1 italic font-bold">
                       <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md self-start italic font-bold tracking-tighter uppercase">{p.payment_method}</span>
                       <span className="text-xs font-black text-slate-700 tracking-tight italic uppercase">{p.transaction_id}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-slate-900 group-hover:text-brand-600 transition-colors uppercase italic font-bold tracking-tighter tabular-nums ">৳ {Number(p.amount).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "text-[9px] font-black uppercase px-2 py-1 rounded-full border tracking-widest shadow-sm shadow-emerald-500/5",
                      p.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      p.status === 'Rejected' ? "bg-rose-50 text-rose-500 border-rose-100" :
                      "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                    )}>
                      {p.status === 'Pending' ? 'SYCHRONIZING' : p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-bold italic">
                    {p.status === 'Pending' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleVerify(p.id, 'Approved')}
                          className="px-4 py-2 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 hover:-translate-y-0.5 transition-all shadow-xl shadow-emerald-500/10"
                        >
                           Validate
                        </button>
                        <button 
                          onClick={() => handleVerify(p.id, 'Rejected')}
                          className="px-4 py-2 bg-white border border-slate-200 text-rose-500 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-all"
                        >
                           Reject
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                        <span className="text-[10px] font-black uppercase tracking-widest italic font-bold">Processed</span>
                        <CheckCircle2 size={16} />
                      </div>
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
