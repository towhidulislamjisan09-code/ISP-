import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Login Successful');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="p-8 md:p-12">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-20 h-20 bg-brand-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-brand-600/20 rotate-12 group hover:rotate-0 transition-transform duration-500">
               <Shield size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Admin Terminal</h1>
            <p className="text-slate-500 font-medium mt-2 italic text-sm">ISP Management Control v2.0</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2">Access Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium text-slate-800 placeholder:text-slate-300"
                  placeholder="Enter system username"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 ml-2">Secure Payload</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium text-slate-800 placeholder:text-slate-300"
                  placeholder="Enter access code"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white rounded-2xl py-4 font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? 'Processing...' : (
                <>
                  Establish Connection
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            Authorized Personnel Only • Secure 256-bit Encryption
          </p>
        </div>
      </motion.div>
    </div>
  );
};
