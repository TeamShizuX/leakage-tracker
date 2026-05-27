import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function GET(request: Request, context: any) {
  try {
    const { params } = context;
    const gameId = (await params).id;

    // 1. Get Game
    let { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) return new NextResponse('Game not found', { status: 404 });

    // Auto-complete game if time is up
    if (game.status === 'active' && new Date() > new Date(game.end_date)) {
      await supabase.from('games').update({ status: 'completed' }).eq('id', game.id);
      game.status = 'completed';
    }

    // 2. Get Participants
    const { data: participants, error: partError } = await supabase
      .from('game_participants')
      .select('profile_id, profiles(id, username, whatsapp_number, is_premium)')
      .eq('game_id', gameId);

    if (partError) throw partError;

    // 3. Calculate Spending
    const leaderboard = await Promise.all((participants || []).map(async (p: any) => {
      const profile = p.profiles;
      let totalSpent = 0;

      if (game.status !== 'waiting' && profile.whatsapp_number) {
        // Query transactions
        const endDate = game.status === 'completed' ? game.end_date : new Date().toISOString();
        
        const { data: txs, error: txError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', profile.whatsapp_number)
          .gte('created_at', game.start_date)
          .lte('created_at', endDate);

        if (!txError && txs) {
          totalSpent = txs.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
        }
      }

      return {
        profileId: profile.id,
        username: profile.username,
        whatsapp_number: profile.whatsapp_number,
        is_premium: profile.is_premium,
        totalSpent
      };
    }));

    // Sort leaderboard (highest spender first)
    leaderboard.sort((a, b) => b.totalSpent - a.totalSpent);

    return NextResponse.json({ game, leaderboard });
  } catch (error) {
    console.error('Fetch game error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
