import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/config";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const now = Date.now();

  return NextResponse.json(
    {
      timestamp: now,
      status: SITE_CONFIG.systemStatus,
      region: "local",
      commit: SITE_CONFIG.deployment.commitHash,
      runtime: SITE_CONFIG.deployment.runtime,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
        "X-Content-Type-Options": "nosniff",
      },
    }
  );
}
