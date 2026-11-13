'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Radio,
  Search,
  SlidersHorizontal,
  Tv,
  Check,
  Play,
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
  const [selectedLanguage, setSelectedLanguage] = useState('All');

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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

    const matchesLanguage =
      selectedLanguage === 'All' ||
      c.language.toLowerCase() === selectedLanguage.toLowerCase();

    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-2xl p-4 sm:p-6 lg:p-8 animate-fade-in overflow-hidden">
      {/* Top TV Guide Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-surface-border">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-black shadow-lg shadow-yellow-400/20">
            <Tv className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                TV GUIDE
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-muted border border-surface-border text-yellow-400">
                {channels.length} CHANNELS
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Tap any channel to tune in instantly
            </p>
          </div>
        </div>

        {/* Search & Close */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search channel or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl bg-surface-muted border border-surface-border pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-yellow-400"
            />
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted hover:bg-surface-border text-slate-300 hover:text-white transition-colors border border-surface-border shrink-0 min-w-[44px]"
            title="Close Guide (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Language Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-3">
        <button
          onClick={() => setSelectedLanguage('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 min-h-[36px] ${
            selectedLanguage === 'All'
              ? 'bg-yellow-400 text-black shadow-md'
              : 'bg-surface-muted text-slate-300 hover:bg-surface-border'
          }`}
        >
          All Languages
        </button>
        {PREFERRED_LANGUAGES.map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 min-h-[36px] ${
              selectedLanguage === lang
                ? 'bg-yellow-400 text-black font-bold shadow-md'
                : 'bg-surface-muted text-slate-300 hover:bg-surface-border'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Channel Grid */}
      <div className="flex-1 overflow-y-auto pr-1 pt-2 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filtered.map((channel) => {
            const isCurrent = channel.id === currentChannel.id;
            const isLive = Boolean(channel.hlsUrl && channel.hlsUrl.trim().length > 0);
            const chNum = String(channel.chNumber || 1).padStart(2, '0');

            return (
              <button
                key={channel.id}
                onClick={() => {
                  onSelectChannel(channel);
                  onClose();
                }}
                className={`relative flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all group min-h-[68px] ${
                  isCurrent
                    ? 'bg-yellow-400/10 border-yellow-400 shadow-lg shadow-yellow-400/10 ring-2 ring-yellow-400/30'
                    : isLive
                    ? 'bg-surface hover:bg-surface-muted border-surface-border hover:border-yellow-400/50'
                    : 'bg-surface/40 border-surface-border/50 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Channel Number Pill */}
                  <div
                    className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1 shrink-0 font-mono ${
                      isCurrent
                        ? 'bg-yellow-400 text-black font-black'
                        : 'bg-surface-muted border border-surface-border text-slate-200 font-bold'
                    }`}
                  >
                    <span className="text-[9px] uppercase -mb-0.5 opacity-75">CH</span>
                    <span className="text-base leading-none">{chNum}</span>
                  </div>

                  {/* Logo */}
                  <div className="relative h-10 w-14 rounded-lg bg-black/40 border border-white/5 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    <Image
                      src={channel.logo || '/logos/placeholder.svg'}
                      alt={channel.name}
                      fill
                      sizes="60px"
                      className="object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <p
                      className={`text-sm font-bold truncate leading-tight ${
                        isCurrent
                          ? 'text-yellow-400'
                          : 'text-white group-hover:text-yellow-300'
                      }`}
                    >
                      {channel.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {channel.language} • {channel.category}
                    </p>
                  </div>
                </div>

                {/* Right Badge */}
                <div className="shrink-0 ml-2">
                  {isCurrent ? (
                    <span className="flex items-center gap-1 text-[10px] font-black text-yellow-400 bg-yellow-400/20 px-2 py-0.5 rounded-full">
                      <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping" />
                      PLAYING
                    </span>
                  ) : isLive ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                      LIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500">
                      Soon
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

