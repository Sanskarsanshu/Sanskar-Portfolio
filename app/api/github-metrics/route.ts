import { NextResponse } from "next/server";
import { SITE_CONFIG } from "@/lib/config";

// Cache duration: 30 minutes (1800 seconds)
const CACHE_TTL_MS = 30 * 60 * 1000;

export interface GitHubLanguageShare {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GitHubFeaturedRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string;
  url: string;
  isFork: boolean;
}

export interface GitHubActivityEvent {
  id: string;
  type: string;
  action: string;
  repo: string;
  repoUrl: string;
  details: string;
  timestamp: string;
  source: "github" | "system";
}

export interface GitHubMetricsPayload {
  status: "operational" | "degraded";
  source: "GitHub REST API";
  cachedAt: number;
  cacheTtlSeconds: number;
  isCached: boolean;
  lastSuccessfulSync: string;
  rateLimitRemaining?: number;
  warning?: string;
  user: {
    username: string;
    publicRepos: number;
    followers: number;
    profileUrl: string;
  };
  metrics: {
    totalStars: number;
    totalForks: number;
    primaryLanguage: string;
    languages: GitHubLanguageShare[];
  };
  featuredRepos: GitHubFeaturedRepo[];
  recentActivity: GitHubActivityEvent[];
}

// In-memory cache across requests on the server instance
let cachedPayload: GitHubMetricsPayload | null = null;
let lastFetchTimestamp = 0;

// Standard language colors for accurate visualization
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  "C++": "#f34b7d",
  C: "#555555",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Rust: "#dea584",
  Go: "#00add8",
  Shell: "#89e051",
  Dockerfile: "#384d54",
  Java: "#b07219",
};

export const dynamic = "force-dynamic";

