import React from 'react';
import { Package } from '@/src/types';
import { formatCurrency, cn } from '@/src/lib/utils';
import { Check, Zap, Shield, Rocket } from 'lucide-react';
import { motion } from 'motion/react';

const availablePackages: Package[] = [
  { id: '1', name: 'Lite', speed: '10 Mbps', price: 800, features: ['Buffering Free YouTube', '24/7 Support', 'Standard IP'] },
  { id: '2', name: 'Starter', speed: '20 Mbps', price: 1200, features: ['Premium Bandwidth', 'BDIX Enabled', 'Fast Browsing'] },
  { id: '3', name: 'Business', speed: '35 Mbps', price: 1800, features: ['Real IP Included', 'High Speed Gaming', 'Priority Support'] },
  { id: '4', name: 'Ultimate', speed: '50 Mbps', price: 2500, features: ['Ultra Speed', 'Remote Access', 'Dedicated Support'] },
];

export const Packages = () => {
  return (
    <div className="space-y-6 pb-24">
      <div className="bg-brand-600 text-white rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold mb-2">Upgrade Your Speed</h2>
        <p className="text-brand-100 text-sm opacity-90">Experience seamless connectivity with our premium broadband plans.</p>
      </div>

      <div className="space-y-4">
        {availablePackages.map((pkg, idx) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "bg-white border-2 rounded-3xl p-6 relative overflow-hidden transition-all shadow-sm",
              pkg.name === 'Starter' ? "border-brand-500 ring-4 ring-brand-500/10" : "border-slate-100"
            )}
          >
            {pkg.name === 'Starter' && (
              <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] font-bold px-4 py-1 rounded-bl-xl uppercase tracking-widest">
                Current
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-slate-800 text-xl">{pkg.name}</h4>
                <p className="text-brand-600 font-black text-2xl mt-1">{pkg.speed}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs font-medium line-through">TK. {pkg.price + 200}</p>
                <p className="text-slate-800 font-bold text-xl">{formatCurrency(pkg.price)}</p>
                <p className="text-slate-400 text-[10px]">Per month (+VAT)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-2 mb-6">
              {pkg.features.map(feat => (
                <div key={feat} className="flex items-center gap-2 text-slate-600">
                  <div className="bg-emerald-100 text-emerald-600 rounded-full p-0.5">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-xs font-medium">{feat}</span>
                </div>
              ))}
            </div>

            <button className={cn(
              "w-full py-3 rounded-2xl font-bold transition-all active:scale-95",
              pkg.name === 'Starter' 
                ? "bg-slate-100 text-slate-400 cursor-default" 
                : "bg-brand-600 text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700"
            )}>
              {pkg.name === 'Starter' ? 'Current Active Package' : 'Upgrade Now'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
