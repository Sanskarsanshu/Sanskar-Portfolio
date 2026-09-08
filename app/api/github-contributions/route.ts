import { NextRequest, NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/config";

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface GitHubContributionsPayload {
  username: string;
  year: number | "last";
  totalContributions: number;
  contributions: ContributionDay[];
  firstDate: string;
  lastDate: string;
  lastUpdated: string;
  isCached: boolean;
  source: string;
}

// In-memory server cache across requests
interface CacheEntry {
  payload: GitHubContributionsPayload;
  timestamp: number;
}

const serverCache = new Map<string, CacheEntry>();

// Cache TTLs:
// Historical years never change -> 24 hours
// Current year (2026) -> 15 minutes
const HISTORICAL_TTL_MS = 24 * 60 * 60 * 1000;
const CURRENT_YEAR_TTL_MS = 15 * 60 * 1000;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const yearParam = searchParams.get("year") || "2026";
  const username = SITE_CONFIG.githubUsername || "Sanskarsanshu";

  const isCurrentYear = yearParam === "2026" || yearParam === "last";
  const ttl = isCurrentYear ? CURRENT_YEAR_TTL_MS : HISTORICAL_TTL_MS;
  const now = Date.now();

  const cacheKey = `${username}:${yearParam}`;
  const cached = serverCache.get(cacheKey);

  if (cached && now - cached.timestamp < ttl) {
    return NextResponse.json(
      {
        ...cached.payload,
        isCached: true,
      },
      {
        headers: {
          "Cache-Control": isCurrentYear
            ? "public, s-maxage=900, stale-while-revalidate=1800"
            : "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  }

  try {
    const apiUrl = `https://github-contributions-api.jogruber.de/v4/${username}?y=${yearParam}&client=sanskar-portfolio`;
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "SanskarPortfolio/2.0",
        Accept: "application/json",
      },
      // Next.js fetch revalidation
      next: { revalidate: isCurrentYear ? 900 : 86400 },
    });

    if (!response.ok) {
      throw new Error(`Upstream contribution provider returned status ${response.status}`);
    }

    const data = await response.json();
    const rawContributions: ContributionDay[] = data.contributions || [];

    if (!Array.isArray(rawContributions) || rawContributions.length === 0) {
      throw new Error("No contribution records returned from upstream provider");
    }

    // Sort chronologically
    rawContributions.sort((a, b) => a.date.localeCompare(b.date));

    // Handle date range
    // For 2026 (current year): GitHub displays 2026-01-01 through current date (today)
    // while preserving weekly grid structure.
    const todayStr = new Date().toISOString().slice(0, 10);
    let finalContributions = rawContributions;

    if (yearParam === "2026") {
      finalContributions = rawContributions.filter((c) => c.date <= todayStr);
      // Guarantee at least entries starting from 2026-01-01
      if (finalContributions.length === 0 || finalContributions[0].date > "2026-01-01") {
        finalContributions = rawContributions;
      }
    }

    // Authentically compute total contributions directly from the dataset
    const totalContributions = finalContributions.reduce((sum, item) => sum + (item.count || 0), 0);

    const firstDate = finalContributions[0]?.date || `${yearParam}-01-01`;
    const lastDate = finalContributions[finalContributions.length - 1]?.date || todayStr;

    const payload: GitHubContributionsPayload = {
      username,
      year: yearParam === "last" ? "last" : parseInt(yearParam, 10) || 2026,
      totalContributions,
      contributions: finalContributions,
      firstDate,
      lastDate,
      lastUpdated: new Date().toISOString(),
      isCached: false,
      source: "GitHub Contributions API (Cached)",
    };

    // Store in server cache
    serverCache.set(cacheKey, { payload, timestamp: now });

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": isCurrentYear
          ? "public, s-maxage=900, stale-while-revalidate=1800"
          : "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error(`[api/github-contributions] Error fetching year ${yearParam}:`, error);

    // If we have stale cache, return it with warning
    if (cached) {
      return NextResponse.json(
        {
          ...cached.payload,
          isCached: true,
          warning: "Serving stale cached contributions due to upstream fetch error",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error: "GitHub contributions unavailable",
        year: yearParam,
        lastSuccessfulData: null,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 502 }
    );
  }
}
