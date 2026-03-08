import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function resolveBackendUrl(): string {
    const candidate =
        process.env.SIGNER_API_URL ?? process.env.NEXT_PUBLIC_SIGNER_API_URL;
    if (!candidate || candidate.trim() === "") {
        throw new Error("SIGNER_API_URL is not configured");
    }
    return candidate.trim();
}

function resolveTopupApiKey(): string {
    const candidate =
        process.env.EDGE_TOPUP_API_KEY ?? process.env.NEXT_PUBLIC_EDGE_TOPUP_API_KEY;
    if (!candidate || candidate.trim() === "") {
        throw new Error("EDGE_TOPUP_API_KEY is not configured");
    }
    return candidate.trim();
}

export async function POST(request: NextRequest) {
    try {
        const payload = (await request.json()) as {
            walletAddress?: string;
            amount?: string;
            chain?: string;
            idempotencyKey?: string;
        };

        if (!payload.walletAddress || !payload.amount || !payload.chain) {
            return NextResponse.json(
                { error: "walletAddress, amount, and chain are required" },
                { status: 400 },
            );
        }

        const backendUrl = resolveBackendUrl();
        const topupApiKey = resolveTopupApiKey();

        const idempotencyKey =
            typeof payload.idempotencyKey === "string" && payload.idempotencyKey.trim() !== ""
                ? payload.idempotencyKey.trim()
                : `topup-${randomUUID()}`;

        const upstreamResponse = await fetch(`${backendUrl}/topup-idrx`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "idempotency-key": idempotencyKey,
                "x-api-key": topupApiKey,
            },
            body: JSON.stringify({
                walletAddress: payload.walletAddress,
                amount: payload.amount,
                chain: payload.chain,
            }),
            cache: "no-store",
        });

        const data = (await upstreamResponse.json().catch(() => ({}))) as Record<string, unknown>;
        return NextResponse.json(data, { status: upstreamResponse.status });
    } catch (error) {
        return NextResponse.json(
            {
                error: "topup_proxy_failed",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
