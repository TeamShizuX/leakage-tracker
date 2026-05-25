import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { action, userId, gameId, targetProfileId } = await request.json();

    // 1. Get Game
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) return new NextResponse('Game not found', { status: 404 });

    if (action === 'leave') {
      if (game.created_by === userId) {
        return new NextResponse('Creator cannot leave, they can only end the game', { status: 400 });
      }
      
      const { error } = await supabase
        .from('game_participants')
        .delete()
        .match({ game_id: gameId, profile_id: userId });
        
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'remove') {
      if (game.created_by !== userId) {
        return new NextResponse('Only creator can remove players', { status: 403 });
      }
      if (!targetProfileId) {
        return new NextResponse('Target profile id is required', { status: 400 });
      }
      if (game.created_by === targetProfileId) {
        return new NextResponse('Creator cannot remove themselves', { status: 400 });
      }
      
      const { error } = await supabase
        .from('game_participants')
        .delete()
        .match({ game_id: gameId, profile_id: targetProfileId });
        
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === 'end') {
      if (game.created_by !== userId) {
        return new NextResponse('Only creator can end the game', { status: 403 });
      }
      if (game.status === 'completed') {
        return new NextResponse('Game already completed', { status: 400 });
      }
      
      const { error } = await supabase
        .from('games')
        .update({ status: 'completed', end_date: new Date().toISOString() })
        .eq('id', gameId);
        
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return new NextResponse('Invalid action', { status: 400 });
  } catch (error) {
    console.error('Game action error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
