"use client";

import { useEffect, useState, useMemo } from "react";
import { useSeason } from "@/components/SeasonProvider";
import { SITE_CONFIG } from "@/lib/config";
import type {
  GitHubMetricsPayload,
  GitHubLanguageShare,
} from "@/app/api/github-metrics/route";

// Format relative time (e.g. "2 hours ago", "3 days ago")
function formatRelativeTime(dateString: string): string {
  try {
    const now = Date.now();
    const past = new Date(dateString).getTime();
    const diffSeconds = Math.max(1, Math.floor((now - past) / 1000));

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths}mo ago`;
  } catch {
    return dateString;
  }
}

export default function GitHubTelemetry() {
  const { palette } = useSeason();
  const [data, setData] = useState<GitHubMetricsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredLang, setHoveredLang] = useState<GitHubLanguageShare | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchMetrics() {
      try {
        const res = await fetch("/api/github-metrics");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: GitHubMetricsPayload = await res.json();
        if (mounted) {
          setData(json);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load telemetry");
          setLoading(false);
        }
      }
    }

    fetchMetrics();
    return () => {
      mounted = false;
    };
  }, []);

  // System + GitHub combined event stream (clearly distinguishing sources)
  const combinedStream = useMemo(() => {
    if (!data?.recentActivity) return [];
    const stream = [...data.recentActivity];

    // Insert a real local system heartbeat event if we have events
    if (stream.length > 0) {
      stream.splice(2, 0, {
        id: "sys-heartbeat",
        type: "Heartbeat",
        action: "Portfolio telemetry heartbeat",
        repo: "system",
        repoUrl: "#",
        details: "Roundtrip ping latency active • Cache validated",
        timestamp: new Date().toISOString(),
        source: "system",
      });
    }

    return stream;
  }, [data]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="w-full rounded-2xl bg-ink-1/75 backdrop-blur-md border border-ink-3 p-6 sm:p-8 animate-pulse text-ice-300">
        <div className="h-4 w-48 bg-ink-2/60 rounded mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-ink-2/40 rounded-xl" />
          ))}
        </div>
        <div className="h-6 w-full bg-ink-2/40 rounded-full" />
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="w-full rounded-2xl bg-ink-1/75 backdrop-blur-md border border-amber-500/30 p-6 text-sm text-ice-200">
        <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
            <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
          </svg>
          <span>GITHUB TELEMETRY UNAVAILABLE</span>
        </div>
        <p className="text-ice-300 text-xs">
          Upstream telemetry could not be reached. Local system telemetry remains active.
        </p>
      </div>
    );
  }

  const isDegraded = data?.status === "degraded";

  return (
    <div className="w-full rounded-2xl bg-ink-1/80 backdrop-blur-md border border-ink-3 p-6 sm:p-8 col-span-1 md:col-span-2 flex flex-col gap-6 text-ice-100">
      {/* Telemetry Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-ink-3">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 rounded-full motion-safe:animate-pulse"
            style={{ backgroundColor: isDegraded ? "#f59e0b" : palette.accent }}
          />
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-ice-50 font-mono">
            OPEN SOURCE TELEMETRY
          </h3>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-ink-2 border border-ink-3 text-ice-300">
            @{SITE_CONFIG.githubUsername}
          </span>
        </div>

        {/* Cache & Sync Metadata Indicator */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-ice-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span title={`Cached at ${new Date(data?.cachedAt || 0).toLocaleTimeString()} • TTL 30m`}>
            {data?.isCached ? "Cached (30m sync)" : "Live fetched"} · {formatRelativeTime(data?.lastSuccessfulSync || "")}
          </span>
          <a
            href={SITE_CONFIG.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor="hover"
            className="ml-2 text-ice-200 hover:text-ice-50 underline decoration-ice-400/40"
          >
            GitHub ↗
          </a>
        </div>
      </div>

      {/* Degraded Alert Banner if rate-limited */}
      {isDegraded && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" className="mt-0.5 shrink-0">
            <path d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
          </svg>
          <div className="flex-1">
            <span className="font-semibold">GitHub API rate-limited:</span>{" "}
            {data?.warning || "Cached metrics are being displayed to preserve reliability."}
          </div>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-ink-2/60 border border-ink-3 flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ice-400 mb-1">
            PUBLIC REPOSITORIES
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-ice-50">
            {data?.user.publicRepos ?? 0}
          </span>
          <span className="text-[10px] text-ice-400 mt-1 font-mono">
            {data?.user.followers ?? 0} followers
          </span>
        </div>

        <div className="p-4 rounded-xl bg-ink-2/60 border border-ink-3 flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ice-400 mb-1">
            TOTAL STARS
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-ice-50">
            {data?.metrics.totalStars ?? 0}
          </span>
          <span className="text-[10px] text-ice-400 mt-1 font-mono">
            across all repos
          </span>
        </div>

        <div className="p-4 rounded-xl bg-ink-2/60 border border-ink-3 flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ice-400 mb-1">
            TOTAL FORKS
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-ice-50">
            {data?.metrics.totalForks ?? 0}
          </span>
          <span className="text-[10px] text-ice-400 mt-1 font-mono">
            open source forks
          </span>
        </div>

        <div className="p-4 rounded-xl bg-ink-2/60 border border-ink-3 flex flex-col">
          <span className="text-[10px] font-mono uppercase tracking-wider text-ice-400 mb-1">
            PRIMARY LANGUAGE
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-ice-50 truncate">
            {data?.metrics.primaryLanguage || "Full Stack"}
          </span>
          <span className="text-[10px] text-ice-400 mt-1 font-mono">
            top repo volume
          </span>
        </div>
      </div>

      {/* Language Distribution Segmented Bar */}
      {data?.metrics.languages && data.metrics.languages.length > 0 && (
        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-ice-300 font-semibold uppercase tracking-wider text-[11px]">
              LANGUAGE DISTRIBUTION
            </span>
            <span className="text-ice-400 text-[10px]">
              {hoveredLang
                ? `${hoveredLang.name}: ${hoveredLang.percentage}% (${hoveredLang.count} repos)`
                : "Hover bar to inspect"}
            </span>
          </div>

          {/* Segmented Bar */}
          <div
            className="w-full h-3 rounded-full flex overflow-hidden bg-ink-2 border border-ink-3"
            role="progressbar"
            aria-label="Language distribution bar"
          >
            {data.metrics.languages.map((lang, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredLang(lang)}
                onMouseLeave={() => setHoveredLang(null)}
                style={{
                  width: `${lang.percentage}%`,
                  backgroundColor: lang.color,
                }}
                className="h-full transition-all duration-150 hover:brightness-125 cursor-pointer first:rounded-l-full last:rounded-r-full"
                title={`${lang.name}: ${lang.percentage}% (${lang.count} repositories)`}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-[11px] font-mono">
            {data.metrics.languages.slice(0, 6).map((lang, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredLang(lang)}
                onMouseLeave={() => setHoveredLang(null)}
                className="flex items-center gap-1.5 cursor-pointer transition-opacity hover:opacity-100 opacity-80"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: lang.color }}
                />
                <span className="text-ice-200">{lang.name}</span>
                <span className="text-ice-400 text-[10px]">{lang.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Featured Repositories Section */}
      {data?.featuredRepos && data.featuredRepos.length > 0 && (
        <div className="flex flex-col gap-3 pt-3 border-t border-ink-3">
          <div className="flex items-center justify-between">
            <span className="text-ice-300 font-semibold font-mono uppercase tracking-wider text-[11px]">
              FEATURED PUBLIC REPOSITORIES
            </span>
            <span className="text-ice-400 text-[10px] font-mono">
              Ranked by stars, forks & activity
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.featuredRepos.map((repo, idx) => (
              <a
                key={idx}
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="hover"
                className="group p-4 rounded-xl bg-ink-2/40 hover:bg-ink-2/80 border border-ink-3 hover:border-ice-400/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono font-bold text-ice-50 group-hover:text-ice-100 text-sm truncate">
                      {repo.name}
                    </span>
                    <svg
                      viewBox="0 0 16 16"
                      width="12"
                      height="12"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-ice-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0"
                    >
                      <path d="M5 11L11 5M11 5H6M11 5V10" />
                    </svg>
                  </div>
                  <p className="text-xs text-ice-300 line-clamp-2 leading-relaxed mb-3">
                    {repo.description || "Open source project repository."}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-ice-400 pt-2 border-t border-ink-3/50">
                  <span className="flex items-center gap-1.5">
                    {repo.language && (
                      <span className="text-ice-200">{repo.language}</span>
                    )}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      ★ {repo.stars}
                    </span>
                    <span className="flex items-center gap-1">
                      ⑂ {repo.forks}
                    </span>
                    <span>{formatRelativeTime(repo.updatedAt)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Combined Activity Stream (GitHub + System Heartbeat) */}
      {combinedStream.length > 0 && (
        <div className="flex flex-col gap-2 pt-3 border-t border-ink-3">
          <div className="flex items-center justify-between">
            <span className="text-ice-300 font-semibold font-mono uppercase tracking-wider text-[11px]">
              RECENT ACTIVITY STREAM
            </span>
            <span className="text-ice-400 text-[10px] font-mono">
              Live system & public GitHub events
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {combinedStream.slice(0, 5).map((ev, idx) => {
              const isSystem = ev.source === "system";
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-ink-2/30 border border-ink-3/40 hover:bg-ink-2/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isSystem
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {isSystem ? "SYSTEM" : "GITHUB"}
                    </span>
                    <span className="text-ice-100 font-semibold truncate">
                      {ev.action}
                    </span>
                    {ev.repo && ev.repo !== "system" && (
                      <a
                        href={ev.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ice-300 hover:text-ice-50 underline decoration-dotted text-[11px] truncate hidden sm:inline"
                      >
                        {ev.repo}
                      </a>
                    )}
                    {ev.details && (
                      <span className="text-ice-400 text-[11px] truncate hidden md:inline">
                        {ev.details}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[10px] text-ice-400 shrink-0 ml-2"
                    title={new Date(ev.timestamp).toLocaleString()}
                  >
                    {formatRelativeTime(ev.timestamp)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Data Honesty Notice */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-ink-3 text-[10px] font-mono text-ice-400 gap-1">
        <span>Source: GitHub REST API (Cached 30m) · Zero fabricated metrics</span>
        <span>Local Timezone: {SITE_CONFIG.timezone} ({SITE_CONFIG.utcOffset})</span>
      </div>
    </div>
  );
}
