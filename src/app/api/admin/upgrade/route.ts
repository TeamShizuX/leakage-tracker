import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId, isPremium } = await request.json();
    
    if (!userId) {
      return new NextResponse('User ID is required', { status: 400 });
    }

    const { error } = await supabase.rpc('admin_upgrade_user', {
      target_user_id: userId,
      target_is_premium: isPremium
    });

    if (error) throw error;

    return NextResponse.json({ success: true, is_premium: isPremium });
  } catch (error) {
    console.error('Error upgrading user:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
