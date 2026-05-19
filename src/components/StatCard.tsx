import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  icon: Icon,
  color,
  bg,
  trend,
  trendType = 'up',
  loading = false,
}) => {
  return (
    <motion.div
      id={id || `stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col justify-between h-[180px] group hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 cursor-default"
    >
      <div className="flex justify-between items-start">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6", bg)}>
          <Icon className={color} size={24} />
        </div>
        {trend && (
          <div className={cn(
            "text-[9px] font-black uppercase px-2 py-1 rounded-lg tracking-tight",
            trendType === 'up' && "bg-emerald-50 text-emerald-600",
            trendType === 'down' && "bg-rose-50 text-rose-600",
            trendType === 'neutral' && "bg-slate-100 text-slate-500"
          )}>
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 italic opacity-60">
          {title}
        </p>
        <h3 className="text-2.5xl font-black text-slate-800 tracking-tight leading-none">
          {loading ? (
            <span className="inline-block w-16 h-6 bg-slate-100 animate-pulse rounded-md" />
          ) : (
            value
          )}
        </h3>
      </div>
    </motion.div>
  );
};
