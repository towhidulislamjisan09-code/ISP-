import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, CheckCircle2, XCircle, 
  Search, Filter, RefreshCw, User, 
  Clock, AlertCircle, Trash2, ArrowUpRight,
  ChevronRight, Info
} from 'lucide-react';
import api from '../api/client';
import { Ticket } from '../types';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const Tickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/tickets');
      const data = response.data.data !== undefined ? response.data.data : response.data;
      setTickets(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('[Tickets] Failed to load tickets:', error);
      toast.error(error.response?.data?.error || 'Failed to load assist buffer');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (ticketId: number) => {
    try {
      const response = await api.get(`/tickets/${ticketId}/replies`);
      const data = response.data.data !== undefined ? response.data.data : response.data;
      setReplies(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('[Tickets] Failed to fetch replies:', error);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !newReply.trim()) return;
    
    setReplyLoading(true);
    try {
      await api.post(`/tickets/${selectedTicket.id}/reply`, { message: newReply });
      setNewReply('');
      fetchReplies(selectedTicket.id);
      fetchTickets();
      toast.success('Transmission sent');
    } catch (error) {
      toast.error('Transmission failed');
    } finally {
      setReplyLoading(false);
    }
  };

  const handleClose = async (id: number) => {
    try {
      await api.patch(`/tickets/${id}/close`);
      toast.success('Frequency closed');
      fetchTickets();
      setSelectedTicket(null);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(search.toLowerCase()) || 
    t.user_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-4 uppercase tracking-tighter italic font-bold">
            Assist Buffer
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
          </h1>
          <p className="text-slate-500 font-medium italic mt-2 uppercase tracking-tight font-bold italic opacity-60">Synchronize frequency with customer distress signals</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tickets List */}
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
           <div className="p-6 border-b border-slate-100 italic font-bold">
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                   type="text" 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Scan subjects/identities..."
                   className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-brand-500/5 transition-all"
                 />
              </div>
           </div>
           <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 italic font-bold">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-slate-50 rounded-2xl animate-pulse" />)
              ) : filteredTickets.map((t) => (
                <button 
                  key={t.id}
                  onClick={() => {
                    setSelectedTicket(t);
                    fetchReplies(t.id);
                  }}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all duration-300 group",
                    selectedTicket?.id === t.id 
                      ? "bg-slate-900 border-slate-800 shadow-xl shadow-slate-900/10" 
                      : "bg-white border-slate-100 hover:border-brand-200 hover:bg-slate-50 shadow-sm"
                  )}
                >
                   <div className="flex justify-between items-start mb-2 group italic font-bold">
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest italic font-bold",
                        t.priority === 'Urgent' ? "bg-rose-100 text-rose-600" :
                        t.priority === 'High' ? "bg-brand-100 text-brand-600" :
                        "bg-slate-100 text-slate-500"
                      )}>
                        {t.priority}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 italic font-bold">{new Date(t.updated_at).toLocaleDateString()}</span>
                   </div>
                   <h4 className={cn(
                     "text-sm font-black tracking-tight leading-tight mb-1 uppercase tracking-tighter font-bold",
                     selectedTicket?.id === t.id ? "text-white" : "text-slate-800"
                   )}>{t.subject}</h4>
                   <p className={cn(
                     "text-[10px] font-bold uppercase tracking-tight italic font-bold",
                     selectedTicket?.id === t.id ? "text-slate-400 italic" : "text-slate-400 italic"
                   )}>{t.user_name} • <span className={t.status === 'Open' ? 'text-emerald-500' : 'text-slate-500'}>{t.status.toUpperCase()}</span></p>
                </button>
              ))}
           </div>
        </div>

        {/* Chat / Details */}
        <div className="lg:col-span-2 flex flex-col gap-6 font-bold italic">
           {selectedTicket ? (
             <>
               <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm flex flex-col flex-1 min-h-0 relative font-bold italic">
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100 italic font-bold">
                     <div className="flex items-center gap-4 italic font-bold">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-900/10">
                           <MessageSquare size={24} />
                        </div>
                        <div>
                           <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none italic font-bold uppercase tracking-tighter">{selectedTicket.subject}</h3>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic font-bold">Origin: {selectedTicket.user_name} ({selectedTicket.id})</p>
                        </div>
                     </div>
                     <div className="flex gap-2 font-bold italic font-bold">
                        {selectedTicket.status !== 'Closed' && (
                          <button 
                            onClick={() => handleClose(selectedTicket.id)}
                            className="px-6 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all font-bold italic"
                          >
                            Terminate Frequency
                          </button>
                        )}
                        <span className={cn(
                          "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border font-bold italic",
                          selectedTicket.status === 'Open' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                        )}>
                          {selectedTicket.status}
                        </span>
                     </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4 font-bold italic">
                     <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 group italic font-bold">
                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-2 italic font-bold leading-none">Transmission Decoded</p>
                        <p className="text-slate-700 font-medium leading-relaxed italic font-bold">{selectedTicket.description}</p>
                     </div>

                     <div className="relative font-bold italic">
                        <div className="absolute left-1/2 -translate-x-1/2 top-1 w-20 h-0.5 bg-slate-100 rounded-full" />
                        <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] py-8 italic font-bold">Sequence Logs</p>
                     </div>

                     {replies.map((reply, idx) => (
                       <div key={idx} className={cn(
                         "flex",
                         reply.user_role === 'admin' ? "justify-end" : "justify-start"
                       )}>
                          <div className={cn(
                            "max-w-[80%] p-6 rounded-[2rem] shadow-sm italic font-bold",
                            reply.user_role === 'admin' 
                              ? "bg-slate-900 text-white rounded-tr-none shadow-slate-900/10" 
                              : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                          )}>
                             <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50 italic font-bold">
                                {reply.user_name} • {new Date(reply.created_at).toLocaleTimeString()}
                             </p>
                             <p className="text-sm font-medium leading-relaxed italic font-bold uppercase tracking-tighter" >{reply.message}</p>
                          </div>
                       </div>
                     ))}
                  </div>

                  {selectedTicket.status !== 'Closed' && (
                    <form onSubmit={handleReply} className="mt-8 pt-6 border-t border-slate-100 flex gap-3 italic font-bold">
                       <input 
                         type="text" 
                         value={newReply}
                         onChange={(e) => setNewReply(e.target.value)}
                         placeholder="Synthesize response..."
                         className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all font-medium text-sm italic font-bold"
                       />
                       <button 
                         disabled={replyLoading || !newReply.trim()}
                         className="px-8 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                       >
                         {replyLoading ? <RefreshCw size={20} className="animate-spin" /> : <Send size={20} />}
                       </button>
                    </form>
                  )}
               </div>
             </>
           ) : (
             <div className="bg-white rounded-[2.5rem] border border-slate-200 border-dashed p-20 flex flex-col items-center justify-center text-center italic font-bold uppercase tracking-tighter ">
                <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2rem] flex items-center justify-center mb-8 italic font-bold uppercase tracking-tighter uppercase ">
                   <MessageSquare size={48} />
                </div>
                <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight italic font-bold uppercase tracking-tighter">No Active Frequency</h4>
                <p className="text-slate-500 font-medium italic mt-2 max-w-xs italic font-bold uppercase tracking-tighter">Select a distress signal from the buffer to establish a bilateral communication link.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
