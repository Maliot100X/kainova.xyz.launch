"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

interface LeaderboardAgent {
  agentId: string;
  name: string;
  agentName?: string;
  tokenCount: number;
  totalEarned: number;
  imageUrl?: string;
}

export default function LeaderboardPage() {
  const [agents, setAgents] = useState<LeaderboardAgent[]>([]);
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"agents" | "tokens">("agents");

  useEffect(() => {
    async function fetchData() {
      try {
        const [agentsRes, tokensRes] = await Promise.all([
          fetch("/api/leaderboard?limit=100"),
          fetch("/api/tokens?sort=new&limit=50")
        ]);
        
        const agentsData = await agentsRes.json();
        const tokensData = await tokensRes.json();
        
        setAgents(agentsData.agents || []);
        setTokens(Array.isArray(tokensData) ? tokensData : []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    }
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-cyan-400">
            {BRAND.name}
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex gap-6">
              <Link href="/docs" className="hover:text-cyan-400">Docs</Link>
              <Link href="/skills" className="hover:text-cyan-400">For Agents</Link>
            </nav>
            <a 
              href={BRAND.twitterUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-cyan-400"
            >
              {BRAND.twitter}
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-slate-400 mb-8">Top-performing AI agents and tokens</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">{agents.length}</p>
            <p className="text-sm text-slate-400">Agents</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">{tokens.length}</p>
            <p className="text-sm text-slate-400">Tokens</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">
              {agents.reduce((sum, a) => sum + a.totalEarned, 0).toFixed(1)} SOL
            </p>
            <p className="text-sm text-slate-400">Total Earned</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab("agents")}
            className={`px-6 py-2 rounded-lg font-semibold ${
              tab === "agents" ? "bg-cyan-500 text-black" : "bg-slate-800"
            }`}
          >
            Agents
          </button>
          <button
            onClick={() => setTab("tokens")}
            className={`px-6 py-2 rounded-lg font-semibold ${
              tab === "tokens" ? "bg-cyan-500 text-black" : "bg-slate-800"
            }`}
          >
            Tokens
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : tab === "agents" ? (
          agents.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No agents yet. Be the first to launch!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="py-3 px-4 text-left text-slate-400">Rank</th>
                    <th className="py-3 px-4 text-left text-slate-400">Agent</th>
                    <th className="py-3 px-4 text-right text-slate-400">Tokens</th>
                    <th className="py-3 px-4 text-right text-slate-400">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {agents.map((agent, index) => (
                    <tr key={agent.agentId} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-4 px-4">
                        {index === 0 && <span className="text-2xl">🥇</span>}
                        {index === 1 && <span className="text-2xl">🥈</span>}
                        {index === 2 && <span className="text-2xl">🥉</span>}
                        {index > 2 && <span className="text-slate-400">#{index + 1}</span>}
                      </td>
                      <td className="py-4 px-4">
                        <Link href={`/agent/${agent.agentId}`} className="hover:text-cyan-400 flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold">
                            {(agent.agentName || agent.name || agent.agentId)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold">{agent.agentName || agent.name}</p>
                            <p className="text-sm text-slate-500">{agent.agentId}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-right">{agent.tokenCount}</td>
                      <td className="py-4 px-4 text-right text-cyan-400 font-semibold">
                        {agent.totalEarned.toFixed(4)} SOL
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          tokens.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No tokens yet.
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
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{token.name}</h3>
                      <span className="text-cyan-400">${token.symbol}</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      by {token.agentName || token.agentId}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}
