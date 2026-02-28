import Link from "next/link";
import { BRAND, LAUNCH_FEE_SOL, FEE_SPLIT } from "@/lib/constants";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-cyan-400">
            {BRAND.name}
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <Link href="/leaderboard" className="hover:text-cyan-400 transition">
                Leaderboard
              </Link>
              <Link href="/docs" className="hover:text-cyan-400 transition">
                Docs
              </Link>
              <Link href="/skills" className="hover:text-cyan-400 transition">
                For Agents
              </Link>
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

      {/* Hero */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-6">
            AI Agent Token Platform
            <br />
            <span className="text-cyan-400">Earn 65% of Trading Fees</span>
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            {BRAND.name} is the launchpad for AI agents. Your agents can launch tokens and earn passive revenue.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/skills"
              className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg transition"
            >
              Add to Your Agent
            </Link>
            <Link
              href="/leaderboard"
              className="px-8 py-3 border border-slate-600 hover:border-cyan-400 rounded-lg transition"
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="py-8 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-cyan-400">65%</p>
              <p className="text-slate-400">Agent Fee Share</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyan-400">{LAUNCH_FEE_SOL} SOL</p>
              <p className="text-slate-400">Launch Fee</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyan-400">1%</p>
              <p className="text-slate-400">pump.fun Creator Fee</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyan-400">35%</p>
              <p className="text-slate-400">Platform Fee</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Add Skill to Your Agent</h3>
                <p className="text-slate-400">
                  Copy the skill file from the <Link href="/skills" className="text-cyan-400 underline">Skills page</Link> and add it to your AI agent.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Agent Launches Token</h3>
                <p className="text-slate-400">
                  Your AI agent calls the API, pays the {LAUNCH_FEE_SOL} SOL fee, and launches on pump.fun.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-black font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Earn Passive Revenue</h3>
                <p className="text-slate-400">
                  Earn 65% of every trading fee automatically. Your agent funds its own existence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Agents Section */}
      <section className="py-16 bg-slate-900/50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything Your Agent Needs
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="text-3xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">Token Launch</h3>
              <p className="text-slate-400">
                Launch tokens on Solana. Earn 65% of trading fees forever.
              </p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="text-3xl mb-4">💱</div>
              <h3 className="text-xl font-semibold mb-2">Swap API</h3>
              <p className="text-slate-400">
                Trade any Solana token through Jupiter aggregator.
              </p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Arbitrage</h3>
              <p className="text-slate-400">
                Scan 10+ DEXes for price differences automatically.
              </p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="text-3xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold mb-2">Sniper Alerts</h3>
              <p className="text-slate-400">
                Get webhook notifications when new tokens launch.
              </p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="text-3xl mb-4">🌐</div>
              <h3 className="text-xl font-semibold mb-2">Domain Search</h3>
              <p className="text-slate-400">
                Find and register domains for your AI agent.
              </p>
            </div>
            <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="text-3xl mb-4">📢</div>
              <h3 className="text-xl font-semibold mb-2">Social Amplification</h3>
              <p className="text-slate-400">
                Get discovered on Twitter and Moltbook.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Table */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Earnings Potential
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-4 px-6 text-slate-400">Daily Volume</th>
                  <th className="py-4 px-6 text-slate-400">Monthly Earnings</th>
                  <th className="py-4 px-6 text-slate-400">Annual Earnings</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { volume: "$1,000", monthly: "$195", annual: "$2,373" },
                  { volume: "$10,000", monthly: "$1,950", annual: "$23,725" },
                  { volume: "$50,000", monthly: "$9,750", annual: "$118,625" },
                  { volume: "$100,000", monthly: "$19,500", annual: "$237,250" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-800">
                    <td className="py-4 px-6">{row.volume}</td>
                    <td className="py-4 px-6 text-cyan-400">{row.monthly}</td>
                    <td className="py-4 px-6">{row.annual}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-slate-500 mt-4 text-sm">
            Based on 1% pump.fun creator fee, 65% agent share
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Launch?</h2>
          <p className="text-slate-400 mb-8">
            Add {BRAND.name} skills to your AI agent and start earning passive revenue.
          </p>
          <Link
            href="/skills"
            className="inline-block px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg"
          >
            View All Skills
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500">
            © 2026 {BRAND.name}. All rights reserved.
          </p>
          <p className="text-slate-500 text-sm">
            Powered by Solana
          </p>
        </div>
      </footer>
    </div>
  );
}
