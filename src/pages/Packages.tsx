import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Package as PackageIcon, 
  Zap, DollarSign, Activity, ChevronRight,
  Shield, CheckCircle2, XCircle, Info
} from 'lucide-react';
import api from '../api/client';
import { Package } from '../types';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const Packages = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPackage, setCurrentPackage] = useState<Partial<Package>>({});

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/packages');
      setPackages(response.data.data);
    } catch (error) {
      toast.error('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/packages/${currentPackage.id}`, currentPackage);
        toast.success('Package updated');
      } else {
        await api.post('/packages', currentPackage);
        toast.success('Package created');
      }
      setShowModal(false);
      fetchPackages();
    } catch (error) {
      toast.error('Something went wrong');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this package?')) return;
    try {
      await api.delete(`/packages/${id}`);
      toast.success('Package removed');
      fetchPackages();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4 uppercase">
            Service Tiers
            <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
            <span className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full font-black italic">{packages.length} Active Protocols</span>
          </h1>
          <p className="text-slate-500 font-medium italic mt-2 uppercase tracking-tight font-bold opacity-60">Architect the network speed and value systems</p>
        </div>
        <button 
          onClick={() => {
            setIsEditing(false);
            setCurrentPackage({ speed: 10, price: 500 });
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-1 transition-all group"
        >
          <Zap size={18} className="group-hover:scale-125 transition-transform" />
          Deploy New Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-[3rem] animate-pulse border border-slate-100" />
          ))
        ) : packages.map((pkg, idx) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-white rounded-[3rem] border border-slate-200 p-8 shadow-sm hover:shadow-2xl hover:shadow-brand-500/10 hover:border-brand-500/50 transition-all flex flex-col"
          >
             <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setCurrentPackage(pkg);
                    setIsEditing(true);
                    setShowModal(true);
                  }}
                  className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all"
                >
                  <Edit size={16} className="text-slate-400 hover:text-brand-600" />
                </button>
                <button 
                  onClick={() => handleDelete(pkg.id)}
                  className="p-3 bg-white border border-slate-100 rounded-2xl hover:bg-rose-50 transition-all"
                >
                  <Trash2 size={16} className="text-slate-400 hover:text-rose-600" />
                </button>
             </div>

             <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform shadow-xl shadow-slate-900/20">
                   <PackageIcon size={32} />
                </div>
                <div>
                   <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">{pkg.name}</h3>
                   <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest italic">{pkg.mikrotik_profile || 'DEFAULT-PROFILE'}</p>
                </div>
             </div>

             <div className="space-y-6 flex-1">
                <div className="flex items-end gap-2">
                   <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums">৳{pkg.price.toLocaleString()}</span>
                   <span className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 italic">/ cycle</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-brand-50/50 transition-colors">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">Speed Bandwidth</p>
                      <p className="text-xl font-black text-slate-800 tracking-tighter">{pkg.speed} Mbps</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-emerald-50/50 transition-colors">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1 italic">Data Payload</p>
                      <p className="text-xl font-black text-slate-800 tracking-tighter">{pkg.fup_limit || 'Infinity'}</p>
                   </div>
                </div>

                <p className="text-xs font-medium text-slate-500 leading-relaxed italic">{pkg.description || 'Enterprise grade fiber connection with low latency routing.'}</p>
             </div>

             <div className="mt-10 flex items-center gap-2">
               <div className="flex -space-x-2">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">U{i}</div>
                 ))}
                 <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[8px] font-black text-white">12+</div>
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic ml-2">Active subscribers on this tier</span>
             </div>
          </motion.div>
        ))}
      </div>

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
               className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl relative z-10 overflow-hidden border border-slate-100"
             >
                <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                   <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase tracking-tighter">
                        {isEditing ? 'Sync Tier Updates' : 'Configure New Tier'}
                      </h2>
                      <p className="text-slate-500 font-bold italic text-sm mt-1 uppercase">Protocol parameters must be validated</p>
                   </div>
                   <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-800 rounded-2xl transition-all">
                      <XCircle size={24} />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-6">
                   <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2 italic">Identity Name</label>
                       <input 
                         type="text" 
                         required
                         value={currentPackage.name || ''}
                         onChange={(e) => setCurrentPackage({...currentPackage, name: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-black text-slate-800 transition-all"
                         placeholder="e.g. ULTIMA PRO"
                       />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2 italic">Bandwidth (Mbps)</label>
                         <input 
                           type="number" 
                           required
                           value={currentPackage.speed || ''}
                           onChange={(e) => setCurrentPackage({...currentPackage, speed: parseInt(e.target.value)})}
                           className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-black text-slate-800"
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2 italic">Currency Value (৳)</label>
                         <input 
                           type="number" 
                           required
                           value={currentPackage.price || ''}
                           onChange={(e) => setCurrentPackage({...currentPackage, price: parseInt(e.target.value)})}
                           className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-black text-slate-800"
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2 italic">MikroTik Profile Alias</label>
                       <input 
                         type="text" 
                         value={currentPackage.mikrotik_profile || ''}
                         onChange={(e) => setCurrentPackage({...currentPackage, mikrotik_profile: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-bold text-slate-800"
                         placeholder="e.g. 50M_LIT_PROFILE"
                       />
                   </div>

                   <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2 italic">Functional Breakdown</label>
                       <textarea 
                         rows={3}
                         value={currentPackage.description || ''}
                         onChange={(e) => setCurrentPackage({...currentPackage, description: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium resize-none text-slate-600"
                         placeholder="Marketing description and technical specs..."
                       />
                   </div>

                   <button 
                     type="submit"
                     className="w-full bg-slate-900 text-white rounded-3xl py-6 font-black uppercase tracking-widest transition-all hover:bg-slate-800 hover:-translate-y-1 shadow-2xl flex items-center justify-center gap-3"
                   >
                     {isEditing ? 'Overwrite Logic' : 'Initiate Tier'}
                     <ChevronRight size={20} />
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
