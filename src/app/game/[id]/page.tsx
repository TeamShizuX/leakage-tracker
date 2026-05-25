'use client';

import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Share2, Play, Users, Trophy, AlertTriangle, Copy, Check, StopCircle, UserMinus, LogOut } from 'lucide-react';

export default function GameLobby({ params }: { params: Promise<{ id: string }> }) {
  const { id: gameId } = use(params);
  
  const [profile, setProfile] = useState<any>(null);
  const [game, setGame] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);
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
        try {
          // Attempt to join just in case they clicked a share link
          await fetch('/api/game/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: profileData.id, gameId })
          });

          // Fetch game and leaderboard data
          const res = await fetch(`/api/game/${gameId}`);
          if (res.ok) {
            const data = await res.json();
            setGame(data.game);
            setLeaderboard(data.leaderboard);
          } else {
            alert('Game not found or error loading game.');
            router.push('/game');
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
    load();
  }, [gameId, router]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const res = await fetch('/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, gameId: game.id })
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const err = await res.text();
        alert('Failed to start: ' + err);
      }
    } catch (e) {
      console.error(e);
    }
    setStarting(false);
  };

  const handleAction = async (action: string, targetProfileId?: string) => {
    try {
      const res = await fetch('/api/game/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, userId: profile.id, gameId: game.id, targetProfileId })
      });
      if (res.ok) {
        if (action === 'leave') router.push('/game');
        else window.location.reload();
      } else {
        const err = await res.text();
        alert(`Failed to ${action}: ` + err);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="min-h-screen bg-[#030303] flex items-center justify-center"><div className="animate-pulse w-8 h-8 bg-blue-500 rounded-full"></div></div>;
  if (!game) return null;

  const isCreator = profile?.id === game.created_by;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#030303] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 opacity-20 ${
            game.status === 'waiting' ? 'bg-yellow-500' : game.status === 'active' ? 'bg-green-500' : 'bg-blue-500'
          }`}></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  game.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-500' :
                  game.status === 'active' ? 'bg-green-500/20 text-green-500' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {game.status.toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl font-bold">Least Spender Challenge</h1>
              <p className="text-gray-400 mt-1">
                {game.status === 'waiting' ? 'Invite friends to join before starting.' : 
                 game.status === 'active' ? `Ends on ${new Date(game.end_date).toLocaleDateString()}` : 
                 'Challenge completed!'}
              </p>
            </div>

            {game.status === 'waiting' && (
              <div className="flex flex-col gap-3 w-full md:w-auto">
                <button onClick={copyLink} className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-xl transition-all">
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  {copied ? 'Copied!' : 'Copy Invite Link'}
                </button>
                {isCreator && (
                  <button onClick={handleStart} disabled={starting || leaderboard.length < 2} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl font-bold transition-all disabled:opacity-50">
                    <Play size={18} /> {starting ? 'Starting...' : 'Start Challenge'}
                  </button>
                )}
                {isCreator && leaderboard.length < 2 && (
                  <p className="text-xs text-yellow-500 text-center">Need at least 2 players</p>
                )}
              </div>
            )}
            
            {game.status === 'active' && isCreator && (
              <button 
                onClick={() => handleAction('end')}
                className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 rounded-xl font-bold transition-all"
              >
                <StopCircle size={18} /> End Challenge Early
              </button>
            )}

            {!isCreator && game.status !== 'completed' && (
              <button 
                onClick={() => handleAction('leave')}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-500 border border-white/10 hover:border-red-500/50 px-4 py-2 rounded-xl transition-all"
              >
                <LogOut size={18} /> Leave Challenge
              </button>
            )}
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="bg-black/40 border border-white/5 rounded-3xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Users size={24} className="text-blue-500" />
            Participants ({leaderboard.length})
          </h2>

          <div className="space-y-4">
            {leaderboard.map((p, index) => {
              const isMe = p.profileId === profile?.id;
              const isLoser = game.status === 'completed' && index === 0;
              const isWinner = game.status === 'completed' && index === leaderboard.length - 1 && leaderboard.length > 1;

              return (
                <div key={p.profileId} className={`flex items-center justify-between p-4 rounded-2xl border ${index === 0 && game.status !== 'waiting' ? 'border-yellow-500/50 bg-yellow-500/10' : isMe ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/5 bg-white/5'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 && game.status !== 'waiting' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-lg shadow-yellow-500/20' : 
                      index === 1 && game.status !== 'waiting' ? 'bg-gray-300 text-black' : 
                      index === 2 && game.status !== 'waiting' ? 'bg-orange-600 text-white' : 
                      'bg-white/10 text-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold flex items-center gap-2">
                        {p.username || p.whatsapp_number || 'Unknown User'} 
                        {isMe && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">You</span>}
                      </p>
                      {game.status === 'completed' && (
                        <p className="text-sm mt-1">
                          {isWinner && <span className="text-green-500 flex items-center gap-1"><Trophy size={14}/> Financial Guru Badge</span>}
                          {isLoser && <span className="text-red-500 flex items-center gap-1"><AlertTriangle size={14}/> The Leaky Bucket Badge</span>}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {game.status !== 'waiting' && (
                      <div className="text-right">
                        <p className={`text-xl font-bold ${index === 0 ? 'text-yellow-500' : 'text-gray-200'}`}>{p.totalSpent.toLocaleString()} LKR</p>
                        <p className="text-xs text-gray-500">spent</p>
                      </div>
                    )}
                    {isCreator && !isMe && game.status === 'waiting' && (
                      <button 
                        onClick={() => handleAction('remove', p.profileId)}
                        className="p-2 text-gray-500 hover:text-red-500 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Remove player"
                      >
                        <UserMinus size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
