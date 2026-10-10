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

interface GalleryItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string;
}

interface Gallery6Props {
  heading?: string;
  demoUrl?: string;
  items?: GalleryItem[];
}

const Gallery6 = ({
  heading = "Other FEATURED projects",
  demoUrl = "#",
  items = [
    {
      id: "item-1",
      title: "Build Modern UIs",
      summary:
        "Create stunning user interfaces with our comprehensive design system.",
      url: "#",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "item-2",
      title: "Computer Vision Technology",
      summary:
        "Powerful image recognition and processing capabilities that allow AI systems to analyze, understand, and interpret visual information from the world.",
      url: "#",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "item-3",
      title: "Machine Learning Automation",
      summary:
        "Self-improving algorithms that learn from data patterns to automate complex tasks and make intelligent decisions with minimal human intervention.",
      url: "#",
      image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "item-4",
      title: "Predictive Analytics",
      summary:
        "Advanced forecasting capabilities that analyze historical data to predict future trends and outcomes, helping businesses make data-driven decisions.",
      url: "#",
      image: "https://images.unsplash.com/photo-1519389953810-19558157728e?auto=format&fit=crop&q=80&w=800",
    },
    {
      id: "item-5",
      title: "Neural Network Architecture",
      summary:
        "Sophisticated AI models inspired by human brain structure, capable of solving complex problems through deep learning and pattern recognition.",
      url: "#",
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800",
    },
  ],
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
              <CarouselItem key={item.id} className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3">
                <a
                  href={item.url}
                  className="group flex flex-col h-full rounded-2xl bg-ink-1/75 backdrop-blur-md border border-ink-3 overflow-hidden hover:bg-ink-2/50 transition-all duration-500"
                >
                  <div className="flex aspect-[4/3] overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6 md:p-8 flex flex-col flex-1 relative z-20">
                    <h3 className="mb-3 text-xl font-semibold tracking-tight text-ice-50 group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                    <p className="mb-6 line-clamp-3 text-sm text-ice-300 leading-relaxed">
                      {item.summary}
                    </p>
                    <div className="flex items-center text-xs font-mono text-ice-400 group-hover:text-white mt-auto transition-colors">
                      READ MORE
                      <ArrowRight className="ml-2 size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </a>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  );
};

export { Gallery6 };
