"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import {
  translate,
} from "@/lib/i18n";

type LanguageCtx = {
  lang: "en";
  setLang: (lang: "en") => void;
  t: (path: string) => string;
};

const Ctx = createContext<LanguageCtx | null>(null);

export const LANG_BOOT_SCRIPT = `(function(){document.documentElement.lang="en";})();`;

export default function LanguageProvider({ children }: { children: ReactNode }) {
  const t = useCallback((path: string) => translate(path), []);

  return <Ctx.Provider value={{ lang: "en", setLang: () => {}, t }}>{children}</Ctx.Provider>;
}

export function useLanguage(): LanguageCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    return {
      lang: "en",
      setLang: () => {},
      t: (path) => translate(path),
    };
  }
  return ctx;
}
