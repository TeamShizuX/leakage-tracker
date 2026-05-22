import { NextResponse } from 'next/server';
import { generatePremiumChatResponse } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { userId, message } = await request.json();

    if (!userId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, budget_limit, savings_goal')
      .eq('whatsapp_number', userId)
      .maybeSingle();

    if (!profile?.is_premium) {
      return NextResponse.json({ response: '⭐ Please upgrade to Premium to use the AI Chat Advisor.' });
    }

    // Fetch recent transactions for context
    const { data: recentTransactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    const budgetLimit = profile?.budget_limit || 10000;
    const savingsGoal = profile?.savings_goal || 0;
    
    const responseText = await generatePremiumChatResponse(message, recentTransactions || [], budgetLimit, savingsGoal);

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
