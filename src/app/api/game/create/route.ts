import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    
    // Create the game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .insert({ created_by: userId, status: 'waiting' })
      .select()
      .single();

    if (gameError) throw gameError;

    // Add the creator as the first participant
    const { error: partError } = await supabase
      .from('game_participants')
      .insert({ game_id: game.id, profile_id: userId });

    if (partError) throw partError;

    return NextResponse.json({ game });
  } catch (error) {
    console.error('Create game error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
