"use client";

import { useMemo, useState } from "react";
import { BotMessageSquare, Loader2, ShieldAlert, Workflow } from "lucide-react";
import {
  fetchAgentcoreSession,
  fetchKiroPlan,
  fetchRiskAssessment,
  type AgentcoreSessionResponse,
  type KiroPlanResponse,
  type RiskAssessmentResponse,
} from "@/api/aiApi";

const demoAddress = "0x1111111111111111111111111111111111111111";

type ToolKey = "risk" | "kiro" | "agentcore";

export function IntegrationWorkbenchPanel() {
  const [active, setActive] = useState<ToolKey>("risk");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [riskResult, setRiskResult] = useState<RiskAssessmentResponse | null>(null);
  const [kiroResult, setKiroResult] = useState<KiroPlanResponse | null>(null);
  const [agentResult, setAgentResult] = useState<AgentcoreSessionResponse | null>(null);

  const [riskPayer, setRiskPayer] = useState(demoAddress);
  const [riskToken, setRiskToken] = useState(demoAddress);
  const [riskActivation, setRiskActivation] = useState(false);

  const [kiroGoal, setKiroGoal] = useState("Ship safer auto-routing with deterministic guardrails");
  const [agentInput, setAgentInput] = useState("Summarize today's risk posture");

  const tabs = useMemo(
    () => [
      { key: "risk" as const, label: "Risk Assess" },
      { key: "kiro" as const, label: "Kiro Plan" },
      { key: "agentcore" as const, label: "AgentCore" },
    ],
    [],
  );

  const runActive = async () => {
    setLoading(true);
    setError(null);

    try {
      if (active === "risk") {
        const data = await fetchRiskAssessment({
          payerAddress: riskPayer.trim(),
          tokenAddress: riskToken.trim(),
          isActivation: riskActivation,
        });
        setRiskResult(data);
        return;
      }

      if (active === "kiro") {
        const data = await fetchKiroPlan(kiroGoal.trim());
        setKiroResult(data);
        return;
      }

      if (active === "agentcore") {
        const data = await fetchAgentcoreSession({
          inputText: agentInput.trim(),
        });
        setAgentResult(data);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-700 bg-black-primary p-4 space-y-4 lg:col-span-2">
      <div className="flex items-center gap-2 text-zinc-100">
        <Workflow className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold tracking-wide">AI Integration Workbench</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`rounded-lg px-3 py-1.5 text-xs border ${
              active === tab.key
                ? "border-primary bg-primary/10 text-zinc-100"
                : "border-zinc-700 text-zinc-300 hover:text-zinc-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "risk" && (
        <div className="space-y-2">
          <input
            value={riskPayer}
            onChange={(event) => setRiskPayer(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black-secondary p-2 text-xs text-zinc-100"
            placeholder="payerAddress"
          />
          <input
            value={riskToken}
            onChange={(event) => setRiskToken(event.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-black-secondary p-2 text-xs text-zinc-100"
            placeholder="tokenAddress"
          />
          <label className="flex items-center gap-2 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={riskActivation}
              onChange={(event) => setRiskActivation(event.target.checked)}
            />
            Activation flow
          </label>
        </div>
      )}

      {active === "kiro" && (
        <textarea
          value={kiroGoal}
          onChange={(event) => setKiroGoal(event.target.value)}
          className="w-full min-h-20 rounded-lg border border-zinc-700 bg-black-secondary p-2 text-xs text-zinc-100"
          placeholder="Describe the implementation goal"
        />
      )}

      {active === "agentcore" && (
        <textarea
          value={agentInput}
          onChange={(event) => setAgentInput(event.target.value)}
          className="w-full min-h-20 rounded-lg border border-zinc-700 bg-black-secondary p-2 text-xs text-zinc-100"
          placeholder="Enter an agent prompt"
        />
      )}

      <button
        onClick={runActive}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BotMessageSquare className="w-4 h-4" />}
        Run {tabs.find((tab) => tab.key === active)?.label}
      </button>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-300 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          {error}
        </div>
      )}

      {riskResult && active === "risk" && (
        <div className="rounded-lg border border-zinc-700 bg-black-secondary p-3 text-xs space-y-2">
          <p className="text-zinc-200">
            Risk: <span className="uppercase">{riskResult.risk.level}</span> ({riskResult.risk.score}/100)
          </p>
          <p className="text-zinc-300">Action: {riskResult.risk.recommendedAction}</p>
          <p className="text-zinc-400">{riskResult.explanation}</p>
        </div>
      )}

      {kiroResult && active === "kiro" && (
        <div className="rounded-lg border border-zinc-700 bg-black-secondary p-3 text-xs space-y-2">
          <p className="text-zinc-200">{kiroResult.plan.summary}</p>
          {kiroResult.plan.steps.map((step, idx) => (
            <p key={`${step.id}-${idx}`} className="text-zinc-400">
              {idx + 1}. {step.title} - {step.outcome}
            </p>
          ))}
        </div>
      )}

      {agentResult && active === "agentcore" && (
        <div className="rounded-lg border border-zinc-700 bg-black-secondary p-3 text-xs space-y-2">
          <p className="text-zinc-300">Provider: {agentResult.provider}</p>
          <p className="text-zinc-300">Session: {agentResult.result.sessionId}</p>
          <p className="text-zinc-200">{agentResult.result.outputText || "(no output returned)"}</p>
        </div>
      )}
    </div>
  );
}
