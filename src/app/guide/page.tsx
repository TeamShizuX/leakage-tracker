'use client';

import { CheckCircle, MessageCircle, Send, Sparkles, TrendingDown, Lock, Zap, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#030303] text-white pt-8 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(239,68,68,0.3)]">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">How it Works</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Your personal AI expense tracker directly inside WhatsApp and Telegram. Zero apps to download. Zero spreadsheets to maintain.
          </p>
        </div>

        {/* Setup Section */}
        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-red-500/20"></div>
          
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-sm">1</span>
            Getting Started
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">WhatsApp Setup</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Message our verified WhatsApp bot. It will securely link to your account using your phone number automatically.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Send className="text-blue-500" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Telegram Setup</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Head to your <Link href="/profile" className="text-blue-400 hover:underline">Profile</Link> to connect your Telegram account by messaging our official bot: <a href="https://t.me/Leakage777bot" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-bold">@Leakage777bot</a>.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-black/50 border border-white/5 rounded-2xl p-6 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-4">Go to your profile to see connection details</p>
                <Link href="/profile" className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors">
                  View Connect Settings
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Install App Section (PWA) */}
        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-blue-500/20"></div>
          
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-sm">2</span>
            Install the App (Optional)
          </h2>

          <div className="space-y-6">
            <p className="text-gray-400">
              Leakage Tracker works entirely in your browser, but you can install it to your home screen to use it like a native app!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone size={20} className="text-gray-300" />
                  <h3 className="font-bold text-lg">iOS (iPhone)</h3>
                </div>
                <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
                  <li>Open Safari and navigate to Leakage Tracker.</li>
                  <li>Tap the <strong>Share</strong> button at the bottom of the screen.</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                  <li>Tap <strong>"Add"</strong> in the top right corner.</li>
                </ol>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Smartphone size={20} className="text-gray-300" />
                  <h3 className="font-bold text-lg">Android</h3>
                </div>
                <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
                  <li>Open Chrome and navigate to Leakage Tracker.</li>
                  <li>Tap the <strong>three dots menu (⋮)</strong> in the top right corner.</li>
                  <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Follow the on-screen prompt to add it.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Logging Expenses Section */}
        <div className="bg-white/5 border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-orange-500/20"></div>
          
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center text-sm">3</span>
            Logging Expenses
          </h2>

          <div className="space-y-6">
            <p className="text-gray-400">
              No need for strict formats. Just type to the bot naturally as if you were talking to a friend. Our AI will automatically categorize it and determine if it was a "necessary" expense or "financial leakage" (wasted money).
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">You Type</p>
                <p className="text-white text-lg font-medium">"Pizza 2500"</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
                <p className="text-xs text-red-400 uppercase tracking-widest mb-2 font-bold">AI Response</p>
                <p className="text-red-200 text-sm">Logged! Food & Dining: 2500 LKR.<br/>⚠️ Marked as Unnecessary (Leakage)</p>
              </div>
              
              <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">You Type</p>
                <p className="text-white text-lg font-medium">"Paid the electricity bill 8500"</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
                <p className="text-xs text-green-400 uppercase tracking-widest mb-2 font-bold">AI Response</p>
                <p className="text-green-200 text-sm">Logged! Utilities: 8500 LKR.<br/>✅ Marked as Need</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing / Features Section */}
        <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/5 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4">Choose Your Plan</h2>
            <p className="text-gray-400">Start for free, upgrade when you need deep financial insights.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="bg-black/40 border border-white/5 rounded-2xl p-6 sm:p-8 flex flex-col">
              <h3 className="text-xl font-bold text-gray-300 mb-2">Free Plan</h3>
              <div className="text-3xl font-black mb-6">$0<span className="text-sm font-normal text-gray-500">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1 text-sm">
                <li className="flex items-center gap-3 text-gray-400"><CheckCircle size={16} className="text-green-500" /> Auto-categorize expenses</li>
                <li className="flex items-center gap-3 text-gray-400"><CheckCircle size={16} className="text-green-500" /> WhatsApp & Telegram access</li>
                <li className="flex items-center gap-3 text-gray-400"><CheckCircle size={16} className="text-green-500" /> Basic leakage tracking</li>
                <li className="flex items-center gap-3 text-gray-600"><Lock size={16} /> Advanced Analytics</li>
                <li className="flex items-center gap-3 text-gray-600"><Lock size={16} /> Interactive AI Advisor</li>
              </ul>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-b from-orange-500/10 to-yellow-500/5 border border-orange-500/30 rounded-2xl p-6 sm:p-8 flex flex-col relative">
              <div className="absolute top-0 right-6 transform -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                Pro
              </div>
              <h3 className="text-xl font-bold text-orange-400 mb-2">Premium</h3>
              <div className="text-3xl font-black mb-6">$2.99<span className="text-sm font-normal text-gray-500">/mo</span></div>
              <ul className="space-y-4 mb-8 flex-1 text-sm">
                <li className="flex items-center gap-3 text-white"><CheckCircle size={16} className="text-orange-500" /> Everything in Free</li>
                <li className="flex items-center gap-3 text-white"><Zap size={16} className="text-orange-500" /> Unlimited AI Roasts</li>
                <li className="flex items-center gap-3 text-white"><TrendingDown size={16} className="text-orange-500" /> Visual Expense Analytics</li>
                <li className="flex items-center gap-3 text-white"><Sparkles size={16} className="text-orange-500" /> 24/7 AI Financial Advisor Chat</li>
              </ul>
              <Link href="/premium" className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold text-center hover:opacity-90 transition-opacity">
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
