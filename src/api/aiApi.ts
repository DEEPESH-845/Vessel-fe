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
