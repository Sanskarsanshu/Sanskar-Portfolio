"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSeason } from "@/components/SeasonProvider";
import { AnimatePresence, motion } from "framer-motion";

export function SlideshowBackground() {
  const { id: seasonId, setGalleryImage } = useSeason();
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Sync current image to context for dynamic palette overrides
  useEffect(() => {
    if (images.length > 0) {
      setGalleryImage(images[currentIndex]);
    }
  }, [currentIndex, images, setGalleryImage]);

  // Fetch the list of images when the component mounts
  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch(`/api/backgrounds?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        if (data.images && data.images.length > 0) {
          setImages(data.images);
        }
      } catch (err) {
        console.error("Failed to load backgrounds for slideshow", err);
      }
    }
    fetchImages();
  }, []);

  // Set up the interval for 2 minutes (120,000 ms)
  useEffect(() => {
    if (images.length <= 1 || seasonId !== "gallery") return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [images.length, seasonId]);

  // If not in gallery mode or no images, render nothing
  if (seasonId !== "gallery" || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[-2] w-full h-full bg-black pointer-events-none overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={images[currentIndex]}
            alt={`Background slideshow ${currentIndex + 1}`}
            fill
            sizes="100vw"
            quality={90}
            priority
            style={{ objectFit: "cover" }}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Optional: Add a subtle overlay so text remains readable across different images */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
