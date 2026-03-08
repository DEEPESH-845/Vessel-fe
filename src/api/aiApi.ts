import { env } from "@/config/env";

function getApiUrl(): string {
    if (!env.signerApiUrl) {
        throw new Error("NEXT_PUBLIC_SIGNER_API_URL is not set");
    }
    return env.signerApiUrl;
}

export type CopilotPlan = {
    intent: "swap" | "send" | "topup" | "balance" | "unknown";
    confidence: number;
    summary: string;
    extracted: {
        amount?: string;
        tokenIn?: string;
        tokenOut?: string;
        recipient?: string;
        chain?: "base_sepolia" | "etherlink_shadownet";
    };
    steps: string[];
};

export type MerchantDashboardResponse = {
    windowDays: number;
    generatedAt: string;
    kpis: {
        totalSwaps: number;
        totalVolumeIn: string;
        avgDailySwaps: number;
        projectedNext7Days: number;
    };
    chainDistribution: Record<string, number>;
    topPairs: Array<{ pair: string; count: number }>;
    dailySeries: Array<{ date: string; count: number }>;
    insight: string;
};

export type RiskAssessmentResponse = {
    chain: "base_sepolia" | "etherlink_shadownet";
    chainId: number;
    risk: {
        score: number;
        level: "low" | "medium" | "high" | "critical";
        allowSponsoredGas: boolean;
        reasons: string[];
        recommendedAction: "allow" | "review" | "block";
    };
    explanation: string;
};

export type KiroPlanResponse = {
    ok: boolean;
    plan: {
        mode: "kiro";
        summary: string;
        steps: Array<{
            id: string;
            title: string;
            outcome: string;
        }>;
    };
};

export type AgentcoreSessionResponse = {
    ok: boolean;
    provider: "bedrock-agentcore" | "bedrock-agentcore-fallback";
    configured?: boolean;
    result: {
        sessionId: string;
        outputText: string;
    };
    fallbackPlan?: CopilotPlan;
};

export async function fetchCopilotPlan(prompt: string): Promise<CopilotPlan> {
    const res = await fetch(`${getApiUrl()}/ai/copilot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "copilot failed" }));
        throw new Error(err.message || "copilot failed");
    }

    const data = await res.json();
    return data.plan as CopilotPlan;
}

export async function fetchMerchantDashboard(
    windowDays = 30
): Promise<MerchantDashboardResponse> {
    const res = await fetch(`${getApiUrl()}/ai/merchant/dashboard?windowDays=${windowDays}`);

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "dashboard failed" }));
        throw new Error(err.message || "dashboard failed");
    }

    return (await res.json()) as MerchantDashboardResponse;
}

export async function fetchRiskAssessment(params: {
    payerAddress: string;
    tokenAddress: string;
    isActivation?: boolean;
    chainId?: number;
}): Promise<RiskAssessmentResponse> {
    const url = new URL(`${getApiUrl()}/risk/assess`);
    if (params.chainId) {
        url.searchParams.set("chainId", String(params.chainId));
    }

    const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            payerAddress: params.payerAddress,
            tokenAddress: params.tokenAddress,
            isActivation: params.isActivation ?? false,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "risk assessment failed" }));
        throw new Error(err.message || "risk assessment failed");
    }

    return (await res.json()) as RiskAssessmentResponse;
}

export async function fetchKiroPlan(goal: string, context?: Record<string, unknown>) {
    const res = await fetch(`${getApiUrl()}/ai/kiro/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, ...(context ? { context } : {}) }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "kiro plan failed" }));
        throw new Error(err.message || "kiro plan failed");
    }

    return (await res.json()) as KiroPlanResponse;
}

export async function fetchAgentcoreSession(input: {
    inputText: string;
    sessionId?: string;
    userId?: string;
}): Promise<AgentcoreSessionResponse> {
    const res = await fetch(`${getApiUrl()}/ai/agentcore/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "agentcore session failed" }));
        throw new Error(err.message || "agentcore session failed");
    }

    return (await res.json()) as AgentcoreSessionResponse;
}
