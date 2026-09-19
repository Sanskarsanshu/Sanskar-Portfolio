"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_SEASON,
  SEASONS,
  getPalette,
  type SeasonId,
  type SeasonPalette,
} from "@/lib/seasons";

type SeasonCtx = {
  id: SeasonId;
  palette: SeasonPalette;
  setSeason: (id: SeasonId) => void;
  galleryImage: string | null;
  setGalleryImage: (url: string | null) => void;
};

const Ctx = createContext<SeasonCtx | null>(null);

const STORAGE_KEY = "portfolio-season";

// Client-side script that runs before React hydrates. Reads the stored
// season and sets data-season on <html> so the first paint already uses
// the right palette (no flash of winter). Emitted inline by layout.tsx.
export const SEASON_BOOT_SCRIPT = `(function(){try{var s=localStorage.getItem(${JSON.stringify(STORAGE_KEY)});var ok=${JSON.stringify(SEASONS.map((s) => s.id))};if(s&&ok.indexOf(s)>-1){document.documentElement.dataset.season=s;}else{document.documentElement.dataset.season=${JSON.stringify(DEFAULT_SEASON)};}}catch(e){document.documentElement.dataset.season=${JSON.stringify(DEFAULT_SEASON)};}})();`;

export default function SeasonProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<SeasonId>(DEFAULT_SEASON);
  const [galleryImage, setGalleryImage] = useState<string | null>(null);

  // On mount: read whatever the boot script already placed on <html>, so
  // React state matches the DOM attribute from the very first render.
  useEffect(() => {
    const fromDom = document.documentElement.dataset.season as
      | SeasonId
      | undefined;
    if (fromDom && SEASONS.some((s) => s.id === fromDom) && fromDom !== id) {
      setId(fromDom);
    }
    // Empty deps: this only runs once to sync with the boot script.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setSeason = useCallback((next: SeasonId) => {
    setId(next);
    document.documentElement.dataset.season = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore quota/availability errors — the UI still updates in-memory.
    }
  }, []);

  const basePalette = getPalette(id);
  const palette = { ...basePalette };
  
  if (id === "gallery" && galleryImage) {
    if (galleryImage.includes("Back5.jpg") || galleryImage.includes("Back21") || galleryImage.includes("Back22")) {
      palette.keyboardBase = "#4A321C";
    } else if (galleryImage.includes("Back8") || galleryImage.includes("Back9")) {
      palette.keyboardBase = "#080808";
    } else if (galleryImage.includes("Back3")) {
      palette.keyboardBase = "#7A1118";
    } else if (galleryImage.includes("Back4")) {
      palette.keyboardBase = "#183326";
    } else if (galleryImage.includes("Back7")) {
      palette.keyboardBase = "#8A3F0A";
    } else if (galleryImage.includes("Back11")) {
      palette.keyboardBase = "#5A0B10";
    } else if (galleryImage.includes("Back6") || galleryImage.includes("Back18") || galleryImage.includes("Back19")) {
      palette.keyboardBase = "#050505";
    } else if (galleryImage.includes("Back25")) {
      palette.keyboardBase = "#46515E";
    } else if (galleryImage.includes("Back24")) {
      palette.keyboardBase = "#3A2A1B";
      palette.keyboardMetalness = 0.85;
      palette.keyboardRoughness = 0.35;
    } else if (galleryImage.includes("Back16")) {
      palette.keyboardBase = "#686D70";
      palette.keyboardMetalness = 0.9;
      palette.keyboardRoughness = 0.4;
    } else if (galleryImage.includes("Back10") || galleryImage.includes("Back12")) {
      palette.keyboardBase = "#686F74";
      palette.keyboardMetalness = 0.85;
      palette.keyboardRoughness = 0.4;
    } else if (galleryImage.includes("Back23") || galleryImage.includes("Back17")) {
      palette.keyboardBase = "#4A4D50";
      palette.keyboardMetalness = 0.85;
      palette.keyboardRoughness = 0.4;
    } else if (galleryImage.includes("Back13") || galleryImage.includes("Back14")) {
      palette.keyboardBase = "#1A0502";
      palette.keyboardMetalness = 0.85;
      palette.keyboardRoughness = 0.35;
    } else if (galleryImage.includes("Back15") || galleryImage.includes("Back20")) {
      palette.keyboardBase = "#181A1D";
      palette.keyboardMetalness = 0.85;
      palette.keyboardRoughness = 0.35;
    }
  }

  return (
    <Ctx.Provider value={{ id, palette, setSeason, galleryImage, setGalleryImage }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSeason(): SeasonCtx {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Outside the provider (e.g. during SSR before hydration of a leaf),
    // fall back to defaults rather than throwing. Keeps rendering robust.
    return {
      id: DEFAULT_SEASON,
      palette: getPalette(DEFAULT_SEASON),
      setSeason: () => {},
      galleryImage: null,
      setGalleryImage: () => {},
    };
  }
  return ctx;
}
