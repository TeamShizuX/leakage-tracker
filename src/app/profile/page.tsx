'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, Save, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('10000');
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
        setBudgetLimit(data.budget_limit?.toString() || '10000');
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
          budget_limit: Number(budgetLimit),
          username: session.user.user_metadata?.full_name,
          avatar_url: session.user.user_metadata?.avatar_url
        });
        
      setProfile({ ...profile, whatsapp_number: whatsappNumber, budget_limit: Number(budgetLimit) });
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
          
          <form onSubmit={handleSave} className="w-full mt-8 space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">WhatsApp Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone size={16} className="text-gray-400" />
                </div>
                <input 
                  type="text" 
                  placeholder="e.g. 94764392015" 
                  className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Enter your number exactly as WhatsApp formats it without the + symbol. This links your messages to this dashboard.</p>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Monthly Budget Limit (Premium)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-bold">LKR</span>
                </div>
                <input 
                  type="number" 
                  placeholder="e.g. 15000" 
                  className="w-full bg-[#1A1A1A] border border-gray-800 rounded-xl pl-14 pr-4 py-3 focus:outline-none focus:border-red-500 transition-colors"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  disabled={!profile?.is_premium}
                />
              </div>
              {!profile?.is_premium && (
                <p className="text-xs text-orange-500 mt-2">Upgrade to Premium to set a custom budget limit.</p>
              )}
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
