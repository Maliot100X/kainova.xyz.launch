"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

export default function AgentPage() {
  const params = useParams();
  const agentId = params.agentId as string;

  const [tokens, setTokens] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [tokensRes, earningsRes] = await Promise.all([
          fetch(`/api/tokens?limit=100`),
          fetch(`/api/fees/earnings?agentId=${agentId}`)
        ]);

        const tokensData = await tokensRes.json();
        const earningsData = await earningsRes.json();

        const agentTokens = Array.isArray(tokensData) 
          ? tokensData.filter((t: any) => t.agentId === agentId)
          : [];
        setTokens(agentTokens);
        
        if (earningsData.agentId) {
          setEarnings(earningsData);
        }
      } catch (error) {
        console.error("Error:", error);
      }
      setLoading(false);
    }

    if (agentId) fetchData();
  }, [agentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const totalEarned = earnings?.totalEarned || 0;
  const totalSent = earnings?.totalSent || 0;
  const totalPending = earnings?.totalPending || 0;
  const totalHeld = earnings?.totalHeld || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-cyan-400">
            {BRAND.name}
          </Link>
          <nav className="flex gap-6">
            <Link href="/leaderboard" className="hover:text-cyan-400">Leaderboard</Link>
            <Link href="/skills" className="hover:text-cyan-400">For Agents</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Back */}
        <Link href="/leaderboard" className="text-slate-400 hover:text-cyan-400 mb-4 inline-block">
          ← Back to Leaderboard
        </Link>

        {/* Agent Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center text-2xl font-bold">
              {(agentId || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold">{agentId}</h1>
              <p className="text-slate-400">ID: {agentId}</p>
            </div>
          </div>
        </div>

        {/* Earnings Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-1">Total Earned</p>
            <p className="text-3xl font-bold text-cyan-400">{totalEarned.toFixed(4)} SOL</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-1">Sent</p>
            <p className="text-3xl font-bold">{totalSent.toFixed(4)} SOL</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{totalPending.toFixed(4)} SOL</p>
          </div>
          <div className="bg-slate-800 rounded-xl p-6">
            <p className="text-slate-400 text-sm mb-1">Held</p>
            <p className="text-3xl font-bold text-orange-400">{totalHeld.toFixed(4)} SOL</p>
          </div>
        </div>

        {/* Tokens */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Tokens ({tokens.length})</h2>
          
          {tokens.length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-slate-800/50 rounded-xl">
              No tokens launched yet.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tokens.map((token) => (
                <Link
                  key={token.mintAddress}
                  href={`/token/${token.mintAddress}`}
                  className="bg-slate-800 rounded-xl overflow-hidden hover:bg-slate-700 transition"
                >
                  <div className="aspect-square relative bg-slate-700">
                    {token.imageUrl ? (
                      <img src={token.imageUrl} alt={token.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold">
                        {token.symbol?.[0] || "?"}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold truncate">{token.name}</h3>
                      <span className="text-cyan-400">${token.symbol}</span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {new Date(token.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Distribution History */}
        {earnings?.recentDistributions?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Distribution History</h2>
            <div className="bg-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-3 px-4 text-left text-slate-400">Date</th>
                    <th className="py-3 px-4 text-right text-slate-400">Amount</th>
                    <th className="py-3 px-4 text-right text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.recentDistributions.slice(0, 10).map((dist: any) => (
                    <tr key={dist.id} className="border-b border-slate-700">
                      <td className="py-3 px-4">
                        {new Date(dist.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right text-cyan-400">
                        {dist.amountSol?.toFixed(4)} SOL
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-1 rounded text-xs ${
                          dist.status === 'sent' ? 'bg-green-500/20 text-green-400' :
                          dist.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          dist.status === 'held' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {dist.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
