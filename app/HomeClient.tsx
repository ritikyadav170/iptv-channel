'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Channel, Category } from '@/types/channel';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import TvRemoteBar from '@/components/TvRemoteBar';
import TvChannelBanner from '@/components/TvChannelBanner';
import TvNumpadModal from '@/components/TvNumpadModal';
import TvGuideOverlay from '@/components/TvGuideOverlay';
import ChannelGrid from '@/components/ChannelGrid';
import { VolumeX, Volume2, Tv, Sparkles, Radio } from 'lucide-react';

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

  // Search & Categories for below grid
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('news');

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
    // Show banner on initial TV turn on
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

  // Channel Up (Next channel)
  const handleChannelUp = useCallback(() => {
    const currentIndex = channels.findIndex((c) => c.id === currentChannel.id);
    const nextIndex = (currentIndex + 1) % channels.length;
    tuneChannel(channels[nextIndex]);
  }, [channels, currentChannel.id, tuneChannel]);

  // Channel Down (Previous channel)
  const handleChannelDown = useCallback(() => {
    const currentIndex = channels.findIndex((c) => c.id === currentChannel.id);
    const prevIndex = (currentIndex - 1 + channels.length) % channels.length;
    tuneChannel(channels[prevIndex]);
  }, [channels, currentChannel.id, tuneChannel]);

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
      // Swiped Up -> Next channel
      handleChannelUp();
    } else if (deltaY < -50) {
      // Swiped Down -> Previous channel
      handleChannelDown();
    }
  };

  // Keyboard Navigation for Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If user is focused on an input element, do not hijack
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
        // Direct number key opened numpad
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
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-28">
      {/* Top Navigation */}
      <Navbar
        categories={categories}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        liveCount={liveChannels.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-8">
        {/* TV Stage: Video Player + Channel OSD Banner */}
        <section className="relative w-full max-w-5xl mx-auto space-y-3">
          {/* TV Screen Container with Swipe Handlers */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black">
            {/* OSD Channel Banner (slides in on channel change) */}
            <TvChannelBanner channel={currentChannel} visible={showBanner} />

            {/* Video Player */}
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

          {/* Quick TV Info & Unmute Indicator */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-bold text-white bg-surface-muted border border-surface-border px-3 py-1.5 rounded-xl font-mono text-xs">
                <Tv className="h-4 w-4 text-yellow-400" />
                CH {String(currentChannel.chNumber || 1).padStart(2, '0')} • {currentChannel.name}
              </span>
              <span className="hidden sm:inline text-slate-400">
                Tip: Use <b>Arrow Up/Down</b> or <b>Remote</b> to switch channels
              </span>
            </div>

            {/* If muted, show big 1-click unmute pill */}
            {isMuted && (
              <button
                onClick={handleToggleMute}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 animate-pulse transition-all min-h-[36px]"
              >
                <VolumeX className="h-4 w-4" />
                <span>SOUND MUTED — CLICK FOR AUDIO</span>
              </button>
            )}
          </div>
        </section>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-surface-border pb-4 pt-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                All Cable News Channels
              </h2>
              <span className="rounded-full bg-yellow-400/20 text-yellow-400 px-2.5 py-0.5 text-[11px] font-black border border-yellow-400/30">
                TV LINEUP
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Click any channel card to tune in instantly. Use the on-screen remote or keyboard to flip channels.
            </p>
          </div>

          <div className="text-xs text-slate-400 font-medium font-mono">
            <span className="text-white font-bold">{channels.length}</span> Total Channels Listed
          </div>
        </div>

        {/* Channel Grid with Search & Language Filters */}
        <ChannelGrid
          channels={channels}
          currentChannelId={currentChannel.id}
          onSelectChannel={tuneChannel}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </main>

      {/* Persistent On-Screen Cable TV Remote Control Bar */}
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

      {/* Direct Numeric Keypad Jump Modal */}
      <TvNumpadModal
        isOpen={isNumpadOpen}
        onClose={() => setIsNumpadOpen(false)}
        channels={channels}
        onSelectChannel={tuneChannel}
      />

      {/* TV Guide (EPG Grid) Overlay */}
      <TvGuideOverlay
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        channels={channels}
        currentChannel={currentChannel}
        onSelectChannel={tuneChannel}
      />

      {/* Footer */}
      <footer className="border-t border-surface-border bg-surface/30 py-6 px-4 text-center text-xs text-slate-400 space-y-1">
        <p className="font-bold text-slate-300">
          StreamPulse Live TV &copy; {new Date().getFullYear()} • Zero Learning Curve Cable TV Experience
        </p>
        <p className="text-[11px] text-slate-400">
          Use on-screen remote buttons, swipe gestures on mobile, or arrow keys on desktop to flip channels.
        </p>
      </footer>
    </div>
  );
}
