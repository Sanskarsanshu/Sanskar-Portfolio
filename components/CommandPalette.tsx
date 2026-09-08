"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useSeason } from "@/components/SeasonProvider";
import { SEASONS, type SeasonId } from "@/lib/seasons";
import { SITE_CONFIG } from "@/lib/config";

interface CommandItem {
  id: string;
  category: "Navigation" | "Theme" | "Action" | "Developer";
  title: string;
  subtitle?: string;
  shortcut?: string;
  perform: () => void;
}

export default function CommandPalette({
  onOpenTerminal,
}: {
  onOpenTerminal?: () => void;
}) {
  const { setSeason, palette } = useSeason();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Define commands
  const commands: CommandItem[] = useMemo(() => {
    return [
      // Navigation
      {
        id: "nav-home",
        category: "Navigation",
        title: "Jump to Hero",
        subtitle: "Scroll to top",
        perform: () => window.scrollTo({ top: 0, behavior: "smooth" }),
      },
      {
        id: "nav-stack",
        category: "Navigation",
        title: "Jump to Tech Stack",
        subtitle: "Interactive 3D keyboard & skills",
        perform: () => {
          document.querySelector("[data-kb-section='stack']")?.scrollIntoView({ behavior: "smooth" });
        },
      },
      {
        id: "nav-experience",
        category: "Navigation",
        title: "Jump to Engineering Journey",
        subtitle: "Career timeline, achievements & GitHub telemetry",
        perform: () => {
          document.querySelector("[data-kb-section='experience']")?.scrollIntoView({ behavior: "smooth" });
        },
      },
      {
        id: "nav-projects",
        category: "Navigation",
        title: "Jump to Featured Projects",
        subtitle: "Full-stack systems and architecture showcases",
        perform: () => {
          document.querySelector("[data-kb-section='project-1']")?.scrollIntoView({ behavior: "smooth" });
        },
      },
      {
        id: "nav-contact",
        category: "Navigation",
        title: "Jump to Contact",
        subtitle: "Email, LinkedIn, and collaboration links",
        perform: () => {
          document.querySelector("[data-kb-section='contact']")?.scrollIntoView({ behavior: "smooth" });
        },
      },

      // Seasonal Themes
      ...SEASONS.map((s) => ({
        id: `theme-${s.id}`,
        category: "Theme" as const,
        title: `Switch to ${s.label} (${s.id.toUpperCase()})`,
        subtitle: `Palette with ${s.accent} accent`,
        perform: () => setSeason(s.id as SeasonId),
      })),

      // Actions
      {
        id: "act-resume",
        category: "Action",
        title: "Open Resume / CV",
        subtitle: "Download official PDF",
        shortcut: "CV",
        perform: () => window.open(SITE_CONFIG.resumeUrl, "_blank"),
      },
      {
        id: "act-github",
        category: "Action",
        title: `Visit GitHub Profile (@${SITE_CONFIG.githubUsername})`,
        subtitle: "Open external profile in new tab",
        perform: () => window.open(SITE_CONFIG.githubUrl, "_blank"),
      },
      {
        id: "act-email",
        category: "Action",
        title: `Email Sanskar (${SITE_CONFIG.email})`,
        subtitle: "Open mailto link",
        perform: () => {
          window.location.href = `mailto:${SITE_CONFIG.email}`;
        },
      },

      // Developer Tools
      {
        id: "dev-terminal",
        category: "Developer",
        title: "Open Developer Terminal",
        subtitle: "Interactive CLI emulator with commands",
        shortcut: "~",
        perform: () => {
          if (onOpenTerminal) onOpenTerminal();
        },
      },
    ];
  }, [setSeason, onOpenTerminal]);

  // Filter commands by query
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q))
    );
  }, [commands, query]);

  // Keyboard shortcut listener (Ctrl+K or ⌘+K)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery("");
            setSelectedIndex(0);
          }
          return !prev;
        });
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Auto focus input on open
  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  // Keyboard navigation within palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].perform();
        setOpen(false);
      }
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-background/70 backdrop-blur-md transition-opacity motion-safe:fade-in"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-ink-0/95 border border-ink-3 shadow-2xl overflow-hidden flex flex-col motion-safe:fade-in-up"
        style={{ borderColor: "rgba(166, 197, 228, 0.35)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-ink-3 gap-3">
          <svg
            viewBox="0 0 16 16"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-ice-400 shrink-0"
          >
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11L15 15" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search sections, themes, links..."
            className="flex-1 bg-transparent border-none text-sm text-ice-50 placeholder-ice-400/60 focus:outline-none font-mono"
          />

          <kbd className="px-2 py-0.5 rounded text-[10px] font-mono bg-ink-2 border border-ink-3 text-ice-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          role="listbox"
          className="max-h-[360px] overflow-y-auto p-2 space-y-1 custom-scrollbar text-xs font-mono"
        >
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-ice-400">
              No matching commands found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    item.perform();
                    setOpen(false);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-ink-2 text-ice-50 border border-ink-3"
                      : "text-ice-300 hover:bg-ink-2/40 border border-transparent"
                  }`}
                  style={{
                    borderLeftColor: isSelected ? palette.accent : undefined,
                    borderLeftWidth: isSelected ? "3px" : undefined,
                  }}
                >
                  <div className="flex flex-col truncate">
                    <span className="font-semibold text-ice-100">{item.title}</span>
                    {item.subtitle && (
                      <span className="text-[10px] text-ice-400 truncate mt-0.5">
                        {item.subtitle}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] uppercase tracking-wider text-ice-400/80 px-1.5 py-0.5 rounded bg-ink-1/60 border border-ink-3/40">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded text-[9px] bg-ink-2 border border-ink-3 text-ice-400">
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-ink-1/60 border-t border-ink-3 flex items-center justify-between text-[10px] font-mono text-ice-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>Ctrl+K / ⌘K</span>
        </div>
      </div>
    </div>
  );
}
