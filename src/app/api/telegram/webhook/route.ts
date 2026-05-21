import { NextResponse } from 'next/server';
import { parseExpenseDetails, determineIntent, generatePremiumChatResponse } from '@/lib/gemini';
import { supabase } from '@/lib/supabase';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

// Telegram sends all updates via POST
export async function POST(request: Request) {
  // Verify the secret token header if configured
  if (TELEGRAM_WEBHOOK_SECRET) {
    const secretHeader = request.headers.get('x-telegram-bot-api-secret-token');
    if (secretHeader !== TELEGRAM_WEBHOOK_SECRET) {
      console.error('Invalid Telegram webhook secret token');
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  let body;
  try {
    body = await request.json();
  } catch {
    console.error('Failed to parse Telegram webhook body');
    return new NextResponse('Bad Request', { status: 400 });
  }

  console.log('Telegram webhook received:', JSON.stringify(body, null, 2));

  // Extract message from the update
  const message = body.message;

  if (!message) {
    // Could be an edited_message, channel_post, callback_query, etc.
    console.log('No message in Telegram update (likely an edit or other event)');
    return new NextResponse('OK', { status: 200 });
  }

  const chatId = message.chat.id;
  const from = message.from;
  const username = from?.username || '';
  const firstName = from?.first_name || 'User';

  // Handle /start command
  if (message.text?.startsWith('/start')) {
    await sendTelegramMessage(
      chatId,
      `👋 Hey ${firstName}! Welcome to *Leakage Tracker*!\n\n` +
      `I'll help you track your expenses. Just send me messages like:\n\n` +
      `💬 "Coffee 350"\n` +
      `💬 "Uber ride for 1200"\n` +
      `💬 "Bought groceries 3500 LKR"\n\n` +
      `Your Telegram Chat ID is: \`${chatId}\`\n` +
      `${username ? `Your username is: @${username}\n` : ''}` +
      `\nAdd this Chat ID to your profile on the Leakage Tracker dashboard to link your expenses to your account.`
    );
    return new NextResponse('OK', { status: 200 });
  }

  // Handle /help command
  if (message.text?.startsWith('/help')) {
    await sendTelegramMessage(
      chatId,
      `📖 *How to use Leakage Tracker:*\n\n` +
      `1️⃣ Send any expense as a text message\n` +
      `2️⃣ I'll use AI to parse and categorize it\n` +
      `3️⃣ View your dashboard at your web app\n\n` +
      `*Examples:*\n` +
      `• "Pizza 2500"\n` +
      `• "Bought a shirt for 4000 LKR"\n` +
      `• "Netflix subscription $15"\n\n` +
      `Your Chat ID: \`${chatId}\``
    );
    return new NextResponse('OK', { status: 200 });
  }

  // Handle /id command — so user can easily get their chat ID
  if (message.text?.startsWith('/id')) {
    await sendTelegramMessage(
      chatId,
      `🆔 Your Telegram Chat ID is: \`${chatId}\`\n\nPaste this into your profile page on the Leakage Tracker dashboard to link your Telegram expenses.`
    );
    return new NextResponse('OK', { status: 200 });
  }

  // Only process text messages
  if (!message.text) {
    await sendTelegramMessage(
      chatId,
      '📝 I can only process text messages. Please send your expense as text, e.g. "Pizza for 2500".'
    );
    return new NextResponse('OK', { status: 200 });
  }

  const msgBody = message.text;
  console.log(`Telegram message from ${chatId} (@${username}): ${msgBody}`);

  // Determine user_id: look up profile by telegram_chat_id, fallback to chat ID string
  let userId = `tg_${chatId}`;
  let profileData: any = null;
  try {
    const { data, error: profileError } = await supabase
      .from('profiles')
      .select('whatsapp_number, telegram_chat_id, is_premium, budget_limit')
      .eq('telegram_chat_id', String(chatId))
      .maybeSingle();
    profileData = data;

    console.log('Telegram Profile Lookup Result:', { profileData, profileError, searchId: String(chatId) });

    if (profileData?.whatsapp_number) {
      // Use the whatsapp_number as user_id for consistency — all transactions
      // from both WhatsApp and Telegram will use the same user_id
      userId = profileData.whatsapp_number;
      console.log(`Matched profile with WhatsApp number: ${userId}`);
    } else if (profileData?.telegram_chat_id) {
      userId = `tg_${profileData.telegram_chat_id}`;
      console.log(`Matched profile with Telegram ID: ${userId}`);
    } else {
      console.log(`No profile matched for Telegram ID ${chatId}, using fallback ID: ${userId}`);
    }
  } catch (err) {
    console.error('Error looking up profile for Telegram user:', err);
    // userId remains tg_{chatId}
  }

  try {
    // Determine the user's intent
    const intent = await determineIntent(msgBody);
    console.log(`Intent determined: ${intent}`);

    if (intent === 'EXPENSE') {
      // 1. Parse with Gemini
      const expenseData = await parseExpenseDetails(msgBody);

      // 2. Save to Supabase
      const { error } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: userId,
            item: expenseData.item,
            amount: expenseData.amount,
            currency: expenseData.currency,
            category: expenseData.category,
            necessity_score: expenseData.necessity_score,
            is_unnecessary: expenseData.is_unnecessary,
          }
        ]);

      if (error) {
        console.error('Supabase Insert Error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
      
      console.log('Successfully saved Telegram transaction for user:', userId);

      // 3. Send confirmation back to Telegram
      const emoji = expenseData.is_unnecessary ? '⚠️' : '✅';
      const responseMessage =
        `${emoji} *Expense Logged!*\n\n` +
        `📦 *Item:* ${expenseData.item}\n` +
        `💰 *Amount:* ${expenseData.amount} ${expenseData.currency}\n` +
        `📁 *Category:* ${expenseData.category}\n` +
        `📊 *Necessity:* ${expenseData.necessity_score}/5\n` +
        `${expenseData.is_unnecessary ? '🔥 _Marked as Unnecessary Leakage_' : '✅ _Marked as Necessary_'}`;

      await sendTelegramMessage(chatId, responseMessage);
      
    } else {
      // Intent is CHAT
      if (!profileData?.is_premium) {
        await sendTelegramMessage(
          chatId,
          '⭐ *Premium Feature*\n\nInteractive AI chat, financial summaries, and wallet roasts are available exclusively to Premium users! Head over to your dashboard to upgrade.'
        );
        return new NextResponse('OK', { status: 200 });
      }

      // Premium Chat Flow
      // Fetch recent transactions for context
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50); // Get last 50 transactions

      const budgetLimit = profileData?.budget_limit || 10000;
      
      const responseText = await generatePremiumChatResponse(msgBody, recentTransactions || [], budgetLimit);
      
      await sendTelegramMessage(chatId, responseText);
    }

  } catch (error) {
    console.error('Error processing Telegram message:', error);
    await sendTelegramMessage(
      chatId,
      '❌ Sorry, I encountered an error processing your request. If logging an expense, try formatting it clearly like "Pizza 2500".'
    );
  }

  return new NextResponse('OK', { status: 200 });
}

export async function GET() {
  return NextResponse.json({ 
    status: 'active', 
    message: 'Telegram Webhook endpoint is reachable',
    timestamp: new Date().toISOString()
  });
}

async function sendTelegramMessage(chatId: number | string, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  console.log(`Sending Telegram message to ${chatId}`);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    const responseBody = await response.text();

    if (!response.ok) {
      console.error(`Failed to send Telegram message (${response.status}):`, responseBody);
    } else {
      console.log('Telegram message sent successfully');
    }
  } catch (error) {
    console.error('Network error sending Telegram message:', error);
  }
}
