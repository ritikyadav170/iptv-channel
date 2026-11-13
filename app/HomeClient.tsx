'use client';

import React, { useState } from 'react';
import { Channel, Category } from '@/types/channel';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import HeroBanner from '@/components/HeroBanner';
import ChannelGrid from '@/components/ChannelGrid';
import PlayerModal from '@/components/PlayerModal';

interface HomeClientProps {
  channels: Channel[];
  categories: Category[];
}

export default function HomeClient({ channels, categories }: HomeClientProps) {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('news');

  const liveChannels = channels.filter(
    (c) => c.hlsUrl && c.hlsUrl.trim().length > 0
  );

  // Pick first active live channel as featured
  const featuredChannel = liveChannels[0] || channels[0];

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  const handleCloseModal = () => {
    setSelectedChannel(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <Navbar
        categories={categories}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        liveCount={liveChannels.length}
      />

      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <Sidebar
          categories={categories}
          activeCategory={activeCategory}
          totalChannels={channels.length}
          liveCount={liveChannels.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 overflow-x-hidden">
          {/* Featured Hero Banner (hidden when user is searching to keep view focused) */}
          {!searchQuery && (
            <HeroBanner
              featuredChannel={featuredChannel}
              onWatch={handleSelectChannel}
              liveCount={liveChannels.length}
            />
          )}

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-surface-border pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Live News Channels
                </h2>
                <span className="flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  ACTIVE
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Browse Indian national & regional news broadcasts in 8 regional languages.
              </p>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              <span className="text-white font-semibold">{channels.length}</span> Total channels cataloged
            </div>
          </div>

          {/* Channel Grid with Search & Filters */}
          <ChannelGrid
            channels={channels}
            onSelectChannel={handleSelectChannel}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </main>
      </div>

      {/* In-Page Quick Player Modal */}
      {selectedChannel && (
        <PlayerModal
          channel={selectedChannel}
          channels={channels}
          onClose={handleCloseModal}
          onSelectChannel={handleSelectChannel}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-surface-border bg-surface/40 py-8 px-4 text-center text-xs text-slate-400 space-y-2">
        <p className="font-medium text-slate-300">
          StreamPulse Live TV &copy; {new Date().getFullYear()} • 24/7 Live Broadcast Network
        </p>
        <p className="max-w-xl mx-auto text-[11px] text-slate-400">
          All streams are proxied via server-side HLS rewrites for HTTPS & CORS compliance. Channel metadata, EPG IDs, and logos are configurable via <code className="text-slate-300">data/channels.json</code> without code modifications.
        </p>
      </footer>
    </div>
  );
}

