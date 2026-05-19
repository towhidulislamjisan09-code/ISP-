import React from 'react';
import { CreditCard, History, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Invoice } from '@/src/types';
import { formatCurrency, cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

const mockInvoices: Invoice[] = [
  { id: 'INV-001', month: 'May 2026', amount: 1200, status: 'Unpaid', dueDate: '2026-05-25' },
  { id: 'INV-002', month: 'April 2026', amount: 1200, status: 'Paid', dueDate: '2026-04-25' },
  { id: 'INV-003', month: 'March 2026', amount: 1200, status: 'Paid', dueDate: '2026-03-25' },
];

export const Billing = () => {
  return (
    <div className="space-y-6 pb-24">
      {/* Payment Summary */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-slate-800 to-slate-950 text-white rounded-3xl p-8 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-slate-400 text-sm mb-2">Total Due</p>
          <h2 className="text-5xl font-black mb-6 tracking-tight">{formatCurrency(1200)}</h2>
          <button className="btn-primary w-full bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20">
            <CreditCard size={20} />
            Pay Now
          </button>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Invoice List */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">Payment History</h3>
        <div className="space-y-3">
          {mockInvoices.map((inv, idx) => (
            <motion.div
              key={inv.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center",
                  inv.status === 'Paid' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {inv.status === 'Paid' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{inv.month}</h4>
                  <p className="text-xs text-slate-500">ID: {inv.id} • Due: {inv.dueDate}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-800">{formatCurrency(inv.amount)}</p>
                <p className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  inv.status === 'Paid' ? "text-emerald-600" : "text-rose-600"
                )}>{inv.status}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
