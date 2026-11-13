'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  X,
  Radio,
  ExternalLink,
  Copy,
  Check,
  Search,
  Tv,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { Channel } from '@/types/channel';
import VideoPlayer from '@/components/VideoPlayer';

interface PlayerModalProps {
  channel: Channel | null;
  channels: Channel[];
  onClose: () => void;
  onSelectChannel: (channel: Channel) => void;
}

export default function PlayerModal({
  channel,
  channels,
  onClose,
  onSelectChannel,
}: PlayerModalProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!channel) return null;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/watch/${channel.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Filter list for quick switcher
  const filteredChannels = channels.filter(
    (c) =>
      c.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      c.language.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-fade-in overflow-y-auto">
      {/* Modal Container */}
      <div className="relative flex flex-col lg:flex-row w-full max-w-7xl max-h-[92vh] rounded-3xl bg-surface border border-surface-border shadow-2xl overflow-hidden my-auto">
        {/* Close Button Mobile/Desktop */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-slate-300 hover:text-white hover:bg-black/80 transition-all border border-white/10"
          title="Close (Esc)"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left Column: Player + Channel Details */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto max-h-[92vh] space-y-4">
          {/* Video Player */}
          <VideoPlayer channel={channel} autoPlay={true} />

          {/* Channel Header & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3.5">
              <div className="relative h-12 w-20 rounded-xl bg-slate-900 border border-surface-border overflow-hidden shrink-0 flex items-center justify-center p-1">
                <Image
                  src={channel.logo || '/logos/placeholder.svg'}
                  alt={channel.name}
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {channel.name}
                  </h2>
                  <span className="flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                  <span className="text-slate-200 font-medium">{channel.language}</span>
                  <span>•</span>
                  <span>{channel.category}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-400">EPG: {channel.epgId}</span>
                </div>
              </div>
            </div>

            {/* Actions: Direct link & Copy */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-muted hover:bg-surface-border text-xs font-semibold text-slate-200 transition-colors border border-surface-border"
                title="Copy shareable link"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4 text-slate-400" />
                    <span>Share</span>
                  </>
                )}
              </button>

              <Link
                href={`/watch/${channel.id}`}
                target="_blank"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-xs font-semibold text-white shadow-md shadow-red-600/20 transition-all"
                title="Open dedicated player page"
              >
                <span>Full Page</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* EPG Now Playing info box */}
          <div className="rounded-2xl border border-surface-border bg-surface-muted/60 p-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-red-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Now Broadcasting
              </span>
              <span className="text-slate-400 font-mono text-[11px]">24x7 Continuous Feed</span>
            </div>
            <p className="text-sm font-medium text-slate-200">
              Live National & Regional Television Coverage • Direct Stream
            </p>
            <p className="mt-1 text-xs text-slate-400">
              EPG Identifier: <code className="bg-black/30 px-1.5 py-0.5 rounded text-slate-300 font-mono">{channel.epgId}</code> (XMLTV feed ready)
            </p>
          </div>
        </div>

        {/* Right Column: Quick Channel Switching Drawer */}
        <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-surface-border bg-surface-muted/40 p-4 flex flex-col max-h-[45vh] lg:max-h-[92vh]">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Tv className="h-3.5 w-3.5 text-red-400" />
                Quick Channel Switch
              </h3>
              <span className="text-[11px] text-slate-400">
                {filteredChannels.length} Channels
              </span>
            </div>

            {/* Quick search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter channels..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full rounded-xl bg-surface border border-surface-border pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Channel list */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
            {filteredChannels.map((c) => {
              const isCurrent = c.id === channel.id;
              const isLive = Boolean(c.hlsUrl && c.hlsUrl.trim().length > 0);

              return (
                <button
                  key={c.id}
                  disabled={!isLive}
                  onClick={() => {
                    if (isLive && !isCurrent) {
                      onSelectChannel(c);
                    }
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                    isCurrent
                      ? 'bg-red-600/20 border border-red-500/50 text-white shadow-sm'
                      : isLive
                      ? 'bg-surface/60 hover:bg-surface border border-transparent hover:border-surface-border text-slate-200'
                      : 'bg-surface/30 opacity-50 cursor-not-allowed border border-transparent text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`h-2 w-2 rounded-full shrink-0 ${
                        isCurrent
                          ? 'bg-red-500 animate-pulse'
                          : isLive
                          ? 'bg-emerald-500'
                          : 'bg-slate-600'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate leading-tight">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {c.language} • {isLive ? 'Live' : 'Coming Soon'}
                      </p>
                    </div>
                  </div>

                  {isCurrent ? (
                    <span className="text-[10px] font-bold text-red-400 px-1.5 py-0.5 rounded bg-red-500/20">
                      PLAYING
                    </span>
                  ) : isLive ? (
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  ) : (
                    <span className="text-[9px] text-slate-400 px-1 py-0.5 rounded bg-surface">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

