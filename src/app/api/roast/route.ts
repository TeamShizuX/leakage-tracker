import { NextResponse } from 'next/server';
import { roastWallet } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId, profileId, language } = await request.json();
    
    // Fetch recent transactions for this user
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ roast: "You haven't bought anything yet. Either you're broke or incredibly disciplined. Either way, boring." });
    }

    const roast = await roastWallet(transactions, language);
    
    // Increment roast count if profileId is provided
    if (profileId) {
      // We first need to get the current count to increment it 
      // (Using a simple select + update since we don't have a secure rpc increment function yet)
      const { data: profile } = await supabase
        .from('profiles')
        .select('roast_count')
        .eq('id', profileId)
        .single();
        
      if (profile) {
        await supabase
          .from('profiles')
          .update({ roast_count: (profile.roast_count || 0) + 1 })
          .eq('id', profileId);
      }
    }
    
    return NextResponse.json({ roast });
  } catch (error) {
    console.error('Roast error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
