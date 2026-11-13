'use client';

import React, { useState, useMemo } from 'react';
import { Search, Radio, SlidersHorizontal, Sparkles, FilterX } from 'lucide-react';
import { Channel } from '@/types/channel';
import { PREFERRED_LANGUAGES } from '@/lib/constants';
import ChannelCard from '@/components/ChannelCard';

interface ChannelGridProps {
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function ChannelGrid({
  channels,
  onSelectChannel,
  searchQuery,
  onSearchChange,
}: ChannelGridProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [onlyLive, setOnlyLive] = useState<boolean>(false);

  // Compute language channel counts
  const languageCounts = useMemo(() => {
    const counts: Record<string, number> = { All: channels.length };
    PREFERRED_LANGUAGES.forEach((lang) => {
      counts[lang] = channels.filter((c) => c.language.toLowerCase() === lang.toLowerCase()).length;
    });
    return counts;
  }, [channels]);

  // Filter channels based on search query, language, and onlyLive toggle
  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      // Search filter
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        channel.name.toLowerCase().includes(q) ||
        channel.language.toLowerCase().includes(q) ||
        channel.epgId.toLowerCase().includes(q);

      // Language filter
      const matchesLanguage =
        selectedLanguage === 'All' ||
        channel.language.toLowerCase() === selectedLanguage.toLowerCase();

      // Only Live filter
      const isLive = Boolean(channel.hlsUrl && channel.hlsUrl.trim().length > 0);
      const matchesLive = !onlyLive || isLive;

      return matchesSearch && matchesLanguage && matchesLive;
    });
  }, [channels, searchQuery, selectedLanguage, onlyLive]);

  const liveInResults = filteredChannels.filter((c) => c.hlsUrl && c.hlsUrl.trim().length > 0).length;

  return (
    <div className="space-y-6">
      {/* Controls & Filters Bar */}
      <div className="space-y-4 rounded-2xl bg-surface p-4 sm:p-5 border border-surface-border">
        {/* Top Filter Controls: Search & Live Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar inside section */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search news channels by name (e.g. NDTV, ABP, DD, TV9)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-xl bg-surface-muted border border-surface-border pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-red-500/80 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Toggle: Only Live Now */}
          <button
            onClick={() => setOnlyLive(!onlyLive)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
              onlyLive
                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                : 'bg-surface-muted text-slate-300 border-surface-border hover:bg-surface-border hover:text-white'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                onlyLive ? 'bg-white animate-pulse' : 'bg-red-500'
              }`}
            />
            <span>Only Live Channels</span>
          </button>
        </div>

        {/* Language Filter Chips */}
        <div>
          <div className="flex items-center gap-2 mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5 text-red-400" />
            <span>Filter by Language</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* All chip */}
            <button
              onClick={() => setSelectedLanguage('All')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedLanguage === 'All'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                  : 'bg-surface-muted text-slate-300 hover:bg-surface-border hover:text-white border border-surface-border'
              }`}
            >
              <span>All</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  selectedLanguage === 'All'
                    ? 'bg-red-700 text-white'
                    : 'bg-surface-border text-slate-400'
                }`}
              >
                {languageCounts['All'] || 0}
              </span>
            </button>

            {/* Individual Language Chips */}
            {PREFERRED_LANGUAGES.map((lang) => {
              const count = languageCounts[lang] || 0;
              const isSelected = selectedLanguage.toLowerCase() === lang.toLowerCase();

              return (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                      : 'bg-surface-muted text-slate-300 hover:bg-surface-border hover:text-white border border-surface-border'
                  }`}
                >
                  <span>{lang}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-red-700 text-white'
                        : 'bg-surface-border text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid Results Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className="font-semibold text-white">
            {filteredChannels.length} {filteredChannels.length === 1 ? 'Channel' : 'Channels'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 font-medium">
            {liveInResults} Currently Live
          </span>
          {onlyLive && (
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30">
              Live Filter Active
            </span>
          )}
        </div>

        {(searchQuery || selectedLanguage !== 'All' || onlyLive) && (
          <button
            onClick={() => {
              onSearchChange('');
              setSelectedLanguage('All');
              setOnlyLive(false);
            }}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <FilterX className="h-3.5 w-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Channels Grid */}
      {filteredChannels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredChannels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onSelect={onSelectChannel}
            />
          ))}
        </div>
      ) : (
        /* Empty Results State */
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-surface-border bg-surface/30 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted text-slate-400 mb-3">
            <Radio className="h-7 w-7 text-slate-500" />
          </div>
          <h3 className="text-base font-semibold text-white">No channels found</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm">
            No TV channels match your current search &quot;{searchQuery}&quot; or language filter.
          </p>
          <button
            onClick={() => {
              onSearchChange('');
              setSelectedLanguage('All');
              setOnlyLive(false);
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-all shadow-md shadow-red-600/30"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

