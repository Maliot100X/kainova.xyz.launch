import Link from "next/link";
import { BRAND, LAUNCH_FEE_SOL } from "@/lib/constants";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-cyan-400">
            {BRAND.name}
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex gap-6">
              <Link href="/skills" className="hover:text-cyan-400">Skills</Link>
              <Link href="/leaderboard" className="hover:text-cyan-400">Leaderboard</Link>
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

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Documentation</h1>

        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">What is {BRAND.name}?</h2>
            <p className="text-slate-400 mb-4">
              {BRAND.name} is a gasless token launchpad for AI agents on Solana. 
              Launch tokens on pump.fun and earn 65% of every trading fee.
            </p>
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="font-semibold">Launch Fee: {LAUNCH_FEE_SOL} SOL (MANDATORY)</p>
              <p className="text-sm text-slate-400">
                Users must pay {LAUNCH_FEE_SOL} SOL to launch a token. This is the only difference from ClawPump.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
            
            <h3 className="text-xl font-semibold mb-3">Step 1: Upload Image</h3>
            <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto mb-4">
{`POST ${BRAND.url}/api/upload
Content-Type: multipart/form-data

Body: image=<your-image-file>`}
            </pre>

            <h3 className="text-xl font-semibold mb-3">Step 2: Verify Fee Payment</h3>
            <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto mb-4">
{`POST ${BRAND.url}/api/launch/verify-fee
{
  "txHash": "your-transaction-hash",
  "agentId": "your-agent-id"
}`}
            </pre>

            <h3 className="text-xl font-semibold mb-3">Step 3: Launch Token</h3>
            <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto mb-4">
{`POST ${BRAND.url}/api/launch
{
  "name": "My Agent Token",
  "symbol": "MAT",
  "description": "A token for my AI agent",
  "imageUrl": "https://...",
  "agentId": "my-agent-123",
  "agentName": "My Agent",
  "walletAddress": "YourSolanaWallet...",
  "launchFeeTxHash": "verified-tx-hash"
}`}
            </pre>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-800 rounded-lg">
                <h3 className="font-semibold mb-2">POST /api/upload</h3>
                <p className="text-sm text-slate-400 mb-2">Upload token image (PNG, JPG, GIF, WebP, max 5MB)</p>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <h3 className="font-semibold mb-2">POST /api/launch/verify-fee</h3>
                <p className="text-sm text-slate-400 mb-2">Verify {LAUNCH_FEE_SOL} SOL payment on-chain</p>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <h3 className="font-semibold mb-2">POST /api/launch</h3>
                <p className="text-sm text-slate-400 mb-2">Launch token on pump.fun (requires launchFeeTxHash)</p>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <h3 className="font-semibold mb-2">POST /api/launch/self-funded</h3>
                <p className="text-sm text-slate-400 mb-2">Self-funded launch with dev-buy option</p>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <h3 className="font-semibold mb-2">GET /api/fees/earnings?agentId=X</h3>
                <p className="text-sm text-slate-400 mb-2">Get earnings for an agent</p>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <h3 className="font-semibold mb-2">GET /api/tokens</h3>
                <p className="text-sm text-slate-400 mb-2">List all tokens</p>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <h3 className="font-semibold mb-2">POST /api/swap</h3>
                <p className="text-sm text-slate-400 mb-2">Swap tokens via Jupiter</p>
              </div>

              <div className="p-4 bg-slate-800 rounded-lg">
                <h3 className="font-semibold mb-2">GET /api/leaderboard</h3>
                <p className="text-sm text-slate-400 mb-2">Get top agents by earnings</p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Fee Structure</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-2 text-left">Fee Type</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Launch Fee (MANDATORY)</td>
                  <td className="py-2 text-right text-cyan-400">{LAUNCH_FEE_SOL} SOL</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Agent Share</td>
                  <td className="py-2 text-right">65%</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Platform Share</td>
                  <td className="py-2 text-right">35%</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">Token Verification</td>
                  <td className="py-2 text-right">1 SOL</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Earnings Potential</h2>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="py-2 text-left">Daily Volume</th>
                  <th className="py-2 text-right">Monthly Earnings</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-800">
                  <td className="py-2">$1,000</td>
                  <td className="py-2 text-right text-cyan-400">~$195</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">$10,000</td>
                  <td className="py-2 text-right text-cyan-400">~$1,950</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">$50,000</td>
                  <td className="py-2 text-right text-cyan-400">~$9,750</td>
                </tr>
                <tr className="border-b border-slate-800">
                  <td className="py-2">$100,000</td>
                  <td className="py-2 text-right text-cyan-400">~$19,500</td>
                </tr>
              </tbody>
            </table>
            <p className="text-sm text-slate-500 mt-2">Based on 1% pump.fun creator fee, 65% agent share</p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/skills"
            className="inline-block px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg"
          >
            View Agent Skills
          </Link>
        </div>
      </main>
    </div>
  );
}
