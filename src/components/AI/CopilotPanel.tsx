"use client";

import { useState } from "react";
import { Bot, Loader2, Sparkles } from "lucide-react";
import { fetchCopilotPlan, type CopilotPlan } from "@/api/aiApi";

export function CopilotPanel() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<CopilotPlan | null>(null);

  const runCopilot = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const next = await fetchCopilotPlan(prompt.trim());
      setPlan(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get copilot plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-700 bg-black-primary p-4 space-y-4">
      <div className="flex items-center gap-2 text-zinc-100">
        <Bot className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-wide">NLP Payment Copilot</h3>
      </div>

      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Try: Swap 100 USDC to IDRX on Base with best rate"
        className="w-full min-h-24 rounded-xl border border-zinc-700 bg-black-secondary p-3 text-sm text-zinc-100 outline-none focus:border-primary"
      />

      <button
        onClick={runCopilot}
        disabled={loading || !prompt.trim()}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
        Generate AI plan
      </button>

      {error && <p className="text-xs text-red-300">{error}</p>}

      {plan && (
        <div className="rounded-xl border border-zinc-700 bg-black-secondary p-3 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-300">
            <span>Intent</span>
            <span className="uppercase">{plan.intent}</span>
          </div>
          <div className="flex justify-between text-zinc-300">
            <span>Confidence</span>
            <span>{Math.round(plan.confidence * 100)}%</span>
          </div>
          <p className="text-zinc-200">{plan.summary}</p>
          <div className="space-y-1">
            {plan.steps.map((step, idx) => (
              <p key={`${idx}-${step}`} className="text-zinc-400">
                {idx + 1}. {step}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
