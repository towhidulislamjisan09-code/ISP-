import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, Plus, Search, Filter, 
  MoreHorizontal, Edit, Trash2, ShieldAlert,
  CheckCircle2, XCircle, RefreshCw, ChevronLeft,
  ChevronRight, ArrowRight, UserPlus, Phone,
  MapPin, Package as PackageIcon, Info
} from 'lucide-react';
import api from '../api/client';
import { User, Package } from '../types';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});

  useEffect(() => {
    fetchUsers();
    fetchPackages();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      const data = response.data.data !== undefined ? response.data.data : response.data;
      setUsers(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('[Users] Error loading users:', error);
      toast.error(error.response?.data?.error || 'Failed to load user list');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await api.get('/packages');
      const data = response.data.data !== undefined ? response.data.data : response.data;
      setPackages(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('[Users] Error loading packages list:', error);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/users/${currentUser.id}`, currentUser);
        toast.success('User updated');
      } else {
        await api.post('/users', currentUser);
        toast.success('User created');
      }
      setShowModal(false);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Terminate this user account? This action is irreversible.')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User terminated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const toggleStatus = async (user: User) => {
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.patch(`/users/${user.id}/status`, { status: newStatus });
      toast.success(`User set to ${newStatus}`);
      fetchUsers();
    } catch (error) {
      toast.error('Status sync failed');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4">
            User Base
            <span className="bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full font-bold">{users.length} Active Node(s)</span>
          </h1>
          <p className="text-slate-500 font-medium italic mt-2">Manage customer identity and network authorization</p>
        </div>
        <button 
          onClick={() => {
            setIsEditing(false);
            setCurrentUser({ role: 'customer', status: 'Active' });
            setShowModal(true);
          }}
          className="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-1 transition-all group"
        >
          <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
          Initialize New User
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder="Search by name, username or phone..."
             value={search}
             onChange={(e) => setSearch(e.target.value)}
             className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium"
           />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
           <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
              <Filter size={16} /> Filters
           </button>
           <button 
             onClick={fetchUsers}
             className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
           >
              <RefreshCw size={18} className={cn(loading && "animate-spin")} />
           </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Node / Identity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Network Profile</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status / Health</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 italic">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-10 h-24 bg-slate-50/30" />
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                     <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
                           <Search size={32} />
                        </div>
                        <p className="text-slate-500 font-bold">No matching system nodes found</p>
                     </div>
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-sm uppercase shrink-0 border-4 border-white shadow-lg overflow-hidden">
                         {user.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 tracking-tight group-hover:text-brand-600 transition-colors uppercase">{user.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 tracking-widest leading-none flex items-center gap-1.5 uppercase italic">
                           ID: {user.username} <span className="w-1 h-1 bg-slate-300 rounded-full" /> {user.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-black text-slate-700 flex items-center gap-2 uppercase">
                        <PackageIcon size={12} className="text-brand-500" />
                        {user.package_name || 'N/A'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter italic">
                         PPPoE: {user.pppoe_username || 'n/a'} • {user.ip_address || 'DHCP'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button 
                      onClick={() => toggleStatus(user)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95",
                        user.status === 'Active' 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-rose-50 text-rose-500 border border-rose-100"
                      )}
                    >
                      {user.status === 'Active' ? 'SYNCED' : 'TERMINATED'}
                    </button>
                    <p className="text-[9px] text-slate-400 font-bold mt-1.5 uppercase italic tracking-tighter">Exp: {user.expiry_date ? new Date(user.expiry_date).toLocaleDateString() : 'Never'}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className={cn(
                        "text-sm font-black tabular-nums tracking-tight",
                        user.total_due > 0 ? "text-rose-600" : "text-emerald-600"
                      )}>
                        ৳ {user.total_due.toLocaleString()}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Total Payload</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setCurrentUser(user);
                          setIsEditing(true);
                          setShowModal(true);
                        }}
                        className="p-2.5 hover:bg-brand-50 hover:text-brand-600 text-slate-400 rounded-xl transition-all"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2.5 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Placeholder */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border border-slate-200 rounded-3xl shadow-sm italic">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-bold">Node Sequence 1 - {filteredUsers.length} of {users.length}</p>
         <div className="flex gap-2">
            <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-30" disabled><ChevronLeft size={20} /></button>
            <button className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-30" disabled><ChevronRight size={20} /></button>
         </div>
      </div>

      {/* User Modal */}
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
               className="bg-white rounded-[3rem] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
             >
                <div className="p-10 border-b border-slate-100 flex items-center justify-between shrink-0">
                   <div>
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase tracking-tighter">
                        {isEditing ? 'Pulse User Update' : 'Initialize New Terminal'}
                      </h2>
                      <p className="text-slate-500 font-bold italic text-sm mt-1 uppercase tracking-tight italic">Protocol version 2.4.9 • Authorization Required</p>
                   </div>
                   <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-800 rounded-2xl transition-all">
                      <XCircle size={24} />
                   </button>
                </div>

                <form onSubmit={handleCreateOrUpdate} className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2">Node Name</label>
                        <input 
                          type="text" 
                          required
                          value={currentUser.name || ''}
                          onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                          placeholder="e.g. Abir Hussain"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2">Unique Frequency (Username)</label>
                        <input 
                          type="text" 
                          required
                          disabled={isEditing}
                          value={currentUser.username || ''}
                          onChange={(e) => setCurrentUser({...currentUser, username: e.target.value})}
                          placeholder="unique_id"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium disabled:opacity-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2">Secure Link (Password)</label>
                        <input 
                          type="password" 
                          placeholder={isEditing ? '••••••••' : 'Default: password123'}
                          onChange={(e) => setCurrentUser({...currentUser, password: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2">Communication (Phone)</label>
                        <input 
                          type="tel" 
                          required
                          value={currentUser.phone || ''}
                          onChange={(e) => setCurrentUser({...currentUser, phone: e.target.value})}
                          placeholder="017XXXXXXXX"
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium"
                        />
                      </div>
                      <div className="space-y-2 lg:col-span-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2">Geographical Terminal (Address)</label>
                        <textarea 
                          rows={2}
                          value={currentUser.address || ''}
                          onChange={(e) => setCurrentUser({...currentUser, address: e.target.value})}
                          placeholder="Station location details..."
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2">Network Protocol (Package)</label>
                        <select 
                          value={currentUser.package_id || ''}
                          onChange={(e) => setCurrentUser({...currentUser, package_id: parseInt(e.target.value)})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium appearance-none"
                        >
                          <option value="">Select Package</option>
                          {packages.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.speed} Mbps - ৳{p.price})</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2">Exfiltration Date (Expiry)</label>
                        <input 
                          type="date" 
                          value={currentUser.expiry_date ? new Date(currentUser.expiry_date).toISOString().split('T')[0] : ''}
                          onChange={(e) => setCurrentUser({...currentUser, expiry_date: e.target.value})}
                          className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium"
                        />
                      </div>
                   </div>

                   <button 
                     type="submit"
                     className="w-full bg-slate-900 text-white rounded-3xl py-6 font-black uppercase tracking-widest transition-all hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3"
                   >
                     {isEditing ? 'Overwrite Node' : 'Register Terminal'}
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
