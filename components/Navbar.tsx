'use client';

import React from 'react';
import Link from 'next/link';
import { Radio, Search, Tv, Sparkles } from 'lucide-react';
import { Category } from '@/types/channel';

interface NavbarProps {
  categories: Category[];
  activeCategory?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  liveCount?: number;
}

export default function Navbar({
  categories,
  activeCategory = 'news',
  searchQuery = '',
  onSearchChange,
  liveCount = 4,
}: NavbarProps) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'StreamPulse';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-700 shadow-lg shadow-red-500/25 group-hover:scale-105 transition-transform">
              <Radio className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-mono">
                  {siteName}
                </span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </div>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 -mt-0.5">
                Live TV Platform
              </p>
            </div>
          </Link>

          {/* Live Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-surface-muted border border-surface-border text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-emerald-400">{liveCount} Live Streams</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">HLS Proxy Active</span>
          </div>
        </div>

        {/* Center / Search Bar if handler provided */}
        {onSearchChange && (
          <div className="hidden sm:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search 30+ TV channels by name or language..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-xl bg-surface-muted/90 border border-surface-border pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/60 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-surface-border"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Categories Bar (Desktop quick pills) */}
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => {
            const isActive = cat.id === activeCategory;
            return (
              <Link
                key={cat.id}
                href={cat.active ? `/?category=${cat.id}` : '#'}
                onClick={(e) => {
                  if (!cat.active) {
                    e.preventDefault();
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                    : cat.active
                    ? 'text-slate-300 hover:bg-surface-muted hover:text-white'
                    : 'text-slate-500 cursor-not-allowed opacity-60 hover:bg-transparent'
                }`}
              >
                <span>{cat.name}</span>
                {cat.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-surface-border text-slate-400 font-normal">
                    {cat.badge}
                  </span>
                )}
                {isActive && (
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile search bar */}
      {onSearchChange && (
        <div className="sm:hidden px-4 pb-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl bg-surface-muted border border-surface-border pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>
      )}
    </header>
  );
}

