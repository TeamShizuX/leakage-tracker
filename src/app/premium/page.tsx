'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Sparkles, Lock, TrendingUp, Loader2, PieChart as PieChartIcon, MessageCircle, X, Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

declare global {
  interface Window {
    paypal: any;
  }
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

export default function PremiumPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sdkReady, setSdkReady] = useState(false);
  
  // Premium Hub State
  const [transactions, setTransactions] = useState<any[]>([]);
  const [fetchingData, setFetchingData] = useState(false);
  
  // Chat Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Hello! I'm your Premium AI Advisor. Ask me anything about your spending or savings goals!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const getUserId = (profileData: any = user) => {
    if (!profileData) return null;
    if (profileData.whatsapp_number) return profileData.whatsapp_number;
    if (profileData.telegram_chat_id) return `tg_${profileData.telegram_chat_id}`;
    return null;
  };

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      setUser({ ...session.user, ...profile });
      setLoading(false);

      if (profile?.is_premium) {
        const uid = getUserId(profile);
        if (uid) {
          fetchTransactions(uid);
        }
      }
    }
    checkUser();
  }, [router]);

  const fetchTransactions = async (uid: string) => {
    setFetchingData(true);
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString();

    const [txResponse] = await Promise.all([
      supabase
        .from('transactions')
        .select('*')
        .eq('user_id', uid)
        .gte('created_at', sixMonthsAgo)
        .order('created_at', { ascending: false })
    ]);

    setTransactions(txResponse.data || []);
    setFetchingData(false);
  };

  const handleSubscriptionSuccess = async (subscriptionID: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', user.id);

      if (error) throw error;

      alert(`Success! Your subscription (${subscriptionID}) is active. You are now a Premium user!`);
      // Update local state to immediately show premium hub
      setUser({ ...user, is_premium: true });
      const uid = getUserId({ ...user, is_premium: true });
      if (uid) {
        fetchTransactions(uid);
      }
    } catch (error) {
      console.error('Error updating premium status:', error);
      alert('Payment successful but failed to update profile. Please contact support.');
    }
  };

  const renderPaypalButtons = () => {
    if (window.paypal && user && !user.is_premium) {
      const container = document.getElementById('paypal-button-container');
      if (container) container.innerHTML = '';

      window.paypal.Buttons({
        style: {
          shape: 'pill',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(data: any, actions: any) {
          return actions.subscription.create({
            plan_id: 'P-6J490626VK948851YNIHLVYY'
          });
        },
        onApprove: function(data: any, actions: any) {
          handleSubscriptionSuccess(data.subscriptionID);
        }
      }).render('#paypal-button-container');
    }
  };

  useEffect(() => {
    if (sdkReady && user && !user.is_premium) {
      renderPaypalButtons();
    }
  }, [sdkReady, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user?.whatsapp_number) return;
    
    const newMessages = [...chatMessages, { role: 'user' as const, text: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput, userId: getUserId() })
      });
      const data = await res.json();
      setChatMessages([...newMessages, { role: 'ai', text: data.response || "Sorry, I encountered an error." }]);
    } catch (error) {
      setChatMessages([...newMessages, { role: 'ai', text: "Failed to connect to the AI Advisor." }]);
    }
    setIsSending(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  // Calculate Premium Hub Metrics
  const currentMonthTx = transactions.filter(t => {
    const d = new Date(t.created_at);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  });

  const totalSpent = currentMonthTx.reduce((sum, t) => sum + Number(t.amount), 0);
  
  const budgetLimit = user?.budget_limit || 15000;
  const budgetPercent = Math.min((totalSpent / budgetLimit) * 100, 100);
  
  const savingsGoal = user?.savings_goal || 0;
  const savingsPercent = savingsGoal > 0 ? Math.min((Math.max(budgetLimit - totalSpent, 0) / savingsGoal) * 100, 100) : 0;
  
  const categoryData = currentMonthTx.reduce((acc: any[], t) => {
    const existing = acc.find((c) => c.name === t.category);
    if (existing) existing.value += Number(t.amount);
    else acc.push({ name: t.category, value: Number(t.amount) });
    return acc;
  }, []);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const historicalData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.getMonth();
    const year = d.getFullYear();
    
    const monthTx = transactions.filter(t => {
      const td = new Date(t.created_at);
      return td.getMonth() === month && td.getFullYear() === year;
    });
    
    return {
      name: monthNames[month],
      Expense: monthTx.reduce((sum, t) => sum + Number(t.amount), 0)
    };
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#030303] text-white p-4 sm:p-6 md:p-12 font-sans selection:bg-orange-500/30">
      
      {!user?.is_premium && (
        <Script 
          src="https://www.paypal.com/sdk/js?client-id=AeJkAm7G2tiz14Z0zgArous6hK5ZUBmt1JW5bK1a0E4Tzl5FvnN8rUnz-ZfOsRNjWyQi0ceQPM0Bfff8&vault=true&intent=subscription" 
          onLoad={() => setSdkReady(true)}
        />
      )}

      {user?.is_premium ? (
        // ================= PREMIUM HUB UI =================
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles size={24} className="text-black" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">Premium Hub</h1>
              <p className="text-gray-400 text-sm">Advanced visual analytics and AI financial advice.</p>
            </div>
          </div>

          {fetchingData ? (
            <div className="flex justify-center p-12"><Loader2 className="animate-spin text-orange-500" size={32} /></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="space-y-8 flex flex-col">
                {/* Visual Category Graphs */}
                <div className="bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30"><PieChartIcon size={20} className="text-blue-400" /></div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">Monthly Spending</h3>
                  </div>
                  
                  {categoryData.length > 0 ? (
                    <>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value" stroke="none">
                              {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ backgroundColor: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                              itemStyle={{ color: '#fff' }} 
                              formatter={(value: any) => `LKR ${Number(value).toLocaleString()}`}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-6 justify-center">
                        {categoryData.map((c, i) => (
                          <div key={c.name} className="flex items-center gap-2 text-xs font-semibold text-gray-300 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                            <div className="w-2 h-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                            {c.name}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-gray-500 text-sm text-center">
                      No transactions found this month. <br/>Start logging to see your charts!
                    </div>
                  )}
                </div>

                {/* Budget Limit Tracker */}
                <div className="bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30"><TrendingUp size={20} className="text-green-400" /></div>
                      <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">Monthly Budget</h3>
                    </div>
                    <span className="text-sm font-bold text-gray-400">{totalSpent.toLocaleString()} / {budgetLimit.toLocaleString()} LKR</span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-4 overflow-hidden mb-3 border border-white/5 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${budgetPercent > 90 ? 'bg-gradient-to-r from-red-600 to-red-400' : budgetPercent > 70 ? 'bg-gradient-to-r from-orange-600 to-orange-400' : 'bg-gradient-to-r from-green-600 to-emerald-400'}`}
                      style={{ width: `${budgetPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-gray-500">0%</span>
                    <span className={budgetPercent >= 100 ? "text-red-400 font-bold drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]" : "text-gray-400"}>
                      {budgetPercent >= 100 ? "You're over budget!" : `${(100 - budgetPercent).toFixed(1)}% remaining`}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-8 flex flex-col">
                {/* 6-Month Historical Graph */}
                <div className="bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 rounded-xl border border-orange-500/30"><TrendingUp size={20} className="text-orange-400" /></div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">Spending History</h3>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          contentStyle={{ backgroundColor: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', color: '#fff', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                          itemStyle={{ color: '#fff' }}
                          formatter={(value: any) => `LKR ${Number(value).toLocaleString()}`}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                        <Bar dataKey="Expense" fill="url(#colorExpense)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                        <defs>
                          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#fb7185" stopOpacity={1}/>
                            <stop offset="95%" stopColor="#e11d48" stopOpacity={1}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Savings Goal Tracker */}
                <div className="bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30"><Sparkles size={20} className="text-cyan-400" /></div>
                      <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">Savings Goal</h3>
                    </div>
                    <span className="text-sm font-bold text-gray-400">{Math.max(budgetLimit - totalSpent, 0).toLocaleString()} / {savingsGoal.toLocaleString()} LKR</span>
                  </div>
                  <div className="w-full bg-black/50 rounded-full h-4 overflow-hidden mb-3 border border-white/5 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-500`}
                      style={{ width: `${savingsPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-gray-500">0%</span>
                    <span className={savingsPercent >= 100 ? "text-cyan-400 font-bold drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" : "text-gray-400"}>
                      {savingsPercent >= 100 ? "Goal Crushed! 🎉" : `${(100 - savingsPercent).toFixed(1)}% to go`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FLOATING AI CHAT WIDGET */}
          <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end">
            {/* Chat Window */}
            <div className={`transition-all duration-300 origin-bottom-right ${isChatOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 h-0 w-0 overflow-hidden'}`}>
              <div className="bg-[#1A1A1A]/90 backdrop-blur-2xl border border-purple-500/30 rounded-3xl w-[320px] sm:w-[380px] h-[500px] shadow-[0_0_40px_rgba(168,85,247,0.2)] flex flex-col overflow-hidden">
                {/* Chat Header */}
                <div className="bg-gradient-to-r from-purple-900/50 to-[#1A1A1A] border-b border-purple-500/20 p-4 flex justify-between items-center relative overflow-hidden">
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-purple-500/20 rounded-full border border-purple-500/50 relative">
                      <Sparkles size={18} className="text-purple-300" />
                      <span className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(74,222,128,1)]"></span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">AI Advisor</h3>
                      <p className="text-[10px] text-purple-300 font-medium">Premium Access</p>
                    </div>
                  </div>
                  <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white transition-colors relative z-10 bg-black/20 p-1.5 rounded-full">
                    <X size={18} />
                  </button>
                </div>
                
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-black/20">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none shadow-[0_4px_15px_rgba(147,51,234,0.3)]' : 'bg-white/10 text-gray-200 rounded-bl-none border border-white/5'}`}>
                        {msg.text.split('\n').map((line, j) => (
                          <p key={j} className={j > 0 ? "mt-2" : ""}>
                            {line.split(/(\*\*.*?\*\*)/g).map((part, k) => {
                              if (part.startsWith('**') && part.endsWith('**')) {
                                return <strong key={k} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                              }
                              return part;
                            })}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 rounded-2xl rounded-bl-none p-3 px-4 border border-white/5 flex gap-1 items-center h-[40px]">
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-black/40 backdrop-blur-md">
                  <div className="relative flex items-center">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Ask for financial advice..." 
                      className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                      disabled={isSending}
                    />
                    <button 
                      type="submit" 
                      disabled={isSending || !chatInput.trim()}
                      className="absolute right-1.5 p-2 bg-purple-600 rounded-full text-white hover:bg-purple-500 transition-colors disabled:opacity-50"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            {/* FAB Button */}
            {!isChatOpen && (
              <button 
                onClick={() => setIsChatOpen(true)}
                className="group relative p-4 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:shadow-[0_0_40px_rgba(147,51,234,0.8)] transition-all hover:scale-110"
              >
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-75"></div>
                <MessageCircle size={28} className="text-white relative z-10 group-hover:rotate-12 transition-transform" />
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#030303]">1</div>
              </button>
            )}
          </div>
        </div>

      ) : (
        // ================= UPGRADE UI (FREE USERS) =================
        <div className="max-w-4xl w-full mx-auto flex flex-col items-center justify-center">
          
          <div className="text-center mb-16">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/20">
              <Sparkles size={40} className="text-black" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500 px-4">
              Upgrade to Premium
            </h1>
            <p className="text-gray-400 text-base sm:text-lg font-light max-w-xl mx-auto px-4">
              Take full control of your finances. Unlock powerful AI insights, visual analytics, and unlimited access to the Leakage Tracker.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto w-full">
            
            {/* Free Tier */}
            <div className="bg-white/5 border border-white/5 rounded-[2rem] p-6 sm:p-8 flex flex-col opacity-70">
              <h3 className="text-2xl font-bold mb-2">Free Plan</h3>
              <div className="text-4xl font-black mb-6">$0<span className="text-lg font-normal text-gray-500">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-gray-400"><CheckCircle size={18} className="text-green-500" /> WhatsApp Logging</li>
                <li className="flex items-center gap-3 text-gray-400"><CheckCircle size={18} className="text-green-500" /> Leakage Calculation</li>
                <li className="flex items-center gap-3 text-gray-400"><CheckCircle size={18} className="text-green-500" /> 3 AI Roasts / Day</li>
                <li className="flex items-center gap-3 text-gray-600"><Lock size={18} /> Visual Analytics</li>
                <li className="flex items-center gap-3 text-gray-600"><Lock size={18} /> Custom Budget Limits</li>
                <li className="flex items-center gap-3 text-gray-600"><Lock size={18} /> AI Cost-Cutting Advisor</li>
              </ul>
              <div className="mt-auto pt-6 text-center text-xs font-bold uppercase tracking-widest text-gray-600">
                Current Plan
              </div>
            </div>

            {/* Premium Tier */}
            <div className="bg-gradient-to-b from-orange-500/10 to-yellow-500/5 border border-orange-500/30 rounded-[2rem] p-6 sm:p-8 flex flex-col relative shadow-2xl transition-all sm:scale-105">
              <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2 text-orange-400">Premium</h3>
              <div className="text-4xl font-black mb-6">$4.99<span className="text-lg font-normal text-gray-500">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-white"><CheckCircle size={18} className="text-orange-500" /> Everything in Free</li>
                <li className="flex items-center gap-3 text-white"><CheckCircle size={18} className="text-orange-500" /> Unlimited AI Roasts</li>
                <li className="flex items-center gap-3 text-white"><CheckCircle size={18} className="text-orange-500" /> Interactive Category Graphs</li>
                <li className="flex items-center gap-3 text-white"><CheckCircle size={18} className="text-orange-500" /> Set Custom Budget Limits</li>
                <li className="flex items-center gap-3 text-white"><CheckCircle size={18} className="text-orange-500" /> AI Cost-Cutting Advisor</li>
              </ul>

              <div id="paypal-button-container" className="mt-auto"></div>
              {!sdkReady && (
                <div className="flex items-center justify-center py-4 text-orange-500/50 text-sm animate-pulse">
                  Loading Secure Payment...
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
