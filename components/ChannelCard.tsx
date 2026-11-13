'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Clock, Radio, Tv } from 'lucide-react';
import { Channel } from '@/types/channel';

interface ChannelCardProps {
  channel: Channel;
  onSelect?: (channel: Channel) => void;
}

export default function ChannelCard({ channel, onSelect }: ChannelCardProps) {
  const isLive = Boolean(channel.hlsUrl && channel.hlsUrl.trim().length > 0);
  const [imgError, setImgError] = useState(false);

  // Derive initial logo or fallback
  const logoSrc = imgError || !channel.logo ? '/logos/placeholder.svg' : channel.logo;

  const handleClick = () => {
    if (isLive && onSelect) {
      onSelect(channel);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden ${
        isLive
          ? 'cursor-pointer border-surface-border bg-surface hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1'
          : 'cursor-not-allowed border-surface-border/60 bg-surface/50 opacity-70'
      }`}
    >
      {/* Top Banner / Logo Area */}
      <div className="relative aspect-video w-full bg-slate-900/80 flex items-center justify-center p-4 overflow-hidden border-b border-surface-border/50">
        {/* Ambient gradient glow on active cards */}
        {isLive && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
        )}

        {/* Channel Logo */}
        <div className="relative h-20 w-36 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <Image
            src={logoSrc}
            alt={`${channel.name} Logo`}
            fill
            sizes="150px"
            className="object-contain drop-shadow-md"
            onError={() => setImgError(true)}
            priority={isLive}
          />
        </div>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
          {/* Status Badge */}
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/95 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-md shadow-red-900/50 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted/90 border border-surface-border px-2 py-0.5 text-[10px] font-medium text-slate-400">
              <Clock className="h-3 w-3 text-amber-400/80" />
              Coming Soon
            </span>
          )}

          {/* Language Chip */}
          <span className="inline-flex items-center rounded-lg bg-black/60 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-slate-300 backdrop-blur-md">
            {channel.language}
          </span>
        </div>

        {/* Play Overlay (appears on hover for live channels) */}
        {isLive && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-600/50 transform group-hover:scale-110 transition-transform">
              <Play className="h-6 w-6 fill-white ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Card Info Area */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-2.5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`font-semibold text-base tracking-tight truncate ${
                isLive ? 'text-white group-hover:text-red-400 transition-colors' : 'text-slate-300'
              }`}
              title={channel.name}
            >
              {channel.name}
            </h3>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-muted text-slate-400">
              {channel.category}
            </span>
          </div>

          {/* EPG / Program Slot */}
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <Radio className="h-3 w-3 text-slate-500 shrink-0" />
            <span className="truncate">
              {isLive ? 'Live 24x7 News Broadcast' : 'Stream joining lineup soon'}
            </span>
          </div>
        </div>

        {/* Bottom meta / action */}
        <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
            EPG: {channel.epgId}
          </span>
          {isLive ? (
            <span className="text-red-400 font-semibold group-hover:translate-x-0.5 transition-transform">
              Watch Stream &rarr;
            </span>
          ) : (
            <span className="text-slate-400">Not Clickable</span>
          )}
        </div>
      </div>
    </div>
  );
}

