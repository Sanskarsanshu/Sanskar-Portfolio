"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSeason } from "@/components/SeasonProvider";
import { SITE_CONFIG } from "@/lib/config";

interface PingData {
  timestamp: number;
  status: string;
  region: string;
  commit: string;
  runtime: string;
}

interface TelemetryState {
  latency: number | null; // null while measuring
  lastPing: number | null;
  status: "operational" | "degraded" | "offline";
  pingData: PingData | null;
  githubApiStatus: "connected" | "rate_limited" | "checking";
}

export default function SystemStatusPill() {
  const { palette } = useSeason();
  const [isOpen, setIsOpen] = useState(false);
  const [istTime, setIstTime] = useState("");
  const [istSeconds, setIstSeconds] = useState("");
  const [telemetry, setTelemetry] = useState<TelemetryState>({
    latency: null,
    lastPing: null,
    status: "operational",
    pingData: null,
    githubApiStatus: "checking",
  });

  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Live IST Clock (Asia/Kolkata)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const shortFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: SITE_CONFIG.timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      const secFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: SITE_CONFIG.timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setIstTime(shortFormatter.format(now));
      setIstSeconds(secFormatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Actual client -> /api/ping round-trip latency measurement
  const measurePing = useCallback(async () => {
    // Skip ping if tab is hidden or component unmounted
    if (!mountedRef.current) return;
    if (typeof document !== "undefined" && document.hidden) return;

    const tStart = performance.now();
    try {
      const res = await fetch("/api/ping", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!res.ok) throw new Error("Ping failed");
      const tEnd = performance.now();
      const rtt = Math.round(tEnd - tStart);
      const data: PingData = await res.json();

      if (mountedRef.current) {
        setTelemetry((prev) => ({
          ...prev,
          latency: rtt,
          lastPing: Date.now(),
          status: "operational",
          pingData: data,
        }));
      }
    } catch {
      if (mountedRef.current) {
        setTelemetry((prev) => ({
          ...prev,
          latency: null,
          status: "offline",
        }));
      }
    }
  }, []);

  // Ping polling: immediate on mount, then every 30s
  useEffect(() => {
    measurePing();
    const interval = setInterval(measurePing, 30000);
    const onVisibility = () => {
      if (!document.hidden) measurePing();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [measurePing]);

  // Initial check of GitHub API status for popover
  useEffect(() => {
    fetch("/api/github-metrics")
      .then((r) => r.json())
      .then((d) => {
        if (mountedRef.current) {
          setTelemetry((prev) => ({
            ...prev,
            githubApiStatus: d.status === "operational" ? "connected" : "rate_limited",
          }));
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setTelemetry((prev) => ({
            ...prev,
            githubApiStatus: "rate_limited",
          }));
        }
      });
  }, []);

  // Close popover on Escape or Click Outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const latencyDisplay =
    telemetry.latency !== null ? `${telemetry.latency}ms` : "···";

  return (
    <div className="relative inline-flex items-center">
      {/* Interactive Status Pill Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => setIsOpen(true), 250);
        }}
        onMouseLeave={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => setIsOpen(false), 300);
        }}
        data-cursor="hover"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`System Telemetry: ${telemetry.status}, latency ${latencyDisplay}, IST ${istTime}, status ${SITE_CONFIG.statusLabel}`}
        className="group relative flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-mono tracking-wider transition-all duration-200 border bg-ink-1/80 hover:bg-ink-2/90 backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        style={{
          borderColor: isOpen ? palette.accent : "rgba(166, 197, 228, 0.25)",
        }}
      >
        {/* Pulsing Seasonal Radar Dot */}
        <span className="relative flex h-2 w-2 items-center justify-center">
          <span
            className="absolute inline-flex h-full w-full rounded-full opacity-75 motion-safe:animate-ping"
            style={{ backgroundColor: palette.accent }}
          />
          <span
            className="relative inline-flex h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: palette.accent }}
          />
        </span>

        {/* Desktop View: Full detailed telemetry line */}
        <span className="hidden sm:inline-flex items-center gap-1.5 text-ice-100 whitespace-nowrap">
          <span className="font-semibold text-ice-50">SYSTEMS ONLINE</span>
          <span className="text-ice-400">·</span>
          <span className="text-ice-200">{latencyDisplay}</span>
          <span className="text-ice-400">·</span>
          <span className="text-ice-200">
            {SITE_CONFIG.timezoneCode} {istTime || "04:30 PM"}
          </span>
          <span className="text-ice-400">·</span>
          <span
            className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest uppercase border border-ice-400/30"
            style={{ color: palette.accent }}
          >
            {SITE_CONFIG.statusLabel}
          </span>
        </span>

        {/* Mobile View: Compact telemetry string */}
        <span className="inline-flex sm:hidden items-center gap-1 text-ice-100 text-[10px]">
          <span className="font-semibold text-ice-50">LIVE</span>
          <span className="text-ice-400">·</span>
          <span>{latencyDisplay}</span>
          <span className="text-ice-400">·</span>
          <span>{istTime}</span>
        </span>

        {/* Subtle disclosure chevron */}
        <svg
          viewBox="0 0 16 16"
          width="10"
          height="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={`text-ice-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {/* Telemetry Popover Panel */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label="System Telemetry Diagnostics"
          tabIndex={-1}
          onMouseEnter={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
          }}
          onMouseLeave={() => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setIsOpen(false), 300);
          }}
          className="absolute top-full left-0 mt-2 z-50 w-72 sm:w-80 rounded-xl bg-ink-0/95 backdrop-blur-xl border border-ink-3 p-4 shadow-2xl text-[11px] font-mono text-ice-200 transition-all motion-safe:fade-in-up"
          style={{ borderColor: "rgba(166, 197, 228, 0.3)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-ink-3">
            <div className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: palette.accent }}
              />
              <span className="text-xs font-bold text-ice-50 tracking-wider">
                SYSTEM TELEMETRY
              </span>
            </div>
            <span className="text-[10px] text-ice-400">LIVE RTT</span>
          </div>

          {/* Key-Value Diagnostics */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between py-0.5">
              <span className="text-ice-400">STATUS</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {SITE_CONFIG.systemStatus}
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-ice-400">LATENCY (RTT)</span>
              <span className="text-ice-100 font-semibold">
                {latencyDisplay}
                {telemetry.latency !== null && (
                  <span className="ml-1.5 text-[9px] text-ice-400 font-normal">
                    {telemetry.latency < 50
                      ? "(optimal)"
                      : telemetry.latency < 150
                      ? "(normal)"
                      : "(slow)"}
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-ice-400">CONNECTION</span>
              <span className="text-ice-100">STABLE · HTTP/2</span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-ice-400">TIMEZONE</span>
              <span className="text-ice-100">
                {SITE_CONFIG.timezone} ({SITE_CONFIG.utcOffset})
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-ice-400">LOCAL TIME</span>
              <span className="text-ice-50 font-bold">
                {istSeconds || istTime}
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-ice-400">GITHUB API</span>
              <span
                className={`font-semibold ${
                  telemetry.githubApiStatus === "connected"
                    ? "text-emerald-400"
                    : "text-amber-400"
                }`}
              >
                {telemetry.githubApiStatus === "connected"
                  ? "CONNECTED (30m CACHE)"
                  : "RATE-LIMITED / STALE"}
              </span>
            </div>

            <div className="flex items-center justify-between py-0.5">
              <span className="text-ice-400">DEPLOYMENT</span>
              <span className="text-ice-200">
                Commit {SITE_CONFIG.deployment.commitHash}
              </span>
            </div>
          </div>

          {/* Current Focus Section */}
          <div className="mt-3 pt-3 border-t border-ink-3">
            <div className="text-[10px] uppercase tracking-wider text-ice-400 mb-1.5 flex items-center justify-between">
              <span>CURRENT FOCUS</span>
              <span className="text-[9px] text-ice-400/80">(Configured)</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SITE_CONFIG.currentFocus.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] bg-ink-2/80 border border-ink-3 text-ice-100"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2 border-t border-ink-3 flex items-center justify-between text-[9px] text-ice-400">
            <span>Ping poll: 30s interval</span>
            <span>Press Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
