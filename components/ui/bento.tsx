"use client";
import { clsx } from "clsx";
import { motion } from "framer-motion";

export default function FUIBentoGridDark() {
  return (
    <div className="pt-32 container mx-auto bg-[#] min-w-screen flex flex-col p-10 bg-gray-950/10">
      <h1 className="font-geistMono tracking-tight text-3xl md:text-5xl text-ice-50">
        Other FEATURED projects
      </h1>
      <p className="max-w-3xl text-2xl/8 font-medium tracking-tight mt-2 text-ice-200">
        Explore some of our other notable creations and experiments.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:mt-16 lg:grid-cols-6 lg:grid-rows-2">
        <BentoCard
          eyebrow="Insight"
          title="Get perfect clarity"
          description="PerkAI uses social engineering to build a detailed financial picture of your leads. Know their budget, compensation package, social security number, and more."
          graphic={
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center" />
          }
          className="max-lg:rounded-t-4xl lg:col-span-3 lg:rounded-tl-4xl"
        />
        <BentoCard
          eyebrow="Analysis"
          title="Undercut your competitors"
          description="With our advanced data mining, you’ll know which companies your leads are talking to and exactly how much they’re being charged."
          graphic={
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center" />
          }
          className="lg:col-span-3 lg:rounded-tr-4xl"
        />
        <BentoCard
          eyebrow="Speed"
          title="Built for power users"
          description="It’s never been faster to cold email your entire contact list using our streamlined keyboard shortcuts."
          graphic={
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center bg-black" />
          }
          className="lg:col-span-2 lg:rounded-bl-4xl"
        />
        <BentoCard
          eyebrow="Source"
          title="Get the furthest reach"
          description="Bypass those inconvenient privacy laws to source leads from the most unexpected places."
          graphic={
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519389953810-19558157728e?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center" />
          }
          className="lg:col-span-2"
        />
        <BentoCard
          eyebrow="Limitless"
          title="Sell globally"
          description="PerkAI helps you sell in locations currently under international embargo."
          graphic={
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center" />
          }
          className="max-lg:rounded-b-4xl lg:col-span-2 lg:rounded-br-4xl"
        />
      </div>
    </div>
  );
}

export function BentoCard({
  dark = false,
  className = "",
  eyebrow,
  title,
  description,
  graphic,
  fade = [],
}: {
  dark?: boolean;
  className?: string;
  eyebrow: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  graphic?: React.ReactNode;
  fade?: ("top" | "bottom")[];
}) {
  return (
    <motion.div
      initial="idle"
      whileHover="active"
      variants={{ idle: {}, active: {} }}
      data-dark={dark ? "true" : undefined}
      className={clsx(
        className,
        "group relative flex flex-col overflow-hidden rounded-lg ",
        "bg-black dark:bg-transparent transform-gpu dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#8686f01f_inset] bg-black shadow-sm ring-1 ring-white/10",
        "data-[dark]:bg-gray-800 data-[dark]:ring-white/15"
      )}
    >
      <div className="relative h-[29rem] shrink-0 ">
        {graphic}
        {fade.includes("top") && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent group-data-[dark]:from-gray-800 group-data-[dark]:from-[-25%] opacity-25" />
        )}
        {fade.includes("bottom") && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-data-[dark]:from-gray-800 group-data-[dark]:from-[-25%] opacity-25 " />
        )}
      </div>
      <div className="relative p-10 z-20 isolate mt-[-110px] h-[14rem] bg-ink-1/75 backdrop-blur-md border-t border-ink-3">
        <h1 className="font-mono text-sm text-ice-400 mb-2 uppercase tracking-widest">{eyebrow}</h1>
        <p className="mt-1 text-2xl/8 font-medium tracking-tight text-ice-50">
          {title}
        </p>
        <p className="mt-2 max-w-[600px] text-sm/6 text-ice-300">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
