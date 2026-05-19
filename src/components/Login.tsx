import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Admin credential check
    setTimeout(() => {
      setIsLoading(false);
      if (username === 'admin' && password === 'admin123') {
        onLogin(username);
      } else {
        setError('Invalid admin credentials');
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 px-8 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-brand-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-brand-500/30 mb-6 rotate-12">
          <span className="font-black text-4xl italic tracking-tighter -rotate-12">TR</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Admin Login</h1>
        <p className="text-slate-500 font-medium mt-2">Secure access to Triangle Management</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium border border-rose-100 flex items-center gap-2"
          >
            <ShieldCheck size={18} />
            {error}
          </motion.div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors">
              <User size={20} />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Admin Username"
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-800 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors">
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-12 text-slate-800 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button
          disabled={isLoading}
          className="w-full btn-primary h-14 bg-brand-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-500/20 mt-6 disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <>
              Access Dashboard
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </motion.form>

      <div className="mt-auto pb-12 flex flex-col items-center gap-6">
        <div className="flex items-center gap-4 text-slate-300">
          <div className="h-[1px] w-12 bg-slate-200" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 text-center">Triangle Authorized Access Only</span>
          <div className="h-[1px] w-12 bg-slate-200" />
        </div>
      </div>
    </div>
  );
};
