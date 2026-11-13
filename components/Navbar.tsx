'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Tv, Sparkles, Hash, Layers } from 'lucide-react';
import { Category } from '@/types/channel';
import DekhoLogo from '@/components/DekhoLogo';

interface NavbarProps {
  categories: Category[];
  activeCategory?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  liveCount?: number;
  onOpenGuide?: () => void;
  onOpenNumpad?: () => void;
}

export default function Navbar({
  categories,
  activeCategory = 'all',
  searchQuery = '',
  onSearchChange,
  liveCount = 36,
  onOpenGuide,
  onOpenNumpad,
}: NavbarProps) {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'StreamPulse';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#06080d]/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <Link href="/" className="group hover:opacity-95 transition-opacity">
            <DekhoLogo />
          </Link>

          {/* Live Status Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-400">{liveCount} Live Channels</span>
            <span className="text-white/20">•</span>
            <span className="text-slate-400 font-medium">HLS & YT Cloud Stream</span>
          </div>
        </div>

        {/* Center: Search Bar */}
        {onSearchChange && (
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search channels, numbers, or languages..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-12 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500/60 focus:bg-white/[0.06] focus:ring-1 focus:ring-red-500/40 transition-all"
              />
              {searchQuery ? (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-white/[0.08]"
                >
                  Clear
                </button>
              ) : (
                <kbd className="hidden lg:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-white/[0.06] border border-white/[0.1] px-1.5 py-0.5 rounded">
                  /
                </kbd>
              )}
            </div>
          </div>
        )}

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-bold text-slate-200 transition-all active:scale-95"
              title="Open Full TV Guide (Press 'G')"
            >
              <Tv className="h-3.5 w-3.5 text-amber-400" />
              <span>TV Guide</span>
              <kbd className="hidden sm:inline-block text-[10px] font-mono text-slate-400 bg-white/[0.08] px-1 rounded">
                G
              </kbd>
            </button>
          )}

          {onOpenNumpad && (
            <button
              onClick={onOpenNumpad}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white shadow-md shadow-red-600/20 transition-all active:scale-95"
              title="Jump to Channel Number (0-9)"
            >
              <Hash className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Jump</span> CH
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Bar Row */}
      {onSearchChange && (
        <div className="md:hidden px-3 pb-3 pt-1">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search 45+ channels..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-10 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
