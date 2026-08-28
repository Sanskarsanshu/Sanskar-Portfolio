"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useDragControls, useMotionValue, animate } from "framer-motion";
import { executeCommand, getAutocompleteSuggestion } from "./terminalParser";
import { AUTOCOMPLETE_TERMS, type CommandOutput } from "./terminalCommands";
import { useLenis } from "lenis/react";

interface TerminalOverlayProps {
  isOpen: boolean;
  isMinimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onRestore: () => void;
  onOpenProject: (projectId: string) => void;
}

interface HistoryItem {
  id: number;
  type: "input" | "output";
  content: string | React.ReactNode;
}

const WELCOME_MESSAGE = "Welcome to Sanskar's developer console.\nType \"help\" to see available commands.";

const makeInitialHistory = (): HistoryItem[] => [
  { id: Date.now(), type: "output", content: WELCOME_MESSAGE }
];

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function TerminalOverlay({
  isOpen,
  isMinimized,
  onClose,
  onMinimize,
  onRestore,
  onOpenProject,
}: TerminalOverlayProps) {
  const [cwd, setCwd] = useState("~");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>(makeInitialHistory);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const dragControls = useDragControls();

  // Controlled drag state — saved on minimize, restored on un-minimize
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const savedPos = useRef({ x: 0, y: 0 });

  // ─── Canonical close handler ───────────────────────────────────────────────
  // Calls parent's onClose, then waits for the 300ms exit animation before
  // resetting the entire session state so the NEXT open is always fresh.
  const handleClose = useCallback(() => {
    onClose();
    // Reset session state after the exit animation completes
    setTimeout(() => {
      setHistory(makeInitialHistory());
      setInput("");
      setCwd("~");
      setCommandHistory([]);
      setHistoryIndex(-1);
      setIsFullscreen(false);
      x.set(0);
      y.set(0);
      savedPos.current = { x: 0, y: 0 };
    }, 350);
  }, [onClose, x, y]);

  // ─── Scroll lock ───────────────────────────────────────────────────────────
  // Only lock when the terminal is visually open (not minimized).
  useEffect(() => {
    if (!isOpen || isMinimized) return;

    lenis?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      lenis?.start();
      document.documentElement.style.overflow = prev;
    };
  }, [isOpen, isMinimized, lenis]);

  // ─── Drag position management ──────────────────────────────────────────────
  useEffect(() => {
    if (isMinimized || isFullscreen) {
      if (isMinimized) {
        // Save current drag position before collapsing
        savedPos.current = { x: x.get(), y: y.get() };
      }
      animate(x, 0, { type: "spring", stiffness: 300, damping: 25 });
      animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
    } else if (isOpen) {
      // Restore previous drag position when expanding back
      if (savedPos.current.x !== 0 || savedPos.current.y !== 0) {
        animate(x, savedPos.current.x, { type: "spring", stiffness: 300, damping: 25 });
        animate(y, savedPos.current.y, { type: "spring", stiffness: 300, damping: 25 });
      }
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isMinimized, isFullscreen, isOpen, x, y]);

  // ─── Auto-focus on open ────────────────────────────────────────────────────
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  // ─── Scroll to bottom ─────────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current && !isMinimized) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isMinimized]);

  // ─── Escape key ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || isMinimized) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [isOpen, isMinimized, handleClose]);

  // ─── Command output handler ────────────────────────────────────────────────
  const handleOutput = (output: CommandOutput) => {
    if (typeof output === "string") {
      setHistory(prev => [...prev, { id: Date.now() + Math.random(), type: "output", content: output }]);
    } else if (output.type === "system") {
      setHistory(prev => [...prev, { id: Date.now() + Math.random(), type: "output", content: output.message }]);
    } else if (output.type === "component") {
      setHistory(prev => [...prev, { id: Date.now() + Math.random(), type: "output", content: output.component }]);
    } else if (output.type === "action") {
      if (output.action === "open_project") {
        onOpenProject(output.payload);
      } else if (output.action === "open_url") {
        window.open(output.payload, "_blank");
        setHistory(prev => [...prev, { id: Date.now() + Math.random(), type: "output", content: `Opening ${output.payload}...` }]);
      } else if (output.action === "change_dir") {
        setCwd(output.payload);
      }
    } else if (output.type === "multi") {
      output.outputs.forEach(o => handleOutput(o));
    }
  };

  // ─── Keyboard input handler ────────────────────────────────────────────────
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = input.trim();

      if (!trimmed) {
        setHistory(prev => [...prev, { id: Date.now(), type: "input", content: "" }]);
        return;
      }

      // Built-in shell commands
      if (trimmed === "clear") {
        setHistory([]);
        setInput("");
        return;
      }
      if (trimmed === "exit") {
        // Same as red close button — terminates session
        handleClose();
        return;
      }
      if (trimmed === "history") {
        setHistory(prev => [
          ...prev,
          { id: Date.now(), type: "input", content: input },
          { id: Date.now() + 1, type: "output", content: commandHistory.map((cmd, i) => `${i + 1}  ${cmd}`).join("\n") }
        ]);
        setInput("");
        setCommandHistory(prev => [...prev, trimmed]);
        setHistoryIndex(-1);
        return;
      }

      setHistory(prev => [...prev, { id: Date.now(), type: "input", content: `${cwd} $ ${input}` }]);
      setCommandHistory(prev => [...prev, trimmed]);
      setHistoryIndex(-1);

      const output = await executeCommand(input);
      handleOutput(output);
      setInput("");

    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      setInput(getAutocompleteSuggestion(input, AUTOCOMPLETE_TERMS));
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      setHistory(prev => [...prev, { id: Date.now(), type: "input", content: `${cwd} $ ${input}^C` }]);
      setInput("");
      setHistoryIndex(-1);
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  };

  return (
    <AnimatePresence>
      {/* ── Minimized applet — always fixed bottom-right, totally independent ── */}
      {isMinimized && (
        <motion.div
          key="minimized-icon"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-[48px] h-[48px] md:w-[64px] md:h-[64px] cursor-pointer z-[110] pointer-events-auto"
          onClick={onRestore}
          style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.5))" }}
        >
          <img
            src="/terminal_icon.png"
            alt="Restore Terminal"
            width={256}
            height={256}
            className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
          />
        </motion.div>
      )}

      {/* ── Full terminal window ─────────────────────────────────────────────── */}
      {isOpen && !isMinimized && (
        <motion.div
          key="terminal-overlay"
          ref={constraintsRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 pointer-events-none"
        >
          {/* Backdrop — click outside to close */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={handleClose}
          />

          {/* Terminal window */}
          <motion.div
            style={{ x, y }}
            drag={!isFullscreen}
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragConstraints={constraintsRef}
            initial={{ scale: 0.98, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative overflow-hidden flex flex-col pointer-events-auto ${
              isFullscreen
                ? "w-full h-full rounded-none bg-[#090b10] shadow-2xl border-0"
                : "w-full h-full md:w-[90%] md:h-[85%] md:max-w-5xl md:border md:border-ice-500/20 md:rounded-lg shadow-2xl shadow-ice-900/50 bg-[#090b10]"
            }`}
            onClick={() => inputRef.current?.focus()}
          >
            {/* Window controls / Header (Drag Handle) */}
            <div
              className="h-10 bg-black/40 border-b border-ice-500/10 flex items-center justify-between px-4 select-none shrink-0 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => {
                if (!isFullscreen) dragControls.start(e);
              }}
              onDoubleClick={() => setIsFullscreen(!isFullscreen)}
            >
              {/* Traffic Lights */}
              <div className="flex items-center gap-2 group">
                {/* 🔴 Red — Close (terminates session) */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleClose(); }}
                  className="w-3 h-3 rounded-full bg-ice-500/20 group-hover:bg-red-500/90 border border-transparent group-hover:border-red-600 transition-colors"
                  aria-label="Close"
                />
                {/* 🟡 Yellow — Minimize (preserves session) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isFullscreen) setIsFullscreen(false);
                    onMinimize();
                  }}
                  className="w-3 h-3 rounded-full bg-ice-500/20 group-hover:bg-yellow-500/90 border border-transparent group-hover:border-yellow-600 transition-colors"
                  aria-label="Minimize"
                />
                {/* 🟢 Green — Fullscreen */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFullscreen(!isFullscreen);
                  }}
                  className="w-3 h-3 rounded-full bg-ice-500/20 group-hover:bg-green-500/90 border border-transparent group-hover:border-green-600 transition-colors"
                  aria-label="Fullscreen"
                />
              </div>

              <div className="font-mono text-[10px] text-ice-400 tracking-widest uppercase">
                SANSKAR@portfolio — TERMINAL
              </div>

              {/* Spacer to balance traffic lights and centre the title */}
              <div className="w-[52px]" />
            </div>

            {/* Grain overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay z-0"
              style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }}
            />

            {/* Terminal scroll area */}
            <div
              ref={scrollRef}
              data-lenis-prevent="true"
              className="flex-1 overflow-y-auto p-4 md:p-6 font-mono text-sm sm:text-base text-ice-200 z-10 custom-scrollbar overscroll-contain"
            >
              {history.map((item) => (
                <div key={item.id} className="mb-4">
                  {item.type === "input" ? (
                    <div className="flex gap-3 text-ice-100">
                      <span>{item.content}</span>
                    </div>
                  ) : (
                    <div className="pl-5 whitespace-pre-wrap leading-relaxed opacity-90">
                      {item.content}
                    </div>
                  )}
                </div>
              ))}

              {/* Active input line */}
              <div className="flex gap-3 text-ice-100">
                <span className="text-ice-500 shrink-0 mt-0.5 whitespace-nowrap">{cwd} $</span>
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent outline-none border-none text-ice-100 caret-transparent"
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                  {/* Custom blinking cursor */}
                  <span
                    className="absolute top-0 bottom-0 pointer-events-none flex items-center"
                    style={{ left: `calc(${input.length} * 1ch)` }}
                    aria-hidden
                  >
                    <span className="inline-block w-2.5 h-[1em] bg-ice-300 animate-pulse" />
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
