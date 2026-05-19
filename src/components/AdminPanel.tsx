import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  MessageSquare, 
  Settings, 
  Search, 
  Plus, 
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Package as PackageIcon,
  CreditCard,
  Bell,
  Activity,
  History,
  X,
  UserPlus,
  Power,
  Shield,
  Zap,
  ChevronRight,
  Send,
  RefreshCw
} from 'lucide-react';
import { cn, formatCurrency } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type AdminTab = 'dashboard' | 'users' | 'packages' | 'billing' | 'payments' | 'tickets' | 'notifications';

interface Customer {
  id: string;
  name: string;
  username: string;
  password?: string;
  phone: string;
  address: string;
  package: string;
  status: 'Active' | 'Suspended' | 'Expired';
  expiryDate: string;
  ip: string;
  mac: string;
  due: number;
}

interface AdminPanelProps {
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([
    { id: '101', name: 'Rahat Jaman', username: 'rahat101', password: 'password123', phone: '01711223344', address: 'Sector 4, Uttara', package: 'Starter (20Mbps)', status: 'Active', expiryDate: '2026-06-15', ip: '192.168.10.22', mac: 'BC:4A:11:00:FF:21', due: 0 },
    { id: '102', name: 'Kamal Pasha', username: 'kamal102', password: 'password123', phone: '01855443322', address: 'Dhanmondi 32', package: 'Business (35Mbps)', status: 'Expired', expiryDate: '2026-05-10', ip: '10.55.2.19', mac: 'AA:BB:CC:DD:EE:01', due: 1200 },
    { id: '103', name: 'Nila Ahmed', username: 'nila103', password: 'password123', phone: '01900112233', address: 'Mirpur 10, Block C', package: 'Ultimate (50Mbps)', status: 'Active', expiryDate: '2026-06-20', ip: '192.168.10.45', mac: 'F4:A1:DD:22:99:33', due: 0 },
    { id: '104', name: 'Tanvir Hasan', username: 'tanvir104', password: 'password123', phone: '01688776655', address: 'Rampura, Banasree', package: 'Lite (10Mbps)', status: 'Suspended', expiryDate: 'N/A', ip: '10.55.2.44', mac: 'FF:FF:FF:FF:FF:FF', due: 800 },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({});

  const stats = [
    { label: 'Total Users', value: '1,284', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+4%' },
    { label: 'Active Users', value: '1,120', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '92.1%' },
    { label: 'Today Revenue', value: '৳ 12,450', icon: DollarSign, color: 'text-brand-600', bg: 'bg-brand-50', trend: '+৳ 2.2k' },
    { label: 'Monthly Income', value: '৳ 142,500', icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '+12%' },
  ];

  const packages = [
    { name: 'Lite', speed: '10 Mbps', price: 500, users: 450 },
    { name: 'Starter', speed: '20 Mbps', price: 800, users: 620 },
    { name: 'Business', speed: '35 Mbps', price: 1200, users: 154 },
    { name: 'Ultimate', speed: '50 Mbps', price: 1800, users: 60 },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-4 group hover:border-brand-300 transition-all cursor-default"
          >
            <div className="flex justify-between items-start">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full", 
                stat.trend.startsWith('+') || stat.trend.includes('%') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payments Control */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <CreditCard size={20} className="text-brand-600" />
              Pending Payment Verifications
            </h3>
            <button className="text-[10px] font-black uppercase text-brand-600 tracking-widest hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { id: 'BK-991', user: 'Abir Hussain', amount: 800, method: 'bKash', time: '2m ago' },
              { id: 'NG-221', user: 'Sara Khan', amount: 1200, method: 'Nagad', time: '15m ago' },
              { id: 'BK-105', user: 'Zakir Hasan', amount: 500, method: 'bKash', time: '1h ago' },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-600 font-bold border border-slate-200 uppercase text-xs">
                    {p.method.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.user}</p>
                    <p className="text-[10px] text-slate-500">Trx: {p.id} • {p.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800">৳ {p.amount}</p>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">{p.method}</p>
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"><CheckCircle2 size={14}/></button>
                    <button className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"><X size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health / Offline Alerts */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
            <Activity size={20} className="text-rose-600" />
            Active Alerts
          </h3>
          <div className="space-y-4 flex-1">
             <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Network Outage</p>
                <p className="text-sm font-bold text-slate-800 leading-tight">Sector 4 POP Offline</p>
                <p className="text-xs text-slate-500 italic mt-1">Affected: 124 Users • Est. Fix: 30m</p>
             </div>
             <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Low Balance</p>
                <p className="text-sm font-bold text-slate-800 leading-tight">SMS Gateway Credit Low</p>
                <p className="text-xs text-slate-500 italic mt-1">Current: ৳ 42.00 • Action Needed</p>
             </div>
          </div>
          <button className="mt-8 w-full py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            <Zap size={14} /> Run Diagnostics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Overview */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
            <MessageSquare size={20} className="text-brand-600" />
            Open Tickets
          </h3>
          <div className="overflow-hidden border border-slate-100 rounded-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">User</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Issue</th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 italic">
                {[
                  { user: 'Rahat J.', issue: 'Slow Browsing', priority: 'High' },
                  { user: 'Nila A.', issue: 'Red light on router', priority: 'Urgent' },
                ].map((t, idx) => (
                  <tr key={idx} className="text-sm">
                    <td className="px-4 py-3 font-bold text-slate-700">{t.user}</td>
                    <td className="px-4 py-3 text-slate-500">{t.issue}</td>
                    <td className="px-4 py-3">
                      <span className="text-[9px] font-black uppercase bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">{t.priority}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Requests Dashboard Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
            <RefreshCw size={20} className="text-brand-600" />
            Recent Requests
          </h3>
          <div className="space-y-4">
            {[{from: 'Lite', to: 'Starter', user: 'Zakir Ahmed'}, {from: 'Starter', to: 'Business', user: 'Mila K.'}].map((r, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-slate-800">{r.user}</p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                    <span>{r.from}</span>
                    <ChevronRight size={10} />
                    <span className="text-brand-600">{r.to}</span>
                  </div>
                </div>
                <button className="bg-brand-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg hover:bg-brand-700 transition-all">Review</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const handleAddUser = () => {
    setEditingCustomer(null);
    setFormData({
      id: Math.floor(100 + Math.random() * 900).toString(),
      status: 'Active',
      due: 0,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData(customer);
    setIsModalOpen(true);
  };

  const toggleStatus = (id: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === 'Active' ? 'Suspended' : 'Active' };
      }
      return c;
    }));
  };

  const saveCustomer = () => {
    if (!formData.name || !formData.phone || !formData.username) return;

    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...formData } as Customer : c));
    } else {
      setCustomers(prev => [...prev, formData as Customer]);
    }
    setIsModalOpen(false);
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.includes(searchQuery) ||
    c.phone.includes(searchQuery)
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, ID, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
          />
        </div>
        <button 
          onClick={handleAddUser}
          className="btn-primary w-full md:w-auto h-14 bg-brand-600 px-8"
        >
          <UserPlus size={20} />
          Add User
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Package & IP</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Expiry / Due</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-600">#{c.id}</div>
                    <div>
                      <p className="font-bold text-slate-800">{c.name}</p>
                      <p className="text-[10px] text-brand-600 font-bold">@{c.username}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{c.phone}</p>
                      <p className="text-[9px] text-slate-400 italic truncate max-w-[120px]">{c.address}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-brand-600">{c.package}</p>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">IP: {c.ip}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-xs font-bold text-slate-700">{c.expiryDate}</p>
                  <p className={cn("text-[10px] font-bold", c.due > 0 ? "text-rose-500" : "text-emerald-500")}>
                    Due: {formatCurrency(c.due)}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest",
                    c.status === 'Active' ? "bg-emerald-50 text-emerald-600" : 
                    c.status === 'Suspended' ? "bg-rose-50 text-rose-600" : "bg-amber-100 text-amber-700"
                  )}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => toggleStatus(c.id)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        c.status === 'Active' ? "text-rose-400 hover:bg-rose-50" : "text-emerald-400 hover:bg-emerald-50"
                      )}
                      title={c.status === 'Active' ? "Suspend" : "Activate"}
                    >
                      <Power size={18} />
                    </button>
                    <button 
                      onClick={() => handleEditUser(c)}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                    >
                      <Settings size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredCustomers.length === 0 && (
          <div className="py-20 text-center text-slate-400 italic">No customers found matching your search.</div>
        )}
      </div>

