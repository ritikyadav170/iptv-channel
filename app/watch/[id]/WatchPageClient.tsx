'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Radio,
  Tv,
  Share2,
  Check,
  ChevronRight,
  Search,
  ShieldCheck,
  VolumeX,
} from 'lucide-react';
import { Channel } from '@/types/channel';
import VideoPlayer from '@/components/VideoPlayer';
import TvRemoteBar from '@/components/TvRemoteBar';
import TvChannelBanner from '@/components/TvChannelBanner';
import TvNumpadModal from '@/components/TvNumpadModal';
import TvGuideOverlay from '@/components/TvGuideOverlay';

interface WatchPageClientProps {
  initialChannel: Channel;
  allChannels: Channel[];
}

export default function WatchPageClient({
  initialChannel,
  allChannels,
}: WatchPageClientProps) {
  const [currentChannel, setCurrentChannel] = useState<Channel>(initialChannel);
  const [lastChannel, setLastChannel] = useState<Channel | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [copied, setCopied] = useState(false);
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const bannerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modals state
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isNumpadOpen, setIsNumpadOpen] = useState(false);

  // Volume state
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Swipe gesture tracking
  const touchStartYRef = useRef<number | null>(null);

  const triggerBanner = useCallback(() => {
    setShowBanner(true);
    if (bannerTimerRef.current) {
      clearTimeout(bannerTimerRef.current);
    }
    bannerTimerRef.current = setTimeout(() => {
      setShowBanner(false);
    }, 2800);
  }, []);

  useEffect(() => {
    triggerBanner();
  }, [triggerBanner]);

  const tuneChannel = useCallback(
    (newChannel: Channel) => {
      if (newChannel.id === currentChannel.id) return;
      setLastChannel(currentChannel);
      setCurrentChannel(newChannel);
      triggerBanner();
      try {
        localStorage.setItem('tv_last_channel_id', newChannel.id);
        window.history.replaceState(null, '', `/watch/${newChannel.id}`);
      } catch {
        // Ignore
      }
    },
    [currentChannel, triggerBanner]
  );

  const handleChannelUp = useCallback(() => {
    const currentIndex = allChannels.findIndex((c) => c.id === currentChannel.id);
    const nextIndex = (currentIndex + 1) % allChannels.length;
    tuneChannel(allChannels[nextIndex]);
  }, [allChannels, currentChannel.id, tuneChannel]);

  const handleChannelDown = useCallback(() => {
    const currentIndex = allChannels.findIndex((c) => c.id === currentChannel.id);
    const prevIndex = (currentIndex - 1 + allChannels.length) % allChannels.length;
    tuneChannel(allChannels[prevIndex]);
  }, [allChannels, currentChannel.id, tuneChannel]);

  const handleRecall = useCallback(() => {
    if (lastChannel) {
      tuneChannel(lastChannel);
    }
  }, [lastChannel, tuneChannel]);

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

  // Keyboard navigation
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

  const handleCopy = () => {
    const url = `${window.location.origin}/watch/${currentChannel.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const filteredChannels = allChannels.filter(
    (c) =>
      c.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.language.toLowerCase().includes(searchFilter.toLowerCase()) ||
      String(c.chNumber).includes(searchFilter)
  );

  return (
    <div className="pb-28 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main TV Player Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black">
            <TvChannelBanner channel={currentChannel} visible={showBanner} />

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

          {/* Channel Details Header */}
          <div className="rounded-3xl bg-surface border border-surface-border p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center rounded-2xl bg-yellow-400 px-3 py-1.5 text-black font-mono font-black text-xl leading-none shrink-0 shadow-md">
                  <span className="text-[9px] uppercase tracking-wider">CH</span>
                  <span>{String(currentChannel.chNumber || 1).padStart(2, '0')}</span>
                </div>

                <div className="relative h-14 w-20 rounded-xl bg-slate-900 border border-surface-border overflow-hidden shrink-0 flex items-center justify-center p-1">
                  <Image
                    src={currentChannel.logo || '/logos/placeholder.svg'}
                    alt={currentChannel.name}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {currentChannel.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm shadow-red-600/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      LIVE
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span className="text-amber-400 font-bold">{currentChannel.language}</span>
                    <span>•</span>
                    <span>{currentChannel.category}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">EPG: {currentChannel.epgId}</span>
                  </div>
                </div>
              </div>

              {/* Share action */}
              <button
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-muted hover:bg-surface-border text-xs font-bold text-slate-200 border border-surface-border transition-colors self-start sm:self-auto min-h-[44px]"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 text-slate-400" />
                    <span>Share Channel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Side Column: Quick Channel List */}
        <div className="rounded-3xl bg-surface border border-surface-border p-4 flex flex-col max-h-[750px]">
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
                <Tv className="h-4 w-4 text-yellow-400" />
                Cable Channel Lineup
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                {filteredChannels.length} Channels
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter channels or number..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full rounded-xl bg-surface-muted border border-surface-border pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredChannels.map((c) => {
              const isCurrent = c.id === currentChannel.id;
              const isLive = Boolean(c.hlsUrl && c.hlsUrl.trim().length > 0);
              const chNum = String(c.chNumber || 1).padStart(2, '0');

              return (
                <button
                  key={c.id}
                  onClick={() => tuneChannel(c)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all min-h-[52px] ${
                    isCurrent
                      ? 'bg-yellow-400/15 border border-yellow-400/60 text-white shadow-sm'
                      : isLive
                      ? 'bg-surface-muted/60 hover:bg-surface-muted border border-transparent hover:border-yellow-400/30 text-slate-200'
                      : 'bg-surface-muted/30 opacity-50 cursor-pointer border border-transparent text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`px-1.5 py-0.5 rounded-md font-mono text-xs font-black shrink-0 ${
                        isCurrent
                          ? 'bg-yellow-400 text-black'
                          : 'bg-surface text-slate-300 border border-surface-border'
                      }`}
                    >
                      {chNum}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate leading-tight">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {c.language} • {isLive ? 'Live' : 'Coming Soon'}
                      </p>
                    </div>
                  </div>

                  {isCurrent ? (
                    <span className="text-[10px] font-black text-yellow-400 px-2 py-0.5 rounded-full bg-yellow-400/20">
                      ON AIR
                    </span>
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Persistent Remote Control Bar */}
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

      {/* Numeric Numpad Modal */}
      <TvNumpadModal
        isOpen={isNumpadOpen}
        onClose={() => setIsNumpadOpen(false)}
        channels={allChannels}
        onSelectChannel={tuneChannel}
      />

      {/* TV Guide Overlay */}
      <TvGuideOverlay
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        channels={allChannels}
        currentChannel={currentChannel}
        onSelectChannel={tuneChannel}
      />
    </div>
  );
}
