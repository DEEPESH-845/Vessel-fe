import { NextResponse } from "next/server";

export const runtime = "nodejs";

function resolveBackendUrl(): string {
    const candidate = process.env.SIGNER_API_URL ?? process.env.NEXT_PUBLIC_SIGNER_API_URL;
    if (!candidate || candidate.trim() === "") {
        throw new Error("SIGNER_API_URL is not configured");
    }
    return candidate.trim();
}

export async function GET() {
    try {
        const backendUrl = resolveBackendUrl();
        const upstreamResponse = await fetch(`${backendUrl}/signer`, {
            method: "GET",
            cache: "no-store",
        });

        const data = (await upstreamResponse.json().catch(() => ({}))) as Record<string, unknown>;
        return NextResponse.json(data, { status: upstreamResponse.status });
    } catch (error) {
        return NextResponse.json(
            {
                error: "signer_proxy_failed",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        );
    }
}
