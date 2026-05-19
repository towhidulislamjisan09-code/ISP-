import React, { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle2, XCircle, Search, 
  Filter, RefreshCw, Smartphone, DollarSign,
  Clock, Hash, ArrowRight, Wallet, Info, Plus
} from 'lucide-react';
import api from '../api/client';
import { Payment, User } from '../types';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    user_id: 0,
    amount: 0,
    payment_method: 'Cash',
    transaction_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchPayments();
    fetchUsers();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/payments');
      const data = response.data.data !== undefined ? response.data.data : response.data;
      setPayments(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('[Payments] Failed to fetch layout data:', error);
      toast.error(error.response?.data?.error || 'Failed to load transaction pool');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      const data = response.data.data !== undefined ? response.data.data : response.data;
      setUsers(Array.isArray(data) ? data.filter((u: User) => u.role === 'customer') : []);
    } catch (error) {
      console.error('[Payments] Failed to fetch users list:', error);
    }
  };

  const handleVerify = async (id: number, status: 'Approved' | 'Rejected') => {
    const admin_notes = prompt(`Verification notes for this ${status.toLowerCase()}ed payment:`);
    try {
      await api.patch(`/payments/${id}/verify`, { status, admin_notes });
      toast.success(`Transaction successfully ${status.toLowerCase()}ed`);
      fetchPayments();
    } catch (error: any) {
      console.error('[Payments] Verification error:', error);
      toast.error(error.response?.data?.error || 'Verification failed');
    }
  };

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.user_id || newPayment.user_id === 0) {
      toast.error('Please select a customer first');
      return;
    }
    if (!newPayment.amount || Number(newPayment.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!newPayment.transaction_id && newPayment.payment_method !== 'Cash') {
      toast.error('Transaction ID is required for mobile payments');
      return;
    }

    try {
      // Send correct JSON body format
      await api.post('/payments', {
        ...newPayment,
        amount: Number(newPayment.amount)
      });
      toast.success('Payment successfully logged!');
      setShowModal(false);
      setNewPayment({
        user_id: 0,
        amount: 0,
        payment_method: 'Cash',
        transaction_id: '',
        notes: ''
      });
      fetchPayments();
    } catch (error: any) {
      console.error('[Payments] Error creating payment ledger:', error);
      toast.error(error.response?.data?.error || 'Failed to record payment');
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
            <span className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full font-black italic">{payments.length} Registered Ledgers</span>
          </h1>
          <p className="text-slate-500 font-medium italic mt-2 font-bold uppercase tracking-tight opacity-60">Audit and verify decentralized payment inputs (bKash/Nagad/Cash)</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-1 transition-all group shrink-0"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Collect Balance Payment
        </button>
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
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight italic">
                            {p.payment_date ? new Date(p.payment_date).toLocaleString() : 'N/A'}
                          </p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1 italic font-bold">
                       <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md self-start italic font-bold tracking-tighter uppercase">{p.payment_method}</span>
                       <span className="text-xs font-black text-slate-700 tracking-tight italic uppercase">{p.transaction_id || 'CASH_ENTRY'}</span>
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
                      <div className="flex items-center justify-end gap-2 text-slate-400 group-hover:text-slate-600 transition-colors zoom-in-50">
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

      {/* Collect / Add Payment Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowModal(false)}
               className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl relative z-10 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
             >
                <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
                   <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase tracking-tighter">Collect Cash/Mobile Payment</h2>
                      <p className="text-slate-500 font-bold italic text-sm mt-1 uppercase">Logs client payment balance instantly to the ledger</p>
                   </div>
                   <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-800 rounded-2xl transition-all">
                      <XCircle size={24} />
                   </button>
                </div>

                <form onSubmit={handleCollectPayment} className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                   <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2 italic">Select Customer</label>
                       <select 
                         required
                         value={newPayment.user_id || ''}
                         onChange={(e) => setNewPayment({...newPayment, user_id: parseInt(e.target.value)})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-black text-slate-800"
                       >
                         <option value="">Select Customer Node</option>
                         {users.map(u => (
                           <option key={u.id} value={u.id}>
                             {u.name} ({u.username} • Due: ৳{u.total_due.toLocaleString()})
                           </option>
                         ))}
                       </select>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2 italic">Amount (৳)</label>
                         <input 
                           type="number" 
                           required
                           min="1"
                           value={newPayment.amount || ''}
                           onChange={(e) => setNewPayment({...newPayment, amount: Number(e.target.value)})}
                           className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-black text-slate-800"
                           placeholder="e.g. 500"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2 italic">Payment Method</label>
                         <select 
                           value={newPayment.payment_method || 'Cash'}
                           onChange={(e) => setNewPayment({...newPayment, payment_method: e.target.value})}
                           className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-black text-slate-800"
                         >
                           <option value="Cash">Cash</option>
                           <option value="bKash">bKash</option>
                           <option value="Nagad">Nagad</option>
                           <option value="Bank">Bank Transfer</option>
                         </select>
                      </div>
                   </div>

                   <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2 italic">Transaction ID (for mobile/bank)</label>
                       <input 
                         type="text" 
                         value={newPayment.transaction_id || ''}
                         onChange={(e) => setNewPayment({...newPayment, transaction_id: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-bold text-slate-800 text-sm uppercase"
                         placeholder="e.g. TRK9X72JD8"
                       />
                   </div>

                   <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2 italic">Collector / Admin Notes</label>
                       <textarea 
                         rows={2}
                         value={newPayment.notes || ''}
                         onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium resize-none text-slate-600"
                         placeholder="Reference details / additional info..."
                       />
                   </div>

                   <button 
                     type="submit"
                     className="w-full bg-slate-900 text-white rounded-3xl py-6 font-black uppercase tracking-widest transition-all hover:bg-slate-800 hover:-translate-y-1 shadow-2xl flex items-center justify-center gap-3"
                   >
                     Submit Payment Entry
                     <ArrowRight size={20} />
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

