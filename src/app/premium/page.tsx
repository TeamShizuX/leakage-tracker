'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Sparkles, Lock, TrendingUp, Loader2, PieChart as PieChartIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [advice, setAdvice] = useState<string>('');
  const [isAdvising, setIsAdvising] = useState(false);

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

      if (profile?.is_premium && profile?.whatsapp_number) {
        fetchTransactions(profile.whatsapp_number);
      }
    }
    checkUser();
  }, [router]);

  const fetchTransactions = async (uid: string) => {
    setFetchingData(true);
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', uid)
      .gte('created_at', firstDayOfMonth)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTransactions(data);
    }
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
      if (user.whatsapp_number) {
        fetchTransactions(user.whatsapp_number);
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

  const handleGetAdvice = async () => {
    if (!user?.whatsapp_number) return;
    setIsAdvising(true);
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.whatsapp_number,
          budgetLimit: user.budget_limit || 15000
        })
      });
      const data = await res.json();
      setAdvice(data.advice || "No advice available at this time.");
    } catch (error) {
      setAdvice("Failed to generate advice. The AI must be taking a coffee break.");
    }
    setIsAdvising(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  // Calculate Premium Hub Metrics
  const totalSpent = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const budgetLimit = user?.budget_limit || 15000;
  const budgetPercent = Math.min((totalSpent / budgetLimit) * 100, 100);
  
  const categoryData = transactions.reduce((acc: any[], t) => {
    const existing = acc.find((c) => c.name === t.category);
    if (existing) existing.value += Number(t.amount);
    else acc.push({ name: t.category, value: Number(t.amount) });
    return acc;
  }, []);

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
              
              {/* Visual Category Graphs */}
              <div className="bg-[#111] border border-gray-800 rounded-[2rem] p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-blue-500/10 rounded-xl"><PieChartIcon size={20} className="text-blue-500" /></div>
                  <h3 className="text-xl font-bold">Monthly Spending by Category</h3>
                </div>
                
                {categoryData.length > 0 ? (
                  <>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={5} dataKey="value">
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', borderRadius: '1rem', color: '#fff' }}
                            itemStyle={{ color: '#fff' }} 
                            formatter={(value: number) => `LKR ${value.toLocaleString()}`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-6 justify-center">
                      {categoryData.map((c, i) => (
                        <div key={c.name} className="flex items-center gap-2 text-xs font-semibold text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-gray-800">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
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

              <div className="space-y-8 flex flex-col">
                {/* Budget Limit Tracker */}
                <div className="bg-[#111] border border-gray-800 rounded-[2rem] p-6 sm:p-8 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-500/10 rounded-xl"><TrendingUp size={20} className="text-green-500" /></div>
                      <h3 className="text-xl font-bold">Monthly Budget</h3>
                    </div>
                    <span className="text-sm font-bold text-gray-400">{totalSpent.toLocaleString()} / {budgetLimit.toLocaleString()} LKR</span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-4 overflow-hidden mb-3 border border-gray-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${budgetPercent > 90 ? 'bg-red-500' : budgetPercent > 70 ? 'bg-orange-500' : 'bg-green-500'}`}
                      style={{ width: `${budgetPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span className="text-gray-500">0%</span>
                    <span className={budgetPercent >= 100 ? "text-red-500 font-bold" : "text-gray-400"}>
                      {budgetPercent >= 100 ? "You're over budget!" : `${(100 - budgetPercent).toFixed(1)}% remaining`}
                    </span>
                  </div>
                </div>

                {/* AI Cost Cut Advisor */}
                <div className="bg-gradient-to-br from-purple-900/20 to-[#0A0A0A] border border-purple-500/20 rounded-[2rem] p-6 sm:p-8 flex-1 shadow-2xl relative overflow-hidden flex flex-col min-h-[400px]">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Sparkles size={100} className="text-purple-500" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-500/20 rounded-xl"><Sparkles size={20} className="text-purple-400" /></div>
                      <h3 className="text-xl font-bold text-purple-100">AI Financial Advisor</h3>
                    </div>
                    <button 
                      onClick={handleGetAdvice}
                      disabled={isAdvising || transactions.length === 0}
                      className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isAdvising ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : 'Advise Me'}
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 relative z-10">
                    {advice ? (
                      <div className="p-5 bg-black/60 backdrop-blur-md border border-purple-500/20 rounded-2xl text-sm text-purple-50 leading-relaxed">
                        {advice.split('\n').map((line, i) => {
                          const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
                          let contentStr = isBullet ? line.trim().substring(2) : line;
                          
                          // Parse **bold** text
                          const parts = contentStr.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={j} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          });

                          if (isBullet) {
                            return <li key={i} className="mb-2 ml-4 list-disc marker:text-purple-500">{parts}</li>;
                          }
                          // Only render paragraph if it's not empty
                          return line.trim() ? <p key={i} className="mb-3">{parts}</p> : null;
                        })}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-purple-300/50">
                        <Sparkles size={32} className="mb-4 opacity-50" />
                        <p className="text-sm max-w-xs">Click "Advise Me" to have our AI analyze your monthly spending patterns and suggest ways to save money.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
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
