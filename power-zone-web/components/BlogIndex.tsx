'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { POSTS } from '@/data/blog';
import type { BlogCategory, BlogPost } from '@/data/blog';

const NAV_LINKS = [
  { label: 'Products', href: '/products' },
  { label: 'Applications', href: '/applications' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact Us', href: '/contact' },
];

type Filter = 'All' | BlogCategory;
const FILTERS: Filter[] = ['All', 'Hybrid Inverters', 'Diesel Generators'];

// ───────────────────────────────────────────────────────────────────────────
// SEARCH
// ───────────────────────────────────────────────────────────────────────────
// Token-based contains-match across title, excerpt, category, and tags. Each
// query token must appear in at least one of the searchable fields, so multi
// word queries narrow rather than broaden.
function matches(post: BlogPost, query: string, filter: Filter): boolean {
  if (filter !== 'All' && post.category !== filter) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    post.title,
    post.excerpt,
    post.category,
    ...post.tags,
  ]
    .join(' ')
    .toLowerCase();

  return q
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

export default function BlogIndex() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = useMemo(
    () => POSTS.filter((p) => matches(p, query, filter)),
    [query, filter],
  );

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0F0F0F] text-white">
      {/* Atmospheric glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 100% 0%, rgba(220, 38, 38, 0.12) 0%, transparent 65%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 0% 100%, rgba(255, 255, 255, 0.04) 0%, transparent 70%)',
        }}
      />

      {/* Top-left logo */}
      <Link
        href="/"
        aria-label="Power Zone home"
        className="absolute left-8 top-4 z-40"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo-on-dark.png"
          alt="Power Zone"
          draggable={false}
          className="pointer-events-none h-16 w-auto select-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]"
        />
      </Link>

      {/* Top navbar */}
      <nav className="absolute left-0 right-0 top-0 z-30 h-24 border-b border-white/10 bg-black/30 backdrop-blur-md">
        <div
          className="
            flex h-full items-center justify-center gap-3
            text-sm font-bold uppercase tracking-[0.24em] text-white
            [text-shadow:0_1px_4px_rgba(0,0,0,0.65)]
          "
        >
          {NAV_LINKS.map((link) => {
            const isActive = link.href === '/blog';
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`
                  cursor-pointer rounded-full px-5 py-2
                  transition-colors duration-300
                  ${isActive ? 'bg-red-500/55' : 'hover:bg-red-500/55'}
                `}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main
        className="
          relative z-10 mx-auto w-full max-w-[1400px]
          px-6 pb-24 pt-32 md:px-10 lg:px-16
        "
      >
        {/* Hero */}
        <section className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-red-500">
            Insights &amp; Field Notes
          </p>
          <h1
            className="
              mx-auto mt-4 max-w-[60rem]
              text-[clamp(34px,4.4vw,60px)] font-semibold
              leading-[1.04] tracking-tight text-white
            "
            style={{ letterSpacing: '-0.01em' }}
          >
            Knowledge from the
            <span className="ml-3 font-serif italic font-normal text-white/85">
              power room.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-[44rem] text-[14px] leading-relaxed text-white/65 md:text-[15px]">
            Practical guides on diesel generators, hybrid inverters, and the
            energy systems we install across Pakistan — written by the people
            who run them.
          </p>
        </section>

        {/* Search + filters */}
        <section className="mt-12 md:mt-14">
          <div className="mx-auto flex max-w-[760px] flex-col items-stretch gap-4">
            <SearchBar value={query} onChange={setQuery} />
            <div className="flex flex-wrap items-center justify-center gap-2">
              {FILTERS.map((f) => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`
                      cursor-pointer rounded-full px-4 py-1.5
                      text-[11px] font-medium uppercase tracking-[0.22em]
                      transition-colors duration-300
                      ${
                        active
                          ? 'bg-red-500/85 text-white'
                          : 'border border-white/10 bg-white/[0.03] text-white/70 hover:border-red-500/40 hover:text-white'
                      }
                    `}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
            <p className="text-center text-[12px] text-white/40">
              {filtered.length}{' '}
              {filtered.length === 1 ? 'article' : 'articles'}
              {query ? (
                <>
                  {' '}
                  matching <span className="text-white/70">“{query}”</span>
                </>
              ) : null}
            </p>
          </div>
        </section>

        {/* Results */}
        <section className="mt-12 md:mt-16">
          {filtered.length === 0 ? (
            <EmptyState
              query={query}
              onClear={() => {
                setQuery('');
                setFilter('All');
              }}
            />
          ) : (
            <>
              {featured ? <FeaturedCard post={featured} /> : null}
              {rest.length > 0 ? (
                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                  {rest.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label
      className="
        group relative flex items-center
        rounded-full border border-white/10 bg-white/[0.04]
        px-5 py-3.5
        backdrop-blur-md
        transition-colors duration-300
        focus-within:border-red-500/50 focus-within:bg-white/[0.06]
      "
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-3 h-5 w-5 shrink-0 text-white/45 transition-colors group-focus-within:text-red-400"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder="Search articles — try &ldquo;battery&rdquo;, &ldquo;cleaning&rdquo;, &ldquo;hybrid inverter&rdquo;…"
        className="
          flex-1 bg-transparent text-[14px] text-white placeholder:text-white/35
          focus:outline-none md:text-[15px]
        "
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="
            ml-3 shrink-0 rounded-full
            p-1 text-white/40 transition-colors
            hover:bg-white/10 hover:text-white
          "
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ) : null}
    </label>
  );
}

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="
        group relative block overflow-hidden
        rounded-[2rem] border border-white/10
        bg-gradient-to-br from-[#1A1A1A] via-[#181818] to-[#141414]
        p-8 md:p-12
        transition-all duration-500
        hover:-translate-y-0.5 hover:border-red-500/40
        hover:shadow-[0_30px_80px_-30px_rgba(220,38,38,0.35)]
      "
    >
      {/* Glow accent */}
      <div
        aria-hidden
        className="
          pointer-events-none absolute -right-24 -top-24 h-72 w-72
          rounded-full bg-red-500/10 blur-3xl
          transition-opacity duration-500
          opacity-60 group-hover:opacity-100
        "
      />
      <div className="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <CategoryPill category={post.category} />
            <span className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/45">
              Featured · {post.readMinutes} min read
            </span>
          </div>
          <h2
            className="
              mt-5 text-[clamp(26px,3.2vw,42px)]
              font-semibold leading-[1.08] tracking-tight text-white
            "
            style={{ letterSpacing: '-0.01em' }}
          >
            {post.title}
          </h2>
          <p className="mt-4 max-w-[44rem] text-[15px] leading-relaxed text-white/65 md:text-[16px]">
            {post.excerpt}
          </p>
        </div>
        <div className="flex md:justify-end">
          <span
            className="
              inline-flex items-center gap-2
              text-[12px] font-semibold uppercase tracking-[0.22em] text-white
              transition-colors group-hover:text-red-400
            "
          >
            Read article
            <Arrow />
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="
        group relative flex h-full flex-col
        overflow-hidden rounded-2xl
        border border-white/10 bg-[#181818]
        p-7
        transition-all duration-500
        hover:-translate-y-1 hover:border-red-500/40
        hover:shadow-[0_22px_55px_-25px_rgba(220,38,38,0.45)]
      "
    >
      <div className="flex items-center justify-between">
        <CategoryPill category={post.category} />
        <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/40">
          {post.readMinutes} min
        </span>
      </div>

      <h3
        className="
          mt-5 text-[18px] font-semibold leading-[1.25]
          tracking-tight text-white
          transition-colors group-hover:text-red-400
          md:text-[19px]
        "
        style={{ letterSpacing: '-0.005em' }}
      >
        {post.title}
      </h3>

      <p className="mt-3 line-clamp-3 text-[13.5px] leading-relaxed text-white/60">
        {post.excerpt}
      </p>

      <span
        className="
          mt-6 inline-flex items-center gap-2
          text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70
          transition-colors group-hover:text-red-400
        "
      >
        Read more
        <Arrow />
      </span>
    </Link>
  );
}

function CategoryPill({ category }: { category: BlogCategory }) {
  const styles =
    category === 'Hybrid Inverters'
      ? 'bg-red-500/15 text-red-300 ring-red-500/25'
      : 'bg-amber-400/10 text-amber-200 ring-amber-400/20';
  return (
    <span
      className={`
        inline-flex items-center
        rounded-full px-3 py-1
        text-[10px] font-semibold uppercase tracking-[0.22em]
        ring-1 ring-inset
        ${styles}
      `}
    >
      {category}
    </span>
  );
}

function Arrow() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
      aria-hidden
    >
      <path d="M3 8h10" />
      <path d="M9 4l4 4-4 4" />
    </svg>
  );
}

function EmptyState({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}) {
  return (
    <div
      className="
        mx-auto flex max-w-[480px] flex-col items-center
        rounded-2xl border border-white/10 bg-white/[0.02]
        px-8 py-14 text-center
      "
    >
      <div
        className="
          flex h-12 w-12 items-center justify-center
          rounded-full border border-white/10 bg-black/30
        "
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          className="h-5 w-5 text-white/55"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </div>
      <h3 className="mt-5 text-[18px] font-semibold tracking-tight text-white">
        Nothing matched{query ? ` “${query}”` : ' your filter'}.
      </h3>
      <p className="mt-2 text-[13.5px] leading-relaxed text-white/55">
        Try a different keyword or clear the filters to see every article.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="
          mt-6 inline-flex cursor-pointer items-center gap-2
          rounded-full bg-red-500/85 px-5 py-2
          text-[11px] font-semibold uppercase tracking-[0.22em] text-white
          transition-colors hover:bg-red-500
        "
      >
        Reset
        <Arrow />
      </button>
    </div>
  );
}
