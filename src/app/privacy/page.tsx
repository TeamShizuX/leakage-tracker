import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#030303] text-gray-300 p-6 md:p-12 pb-24 font-sans selection:bg-red-500/30">
      <div className="max-w-3xl mx-auto space-y-8 mt-12 md:mt-0">
        <h1 className="text-4xl font-black text-white">Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: May 2026</p>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">1. Information We Collect</h2>
          <p>We collect information to provide better services to our users. This includes:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Account Information:</strong> Your email address and optional profile details.</li>
            <li><strong>Messaging Data:</strong> If you connect your WhatsApp or Telegram, we securely store your phone number/ID to link transactions to your account.</li>
            <li><strong>Financial Data:</strong> The transaction and income records you send to the bot.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">2. How We Use Your Data</h2>
          <p>Your data is used strictly for the core functionality of the application:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>To track your expenses, savings, and incomes.</li>
            <li>To provide multiplayer gamification features (like the Least Spender Challenge).</li>
            <li>To generate personalized AI insights and "roasts" via Google Gemini. Your text inputs are sent to the AI strictly for processing and are not used to train global AI models.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">3. Data Security & Protection</h2>
          <p>We take security seriously. All user data is protected by Row Level Security (RLS) policies in our database, meaning your financial records can only be accessed by you. Webhook data transmission is secured via HTTPS and verified tokens.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">4. Data Deletion</h2>
          <p>You have the right to request deletion of your data at any time. You can delete individual transactions from the dashboard. To delete your entire account, please contact the administrator.</p>
        </section>

        <div className="pt-8 border-t border-white/10">
          <Link href="/" className="text-red-500 hover:text-red-400 font-bold">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
