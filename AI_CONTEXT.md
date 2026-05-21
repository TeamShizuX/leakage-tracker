# Leakage Tracker - AI Context & Project Flow

This document provides a high-level overview of the Leakage Tracker project to help AI agents understand the codebase and contribute effectively.

## 🚀 Overview
Leakage Tracker is an AI-powered personal finance tool that helps users track "leakage" (unnecessary expenses). It integrates with WhatsApp and Telegram to allow native, conversational expense logging.

## 🛠 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database/Auth**: Supabase
- **AI**: Google Gemini (via `@google/generative-ai`)
- **Messaging**: WhatsApp Cloud API, Telegram Bot API
- **Styling**: Tailwind CSS 4

## 📂 Key Directory Structure
- `src/app/api/`: Contains API routes for webhooks and internal logic.
  - `whatsapp/webhook/`: Entry point for Meta WhatsApp Cloud API webhooks.
  - `telegram/webhook/`: Entry point for Telegram Bot API webhooks.
  - `expense/`: Internal API to manually log expenses from the UI.
  - `advisor/`: Generates personalized financial advice using Gemini.
  - `roast/`: Generates sarcastic financial roasts.
- `src/lib/`: Core utilities and integrations.
  - `gemini.ts`: Handles all interactions with Google Gemini AI.
  - `supabase.ts`: Supabase client initialization.
- `src/components/`: Reusable React components (e.g., `Navbar`).

## 🔄 Core Flows

### 1. Expense Logging (Conversational)
1. User sends a message (e.g., "Pizza 2500") to WhatsApp or Telegram.
2. Webhook (`/api/whatsapp/webhook` or `/api/telegram/webhook`) receives the payload.
3. Payload is passed to `parseExpenseDetails` in `src/lib/gemini.ts`.
4. Gemini extracts item, amount, category, and determines if it's "unnecessary" (leakage).
5. Data is saved to the `transactions` table in Supabase.
6. A confirmation message is sent back to the user via the respective messaging platform.

### 2. Dashboard & Analytics
1. The main dashboard (`src/app/page.tsx`) fetches transactions for the logged-in user.
2. It calculates "Total Leakage" vs. "Necessary Spend".
3. Displays charts using `recharts`.
4. Provides an "AI Advisor" feature to generate deep insights via the `/api/advisor` route.

## 🗄️ Database Schema (`public.transactions`)
- `id`: UUID (Primary Key)
- `user_id`: TEXT (Stores WhatsApp number or `tg_{chat_id}`)
- `item`: TEXT
- `amount`: NUMERIC
- `currency`: TEXT (Default: 'LKR')
- `category`: TEXT
- `necessity_score`: INTEGER (1-5)
- `is_unnecessary`: BOOLEAN
- `created_at`: TIMESTAMPTZ

## 🤖 AI Features
- **Expense Parsing**: Natural language to structured JSON.
- **Wallet Roast**: Humorous analysis of spending habits.
- **AI Advisor**: Strategic advice for saving and budget planning.

## 🔑 Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `WHATSAPP_TOKEN`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
