'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  X,
  Radio,
  Search,
  Tv,
  Check,
  Play,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Channel } from '@/types/channel';
import { PREFERRED_LANGUAGES } from '@/lib/constants';

interface TvGuideOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  currentChannel: Channel;
  onSelectChannel: (channel: Channel) => void;
}

export default function TvGuideOverlay({
  isOpen,
  onClose,
  channels,
  currentChannel,
  onSelectChannel,
}: TvGuideOverlayProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ['All', ...Array.from(set)];
  }, [channels]);

  // Keyboard navigation listener (ESC or G closes)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'g' || e.key === 'G') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = channels.filter((c) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.language.toLowerCase().includes(q) ||
      String(c.chNumber).includes(q) ||
      c.epgId.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategory === 'All' ||
      c.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesLanguage =
      selectedLanguage === 'All' ||
      c.language.toLowerCase() === selectedLanguage.toLowerCase();

    return matchesSearch && matchesCategory && matchesLanguage;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#06080d]/95 backdrop-blur-3xl p-3 sm:p-6 lg:p-8 animate-fade-in overflow-hidden select-none">
      {/* Top TV Guide Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-400 text-black shadow-lg shadow-amber-400/25">
            <Tv className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                CABLE TV GUIDE
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-amber-400">
                {channels.length} CHANNELS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Click any channel to tune in immediately • Press <kbd className="px-1 py-0.5 rounded bg-white/[0.1] text-white font-mono text-[10px]">ESC</kbd> or <kbd className="px-1 py-0.5 rounded bg-white/[0.1] text-white font-mono text-[10px]">G</kbd> to close
            </p>
          </div>
        </div>

        {/* Search & Close */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search channel or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.08] pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:bg-white/[0.06]"
              autoFocus
            />
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white transition-all active:scale-95"
            title="Close Guide (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs: Category & Languages */}
      <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06]">
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categories.map((cat) => {
            const isCatActive = selectedCategory.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  isCatActive
                    ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          {['All', ...PREFERRED_LANGUAGES].map((lang) => {
            const isLangActive = selectedLanguage.toLowerCase() === lang.toLowerCase();
            return (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition-all shrink-0 ${
                  isLangActive
                    ? 'bg-white text-black font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      </div>

      {/* Channel Grid in Guide */}
      <div className="flex-1 overflow-y-auto py-4 space-y-2 pr-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((ch) => {
            const isCurrent = ch.id === currentChannel.id;
            const isLive = Boolean(ch.hlsUrl && ch.hlsUrl.trim().length > 0);
            const chNum = String(ch.chNumber || 1).padStart(2, '0');

            return (
              <div
                key={ch.id}
                onClick={() => {
                  onSelectChannel(ch);
                  onClose();
                }}
                className={`group flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-400/15 border-amber-400 shadow-lg shadow-amber-400/10'
                    : isLive
                    ? 'bg-slate-900/60 border-white/[0.08] hover:border-amber-400/50 hover:bg-slate-900'
                    : 'bg-slate-950/40 border-white/[0.04] opacity-50 hover:opacity-80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Channel Number */}
                  <div
                    className={`flex h-10 w-11 items-center justify-center rounded-xl font-mono text-sm font-black shrink-0 ${
                      isCurrent
                        ? 'bg-amber-400 text-black shadow-md'
                        : 'bg-black/60 border border-white/10 text-amber-400'
                    }`}
                  >
                    {chNum}
                  </div>

                  {/* Channel Logo */}
                  <div className="relative h-10 w-14 rounded-lg bg-black/40 border border-white/5 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    <Image
                      src={ch.logo || '/logos/placeholder.svg'}
                      alt={ch.name}
                      fill
                      sizes="60px"
                      className="object-contain"
                    />
                  </div>

                  {/* Channel Name & Details */}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                      {ch.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <span>{ch.category}</span>
                      <span>•</span>
                      <span>{ch.language}</span>
                    </div>
                  </div>
                </div>

                {/* Right State */}
                <div className="shrink-0 flex items-center gap-1">
                  {isCurrent ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-black font-black text-[10px]">
                      <Check className="h-3 w-3 stroke-[3]" />
                      TUNED
                    </span>
                  ) : isLive ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/90 text-white font-bold text-[9px] group-hover:bg-red-500">
                      <Play className="h-2.5 w-2.5 fill-white" />
                      TUNE
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">Soon</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
