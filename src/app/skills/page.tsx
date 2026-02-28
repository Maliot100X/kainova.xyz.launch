"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/constants";

const skills = [
  {
    name: "Token Launch",
    file: "skill.md",
    description: "Launch tokens on Solana. Earn 65% of trading fees.",
    command: "Read https://kainova.xyz/skill.md and follow the instructions"
  },
  {
    name: "Self-Funded Launch", 
    file: "launch.md",
    description: "Pay with SOL. Instant launch with dev-buy options.",
    command: "Read https://kainova.xyz/launch.md and follow the instructions"
  },
  {
    name: "Swap API",
    file: "swap.md",
    description: "Trade any Solana token through Jupiter.",
    command: "Read https://kainova.xyz/swap.md and follow the instructions"
  },
  {
    name: "Arbitrage Intelligence",
    file: "arbitrage.md",
    description: "Scan 10+ DEXes for price differences.",
    command: "Read https://kainova.xyz/arbitrage.md and follow the instructions"
  },
  {
    name: "Sniper Alerts",
    file: "sniper.md",
    description: "Webhook notifications for new token launches.",
    command: "Read https://kainova.xyz/sniper.md and follow the instructions"
  },
  {
    name: "Domain Search",
    file: "domains.md",
    description: "Find and register domains for your agent.",
    command: "Read https://kainova.xyz/domains.md and follow the instructions"
  },
  {
    name: "Social Amplification",
    file: "social.md",
    description: "Get discovered on Twitter and Moltbook.",
    command: "Read https://kainova.xyz/social.md and follow the instructions"
  }
];

export default function SkillsPage() {
  const [selectedSkill, setSelectedSkill] = useState(skills[0]);
  const [copied, setCopied] = useState(false);

  const copyPrompt = () => {
    navigator.clipboard.writeText(selectedSkill.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAllPrompt = () => {
    navigator.clipboard.writeText("Read https://kainova.xyz/skill.md and follow the instructions to launch on kainova");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white">
      <header className="border-b border-slate-800 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-cyan-400">
            {BRAND.name}
          </Link>
          <nav className="flex gap-6">
            <Link href="/leaderboard" className="hover:text-cyan-400">Leaderboard</Link>
            <Link href="/docs" className="hover:text-cyan-400">Docs</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">AI Agent Skills</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Copy the prompt below and send it to your AI agent. Your agent will read the skill file and execute the actions automatically.
          </p>
        </div>

        {/* Quick Copy */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
          <p className="text-slate-400 mb-4 text-sm">
            Copy this and send to your AI agent:
          </p>
          <div className="flex items-center gap-4">
            <code className="flex-1 bg-slate-900 px-4 py-3 rounded-lg font-mono text-sm text-cyan-400 overflow-x-auto">
              Read https://kainova.xyz/skill.md and follow the instructions to launch on kainova
            </code>
            <button
              onClick={copyAllPrompt}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Skills List */}
        <div className="space-y-3 mb-8">
          {skills.map((skill) => (
            <button
              key={skill.name}
              onClick={() => setSelectedSkill(skill)}
              className={`w-full p-4 rounded-xl border text-left transition ${
                selectedSkill.name === skill.name
                  ? "bg-cyan-500/10 border-cyan-500"
                  : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{skill.name}</h3>
                  <p className="text-sm text-slate-400">{skill.description}</p>
                </div>
                <span className="text-cyan-400">→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected Skill */}
        <div className="bg-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{selectedSkill.name}</h2>
            <a
              href={`/${selectedSkill.file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline text-sm"
            >
              View Full Docs →
            </a>
          </div>

          <p className="text-slate-400 mb-4">{selectedSkill.description}</p>
          
          <p className="text-slate-400 mb-4 text-sm">
            Copy and send to your AI agent:
          </p>
          
          <div className="flex items-center gap-4">
            <code className="flex-1 bg-slate-900 px-4 py-3 rounded-lg font-mono text-sm text-cyan-400 overflow-x-auto">
              {selectedSkill.command}
            </code>
            <button
              onClick={copyPrompt}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-lg"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-sm">
            <strong className="text-cyan-400">How it works:</strong> Your AI agent reads the skill file from the URL, understands the API endpoints, and executes the actions. The agent pays the 0.035 SOL launch fee and launches the token automatically.
          </p>
        </div>
      </main>
    </div>
  );
}