      {/* User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                    {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold tracking-widest mt-0.5 uppercase">
                    Customer Details
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username / Client ID</label>
                    <input 
                      type="text" 
                      value={formData.username || ''}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="e.g. user123"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <input 
                      type="text" 
                      value={formData.password || ''}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="017xxxxxxxx"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Address</label>
                  <input 
                    type="text" 
                    value={formData.address || ''}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Full street address"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Package</label>
                    <select 
                      value={formData.package || ''}
                      onChange={(e) => setFormData({...formData, package: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none appearance-none"
                    >
                      <option value="">Select Package</option>
                      {packages.map(p => <option key={p.name} value={`${p.name} (${p.speed})`}>{p.name} - {p.speed}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">IP Address</label>
                    <input 
                      type="text" 
                      value={formData.ip || ''}
                      onChange={(e) => setFormData({...formData, ip: e.target.value})}
                      placeholder="192.168.x.x"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-5 text-sm focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={saveCustomer}
                  className="w-full py-5 bg-brand-600 text-white rounded-[2rem] font-bold text-lg shadow-xl shadow-brand-500/20 hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <CheckCircle2 size={24} />
                  {editingCustomer ? 'Update Profile' : 'Save Customer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderPackages = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {packages.map(p => (
        <div key={p.name} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative group hover:border-brand-300 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
            <Zap size={24} />
          </div>
          <h4 className="font-black text-xl text-slate-800">{p.name}</h4>
          <p className="text-brand-600 font-bold text-lg">{p.speed}</p>
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-2xl font-black text-slate-900">৳ {p.price}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{p.users} Users</p>
          </div>
          <button className="mt-6 w-full py-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:bg-brand-600 hover:text-white transition-all">Edit Details</button>
        </div>
      ))}
      <button className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-slate-400 hover:border-brand-300 hover:text-brand-600 transition-all gap-2 min-h-[250px]">
        <Plus size={32} />
        <span className="font-bold text-sm uppercase tracking-widest">New Package</span>
      </button>
    </div>
  );

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'packages', label: 'Packages', icon: PackageIcon },
    { id: 'billing', label: 'Billing', icon: DollarSign },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'tickets', label: 'Tickets', icon: MessageSquare },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-80px)]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col p-6 sticky top-20 h-[calc(100vh-80px)]">
        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all",
                  isActive 
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-brand-600"
                )}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">T</div>
              <div>
                <p className="text-xs font-bold text-slate-800">Triangle Admin</p>
                <p className="text-[10px] font-medium text-emerald-600">System Live</p>
              </div>
           </div>
           <button 
             onClick={onLogout}
             className="w-full py-2 bg-white border border-slate-200 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
           >
             <Power size={12} /> Sign Out
           </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
        {/* Mobile Nav Swiper */}
        <div className="lg:hidden flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-x-auto no-scrollbar">
           {sidebarItems.map(item => (
             <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "px-6 py-3 text-xs font-black uppercase tracking-widest transition-all rounded-xl whitespace-nowrap",
                  activeTab === item.id ? "bg-brand-600 text-white shadow-md shadow-brand-500/10" : "text-slate-400"
                )}
             >
               {item.label}
             </button>
           ))}
        </div>

        <section className="mb-8">
           <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{activeTab}</h2>
           <p className="text-xs text-slate-400 font-bold tracking-widest mt-1">MANAGEMENT CONSOLE</p>
        </section>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'packages' && renderPackages()}
            {['billing', 'payments', 'tickets', 'notifications'].includes(activeTab) && (
               <div className="bg-white rounded-[3rem] border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                 <div className="w-24 h-24 bg-brand-50 text-brand-600 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-brand-500/10">
                   {activeTab === 'billing' && <DollarSign size={48} />}
                   {activeTab === 'payments' && <CreditCard size={48} />}
                   {activeTab === 'tickets' && <MessageSquare size={48} />}
                   {activeTab === 'notifications' && <Bell size={48} />}
                 </div>
                 <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">
                   {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
                 </h4>
                 <p className="text-slate-500 font-medium max-w-sm mb-8 leading-relaxed">
                   The administrative interface for managing system {activeTab} is being synchronized with the production database.
                 </p>
                 <div className="flex gap-3">
                   <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
                     Refresh Data
                   </button>
                   <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                     View Logs
                   </button>
                 </div>
               </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
