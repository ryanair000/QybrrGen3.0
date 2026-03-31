"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

type AccentTone = "violet" | "amber" | "emerald";

export interface ArticleCardProps extends React.HTMLAttributes<HTMLDivElement> {
  tag: string;
  date: {
    month: string;
    day: number;
  };
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  location: {
    city: string;
    country: string;
  };
  priceLabel?: string;
  priceDetail?: string;
  ctaLabel?: string;
  accent?: AccentTone;
}

const accentStyles: Record<
  AccentTone,
  {
    glow: string;
    tag: string;
    price: string;
    cta: string;
  }
> = {
  violet: {
    glow:
      "bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_34%)]",
    tag: "bg-white/8 text-white/78",
    price: "text-fuchsia-200",
    cta: "text-fuchsia-200",
  },
  amber: {
    glow:
      "bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.14),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.08),transparent_34%)]",
    tag: "bg-white/8 text-white/78",
    price: "text-amber-200",
    cta: "text-amber-200",
  },
  emerald: {
    glow:
      "bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.14),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.08),transparent_34%)]",
    tag: "bg-white/8 text-white/78",
    price: "text-emerald-200",
    cta: "text-emerald-200",
  },
};

const ArticleCard = React.forwardRef<HTMLDivElement, ArticleCardProps>(
  (
    {
      className,
      tag,
      date,
      title,
      description,
      imageUrl,
      imageAlt,
      location,
      priceLabel,
      priceDetail,
      ctaLabel,
      accent = "violet",
      ...props
    },
    ref
  ) => {
    const motionProps = props as React.ComponentProps<typeof motion.div>;
    const accents = accentStyles[accent];

    const cardVariants = {
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" as const },
      },
      hover: {
        y: -5,
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)",
      },
    };

    const imageVariants = {
      hover: { scale: 1.1 },
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "group relative h-full w-full overflow-hidden rounded-[30px] bg-[#151312] text-white shadow-[0_30px_70px_-42px_rgba(0,0,0,0.82)]",
          className
        )}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        transition={{ duration: 0.3, ease: "easeInOut" as const }}
        {...motionProps}
      >
        <div
          className={cn(
            "absolute inset-0 opacity-80 transition-opacity duration-300 group-hover:opacity-100",
            accents.glow
          )}
        />
        <div className="absolute inset-x-0 top-0 h-px bg-white/10" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_28%)]" />

        <div className="relative flex h-full flex-col">
          <div className="space-y-6 p-6 sm:p-7">
            <header className="flex items-center justify-between gap-4">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em]",
                  accents.tag
                )}
              >
                {tag}
              </span>
              <div className="flex items-center text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                <span className="rounded-l-xl bg-white/8 px-3 py-2 text-white/75">
                  {date.month.toUpperCase()}
                </span>
                <span className="rounded-r-xl bg-white px-3 py-2 text-[#121212]">
                  {date.day}
                </span>
              </div>
            </header>

            <main className="space-y-3">
              <h3 className="max-w-[14ch] text-3xl font-semibold tracking-[-0.04em] text-white sm:text-[2rem]">
                {title}
              </h3>
              <p className="max-w-[34ch] text-sm leading-7 text-white/62 sm:text-[0.97rem]">
                {description}
              </p>
            </main>

            {(priceLabel || ctaLabel || priceDetail) && (
              <div className="flex items-end justify-between gap-4 pt-1">
                <div className="space-y-1">
                  {priceLabel && (
                    <p className={cn("text-sm font-semibold", accents.price)}>
                      {priceLabel}
                    </p>
                  )}
                  {priceDetail && (
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">
                      {priceDetail}
                    </p>
                  )}
                </div>
                {ctaLabel && (
                  <div
                    className={cn(
                      "inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] transition-transform duration-300 group-hover:translate-x-0.5",
                      accents.cta
                    )}
                  >
                    <span>{ctaLabel}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative mt-auto aspect-[16/11] overflow-hidden">
            <motion.img
              src={imageUrl}
              alt={imageAlt}
              className="h-full w-full object-cover"
              variants={imageVariants}
              transition={{ duration: 0.4, ease: "easeOut" as const }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/24 to-transparent" />
            <div className="absolute bottom-0 left-0 flex items-center gap-2 p-5 text-white">
              <MapPin className="h-4 w-4 shrink-0 text-white/80" />
              <div>
                <p className="text-sm font-semibold">{location.city}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-white/72">
                  {location.country}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);
ArticleCard.displayName = "ArticleCard";

export { ArticleCard };
