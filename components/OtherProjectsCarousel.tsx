"use client";

import React, { useEffect, useState } from "react";
import { CalendlyCarousel, type CarouselItem } from "./ui/connected-carousel";
import { Loader2 } from "lucide-react";

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  fork: boolean;
  updated_at: string;
}

export function OtherProjectsCarousel() {
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepos() {
      try {
        // We fetch public repos for the user, sorting by updated time.
        const res = await fetch(
          "https://api.github.com/users/Sanskarsanshu/repos?sort=updated&per_page=15"
        );
        
        if (!res.ok) {
          throw new Error("Failed to load GitHub repositories");
        }

        const data: GitHubRepo[] = await res.json();
        
        // Filter out forks and empty repos to ensure quality projects are shown
        const filteredRepos = data
          .filter((repo) => !repo.fork && repo.name.toLowerCase() !== "sanskarsanshu")
          .slice(0, 6); // Take top 6 projects

        const mappedItems: CarouselItem[] = filteredRepos.map((repo) => {
          // Generate a consistent, sleek abstract developer-themed placeholder using Picsum seeds
          // The seed ensures the same repo always gets the same image
          const imageUrl = `https://picsum.photos/seed/${repo.id}/800/600?grayscale&blur=2`;

          return {
            id: repo.id.toString(),
            stat: repo.name.replace(/-/g, " "),
            quote: repo.description || "A custom open-source project building robust software solutions.",
            author: repo.language || "Open Source",
            role: `${repo.stargazers_count} Stars`,
            defaultImage: imageUrl,
            selectedImage: imageUrl,
            alt: `Screenshot or representation of ${repo.name}`,
          };
        });

        setItems(mappedItems);
        setError(null);
      } catch (err) {
        console.warn("Failed to fetch github repos for carousel:", err);
        setError("Unable to load GitHub projects at this time.");
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, []);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-24 min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-ice-500/50" />
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div className="w-full flex justify-center items-center py-24 text-ice-600 font-mono text-sm">
        {error || "No projects found."}
      </div>
    );
  }

  return (
    <div className="w-full py-12 flex flex-col items-center">
      <CalendlyCarousel
        items={items}
        autoPlayInterval={6000}
        pauseOnHover={false}
      />
    </div>
  );
}
