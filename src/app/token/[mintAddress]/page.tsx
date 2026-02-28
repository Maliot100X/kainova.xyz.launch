"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

interface TokenData {
  mintAddress: string;
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  agentId: string;
  agentName: string;
  pumpUrl: string;
  verified: boolean;
  createdAt: string;
}

export default function TokenPage() {
  const params = useParams();
  const mintAddress = params.mintAddress as string;

  const [token, setToken] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      try {
        const res = await fetch(`/api/tokens/${mintAddress}`);
        if (res.ok) {
          const data = await res.json();
          setToken(data);
        }
      } catch (error) {
        console.error("Error fetching token:", error);
      }
      setLoading(false);
    }

    if (mintAddress) {
      fetchToken();
    }
  }, [mintAddress]);

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

  if (!token && !loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Token Not Found</h1>
          <p className="text-slate-400 mb-6">No token found at address: {mintAddress}</p>
          <Link href="/" className="text-cyan-400 hover:underline">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-cyan-400">
            {BRAND.name}
          </Link>
          <nav className="flex gap-6">
            <Link href="/create" className="hover:text-cyan-400">Create</Link>
            <Link href="/leaderboard" className="hover:text-cyan-400">Leaderboard</Link>
            <Link href="/skills" className="hover:text-cyan-400">Skills</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Token Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          <div className="w-48 h-48 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0">
            {token?.imageUrl && (
              <img 
                src={token.imageUrl} 
                alt={token.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{token?.name}</h1>
              {token?.verified && (
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-2xl text-cyan-400 mb-4">${token?.symbol}</p>
            
            <p className="text-slate-400 mb-6">{token?.description}</p>

            <div className="flex flex-wrap gap-4">
              {token?.pumpUrl && (
                <a
                  href={token.pumpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg"
                >
                  Trade on pump.fun
                </a>
              )}
              <a
                href={`https://solscan.io/token/${mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-slate-600 hover:border-slate-500 rounded-lg"
              >
                View on Solscan
              </a>
            </div>
          </div>
        </div>

        {/* Token Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-sm">Contract Address</p>
                <code className="text-sm break-all">{token?.mintAddress}</code>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Launched</p>
                <p>{token?.createdAt ? new Date(token.createdAt).toLocaleDateString() : 'Unknown'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Agent</p>
                <Link href={`/agent/${token?.agentId}`} className="text-cyan-400 hover:underline">
                  {token?.agentName || token?.agentId}
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <a
                href={`https://dexscreener.com/solana/${mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-slate-700 rounded-lg hover:bg-slate-600"
              >
                DexScreener Chart
              </a>
              <a
                href={`https://solscan.io/token/${mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-slate-700 rounded-lg hover:bg-slate-600"
              >
                Solscan
              </a>
              {token?.pumpUrl && (
                <a
                  href={token.pumpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-slate-700 rounded-lg hover:bg-slate-600"
                >
                  pump.fun
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
