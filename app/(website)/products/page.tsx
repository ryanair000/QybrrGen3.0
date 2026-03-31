'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { ArrowRight } from 'lucide-react';
import { sampleProducts } from '@/lib/products';
import { ArticleCard } from '@/components/ui/card-23';

type Product = (typeof sampleProducts)[number];

const cardAccents = ['violet', 'amber', 'emerald'] as const;

function getPriceLabel(product: Product) {
  if (product.price === 0) {
    return 'Free access';
  }

  if (
    product.memberPrice !== null &&
    product.memberPrice < product.price &&
    product.memberPrice === 0
  ) {
    return 'Included for members';
  }

  if (product.memberPrice !== null && product.memberPrice < product.price) {
    return `$${product.memberPrice.toFixed(2)} member access`;
  }

  return `$${product.price.toFixed(2)} standard access`;
}

function getPriceDetail(product: Product) {
  if (product.price === 0) {
    return 'READY NOW';
  }

  if (product.memberPrice !== null && product.memberPrice < product.price) {
    return `STANDARD ${`$${product.price.toFixed(2)}`}`;
  }

  return 'FULL ACCESS';
}

export default function ProductsPage() {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <div className="relative overflow-hidden bg-[#f6f2eb]">
      <div className="absolute inset-x-0 top-0 h-[28rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.84),rgba(246,242,235,0)),radial-gradient(circle_at_top_right,rgba(251,191,36,0.12),transparent_28%),radial-gradient(circle_at_top_left,rgba(120,119,198,0.08),transparent_34%)]" />

      <div className="container relative mx-auto px-4 pb-20 pt-14 sm:px-6 lg:px-8 lg:pt-20">
        <section className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-start">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-black/42">
              QybrrLabs Product Suite
            </p>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-[#121212] sm:text-5xl lg:text-6xl">
              AI products designed for actual workflows, with a quieter and more intentional presentation.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-black/62 sm:text-lg">
              The page now leans more editorial than promotional. Less chrome,
              fewer boxes, better hierarchy, and product cards that feel like
              complete objects instead of stitched-together sections.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-black/54">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#121212]" />
                {sampleProducts.length} live products
              </span>
              <span>Integrated pricing and launch cues</span>
              <span>Cleaner single-surface cards</span>
            </div>
          </div>

          <div className="space-y-7 pt-1 lg:pl-10">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-black/35">
                What Changed
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#121212]">
                {sampleProducts.length}
              </p>
              <p className="mt-2 max-w-sm text-sm leading-7 text-black/55">
                Distinct product surfaces, each with integrated access details
                and a direct launch path.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-black/35">
                Design Direction
              </p>
              <p className="mt-3 max-w-sm text-lg font-medium leading-8 text-[#121212]">
                More restraint, better spacing, and fewer decorative borders competing for attention.
              </p>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#121212] transition-transform duration-300 hover:translate-x-0.5"
            >
              Explore the Blog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {sampleProducts.map((product: Product, index) => (
            <div
              key={product.id}
              className={
                index === 1
                  ? 'lg:translate-y-8'
                  : index === 2
                    ? 'lg:translate-y-16'
                    : ''
              }
            >
              <Link
                href={product.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${product.name}`}
                className="block h-full"
                data-aos="fade-up"
                data-aos-delay={index * 120}
              >
                <ArticleCard
                  tag={product.cardMeta.tag}
                  date={product.cardMeta.date}
                  title={product.cardMeta.headline || product.name}
                  description={product.cardMeta.description}
                  imageUrl={product.cardMeta.imageUrl}
                  imageAlt={product.cardMeta.imageAlt}
                  location={product.cardMeta.location}
                  priceLabel={getPriceLabel(product)}
                  priceDetail={getPriceDetail(product)}
                  ctaLabel={product.ctaLabel}
                  accent={cardAccents[index % cardAccents.length]}
                  className="max-w-none"
                />
              </Link>
            </div>
          ))}
        </section>

        <div className="mt-20 flex flex-col gap-3 text-sm leading-7 text-black/56 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl">
            Each card now carries its own hierarchy, access context, and launch
            intent without relying on extra bordered sections below it.
          </p>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/34">
            Quiet layout. Stronger cards.
          </p>
        </div>
      </div>
    </div>
  );
}
