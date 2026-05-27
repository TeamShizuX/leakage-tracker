import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId, gameId } = await request.json();

    // Check if game exists and is waiting
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('status')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      return new NextResponse('Game not found', { status: 404 });
    }

    if (game.status !== 'waiting') {
      return new NextResponse('Game has already started or ended', { status: 400 });
    }

    // Add participant
    const { error: partError } = await supabase
      .from('game_participants')
      .insert({ game_id: gameId, profile_id: userId });

    if (partError && partError.code !== '23505') { // Ignore unique violation if already joined
      throw partError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Join game error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
