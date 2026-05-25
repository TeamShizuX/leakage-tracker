'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Gamepad2, Plus, Users, Trophy } from 'lucide-react';

export default function GameDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(profileData);

      if (profileData) {
        // Fetch games user is participating in
        const { data: parts } = await supabase
          .from('game_participants')
          .select('game_id, games(*)')
          .eq('profile_id', profileData.id)
          .order('joined_at', { ascending: false });
        
        if (parts) {
          setGames(parts.map(p => p.games));
        }
      }
      setLoading(false);
    }
    load();
  }, [router]);

  const handleCreateGame = async () => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id })
      });
      const data = await res.json();
      if (data.game) {
        router.push(`/game/${data.game.id}`);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create game');
    }
    setIsCreating(false);
  };

  if (loading) return <div className="min-h-screen bg-[#030303] flex items-center justify-center"><div className="animate-pulse w-8 h-8 bg-blue-500 rounded-full"></div></div>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#030303] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-blue-500/20">
                <Gamepad2 className="text-blue-500" size={24} />
              </div>
              Least Spender
            </h1>
            <p className="text-gray-400 text-lg">Challenge your friends to a 7-day spending freeze.</p>
          </div>
          
          <button 
            onClick={handleCreateGame}
            disabled={isCreating}
            className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isCreating ? <span className="animate-pulse">Creating...</span> : <><Plus size={20} /> New Challenge</>}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.length === 0 ? (
            <div className="col-span-full bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
              <Trophy size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">No active challenges</h3>
              <p className="text-gray-500 mb-6">Create a new game and invite your friends to start competing.</p>
            </div>
          ) : (
            games.map((game: any) => (
              <div 
                key={game.id} 
                onClick={() => router.push(`/game/${game.id}`)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-3xl p-6 cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Challenge Lobby</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    game.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-500' :
                    game.status === 'active' ? 'bg-green-500/20 text-green-500' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {game.status.toUpperCase()}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold mb-1">
                  {game.status === 'waiting' ? 'Waiting for players...' : 
                   game.status === 'active' ? 'Game in Progress' : 
                   'Completed Challenge'}
                </h3>
                <p className="text-sm text-gray-500 truncate">ID: {game.id}</p>
                
                {game.status === 'active' && game.end_date && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-400">Ends: {new Date(game.end_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
