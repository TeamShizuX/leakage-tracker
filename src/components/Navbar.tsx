'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, List, Flame, User, FlameIcon, Sparkles, ShieldAlert, BookOpen, Gamepad2 } from 'lucide-react';
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
    { name: 'Games', path: '/game', icon: <Gamepad2 size={18} /> },
    { name: 'Guide', path: '/guide', icon: <BookOpen size={18} /> },
    { name: 'Transactions', path: '/transactions', icon: <List size={18} /> },
    { name: 'Roast Me', path: '/roast', icon: <FlameIcon size={18} /> },
    { name: 'Profile', path: '/profile', icon: <User size={18} /> },
  ];

  return (
    <>
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

        <div className="flex items-center gap-1 md:gap-2">
          <div className="hidden sm:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-white/10 text-white' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
          
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

    {/* Mobile Bottom Navigation - Apple Liquid Glass Style */}
    <div className="sm:hidden fixed bottom-6 left-4 right-4 z-50 flex justify-center pb-safe">
      <nav className="w-full max-w-md bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] rounded-full overflow-hidden">
        <div className="flex items-center justify-around h-16 px-2">
           {navItems.map((item) => {
               const isActive = pathname === item.path;
               return (
                 <Link 
                   key={item.path} 
                   href={item.path}
                   className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-300 ${
                     isActive ? 'text-white scale-110' : 'text-white/60 hover:text-white/90'
                   }`}
                 >
                   <div className={`${isActive ? 'bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-orange-500/30 p-2 rounded-full text-white' : 'p-1.5'}`}>
                     {item.icon}
                   </div>
                   {/* Hide text for a cleaner dock look, or keep it extremely subtle */}
                   {/* <span className="text-[10px] font-medium leading-none">{item.name}</span> */}
                 </Link>
               );
           })}
        </div>
      </nav>
    </div>
    </>
  );
}
