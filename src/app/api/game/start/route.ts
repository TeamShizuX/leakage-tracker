import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId, gameId } = await request.json();

    // Verify user is creator and game is waiting
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return new NextResponse('Game not found', { status: 404 });
    }

    if (game.created_by !== userId) {
      return new NextResponse('Only creator can start the game', { status: 403 });
    }

    if (game.status !== 'waiting') {
      return new NextResponse('Game already started', { status: 400 });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

    const { error: updateError } = await supabase
      .from('games')
      .update({ 
        status: 'active', 
        start_date: startDate.toISOString(), 
        end_date: endDate.toISOString() 
      })
      .eq('id', gameId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, startDate, endDate });
  } catch (error) {
    console.error('Start game error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
