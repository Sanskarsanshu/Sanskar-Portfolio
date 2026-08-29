"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeroCarousel } from "@/components/ui/hero-carousel";
import { useLenis } from "lenis/react";
import { useLanguage } from "@/components/LanguageProvider";
import type { Project } from "@/lib/projects";

type Props = {
  project: Project | null;
  onBack: () => void;
};

/**
 * Full-viewport project showcase page.
 *
 * - HeroCarousel fills the ENTIRE screen as background.
 * - Project info (number, name, badge, description, stack) overlaid at
 *   the bottom-left ONLY on the first slide (index 0).
 * - Swipe to slide 2+ → project text fades out, carousel title shows.
 * - Back button pinned top-left at all times.
 */
export default function ProjectPage({ project, onBack }: Props) {
  const { t } = useLanguage();
  const lenis = useLenis();
  const open = project !== null;
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Reset to first slide whenever a new project opens
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setCarouselIndex(0);
  }, [open, project?.num]);

  // Freeze Lenis + page scroll while open
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = prev;
    };
  }, [open, lenis]);

  // ESC to go back
  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open, onBack]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="project-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-black text-white overflow-hidden"
        >
          {/* ── Full-bleed HeroCarousel — fills entire viewport ── */}
          <HeroCarousel
            items={[
              {
                id: "logo-slide",
                title: "",
                image: project.logo || "",
                accent: "#000000",
                credit: project.name,
              },
              ...project.media
            ]}
            index={carouselIndex}
            onIndexChange={setCarouselIndex}
            className="absolute inset-0 h-full w-full"
            autoplay
            autoplayDelay={5000}
          />

          {/* ── Back button — top left, always visible ── */}
          <motion.button
            type="button"
            onClick={onBack}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="absolute top-6 left-6 z-50 group flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/70 hover:text-white transition-colors duration-300"
          >
            <svg
              viewBox="0 0 24 24"
              width="13"
              height="13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="group-hover:-translate-x-0.5 transition-transform duration-300"
              aria-hidden
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </motion.button>

          {/* ── Project info — only on slide 0, fades out on swipe ── */}
          <AnimatePresence>
            {carouselIndex === 0 && (
              <motion.div
                key="project-info-gradient"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-x-0 bottom-0 z-40 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.82) 28%, rgba(0,0,0,0.55) 52%, transparent 72%)",
                  paddingTop: "120px",
                }}
              >
                <motion.div
                  className="pointer-events-auto px-8 sm:px-12 md:px-16 pb-10 max-w-3xl"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Project name */}
                  <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[0.95] mb-3">
                    {project.name}
                  </h1>

                  {/* Badge */}
                  {project.badge && (
                    <span className="inline-block mb-4 text-[10px] uppercase tracking-widest text-white/60 border border-white/25 rounded-full px-3 py-1">
                      {project.badge}
                    </span>
                  )}

                  {/* Description */}
                  <p className="text-white/75 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
                    {project.details}
                  </p>

                  {/* Stack */}
                  <div className="mb-6">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">
                      {t("projects.stackLabel")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.stack.map((s) => (
                        <span
                          key={s}
                          className="text-xs font-mono px-3 py-1.5 border border-white/15 text-white/70 hover:border-white/35 hover:text-white transition-colors duration-300 cursor-default"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>


                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
