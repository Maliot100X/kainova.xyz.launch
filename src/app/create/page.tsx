"use client";

import { useState } from "react";
import { BRAND, LAUNCH_FEE_SOL } from "@/lib/constants";

export default function CreatePage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    description: "",
    imageUrl: "",
    agentId: "",
    agentName: "",
    walletAddress: "",
    launchFeeTxHash: "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setForm({ ...form, imageUrl: data.imageUrl });
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err) {
      setError("Upload failed");
    }
    setLoading(false);
  };

  const handleVerifyFee = async () => {
    if (!form.launchFeeTxHash) {
      setError("Please enter the transaction hash");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/launch/verify-fee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: form.launchFeeTxHash,
          agentId: form.agentId,
        }),
      });
      const data = await res.json();

      if (data.verified) {
        setStep(3);
      } else {
        setError(data.error || "Fee verification failed");
      }
    } catch (err) {
      setError("Verification failed");
    }
    setLoading(false);
  };

  const handleLaunch = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(data);
        setStep(4);
      } else {
        setError(data.error || "Launch failed");
      }
    } catch (err) {
      setError("Launch failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="text-2xl font-bold text-cyan-400">
            {BRAND.name}
          </a>
          <nav className="flex gap-6">
            <a href="/leaderboard" className="hover:text-cyan-400">Leaderboard</a>
            <a href="/docs" className="hover:text-cyan-400">Docs</a>
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8 text-center">Launch Your Token</h1>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= s ? "bg-cyan-500 text-black" : "bg-slate-700"
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div className={`w-16 h-1 ${step > s ? "bg-cyan-500" : "bg-slate-700"}`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Token Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block mb-2">Token Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
                placeholder="My AI Agent Token"
                maxLength={32}
              />
            </div>

            <div>
              <label className="block mb-2">Symbol *</label>
              <input
                type="text"
                value={form.symbol}
                onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
                placeholder="MAT"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block mb-2">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
                placeholder="Describe your token..."
                rows={3}
                maxLength={500}
              />
            </div>

            <div>
              <label className="block mb-2">Token Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
              />
              {form.imageUrl && (
                <img src={form.imageUrl} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded" />
              )}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!form.name || !form.symbol || !form.description || !form.imageUrl}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-black font-semibold rounded-lg"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Agent & Wallet */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block mb-2">Agent ID *</label>
              <input
                type="text"
                value={form.agentId}
                onChange={(e) => setForm({ ...form, agentId: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
                placeholder="my-agent-123"
              />
            </div>

            <div>
              <label className="block mb-2">Agent Name *</label>
              <input
                type="text"
                value={form.agentName}
                onChange={(e) => setForm({ ...form, agentName: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
                placeholder="My AI Agent"
              />
            </div>

            <div>
              <label className="block mb-2">Solana Wallet Address *</label>
              <input
                type="text"
                value={form.walletAddress}
                onChange={(e) => setForm({ ...form, walletAddress: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
                placeholder="Your Solana wallet for fee payouts"
              />
            </div>

            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="font-semibold mb-2">Launch Fee: {LAUNCH_FEE_SOL} SOL</p>
              <p className="text-sm text-slate-400 mb-4">
                Send exactly {LAUNCH_FEE_SOL} SOL to: <code className="bg-slate-800 px-2 py-1 rounded">{BRAND.twitter}</code>
              </p>
              <p className="text-xs text-slate-500">
                Admin Wallet: {process.env.NEXT_PUBLIC_ADMIN_WALLET}
              </p>
            </div>

            <div>
              <label className="block mb-2">Transaction Hash *</label>
              <input
                type="text"
                value={form.launchFeeTxHash}
                onChange={(e) => setForm({ ...form, launchFeeTxHash: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
                placeholder="Enter your transaction hash after paying"
              />
            </div>

            <button
              onClick={handleVerifyFee}
              disabled={loading || !form.agentId || !form.agentName || !form.walletAddress || !form.launchFeeTxHash}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-black font-semibold rounded-lg"
            >
              {loading ? "Verifying..." : "Verify Payment & Continue"}
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full py-3 border border-slate-600 hover:border-slate-500 rounded-lg"
            >
              Back
            </button>
          </div>
        )}

        {/* Step 3: Launch */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-green-400">Payment Verified!</p>
            </div>

            <p className="text-center text-slate-400">
              Ready to launch your token. Click below to complete the launch.
            </p>

            <button
              onClick={handleLaunch}
              disabled={loading}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 text-black font-semibold rounded-lg"
            >
              {loading ? "Launching..." : "Launch Token"}
            </button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && success && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">🎉</div>
              <p className="text-green-400 text-xl font-bold">Token Launched!</p>
            </div>

            <div className="p-4 bg-slate-800 rounded-lg space-y-2">
              <p><span className="text-slate-400">Token:</span> {success.token.name} ({success.token.symbol})</p>
              <p><span className="text-slate-400">Mint:</span> <code className="text-xs">{success.token.mintAddress}</code></p>
              <p><span className="text-slate-400">Pump.fun:</span> <a href={success.token.pumpUrl} target="_blank" className="text-cyan-400">View</a></p>
            </div>

            {success.socialAmplification && (
              <div className="p-4 bg-slate-800 rounded-lg">
                <h3 className="font-semibold mb-2">Share on Twitter</h3>
                <a
                  href={success.socialAmplification.twitter?.tweetIntentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center py-2 bg-[#1DA1F2] hover:bg-[#1a91da] text-white rounded-lg"
                >
                  Tweet about your token
                </a>
              </div>
            )}

            <a href="/" className="block text-center py-3 border border-slate-600 hover:border-slate-500 rounded-lg">
              Back to Home
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
