import { NextResponse } from 'next/server';
import { parseExpenseDetails } from '@/lib/gemini';
import { supabaseAdmin as supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { text, userId } = await req.json();

    if (!text || !userId) {
      return NextResponse.json({ error: 'Missing text or userId' }, { status: 400 });
    }

    const expenseData = await parseExpenseDetails(text);

    if (expenseData.error) {
      return NextResponse.json({ error: 'Could not understand the expense' }, { status: 400 });
    }

    const { error: dbError } = await supabase
      .from('transactions')
      .insert([{
        user_id: userId,
        item: expenseData.item,
        amount: expenseData.amount,
        currency: expenseData.currency,
        category: expenseData.category,
        necessity_score: expenseData.necessity_score,
        is_unnecessary: expenseData.is_unnecessary
      }]);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, data: expenseData });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to process expense' }, { status: 500 });
  }
}
