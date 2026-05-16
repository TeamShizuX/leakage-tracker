'use client';

import { CheckCircle, Sparkles, Lock, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function PremiumPage() {
  const router = useRouter();

  const handleUpgrade = async () => {
    alert("PayPal Integration Coming Soon!");
    // Later we will integrate actual PayPal flow here
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#030303] text-white p-6 md:p-12 font-sans selection:bg-orange-500/30 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        
        <div className="text-center mb-16">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-6 shadow-2xl shadow-orange-500/20">
            <Sparkles size={40} className="text-black" />
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
            Upgrade to Premium
          </h1>
          <p className="text-gray-400 text-lg font-light max-w-xl mx-auto">
            Take full control of your finances. Unlock powerful AI insights, visual analytics, and unlimited access to the Leakage Tracker.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          
          {/* Free Tier */}
          <div className="bg-white/5 border border-white/5 rounded-[2rem] p-8 flex flex-col opacity-70">
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
            <button disabled className="w-full bg-white/5 text-gray-500 font-bold py-4 rounded-xl cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* Premium Tier */}
          <div className="bg-gradient-to-b from-orange-500/10 to-yellow-500/5 border border-orange-500/30 rounded-[2rem] p-8 flex flex-col relative shadow-2xl shadow-orange-500/10 scale-105">
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
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
            <button 
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-extrabold py-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
            >
              <TrendingUp size={20} /> Upgrade with PayPal
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
