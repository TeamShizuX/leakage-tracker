'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Flame, AlertCircle, TrendingDown, Coffee, ShoppingBag, Home, FileText, ArrowRight, User, Plus, Lock, Sparkles, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [roast, setRoast] = useState('');
  const [isRoasting, setIsRoasting] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [expenseText, setExpenseText] = useState('');
  const [addingExpense, setAddingExpense] = useState(false);
  const router = useRouter();
  
  const fetchTransactions = async (uid: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setTransactions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        if (profileData.whatsapp_number) {
          fetchTransactions(profileData.whatsapp_number);
        } else {
          setLoading(false); // No number to fetch transactions for
        }
      } else {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const handleRoast = async () => {
    setIsRoasting(true);
    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile?.whatsapp_number })
      });
      const data = await res.json();
      setRoast(data.roast);
    } catch (e) {
      setRoast('Failed to roast. You got lucky this time.');
    }
    setIsRoasting(false);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseText.trim() || !profile?.whatsapp_number) return;
    
    setAddingExpense(true);
    try {
      const res = await fetch('/api/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: expenseText, userId: profile.whatsapp_number })
      });
      
      if (res.ok) {
        setExpenseText('');
        fetchTransactions(profile.whatsapp_number); // Refresh data
      } else {
        alert('Failed to add expense');
      }
    } catch (error) {
      console.error(error);
    }
    setAddingExpense(false);
  };

  const currentMonthTransactions = transactions.filter(t => {
    const d = new Date(t.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const leakage = currentMonthTransactions
    .filter(t => t.is_unnecessary)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const necessary = currentMonthTransactions
    .filter(t => !t.is_unnecessary)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalSpent = currentMonthTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryData = currentMonthTransactions.reduce((acc: any[], t) => {
    const existing = acc.find((c) => c.name === t.category);
    if (existing) existing.value += Number(t.amount);
    else acc.push({ name: t.category, value: Number(t.amount) });
    return acc;
  }, []);
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

  const budgetLimit = profile?.budget_limit || 15000;
  const budgetPercent = Math.min((totalSpent / budgetLimit) * 100, 100);
  const isPremium = profile?.is_premium;

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'dining out': return <Coffee className="text-orange-400" />;
      case 'shopping': return <ShoppingBag className="text-pink-400" />;
      case 'groceries': return <Home className="text-green-400" />;
      default: return <FileText className="text-gray-400" />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#030303] text-white p-4 sm:p-6 md:p-12 font-sans selection:bg-orange-500/30 relative overflow-hidden flex flex-col justify-center">
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-orange-900/10 via-[#030303] to-[#030303] pointer-events-none -z-10"></div>
      
      {/* Massive Background Number */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-0 opacity-5 select-none overflow-hidden">
        <h1 className="text-[15rem] md:text-[30rem] font-black text-white leading-none tracking-tighter whitespace-nowrap">
          {totalSpent.toLocaleString()}
        </h1>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 w-full relative z-10">
        
        {/* Removed redundant header (logo & profile) */}

        {!loading && profile && !profile.whatsapp_number && (
          <div className="bg-orange-500/10 backdrop-blur-md border border-orange-500/30 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
            <div>
              <h3 className="text-orange-400 font-bold text-lg flex items-center gap-2"><AlertCircle size={20} /> Connect Your WhatsApp</h3>
              <p className="text-orange-200/70 text-sm mt-1">Link your phone number to start tracking your daily expenses natively via WhatsApp messages.</p>
            </div>
            <Link href="/profile" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-colors whitespace-nowrap shadow-lg shadow-orange-500/20">
              Link WhatsApp
            </Link>
          </div>
        )}

        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-32 bg-[#1A1A1A] rounded-xl"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-[#1A1A1A] rounded col-span-2"></div>
                  <div className="h-2 bg-[#1A1A1A] rounded col-span-1"></div>
                </div>
                <div className="h-2 bg-[#1A1A1A] rounded"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* Intro & Quick Add Section */}
            <div className="text-center max-w-4xl mx-auto pt-4">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                Stop wondering <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-400">where it went.</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
                Log expenses via WhatsApp or below. Our AI instantly categorizes your spending and calculates your unnecessary "leakage."
              </p>

              {profile?.whatsapp_number && (
                <form onSubmit={handleAddExpense} className="relative group max-w-2xl mx-auto w-full">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 to-orange-500/30 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                  <div className="relative flex flex-col sm:flex-row gap-2 bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
                    <input 
                      type="text" 
                      placeholder="Type naturally... e.g. 'I just bought a $5 coffee'" 
                      className="flex-1 bg-transparent px-3 sm:px-4 py-3 text-base sm:text-lg focus:outline-none placeholder-gray-500 text-white w-full"
                      value={expenseText}
                      onChange={(e) => setExpenseText(e.target.value)}
                      disabled={addingExpense}
                    />
                    <button 
                      type="submit" 
                      disabled={addingExpense || !expenseText.trim()}
                      className="bg-white text-black px-4 sm:px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      {addingExpense ? <span className="animate-pulse">Parsing AI...</span> : <><Plus size={20} /> Log</>}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Leakage Hero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#1A0A0A] to-[#0A0505] border border-red-900/20 rounded-[2rem] p-6 sm:p-8 shadow-2xl group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700 hidden sm:block">
                  <Flame size={120} />
                </div>
                <h2 className="text-red-500/80 font-bold tracking-widest text-xs uppercase mb-2">Total Financial Leakage</h2>
                <div className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tighter mb-4 break-words">
                  <span className="text-2xl sm:text-3xl text-red-500/50 mr-2 align-top">LKR</span>
                  {leakage.toLocaleString()}
                </div>
                <p className="text-red-200/50 max-w-md text-sm sm:text-base font-light leading-relaxed">
                  Money you literally set on fire this month by buying things you didn't need.
                </p>
              </div>

              <div className="col-span-1 flex flex-col gap-4">
                <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-[1.5rem] p-6 flex-1 flex flex-col justify-center hover:bg-white/10 transition-colors">
                   <h2 className="text-gray-400 font-bold tracking-widest text-[10px] uppercase mb-2">Total Spent</h2>
                   <div className="text-3xl font-bold text-white">
                     <span className="text-sm text-gray-500 mr-2 font-normal">LKR</span>
                     {totalSpent.toLocaleString()}
                   </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-[1.5rem] p-6 flex-1 flex flex-col justify-center hover:bg-white/10 transition-colors">
                   <h2 className="text-gray-400 font-bold tracking-widest text-[10px] uppercase mb-2">Necessary Spend</h2>
                   <div className="text-3xl font-bold text-white">
                     <span className="text-sm text-gray-500 mr-2 font-normal">LKR</span>
                     {necessary.toLocaleString()}
                   </div>
                </div>
                <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-[1.5rem] p-6 flex-1 flex flex-col justify-center relative group/card hover:bg-white/10 transition-all">
                   <Link href="/transactions" className="absolute inset-0 z-10"></Link>
                   <div className="flex justify-between items-start">
                     <h2 className="text-gray-400 font-bold tracking-widest text-[10px] uppercase mb-2">Transactions</h2>
                     <div className="bg-white/10 p-1.5 rounded-full group-hover/card:bg-white group-hover/card:text-black transition-colors">
                       <ArrowRight size={14} />
                     </div>
                   </div>
                   <div className="text-3xl font-bold text-white">
                     {currentMonthTransactions.length}
                   </div>
                </div>
              </div>
            </div>

            {/* Premium Features Section */}
            {isPremium ? (
              <div className="pt-8 px-2 sm:px-0">
                <Link href="/premium" className="block group">
                  <div className="bg-gradient-to-r from-orange-500/10 via-yellow-500/5 to-transparent border border-orange-500/20 rounded-[2rem] p-6 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:bg-orange-500/10 transition-all shadow-2xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-orange-500/20 rounded-xl">
                          <Sparkles size={24} className="text-orange-400" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white">Your Premium Hub</h3>
                      </div>
                      <p className="text-gray-400 text-sm sm:text-base max-w-xl">
                        Head over to your dedicated dashboard to access your live AI Financial Advisor, interactive visual analytics, and budget controls.
                      </p>
                    </div>
                    <div className="bg-white/10 group-hover:bg-white text-white group-hover:text-black p-4 rounded-full transition-colors flex-shrink-0">
                      <ArrowRight size={24} />
                    </div>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="pt-8 relative px-2 sm:px-0">
                <Link href="/premium" className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#030303]/60 backdrop-blur-md rounded-[2.5rem] border border-white/5 shadow-2xl p-6 hover:bg-[#030303]/50 transition-colors group">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-6 group-hover:scale-110 transition-transform">
                    <Lock size={32} className="text-black" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-center">Unlock Premium Insights</h3>
                  <p className="text-gray-400 mb-8 max-w-md text-center text-sm sm:text-base">Get visual category breakdowns, custom budget limits, and our AI-powered cost-cutting advisor.</p>
                  <div className="bg-white text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold group-hover:bg-gray-200 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/10 w-full sm:w-auto">
                    <Sparkles size={18} /> Upgrade with PayPal
                  </div>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10 opacity-40 pointer-events-none blur-[2px]">
                  {/* Visual Category Graphs */}
                  <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-3 bg-blue-500/10 rounded-xl"><PieChartIcon size={20} className="text-blue-500" /></div>
                      <h3 className="text-xl font-bold">Spending by Category</h3>
                    </div>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Budget Limit Tracker */}
                    <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-green-500/10 rounded-xl"><TrendingUp size={20} className="text-green-500" /></div>
                          <h3 className="text-xl font-bold">Monthly Budget</h3>
                        </div>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden mb-2">
                        <div 
                          className="h-4 rounded-full transition-all duration-1000 bg-orange-500"
                          style={{ width: '65%' }}
                        ></div>
                      </div>
                    </div>

                    {/* AI Cost Cut Advisor */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-[#0A0A0A] border border-purple-500/20 rounded-[2rem] p-8 flex-1 h-[calc(100%-150px)]">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-xl"><Sparkles size={20} className="text-purple-400" /></div>
                        <h3 className="text-xl font-bold text-purple-100">AI Advisor</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="p-4 bg-black/40 border border-purple-500/10 rounded-xl">
                          <p className="text-sm text-gray-300 leading-relaxed font-light">
                            <strong className="text-white">Actionable Insights:</strong> The AI automatically analyzes your spending patterns to identify areas of unnecessary leakage.
                          </p>
                        </div>
                        <div className="p-4 bg-black/40 border border-purple-500/10 rounded-xl">
                          <p className="text-sm text-gray-300 leading-relaxed font-light">
                            <strong className="text-white">Smart Recommendations:</strong> Receive personalized, specific tips on how to save money and stay under your custom budget limit.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
