import { NextResponse } from 'next/server';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

// GET: Check current webhook status
export async function GET() {
  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
  }

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
  );
  const data = await response.json();
  return NextResponse.json(data);
}

// POST: Register the webhook with Telegram
export async function POST(request: Request) {
  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not configured' }, { status: 500 });
  }

  const { webhookUrl } = await request.json();

  if (!webhookUrl) {
    return NextResponse.json({ error: 'webhookUrl is required' }, { status: 400 });
  }

  const params: Record<string, string> = {
    url: webhookUrl,
    allowed_updates: JSON.stringify(['message']),
  };

  if (TELEGRAM_WEBHOOK_SECRET) {
    params.secret_token = TELEGRAM_WEBHOOK_SECRET;
  }

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
