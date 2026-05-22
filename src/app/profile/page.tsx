'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, Save, LogOut, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('10000');
  const [savingsGoal, setSavingsGoal] = useState('0');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setProfile(data);
        setWhatsappNumber(data.whatsapp_number || '');
        setTelegramChatId(data.telegram_chat_id || '');
        setBudgetLimit(data.budget_limit?.toString() || '10000');
        setSavingsGoal(data.savings_goal?.toString() || '0');
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      await supabase
        .from('profiles')
        .upsert({ 
          id: session.user.id, 
          whatsapp_number: whatsappNumber,
          telegram_chat_id: telegramChatId,
          budget_limit: Number(budgetLimit),
          savings_goal: Number(savingsGoal),
          username: session.user.user_metadata?.full_name,
          avatar_url: session.user.user_metadata?.avatar_url
        });
        
      setProfile({ ...profile, whatsapp_number: whatsappNumber, telegram_chat_id: telegramChatId, budget_limit: Number(budgetLimit), savings_goal: Number(savingsGoal) });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center"><div className="animate-pulse w-8 h-8 bg-red-500 rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-12 font-sans selection:bg-purple-500/30">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 bg-[#1A1A1A] hover:bg-gray-800 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight">Your Profile</h1>
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 flex items-center gap-2 text-sm font-semibold transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-3xl p-8 flex flex-col items-center">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full mb-4 border-2 border-red-500" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-800 mb-4 flex items-center justify-center">
              <User size={40} className="text-gray-400" />
            </div>
          )}
          <h2 className="text-2xl font-bold">{profile?.username || 'User'}</h2>
          
          <form onSubmit={handleSave} className="w-full mt-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">WhatsApp Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone size={16} className="text-green-500" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="e.g. 94764392015" 
                    className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Enter your number as WhatsApp formats it (no + symbol).</p>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Telegram Chat ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MessageCircle size={16} className="text-blue-500" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="e.g. 8248070719" 
                    className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Message the bot with <b>/id</b> on Telegram to get this number.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Monthly Budget Limit</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-bold">LKR</span>
                </div>
                <input 
                  type="number" 
                  placeholder="e.g. 15000" 
                  className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl pl-14 pr-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Monthly Savings Goal</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-bold">LKR</span>
                </div>
                <input 
                  type="number" 
                  placeholder="e.g. 50000" 
                  className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl pl-14 pr-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-white hover:bg-gray-200 text-black font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? 'Saving...' : <><Save size={18} /> Save Profile</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
