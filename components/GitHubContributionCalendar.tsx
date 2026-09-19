"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { ActivityCalendar } from "react-activity-calendar";
import { motion, AnimatePresence } from "framer-motion";
import { useSeason } from "@/components/SeasonProvider";
import type { SeasonId } from "@/lib/seasons";
import type { GitHubContributionsPayload, ContributionDay } from "@/app/api/github-contributions/route";

const AVAILABLE_YEARS = [2026, 2025, 2024, 2023] as const;
type YearOption = (typeof AVAILABLE_YEARS)[number];

// Seasonal palettes mapped to 5 contribution levels (0 = dark empty, 1-4 = increasing intensity)
const SEASON_CALENDAR_THEMES: Record<SeasonId, string[]> = {
  winter: ["#0f131a", "#183f5e", "#205c8c", "#3684c7", "#65b4f7"],
  spring: ["#0a160d", "#1b4d27", "#256d38", "#389a50", "#60d47d"],
  summer: ["#0f131a", "#4d2800", "#8a4b08", "#c97210", "#ff9c2f"],
  autumn: ["#140809", "#4d1912", "#7a281c", "#b3412b", "#e07230"],
};

interface TooltipState {
  activity: ContributionDay;
  rect: DOMRect;
}

// Format date into human-readable e.g. "September 8, 2026"
function formatContributionDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function GitHubContributionCalendar() {
  const { palette } = useSeason();
  const [selectedYear, setSelectedYear] = useState<YearOption>(2026);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  // Contribution data states
  const [data, setData] = useState<GitHubContributionsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSuccessfulDate, setLastSuccessfulDate] = useState<string | null>(null);

  // In-memory client cache: year -> payload
  const cacheRef = useRef<Record<number, GitHubContributionsPayload>>({});

  // Tooltip portal state
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [mounted, setMounted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch contribution data for a specific year
  const loadYearData = useCallback(async (year: YearOption, bypassCache = false) => {
    // Check client in-memory cache first
    if (!bypassCache && cacheRef.current[year]) {
      setData(cacheRef.current[year]);
      setError(null);
      setIsSwitching(false);
      setLoading(false);
      return;
    }

    if (data) {
      setIsSwitching(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await fetch(`/api/github-contributions?year=${year}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        setError(errData?.error || `Failed to load ${year} contributions (HTTP ${res.status})`);
        return;
      }
      const payload: GitHubContributionsPayload = await res.json();

      // Store in client cache
      cacheRef.current[year] = payload;
      setData(payload);
      setLastSuccessfulDate(payload.lastUpdated);
      setError(null);
    } catch (err) {
      // Use console.warn instead of console.error to prevent Next.js dev overlay from hijacking it
      console.warn(`[GitHubContributionCalendar] Fetch error:`, err);
      setError(err instanceof Error ? err.message : "GitHub contributions unavailable");
    } finally {
      setLoading(false);
      setIsSwitching(false);
    }
  }, [data]);

  // Initial load
  useEffect(() => {
    loadYearData(selectedYear);
  }, [selectedYear, loadYearData]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Keyboard accessibility for dropdown
  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setDropdownOpen(true);
      setFocusedIndex(AVAILABLE_YEARS.indexOf(selectedYear));
    } else if (e.key === "Escape") {
      setDropdownOpen(false);
    }
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setDropdownOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % AVAILABLE_YEARS.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + AVAILABLE_YEARS.length) % AVAILABLE_YEARS.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < AVAILABLE_YEARS.length) {
        const year = AVAILABLE_YEARS[focusedIndex];
        setSelectedYear(year);
        setDropdownOpen(false);
        buttonRef.current?.focus();
      }
    } else if (e.key === "Tab") {
      setDropdownOpen(false);
    }
  };

  // Color theme for current season
  const currentTheme = useMemo(() => {
    const shades = SEASON_CALENDAR_THEMES[palette.id] || SEASON_CALENDAR_THEMES.winter;
    return {
      light: shades,
      dark: shades,
    };
  }, [palette.id]);

  // Dynamic button label
  const buttonLabel = selectedYear === 2026 ? "Past 12 Months" : `${selectedYear}`;

  // Dynamic total count text
  const totalSummaryText = useMemo(() => {
    if (!data) return "";
    const count = data.totalContributions;
    if (selectedYear === 2026) {
      return `${count} contributions in 2026`;
    }
    return `${count} contributions in ${selectedYear}`;
  }, [data, selectedYear]);

  return (
    <div className="relative rounded-2xl bg-ink-1/75 backdrop-blur-md border border-ink-3 p-6 sm:p-8 flex flex-col justify-center items-center col-span-1 md:col-span-2 overflow-hidden w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between w-full mb-6 relative z-20">
        <div className="flex items-center gap-2.5">
          <h3 className="text-xl sm:text-2xl font-bold text-ice-50">Contribution Calendar</h3>
          {isSwitching && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-ink-2/60 border border-ink-3 text-[11px] font-mono text-ice-400 animate-pulse">
              <svg className="w-3 h-3 animate-spin text-ice-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span>Updating...</span>
            </div>
          )}
        </div>

        {/* Year Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            ref={buttonRef}
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            onKeyDown={handleButtonKeyDown}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            aria-label={`Select contribution year. Currently viewing ${buttonLabel}`}
            className="px-3 py-1.5 rounded-lg bg-ink-0/60 hover:bg-ink-2/60 border border-ink-3/80 hover:border-ice-400/50 text-xs font-mono text-ice-300 hover:text-ice-100 transition-all flex items-center gap-2 focus:outline-none focus:ring-1 focus:ring-ice-400/50 shadow-sm cursor-pointer"
          >
            <span>{buttonLabel}</span>
            <svg
              className={`w-3.5 h-3.5 text-ice-400 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                role="listbox"
                aria-label="Contribution years"
                onKeyDown={handleMenuKeyDown}
                className="absolute right-0 top-full mt-2 w-40 rounded-xl bg-ink-0/95 backdrop-blur-xl border border-ink-3/90 shadow-2xl p-1.5 z-50 focus:outline-none"
                tabIndex={-1}
              >
                {AVAILABLE_YEARS.map((year, idx) => {
                  const isSelected = selectedYear === year;
                  const isFocused = focusedIndex === idx;
                  return (
                    <button
                      key={year}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => {
                        setSelectedYear(year);
                        setDropdownOpen(false);
                        buttonRef.current?.focus();
                      }}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-ink-2/80 text-ice-50 font-medium"
                          : isFocused
                          ? "bg-ink-2/40 text-ice-200"
                          : "text-ice-300 hover:text-ice-100 hover:bg-ink-2/30"
                      }`}
                    >
                      <span>{year}</span>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-ice-400 animate-in fade-in zoom-in-75 duration-150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Calendar Body or Error/Loading State */}
      <div className="w-full relative min-h-[140px] flex flex-col items-center justify-center">
        {error && !data ? (
          <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl bg-ink-0/60 border border-ink-3 my-4 max-w-md w-full">
            <svg className="w-8 h-8 text-rose-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <h4 className="text-sm font-semibold text-ice-100 mb-1">GitHub contributions unavailable</h4>
            <p className="text-xs text-ice-400 mb-3 font-mono">
              {lastSuccessfulDate
                ? `Last successful data: ${new Date(lastSuccessfulDate).toLocaleDateString()}`
                : "Unable to retrieve contribution telemetry from GitHub API."}
            </p>
            <button
              type="button"
              onClick={() => loadYearData(selectedYear, true)}
              className="px-3.5 py-1.5 rounded-lg bg-ink-2 hover:bg-ink-3 text-xs font-mono text-ice-200 flex items-center gap-1.5 transition-colors cursor-pointer border border-ink-3 hover:border-ice-400/40"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>Retry</span>
            </button>
          </div>
        ) : loading && !data ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <svg className="w-6 h-6 text-ice-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <p className="text-xs font-mono text-ice-400">Loading GitHub contribution telemetry...</p>
          </div>
        ) : (
          <div
            className={`w-full overflow-x-auto flex justify-center custom-scrollbar pb-2 transition-opacity duration-200 ${
              isSwitching ? "opacity-60 pointer-events-none" : "opacity-100"
            }`}
          >
            {data && (
              <ActivityCalendar
                data={data.contributions}
                colorScheme="dark"
                blockSize={12}
                blockMargin={4}
                fontSize={12}
                theme={currentTheme}
                labels={{
                  totalCount: totalSummaryText,
                }}
                renderBlock={(block, activity) => {
                  const dateFormatted = formatContributionDate(activity.date);
                  const accessibleLabel = `${dateFormatted}: ${
                    activity.count === 0
                      ? "No contributions"
                      : `${activity.count} contribution${activity.count === 1 ? "" : "s"}`
                  }`;

                  return React.cloneElement(block, {
                    tabIndex: 0,
                    role: "button",
                    "aria-label": accessibleLabel,
                    className: "outline-none cursor-pointer focus:stroke-ice-300 focus:stroke-2 transition-all",
                    onMouseEnter: (e: React.MouseEvent<SVGRectElement>) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        activity: activity as ContributionDay,
                        rect,
                      });
                    },
                    onMouseLeave: () => {
                      setTooltip(null);
                    },
                    onFocus: (e: React.FocusEvent<SVGRectElement>) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        activity: activity as ContributionDay,
                        rect,
                      });
                    },
                    onBlur: () => {
                      setTooltip(null);
                    },
                    onTouchStart: (e: React.TouchEvent<SVGRectElement>) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({
                        activity: activity as ContributionDay,
                        rect,
                      });
                    },
                  });
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Floating Tooltip Portal */}
      {mounted && tooltip && typeof document !== "undefined" && (
        <TooltipPortal tooltip={tooltip} />
      )}
    </div>
  );
}

// Dedicated floating tooltip rendered via Portal into document.body to prevent clipping
function TooltipPortal({ tooltip }: { tooltip: TooltipState }) {
  const { activity, rect } = tooltip;
  const tooltipWidth = 160;
  const tooltipHeight = 52;
  const margin = 8;
  const viewportPadding = 12;

  // Center horizontally over the square
  const squareCenterX = rect.left + rect.width / 2;
  let left = squareCenterX - tooltipWidth / 2;

  // Clamp within viewport
  const minLeft = viewportPadding;
  const maxLeft = (typeof window !== "undefined" ? window.innerWidth : 1000) - tooltipWidth - viewportPadding;
  left = Math.max(minLeft, Math.min(maxLeft, left));

  // Determine vertical placement: flip to bottom if too close to top
  const fitsAbove = rect.top - tooltipHeight - margin > 0;
  const top = fitsAbove ? rect.top - tooltipHeight - margin : rect.bottom + margin;

  // Arrow alignment offset relative to tooltip box
  const arrowLeft = Math.max(12, Math.min(tooltipWidth - 12, squareCenterX - left));

  const formattedDate = formatContributionDate(activity.date);

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: `${top}px`,
        left: `${left}px`,
        width: `${tooltipWidth}px`,
        zIndex: 99999,
        pointerEvents: "none",
      }}
      className="transition-opacity duration-150 animate-in fade-in zoom-in-95"
    >
      <div className="relative px-3 py-2 rounded-lg bg-ink-0/95 backdrop-blur-xl border border-ink-3 shadow-2xl text-center">
        {/* Pointer Arrow */}
        <div
          style={{
            left: `${arrowLeft}px`,
            [fitsAbove ? "bottom" : "top"]: "-5px",
          }}
          className={`absolute -translate-x-1/2 w-2.5 h-2.5 bg-ink-0 border-ink-3 rotate-45 ${
            fitsAbove ? "border-r border-b" : "border-l border-t"
          }`}
        />

        {/* Tooltip Content */}
        <div className="text-xs font-mono font-semibold text-ice-50 leading-tight">
          {activity.count === 0
            ? "No contributions"
            : `${activity.count} contribution${activity.count === 1 ? "" : "s"}`}
        </div>
        <div className="text-[11px] font-mono text-ice-400/90 mt-0.5 leading-tight">
          {formattedDate}
        </div>
      </div>
    </div>,
    document.body
  );
}
