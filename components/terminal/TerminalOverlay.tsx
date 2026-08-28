"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { executeCommand, getAutocompleteSuggestion } from "./terminalParser";
import { AUTOCOMPLETE_TERMS, type CommandOutput } from "./terminalCommands";
import { useLenis } from "lenis/react";

interface TerminalOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProject: (projectId: string) => void;
}

interface HistoryItem {
  id: number;
  type: "input" | "output";
  content: string | React.ReactNode;
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function TerminalOverlay({ isOpen, onClose, onOpenProject }: TerminalOverlayProps) {
  const [cwd, setCwd] = useState("~");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: Date.now(),
      type: "output",
      content: "Welcome to Sanskar's developer console.\nType \"help\" to see available commands."
    }
  ]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const dragControls = useDragControls();

  // Freeze Lenis + page scroll while open
  useEffect(() => {
    if (!isOpen) return;
    lenis?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = prev;
    };
  }, [isOpen, lenis]);

  // Auto-focus input when terminal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Scroll to bottom when history changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

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

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = input.trim();
      
      if (!trimmed) {
        setHistory(prev => [...prev, { id: Date.now(), type: "input", content: "" }]);
        return;
      }
      
      // Handle built-in shell commands directly
      if (trimmed === "clear") {
        setHistory([]);
        setInput("");
        return;
      }
      if (trimmed === "exit") {
        onClose();
        setInput("");
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

      // Add to visible history and command history
      setHistory(prev => [...prev, { id: Date.now(), type: "input", content: `${cwd} $ ${input}` }]);
      setCommandHistory(prev => [...prev, trimmed]);
      setHistoryIndex(-1);
      
      // Execute command
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
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={constraintsRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-6 pointer-events-none"
        >
          {/* Backdrop blur */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />
          
          <motion.div
            layout
            drag={!isFullscreen} // Disable drag when fullscreen
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragConstraints={constraintsRef}
            initial={{ scale: 0.98, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative overflow-hidden flex flex-col shadow-2xl shadow-ice-900/50 pointer-events-auto bg-[#090b10] border-0 transition-[width,height,border-radius] duration-300 ${
              isFullscreen 
                ? "w-full h-full rounded-none" 
                : isMinimized 
                  ? "w-[90%] md:max-w-5xl h-10 md:border md:border-ice-500/20 md:rounded-lg"
                  : "w-full h-full md:w-[90%] md:h-[85%] md:max-w-5xl md:border md:border-ice-500/20 md:rounded-lg"
            }`}
            onClick={() => {
              if (!isMinimized) inputRef.current?.focus();
            }}
          >
            {/* Window controls / Header (Drag Handle) */}
            <div 
              className="h-10 bg-black/40 border-b border-ice-500/10 flex items-center justify-between px-4 select-none shrink-0 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => {
                if (!isFullscreen) dragControls.start(e);
              }}
              onDoubleClick={() => {
                setIsFullscreen(!isFullscreen);
                setIsMinimized(false);
              }}
            >
              {/* Traffic Lights */}
              <div className="flex items-center gap-2 group">
                {/* Red - Close */}
                <button 
                  onClick={(e) => { e.stopPropagation(); onClose(); }}
                  className="w-3 h-3 rounded-full bg-ice-500/20 group-hover:bg-red-500/90 border border-transparent group-hover:border-red-600 transition-colors flex items-center justify-center"
                  aria-label="Close"
                />
                {/* Yellow - Minimize */}
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setIsMinimized(!isMinimized); 
                    if (isFullscreen) setIsFullscreen(false); 
                  }}
                  className="w-3 h-3 rounded-full bg-ice-500/20 group-hover:bg-yellow-500/90 border border-transparent group-hover:border-yellow-600 transition-colors flex items-center justify-center"
                  aria-label="Minimize"
                />
                {/* Green - Fullscreen */}
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setIsFullscreen(!isFullscreen); 
                    if (isMinimized) setIsMinimized(false);
                  }}
                  className="w-3 h-3 rounded-full bg-ice-500/20 group-hover:bg-green-500/90 border border-transparent group-hover:border-green-600 transition-colors flex items-center justify-center"
                  aria-label="Fullscreen"
                />
              </div>
              
              <div className="font-mono text-[10px] text-ice-400 tracking-widest uppercase">
                SANSKAR@portfolio — TERMINAL
              </div>
              
              {/* Invisible spacer to balance the traffic lights and center the text */}
              <div className="w-[52px]"></div>
            </div>

            {/* Grain overlay inside terminal */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay z-0"
              style={{ backgroundImage: GRAIN, backgroundSize: "180px 180px" }}
            />

            {/* Terminal Scroll Area */}
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

              {/* Active Input Line */}
              <div className="flex gap-3 text-ice-100">
                <span className="text-ice-500 shrink-0 mt-0.5 whitespace-nowrap">{cwd} $</span>
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-transparent outline-none border-none text-ice-100 placeholder:text-ice-500/50 caret-transparent"
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                  />
                  {/* Custom blinking cursor overlapping text */}
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
