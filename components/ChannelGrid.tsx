'use client';

import React, { useState, useMemo } from 'react';
import { Search, Radio, SlidersHorizontal, FilterX, Tv, Sparkles } from 'lucide-react';
import { Channel } from '@/types/channel';
import { PREFERRED_LANGUAGES } from '@/lib/constants';
import ChannelCard from '@/components/ChannelCard';

interface ChannelGridProps {
  channels: Channel[];
  currentChannelId?: string;
  onSelectChannel: (channel: Channel) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
}

export default function ChannelGrid({
  channels,
  currentChannelId,
  onSelectChannel,
  searchQuery,
  onSearchChange,
  selectedCategory = 'all',
  onSelectCategory,
}: ChannelGridProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [onlyLive, setOnlyLive] = useState<boolean>(false);
  const [localCategory, setLocalCategory] = useState<string>(selectedCategory);

  const activeCategory = onSelectCategory ? selectedCategory : localCategory;
  const setCategory = onSelectCategory || setLocalCategory;

  // Extract available categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    channels.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ['All', ...Array.from(set)];
  }, [channels]);

  // Compute language channel counts
  const languageCounts = useMemo(() => {
    const counts: Record<string, number> = { All: channels.length };
    PREFERRED_LANGUAGES.forEach((lang) => {
      counts[lang] = channels.filter(
        (c) => c.language.toLowerCase() === lang.toLowerCase()
      ).length;
    });
    return counts;
  }, [channels]);

  // Filter channels
  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        channel.name.toLowerCase().includes(q) ||
        channel.language.toLowerCase().includes(q) ||
        String(channel.chNumber).includes(q) ||
        channel.epgId.toLowerCase().includes(q);

      const matchesCategory =
        activeCategory.toLowerCase() === 'all' ||
        channel.category.toLowerCase() === activeCategory.toLowerCase();

      const matchesLanguage =
        selectedLanguage === 'All' ||
        channel.language.toLowerCase() === selectedLanguage.toLowerCase();

      const isLive = Boolean(channel.hlsUrl && channel.hlsUrl.trim().length > 0);
      const matchesLive = !onlyLive || isLive;

      return matchesSearch && matchesCategory && matchesLanguage && matchesLive;
    });
  }, [channels, searchQuery, activeCategory, selectedLanguage, onlyLive]);

  const liveInResults = filteredChannels.filter(
    (c) => c.hlsUrl && c.hlsUrl.trim().length > 0
  ).length;

  const handleResetFilters = () => {
    onSearchChange('');
    setSelectedLanguage('All');
    setCategory('all');
    setOnlyLive(false);
  };

  return (
    <div className="space-y-6">
      {/* Modular Filter Container */}
      <div className="space-y-4 rounded-3xl bg-slate-900/60 p-4 sm:p-5 border border-white/[0.08] backdrop-blur-xl shadow-xl">
        {/* Row 1: Search & Live Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or channel number (e.g. 01, Aaj Tak, Kids)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-2xl bg-white/[0.04] border border-white/[0.08] pl-10 pr-10 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400/80 focus:bg-white/[0.06] transition-all"
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
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border min-h-[44px] shrink-0 ${
              onlyLive
                ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-600/30'
                : 'bg-white/[0.03] text-slate-300 border-white/[0.08] hover:bg-white/[0.08] hover:text-white'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                onlyLive ? 'bg-white animate-pulse' : 'bg-red-500'
              }`}
            />
            <span>{onlyLive ? 'Showing Live Only' : 'Filter: Live Only'}</span>
          </button>
        </div>

        {/* Row 2: Category Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
            Category:
          </span>
          {categoriesList.map((cat) => {
            const isCatActive = activeCategory.toLowerCase() === cat.toLowerCase();
            const count =
              cat === 'All'
                ? channels.length
                : channels.filter((c) => c.category.toLowerCase() === cat.toLowerCase()).length;

            return (
              <button
                key={cat}
                onClick={() => setCategory(cat.toLowerCase())}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isCatActive
                    ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/25'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06]'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isCatActive ? 'bg-white/20 text-white' : 'bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Language Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-white/[0.04]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
            Language:
          </span>
          {['All', ...PREFERRED_LANGUAGES].map((lang) => {
            const count = languageCounts[lang] || 0;
            if (lang !== 'All' && count === 0) return null;
            const isSelected = selectedLanguage.toLowerCase() === lang.toLowerCase();

            return (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06]'
                }`}
              >
                <span>{lang}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-white/[0.06] text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>
            Showing <strong className="text-white">{filteredChannels.length}</strong> of{' '}
            <strong className="text-white">{channels.length}</strong> channels
          </span>
          <span className="text-white/20">•</span>
          <span className="text-emerald-400 font-semibold">{liveInResults} Currently Live</span>
        </div>

        {(searchQuery || selectedLanguage !== 'All' || activeCategory !== 'all' || onlyLive) && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <FilterX className="h-3.5 w-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

      {/* Grid Content */}
      {filteredChannels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredChannels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onSelect={onSelectChannel}
              isCurrent={channel.id === currentChannelId}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-slate-900/40 border border-white/[0.08] space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/[0.04] text-slate-400">
            <FilterX className="h-8 w-8 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No channels found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No TV channels match your current search and language filters. Try adjusting your search query or reset filters.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors shadow-lg shadow-amber-400/20"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
