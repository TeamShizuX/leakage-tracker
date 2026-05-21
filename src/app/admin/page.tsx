'use client';

import { useState, useEffect } from 'react';
import { ShieldAlert, Users, TrendingUp, DollarSign, Crown, Flame, Link as LinkIcon, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({ totalUsers: 0, premiumUsers: 0, totalRevenue: 0, totalRoasts: 0 });
  const [webhookStatus, setWebhookStatus] = useState<any>(null);
  const [webhookUrlInput, setWebhookUrlInput] = useState('');
  const [updatingWebhook, setUpdatingWebhook] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
        
        // Calculate global stats
        const stats = data.users.reduce((acc: any, user: any) => ({
          totalUsers: acc.totalUsers + 1,
          premiumUsers: acc.premiumUsers + (user.is_premium ? 1 : 0),
          totalRevenue: acc.totalRevenue + (user.total_spend || 0),
          totalRoasts: acc.totalRoasts + (user.roast_count || 0)
        }), { totalUsers: 0, premiumUsers: 0, totalRevenue: 0, totalRoasts: 0 });
        
        setGlobalStats(stats);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWebhookStatus = async () => {
    try {
      const res = await fetch('/api/telegram/setup');
      const data = await res.json();
      if (data.ok) {
        setWebhookStatus(data.result);
        setWebhookUrlInput(data.result.url || '');
      }
    } catch (err) {
      console.error('Failed to fetch webhook status', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchWebhookStatus();
  }, []);

  const updateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingWebhook(true);
    try {
      const res = await fetch('/api/telegram/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: webhookUrlInput })
      });
      const data = await res.json();
      if (data.ok) {
        alert('Webhook updated successfully!');
        fetchWebhookStatus();
      } else {
        alert('Failed to update webhook: ' + (data.description || 'Unknown error'));
      }
    } catch (err) {
      console.error(err);
      alert('Error updating webhook');
    } finally {
      setUpdatingWebhook(false);
    }
  };

  const togglePremium = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isPremium: !currentStatus })
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, is_premium: !currentStatus } : u));
        setGlobalStats(prev => ({
          ...prev, 
          premiumUsers: prev.premiumUsers + (!currentStatus ? 1 : -1)
        }));
      }
    } catch (error) {
      console.error("Failed to toggle premium status", error);
      alert("Failed to update user status.");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#030303] flex items-center justify-center p-12"><div className="animate-pulse w-8 h-8 bg-red-500 rounded-full"></div></div>;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#030303] text-white p-6 md:p-12 font-sans selection:bg-red-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex items-center gap-4 border-b border-gray-800 pb-6">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Super Admin</h1>
            <p className="text-gray-400 text-sm">Manage users and track system performance</p>
          </div>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-sm font-bold uppercase tracking-wider">Total Users</span>
              <Users size={16} />
            </div>
            <span className="text-4xl font-black">{globalStats.totalUsers}</span>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-yellow-500">
              <span className="text-sm font-bold uppercase tracking-wider">Premium Users</span>
              <Crown size={16} />
            </div>
            <span className="text-4xl font-black text-yellow-500">{globalStats.premiumUsers}</span>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-green-500">
              <span className="text-sm font-bold uppercase tracking-wider">Total Tracked (LKR)</span>
              <DollarSign size={16} />
            </div>
            <span className="text-4xl font-black text-green-400">{globalStats.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-orange-500">
              <span className="text-sm font-bold uppercase tracking-wider">Total Roasts</span>
              <Flame size={16} />
            </div>
            <span className="text-4xl font-black text-orange-500">{globalStats.totalRoasts}</span>
          </div>
        </div>

        {/* System Integrations */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <LinkIcon size={20} className="text-blue-500" />
              <h2 className="text-xl font-bold">System Integrations</h2>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Telegram Webhook */}
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Telegram Webhook</h3>
                {webhookStatus?.url ? (
                  <span className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full"><CheckCircle size={12}/> Active</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full"><XCircle size={12}/> Inactive</span>
                )}
              </div>
              
              <div className="text-sm text-gray-400 mb-6">
                <p>Current URL: <span className="text-white font-mono break-all">{webhookStatus?.url || 'None set'}</span></p>
                {webhookStatus?.pending_update_count !== undefined && (
                  <p className="mt-1">Pending Updates: {webhookStatus.pending_update_count}</p>
                )}
              </div>

              <form onSubmit={updateWebhook} className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Update Webhook URL</label>
                  <input 
                    type="url" 
                    placeholder="https://your-ngrok-url.ngrok-free.dev/api/telegram/webhook"
                    className="w-full bg-[#222] border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    value={webhookUrlInput}
                    onChange={(e) => setWebhookUrlInput(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">Make sure it points to `/api/telegram/webhook`</p>
                </div>
                <button 
                  type="submit" 
                  disabled={updatingWebhook}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updatingWebhook ? <><RefreshCw size={14} className="animate-spin" /> Updating...</> : 'Save Webhook'}
                </button>
              </form>
            </div>
            
            {/* WhatsApp Placeholder */}
            <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-6 opacity-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">WhatsApp Webhook</h3>
                <span className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded-full">Managed via Meta</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">WhatsApp webhooks are configured directly in the Meta Developer Portal. They cannot be changed dynamically here.</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#111] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold">User Directory</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1A1A1A] text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">User</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Contact</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Total Spend</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Roasts</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Status / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#151515] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                          {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : <Users size={14} className="text-gray-500" />}
                        </div>
                        <span className="font-medium text-gray-200">{u.username || 'Anonymous'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex flex-col gap-1 text-xs">
                        {u.whatsapp_number && <span><span className="text-green-500 font-bold">WA:</span> {u.whatsapp_number}</span>}
                        {u.telegram_chat_id && <span><span className="text-blue-500 font-bold">TG:</span> {u.telegram_chat_id}</span>}
                        {!u.whatsapp_number && !u.telegram_chat_id && <span>No integrations</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-gray-300">
                      LKR {u.total_spend?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-orange-400 font-bold">
                      {u.roast_count || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => togglePremium(u.id, u.is_premium)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                          u.is_premium 
                            ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20' 
                            : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {u.is_premium ? 'Revoke Premium' : 'Upgrade to Premium'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="p-8 text-center text-gray-500">No users found.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
