import { NextResponse } from 'next/server';
import { generateFinancialAdvice } from '@/lib/gemini';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId, budgetLimit } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch transactions for the current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', firstDayOfMonth)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json({ 
        advice: "You haven't logged any expenses this month. Start logging to get personalized financial advice!" 
      });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('savings_goal')
      .eq('whatsapp_number', userId)
      .maybeSingle();

    const savingsGoal = profile?.savings_goal || 0;

    const advice = await generateFinancialAdvice(transactions || [], budgetLimit || 15000, savingsGoal);

    return NextResponse.json({ advice });
  } catch (error) {
    console.error('Advisor API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
