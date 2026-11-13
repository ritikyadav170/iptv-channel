'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Channel, Category } from '@/types/channel';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import TvRemoteBar from '@/components/TvRemoteBar';
import TvChannelBanner from '@/components/TvChannelBanner';
import TvNumpadModal from '@/components/TvNumpadModal';
import TvGuideOverlay from '@/components/TvGuideOverlay';
import QuickChannelStrip from '@/components/QuickChannelStrip';
import ChannelGrid from '@/components/ChannelGrid';
import { VolumeX, Volume2, Tv, Sparkles, Radio, HelpCircle } from 'lucide-react';

interface HomeClientProps {
  channels: Channel[];
  categories: Category[];
}

const LOCAL_STORAGE_LAST_CH_KEY = 'tv_last_channel_id';

export default function HomeClient({ channels, categories }: HomeClientProps) {
  // Find initial channel: prioritize localStorage or first live channel
  const [currentChannel, setCurrentChannel] = useState<Channel>(() => {
    return channels[0];
  });

  const [lastChannel, setLastChannel] = useState<Channel | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const bannerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals state
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isNumpadOpen, setIsNumpadOpen] = useState<boolean>(false);

  // Volume & Mute state
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Search & Categories
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Swipe gesture tracking
  const touchStartYRef = useRef<number | null>(null);

  // Load last watched channel from localStorage on mount
  useEffect(() => {
    try {
      const savedId = localStorage.getItem(LOCAL_STORAGE_LAST_CH_KEY);
      if (savedId) {
        const found = channels.find((c) => c.id === savedId);
        if (found) {
          setCurrentChannel(found);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    triggerBanner();
  }, [channels]);

  // Trigger temporary On-Screen Display (OSD) banner
  const triggerBanner = useCallback(() => {
    setShowBanner(true);
    if (bannerTimerRef.current) {
      clearTimeout(bannerTimerRef.current);
    }
    bannerTimerRef.current = setTimeout(() => {
      setShowBanner(false);
    }, 2800);
  }, []);

  // Tune to a new channel
  const tuneChannel = useCallback(
    (newChannel: Channel) => {
      if (newChannel.id === currentChannel.id) return;
      setLastChannel(currentChannel);
      setCurrentChannel(newChannel);
      triggerBanner();

      try {
        localStorage.setItem(LOCAL_STORAGE_LAST_CH_KEY, newChannel.id);
      } catch {
        // Ignore localStorage error
      }
    },
    [currentChannel, triggerBanner]
  );

  // Compute Prev and Next channel relative to current
  const { prevChannel, nextChannel } = useMemo(() => {
    const currentIndex = channels.findIndex((c) => c.id === currentChannel.id);
    const prevIndex = (currentIndex - 1 + channels.length) % channels.length;
    const nextIndex = (currentIndex + 1) % channels.length;
    return {
      prevChannel: channels[prevIndex],
      nextChannel: channels[nextIndex],
    };
  }, [channels, currentChannel.id]);

  // Channel Up (Next channel)
  const handleChannelUp = useCallback(() => {
    if (nextChannel) {
      tuneChannel(nextChannel);
    }
  }, [nextChannel, tuneChannel]);

  // Channel Down (Previous channel)
  const handleChannelDown = useCallback(() => {
    if (prevChannel) {
      tuneChannel(prevChannel);
    }
  }, [prevChannel, tuneChannel]);

  // Recall (Last Channel / Back)
  const handleRecall = useCallback(() => {
    if (lastChannel) {
      tuneChannel(lastChannel);
    }
  }, [lastChannel, tuneChannel]);

  // Volume Handlers
  const handleVolumeUp = useCallback(() => {
    setIsMuted(false);
    setVolume((prev) => Math.min(1, Math.round((prev + 0.1) * 10) / 10));
  }, []);

  const handleVolumeDown = useCallback(() => {
    setVolume((prev) => Math.max(0, Math.round((prev - 0.1) * 10) / 10));
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  // Mobile Touch Swipe Handlers (Swipe Up/Down to change channels like TV)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartYRef.current - touchEndY;
    touchStartYRef.current = null;

    if (deltaY > 50) {
      handleChannelUp();
    } else if (deltaY < -50) {
      handleChannelDown();
    }
  };

  // Keyboard Navigation for Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handleChannelUp();
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        handleChannelDown();
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setIsGuideOpen((prev) => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.key === 'Backquote' || e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        handleRecall();
      } else if (e.key >= '0' && e.key <= '9') {
        setIsNumpadOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleChannelUp, handleChannelDown, handleToggleMute, handleRecall]);

  const liveChannels = channels.filter(
    (c) => c.hlsUrl && c.hlsUrl.trim().length > 0
  );

  return (
    <div className="min-h-screen bg-[#06080d] text-foreground flex flex-col pb-32">
      {/* Module 1: Top Navigation Bar */}
      <Navbar
        categories={categories}
        activeCategory={selectedCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        liveCount={liveChannels.length}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenNumpad={() => setIsNumpadOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-8">
        {/* Module 2: Cinema Live TV Stage (The Screen) */}
        <section className="relative w-full max-w-5xl mx-auto space-y-3">
          {/* Ambient Glow behind player */}
          <div className="tv-ambient-glow" />

          {/* TV Screen Container with Swipe Handlers */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10 ring-1 ring-white/5">
            {/* OSD Channel Banner (slides in on channel change) */}
            <TvChannelBanner channel={currentChannel} visible={showBanner} />

            {/* Video Player Component */}
            <VideoPlayer
              channel={currentChannel}
              autoPlay={true}
              volume={volume}
              isMuted={isMuted}
              onVolumeChange={setVolume}
              onMuteChange={setIsMuted}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            />
          </div>

          {/* Module 3: Quick Channel Strip (Prev / Now Playing / Next) */}
          <QuickChannelStrip
            currentChannel={currentChannel}
            prevChannel={prevChannel}
            nextChannel={nextChannel}
            onPrev={handleChannelDown}
            onNext={handleChannelUp}
            onOpenGuide={() => setIsGuideOpen(true)}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />

          {/* Quick TV Tip & Shortcuts Bar */}
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 font-medium">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-white font-mono text-[10px]">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-white font-mono text-[10px]">↓</kbd>
                <span>Switch Channel</span>
              </span>
              <span className="hidden md:inline text-white/20">•</span>
              <span className="hidden md:inline-flex items-center gap-1.5 font-medium">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-white font-mono text-[10px]">0-9</kbd>
                <span>Jump CH</span>
              </span>
              <span className="hidden md:inline text-white/20">•</span>
              <span className="hidden md:inline-flex items-center gap-1.5 font-medium">
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-white font-mono text-[10px]">G</kbd>
                <span>TV Guide</span>
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              <span className="text-white font-bold">{channels.length}</span> Total Channels Lineup
            </div>
          </div>
        </section>

        {/* Module 4: Section Header & Channel Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Television Lineup
                </h2>
                <span className="rounded-full bg-amber-400/15 text-amber-300 px-2.5 py-0.5 text-[10px] font-black border border-amber-400/30 uppercase tracking-widest">
                  ALL CHANNELS
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-400">
                Click any channel to tune in immediately. Use the on-screen remote or keyboard to flip channels effortlessly.
              </p>
            </div>
          </div>

          {/* Modular Channel Grid Component */}
          <ChannelGrid
            channels={channels}
            currentChannelId={currentChannel.id}
            onSelectChannel={tuneChannel}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>
      </main>

      {/* Module 5: Persistent Floating Cable TV Remote Dock */}
      <TvRemoteBar
        currentChannel={currentChannel}
        onChannelUp={handleChannelUp}
        onChannelDown={handleChannelDown}
        onRecall={handleRecall}
        hasLastChannel={Boolean(lastChannel)}
        lastChannelName={lastChannel?.name}
        onOpenNumpad={() => setIsNumpadOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        volume={volume}
        isMuted={isMuted}
        onVolumeUp={handleVolumeUp}
        onVolumeDown={handleVolumeDown}
        onToggleMute={handleToggleMute}
      />

      {/* Module 6: Direct Numeric Keypad Jump Modal */}
      <TvNumpadModal
        isOpen={isNumpadOpen}
        onClose={() => setIsNumpadOpen(false)}
        channels={channels}
        onSelectChannel={tuneChannel}
      />

      {/* Module 7: TV Guide (EPG Grid) Overlay */}
      <TvGuideOverlay
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        channels={channels}
        currentChannel={currentChannel}
        onSelectChannel={tuneChannel}
      />

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-black/40 py-8 px-4 text-center text-xs text-slate-400 space-y-2">
        <p className="font-bold text-slate-300">
          Dekho TV &copy; {new Date().getFullYear()} • Zero Learning Curve Cable TV Experience
        </p>
        <p className="text-[11px] text-slate-400 max-w-xl mx-auto">
          Built with Next.js, Tailwind CSS, and HLS.js. Designed for effortless cable TV style viewing across Smart TVs, tablets, desktops, and mobile devices.
        </p>
      </footer>
    </div>
  );
}
