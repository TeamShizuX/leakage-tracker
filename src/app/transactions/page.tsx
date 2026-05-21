'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { AlertCircle, Coffee, ShoppingBag, Home, FileText, ArrowLeft, Calendar, Trash2, Edit2, Check, X } from 'lucide-react';
import Link from 'next/link';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ item: '', amount: '' });

  const fetchTransactions = async (uid: string) => {
    setLoading(true);
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (startDate) {
      query = query.gte('created_at', new Date(startDate).toISOString());
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query = query.lte('created_at', end.toISOString());
    }

    const { data, error } = await query;
    if (error) console.error(error);
    else setTransactions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (data) {
          setProfile(data);
          if (data.whatsapp_number) {
            fetchTransactions(data.whatsapp_number);
          } else {
            setLoading(false);
          }
        }
      } else {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (profile?.whatsapp_number) {
      fetchTransactions(profile.whatsapp_number);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    await supabase.from('transactions').delete().eq('id', id);
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const startEdit = (t: any) => {
    setEditingId(t.id);
    setEditForm({ item: t.item, amount: t.amount.toString() });
  };

  const saveEdit = async (id: string) => {
    const amountNum = Number(editForm.amount);
    if (!editForm.item || isNaN(amountNum)) return;

    await supabase
      .from('transactions')
      .update({ item: editForm.item, amount: amountNum })
      .eq('id', id);

    setTransactions(transactions.map(t => 
      t.id === id ? { ...t, item: editForm.item, amount: amountNum } : t
    ));
    setEditingId(null);
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'dining out': return <Coffee className="text-orange-400" />;
      case 'shopping': return <ShoppingBag className="text-pink-400" />;
      case 'groceries': return <Home className="text-green-400" />;
      default: return <FileText className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 sm:p-6 md:p-12 font-sans selection:bg-purple-500/30">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href="/" className="p-2 bg-[#1A1A1A] hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">All Transactions</h1>
        </div>

        <form onSubmit={handleSearch} className="bg-[#111] border border-gray-800 rounded-2xl p-4 sm:p-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Start Date</label>
            <input 
              type="date" 
              className="w-full bg-[#1A1A1A] border border-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors [color-scheme:dark]"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">End Date</label>
            <input 
              type="date" 
              className="w-full bg-[#1A1A1A] border border-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-red-500 transition-colors [color-scheme:dark]"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-white text-black px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-200 transition-colors h-[38px]">
            Filter
          </button>
        </form>

        <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse flex flex-col items-center">
              <Calendar className="mb-4 opacity-50" size={32} />
              <p>Loading transactions...</p>
            </div>
          ) : !profile?.whatsapp_number ? (
            <div className="p-12 text-center text-orange-500">
              Please link your WhatsApp number in your profile to see transactions.
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No transactions found for this period.</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {transactions.map((t) => (
                <div key={t.id} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between hover:bg-[#151515] transition-colors group gap-4 sm:gap-0">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-900 flex-shrink-0 flex items-center justify-center">
                      {getCategoryIcon(t.category)}
                    </div>
                    {editingId === t.id ? (
                      <div className="flex-1 flex gap-2">
                        <input 
                          className="bg-[#222] border border-gray-700 rounded px-2 py-1 text-sm text-white w-full max-w-[200px]"
                          value={editForm.item}
                          onChange={(e) => setEditForm({...editForm, item: e.target.value})}
                        />
                      </div>
                    ) : (
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-200 text-base sm:text-lg truncate">{t.item}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{format(new Date(t.created_at), 'MMM d, yyyy • h:mm a')} • {t.category}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 ml-13 sm:ml-0 pl-13 sm:pl-0">
                    <div className="flex flex-col items-start sm:items-end">
                      {editingId === t.id ? (
                        <div className="flex items-center gap-1">
                          <input 
                            type="number"
                            className="bg-[#222] border border-gray-700 rounded px-2 py-1 text-sm text-white w-20 sm:w-24 text-right"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                          />
                          <span className="text-gray-500 text-xs sm:text-sm">LKR</span>
                        </div>
                      ) : (
                        <p className="font-bold text-gray-200 text-lg sm:text-xl">{t.amount} <span className="text-sm font-normal text-gray-400">{t.currency}</span></p>
                      )}
                      
                      {!editingId && t.is_unnecessary ? (
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-wider bg-red-950/50 text-red-400 px-2 py-1 rounded-full mt-1 font-semibold">
                          <AlertCircle size={10} /> Unnecessary
                        </span>
                      ) : !editingId && (
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] uppercase tracking-wider bg-green-950/50 text-green-400 px-2 py-1 rounded-full mt-1 font-semibold">
                          Essential
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {editingId === t.id ? (
                        <>
                          <button onClick={() => saveEdit(t.id)} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors">
                            <Check size={16} />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors">
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(t)} className="p-2 bg-[#222] text-gray-400 rounded-lg hover:text-white transition-colors">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(t.id)} className="p-2 bg-[#222] text-red-500/70 rounded-lg hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
