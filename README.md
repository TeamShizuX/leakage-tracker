# 🔥 Leakage Tracker: AI-Powered Financial Reality Check

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database_&_Auth-3ECF8E?style=for-the-badge&logo=supabase)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-AI_Categorization-4285F4?style=for-the-badge&logo=google)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Glassmorphism-38B2AC?style=for-the-badge&logo=tailwind-css)
![Meta](https://img.shields.io/badge/WhatsApp_API-Native_Integration-25D366?style=for-the-badge&logo=whatsapp)

**Stop wondering where your money went.** Leakage Tracker is an ultra-modern, AI-powered expense management system that allows you to log your daily expenses natively via **WhatsApp**. It categorizes your spending, calculates your unnecessary "financial leakage," and uses AI to ruthlessly roast your bad financial decisions.

---

## 🌟 Why is this unique?

Most expense trackers require you to open an app, navigate menus, select categories from dropdowns, and manually input data. **Leakage Tracker eliminates friction.** 

1. **Native WhatsApp Logging:** Just send a natural text to your WhatsApp bot (e.g., *"I just bought a $5 coffee at Starbucks"*). 
2. **AI Engine:** Google's Gemini AI reads the text, extracts the item, identifies the price, categorizes it, and scores it out of 10 on a "necessity" scale.
3. **Automated Leakage Calculation:** The dashboard automatically calculates exactly how much money you "set on fire" this month by buying things you didn't need.
4. **AI Roasting:** A dedicated feature that reads your recent transaction history and generates a highly critical, humorous "roast" of your spending habits.
5. **Premium Aesthetic:** Designed with a stunning, dark-mode glassmorphism UI, making financial accountability visually satisfying.

---

## 🏗️ Page Structure & Features

*   **`/` (Dashboard):** The central hub. Features a massive background display of your total spent, and quick-glance cards showing Total Spend, Necessary Spend, and your Financial Leakage. Includes a "Quick Add" natural language input bar to log expenses without your phone.
*   **`/transactions` (Ledger):** A detailed, filterable view of every transaction you've made. Easily edit amounts/names inline, or delete mistaken logs. Icons automatically match the AI-generated categories.
*   **`/roast` (AI Roast):** The accountability page. Generates a personalized, brutally honest critique of your recent spending habits using Gemini AI.
*   **`/profile` (Settings):** Manage your linked WhatsApp number. The application uses this number as a global context key to pull your specific messages from the Meta Webhook.
*   **`/login` (Auth):** Secure Google OAuth integration powered by Supabase.

---

## 🛠️ Tech Stack

*   **Frontend:** Next.js 15 (App Router), React, Tailwind CSS (v4), Lucide Icons, Outfit Font.
*   **Backend:** Next.js Serverless API Routes.
*   **Database & Auth:** Supabase (PostgreSQL with Row Level Security, Google OAuth).
*   **AI Engine:** Google Gemini (`gemini-flash-latest`) for fast, structured JSON parsing of natural language.
*   **Integrations:** Meta Developer Graph API (WhatsApp Webhooks).

---

## 🚀 Setup & Deployment

### 1. Environment Variables
You will need the following API keys in your `.env.local` or Vercel Environment settings:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
WHATSAPP_TOKEN=your_meta_whatsapp_permanent_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_custom_secret_string
```

### 2. Database Schema
Run the provided `supabase_profiles_schema.sql` and `supabase_schema.sql` files in your Supabase SQL Editor to instantly provision the `profiles` and `transactions` tables with full Row Level Security and Auth triggers.

### 3. Vercel Deployment
1. Import this repository into Vercel.
2. Add the environment variables.
3. Update your Supabase Auth "Site URL" to match the Vercel domain.
4. Update your Meta WhatsApp Webhook URL to point to: `https://your-domain.vercel.app/api/whatsapp/webhook`.

---

*Designed for extreme accountability and zero friction.*