export async function GET() {
  const now = Date.now();
  const username = SITE_CONFIG.githubUsername;

  // Serve fresh cache if within TTL
  if (cachedPayload && now - lastFetchTimestamp < CACHE_TTL_MS) {
    return NextResponse.json(
      {
        ...cachedPayload,
        isCached: true,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=1800",
        },
      }
    );
  }

  const headers: Record<string, string> = {
    "User-Agent": "Sanskar-Portfolio-Telemetry/1.0",
    Accept: "application/vnd.github.v3+json",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const [userRes, reposRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers }),
      fetch(`https://api.github.com/users/${username}/events/public?per_page=10`, { headers }),
    ]);

    const rateLimitRemaining = Number(userRes.headers.get("x-ratelimit-remaining")) || undefined;

    // Check for rate limit or errors
    if (!userRes.ok || !reposRes.ok) {
      const isRateLimited = userRes.status === 403 || reposRes.status === 403;
      const errorMsg = isRateLimited
        ? "GitHub API rate limit reached (60/hr unauthenticated limit)"
        : `GitHub API error: ${userRes.statusText}`;

      // Return stale cache with degraded flag if we have one
      if (cachedPayload) {
        return NextResponse.json(
          {
            ...cachedPayload,
            status: "degraded",
            warning: errorMsg,
            isCached: true,
            rateLimitRemaining: 0,
          },
          { status: 200 }
        );
      }

      // If no cache exists, return clean graceful degraded state
      return NextResponse.json(
        {
          status: "degraded",
          source: "GitHub REST API",
          cachedAt: now,
          cacheTtlSeconds: 1800,
          isCached: false,
          lastSuccessfulSync: new Date().toISOString(),
          rateLimitRemaining: 0,
          warning: errorMsg,
          user: {
            username,
            publicRepos: 0,
            followers: 0,
            profileUrl: `https://github.com/${username}`,
          },
          metrics: {
            totalStars: 0,
            totalForks: 0,
            primaryLanguage: "None",
            languages: [],
          },
          featuredRepos: [],
          recentActivity: [],
        } satisfies GitHubMetricsPayload,
        { status: 200 }
      );
    }

    const userData = await userRes.json();
    const reposData = await reposRes.json();
    const eventsData = eventsRes.ok ? await eventsRes.json() : [];

    // Calculate stars and forks
    let totalStars = 0;
    let totalForks = 0;
    const langCounts: Record<string, number> = {};

    interface RawRepo {
      name: string;
      description: string | null;
      language: string | null;
      stargazers_count: number;
      forks_count: number;
      updated_at: string;
      html_url: string;
      fork: boolean;
      archived: boolean;
    }

    const validRepos: RawRepo[] = Array.isArray(reposData) ? reposData : [];

    validRepos.forEach((repo) => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    });

    // Compute language distribution percentages
    const totalLangInstances = Object.values(langCounts).reduce((a, b) => a + b, 0);
    const languages: GitHubLanguageShare[] = Object.entries(langCounts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalLangInstances > 0 ? Math.round((count / totalLangInstances) * 100) : 0,
        color: LANGUAGE_COLORS[name] || "#7aa6d0",
      }))
      .sort((a, b) => b.count - a.count);

    const primaryLanguage = languages[0]?.name || "Full Stack";

    // Rank featured repositories
    // Criteria: (stars * 10) + (forks * 5) + (non-fork bonus) + (description bonus)
    const featuredRepos: GitHubFeaturedRepo[] = validRepos
      .filter((r) => !r.archived)
      .sort((a, b) => {
        const scoreA =
          (a.stargazers_count || 0) * 10 +
          (a.forks_count || 0) * 5 +
          (!a.fork ? 5 : 0) +
          (a.description ? 3 : 0) +
          new Date(a.updated_at).getTime() / 1e11;
        const scoreB =
          (b.stargazers_count || 0) * 10 +
          (b.forks_count || 0) * 5 +
          (!b.fork ? 5 : 0) +
          (b.description ? 3 : 0) +
          new Date(b.updated_at).getTime() / 1e11;
        return scoreB - scoreA;
      })
      .slice(0, 4)
      .map((r) => ({
        name: r.name,
        description: r.description,
        language: r.language,
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        updatedAt: r.updated_at,
        url: r.html_url,
        isFork: r.fork,
      }));

    // Parse public activity events
    interface RawEvent {
      id: string;
      type: string;
      created_at: string;
      repo: { name: string; url: string };
      payload?: {
        commits?: Array<{ message: string }>;
        action?: string;
        ref_type?: string;
      };
    }

    const rawEvents: RawEvent[] = Array.isArray(eventsData) ? eventsData : [];
    const recentActivity: GitHubActivityEvent[] = rawEvents.slice(0, 6).map((ev) => {
      let action = "Activity detected";
      let details = "";

      if (ev.type === "PushEvent") {
        const commitCount = ev.payload?.commits?.length || 1;
        const firstMsg = ev.payload?.commits?.[0]?.message?.split("\n")[0] || "";
        action = `Pushed ${commitCount} commit${commitCount > 1 ? "s" : ""}`;
        details = firstMsg ? `"${firstMsg.slice(0, 60)}${firstMsg.length > 60 ? "..." : ""}"` : "";
      } else if (ev.type === "CreateEvent") {
        action = `Created ${ev.payload?.ref_type || "repository"}`;
        details = "New repository branch / project initialized";
      } else if (ev.type === "WatchEvent") {
        action = "Starred repository";
      } else if (ev.type === "ForkEvent") {
        action = "Forked repository";
      } else if (ev.type === "PullRequestEvent") {
        action = `${ev.payload?.action || "Opened"} Pull Request`;
      } else if (ev.type === "IssuesEvent") {
        action = `${ev.payload?.action || "Updated"} Issue`;
      }

      const repoShortName = ev.repo.name.replace(`${username}/`, "");
      const repoUrl = `https://github.com/${ev.repo.name}`;

      return {
        id: ev.id,
        type: ev.type,
        action,
        repo: repoShortName,
        repoUrl,
        details,
        timestamp: ev.created_at,
        source: "github",
      };
    });

    const payload: GitHubMetricsPayload = {
      status: "operational",
      source: "GitHub REST API",
      cachedAt: now,
      cacheTtlSeconds: 1800,
      isCached: false,
      lastSuccessfulSync: new Date(now).toISOString(),
      rateLimitRemaining,
      user: {
        username: userData.login || username,
        publicRepos: userData.public_repos || validRepos.length,
        followers: userData.followers || 0,
        profileUrl: userData.html_url || `https://github.com/${username}`,
      },
      metrics: {
        totalStars,
        totalForks,
        primaryLanguage,
        languages,
      },
      featuredRepos,
      recentActivity,
    };

    // Save to memory cache
    cachedPayload = payload;
    lastFetchTimestamp = now;

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=60, stale-while-revalidate=1800",
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Network error fetching GitHub data";

    if (cachedPayload) {
      return NextResponse.json(
        {
          ...cachedPayload,
          status: "degraded",
          warning: errorMsg,
          isCached: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        status: "degraded",
        source: "GitHub REST API",
        cachedAt: now,
        cacheTtlSeconds: 1800,
        isCached: false,
        lastSuccessfulSync: new Date().toISOString(),
        warning: errorMsg,
        user: {
          username,
          publicRepos: 0,
          followers: 0,
          profileUrl: `https://github.com/${username}`,
        },
        metrics: {
          totalStars: 0,
          totalForks: 0,
          primaryLanguage: "Unavailable",
          languages: [],
        },
        featuredRepos: [],
        recentActivity: [],
      } satisfies GitHubMetricsPayload,
      { status: 200 }
    );
  }
}
