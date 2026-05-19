import React, { useState } from 'react';
import { SupportChat } from './SupportChat';
import { MessageSquare, Ticket, LifeBuoy, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

export const Support = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'tickets'>('chat');

  const tickets = [
    { id: '#T-9021', subject: 'Internet disconnection', status: 'In Progress', date: '2 hours ago' },
    { id: '#T-8944', subject: 'New router configuration', status: 'Closed', date: '12 May 2026' },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Tab Switcher */}
      <div className="bg-white p-1 rounded-2xl flex border border-slate-200">
        <button
          onClick={() => setActiveTab('chat')}
          className={cn(
            "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
            activeTab === 'chat' ? "bg-brand-600 text-white shadow-md shadow-brand-500/20" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <MessageSquare size={18} />
          AI Chat
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={cn(
            "flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
            activeTab === 'tickets' ? "bg-brand-600 text-white shadow-md shadow-brand-500/20" : "text-slate-500 hover:bg-slate-50"
          )}
        >
          <Ticket size={18} />
          Tickets
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'chat' ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <SupportChat />
          </motion.div>
        ) : (
          <motion.div
            key="tickets"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center mb-2 px-1">
              <h3 className="text-lg font-bold text-slate-800">Support Tickets</h3>
              <button className="text-brand-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:underline">
                Create New
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-brand-200 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">{ticket.id}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      ticket.status === 'Closed' ? "bg-slate-100 text-slate-500" : "bg-brand-50 text-brand-600"
                    )}>{ticket.status}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1 group-hover:text-brand-600 transition-colors">{ticket.subject}</h4>
                  <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Clock size={12} />
                    Last updated {ticket.date}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-brand-50 border border-brand-100 p-6 rounded-3xl mt-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-600 shadow-sm shadow-brand-500/10 mb-4">
                <LifeBuoy size={32} />
              </div>
              <h4 className="font-bold text-slate-800 mb-2">Need immediate help?</h4>
              <p className="text-sm text-slate-600 mb-6 px-4">Contact our 24/7 technical support hotline for urgent issues.</p>
              <button className="btn-secondary w-full border-brand-200 text-brand-600 font-bold">
                Call Support: +880 1234 56789
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
