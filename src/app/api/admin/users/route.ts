import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // 1. Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('username', { ascending: true });

    if (profilesError) throw profilesError;

    // 2. Fetch all transactions to calculate totals
    // Since this is MVP, we fetch all and calculate in memory. 
    // In production with many users, we would use a SQL aggregate query or RPC.
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('user_id, amount');

    if (txError) throw txError;

    // Calculate total spend per user
    const userSpends: Record<string, number> = {};
    if (transactions) {
      transactions.forEach(tx => {
        userSpends[tx.user_id] = (userSpends[tx.user_id] || 0) + Number(tx.amount);
      });
    }

    // Combine profile data with total spend
    const usersWithStats = profiles.map(profile => {
      // User can have whatsapp_number or telegram_chat_id used as user_id in transactions
      // Telegram IDs in transactions are prefixed with 'tg_'
      const waSpend = profile.whatsapp_number ? (userSpends[profile.whatsapp_number] || 0) : 0;
      const tgSpend = profile.telegram_chat_id ? (userSpends[`tg_${profile.telegram_chat_id}`] || 0) : 0;
      
      return {
        ...profile,
        total_spend: waSpend + tgSpend
      };
    });

    return NextResponse.json({ users: usersWithStats });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
