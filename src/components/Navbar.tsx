'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Flame, User, FlameIcon, Sparkles, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        const { data } = await supabase
          .from('profiles')
          .select('is_admin, is_premium')
          .eq('id', session.user.id)
          .single();
        if (data) {
          setIsAdmin(data.is_admin);
          setProfile(data);
        }
      }
    }
    loadData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) loadData();
      else {
        setIsAdmin(false);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session || pathname === '/login') return null;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={18} /> },
    { name: 'Transactions', path: '/transactions', icon: <List size={18} /> },
    { name: 'Roast Me', path: '/roast', icon: <FlameIcon size={18} /> },
    { name: 'Profile', path: '/profile', icon: <User size={18} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#030303]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <Flame size={16} className="text-white" />
          </div>
          <span className="font-bold text-white tracking-wide">Leakage</span>
          {profile?.is_premium && (
            <span className="ml-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Pro</span>
          )}
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-2 px-2.5 sm:px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-white/10 text-white' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.name}</span>
              </Link>
            );
          })}
          
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-2 px-3 sm:px-4 py-2 ml-1 rounded-full text-sm font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all border border-red-500/20">
              <ShieldAlert size={16} />
              <span className="hidden md:inline">Admin</span>
            </Link>
          )}

          <Link href="/premium" className="flex items-center gap-2 px-3 sm:px-4 py-2 ml-1 rounded-full text-sm font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/20">
            <Sparkles size={16} />
            <span className="hidden md:inline">Premium</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
