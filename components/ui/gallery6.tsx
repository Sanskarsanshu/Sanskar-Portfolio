"use client";

import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

import { ProjectDetail } from "@/lib/projects";

interface Gallery6Props {
  heading?: string;
  demoUrl?: string;
  items?: ProjectDetail[];
  onSelect?: (project: ProjectDetail) => void;
}

const Gallery6 = ({
  heading = "Other FEATURED projects",
  demoUrl = "#",
  items = [],
  onSelect,
}: Gallery6Props) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  
  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    carouselApi.on("reInit", updateSelection);
    return () => {
      carouselApi.off("select", updateSelection);
      carouselApi.off("reInit", updateSelection);
    };
  }, [carouselApi]);

  return (
    <div className="w-full text-ice-50">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 md:px-14 flex flex-col">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col">
            <p className="font-mono text-sm text-ice-400 mb-2 uppercase tracking-widest">
              Open Source
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-ice-50">
              {heading}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <a
              href={demoUrl}
              className="group flex items-center gap-1.5 text-sm font-mono text-ice-300 hover:text-white transition-colors"
            >
              EXPLORE ALL
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => carouselApi?.scrollPrev()}
                disabled={!canScrollPrev}
                className="group relative flex items-center justify-center w-11 h-11 rounded-full border border-ice-600/50 bg-transparent text-ice-300 transition-all duration-300 hover:border-ice-300/80 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:border-ice-600/50 disabled:hover:bg-transparent"
                aria-label="Previous"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                onClick={() => carouselApi?.scrollNext()}
                disabled={!canScrollNext}
                className="group relative flex items-center justify-center w-11 h-11 rounded-full border border-ice-600/50 bg-transparent text-ice-300 transition-all duration-300 hover:border-ice-300/80 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:border-ice-600/50 disabled:hover:bg-transparent"
                aria-label="Next"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Section */}
        <Carousel
          setApi={setCarouselApi}
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 md:-ml-6">
            {items.map((item) => (
              <CarouselItem key={item.num} className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect?.(item)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect?.(item);
                    }
                  }}
                  className="group flex flex-col text-left h-full w-full rounded-2xl bg-ink-1/75 backdrop-blur-md border border-ink-3 overflow-hidden hover:bg-ink-2/50 transition-all duration-500 cursor-pointer"
                >
                  <div className="flex aspect-[4/3] w-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <img
                      src={item.logo || item.media?.[0]?.image || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-1 w-full relative z-20">
                    <h3 className="mb-3 text-xl font-semibold tracking-tight text-ice-50 group-hover:text-white transition-colors">
                      {item.name}
                    </h3>
                    <p className="mb-6 line-clamp-3 text-sm text-ice-300 leading-relaxed">
                      {item.desc}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center text-xs font-mono text-ice-400 group-hover:text-white transition-colors uppercase">
                        READ MORE
                        <ArrowRight className="ml-2 size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                      <div className="flex items-center gap-3">
                        {item.github && (
                          <a
                            href={item.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-ice-400 hover:text-white transition-colors"
                            aria-label="GitHub"
                          >
                            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
                              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                            </svg>
                          </a>
                        )}
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-ice-400 hover:text-white transition-colors"
                            aria-label="Live Site"
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export { Gallery6 };
