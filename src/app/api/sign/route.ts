import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function resolveBackendUrl(): string {
    const candidate = process.env.SIGNER_API_URL ?? process.env.NEXT_PUBLIC_SIGNER_API_URL;
    if (!candidate || candidate.trim() === "") {
        throw new Error("SIGNER_API_URL is not configured");
    }
    return candidate.trim();
}

function resolveSignApiKey(): string {
    const candidate = process.env.EDGE_SIGN_API_KEY ?? process.env.NEXT_PUBLIC_EDGE_SIGN_API_KEY;
    if (!candidate || candidate.trim() === "") {
        throw new Error("EDGE_SIGN_API_KEY is not configured");
    }
    return candidate.trim();
}

export async function POST(request: NextRequest) {
    try {
        const payload = (await request.json()) as {
            payerAddress?: string;
            tokenAddress?: string;
            validUntil?: number;
            validAfter?: number;
            isActivation?: boolean;
            chain?: string;
            chainId?: number;
        };

        if (!payload.payerAddress || !payload.tokenAddress) {
            return NextResponse.json(
                { error: "payerAddress and tokenAddress are required" },
                { status: 400 },
            );
        }

        const backendUrl = resolveBackendUrl();
        const signApiKey = resolveSignApiKey();

        const upstreamResponse = await fetch(`${backendUrl}/sign`, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-api-key": signApiKey,
            },
            body: JSON.stringify(payload),
            cache: "no-store",
        });

        const data = (await upstreamResponse.json().catch(() => ({}))) as Record<string, unknown>;
        return NextResponse.json(data, { status: upstreamResponse.status });
    } catch (error) {
        return NextResponse.json(
            {
                error: "sign_proxy_failed",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
