'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Clock, Radio, Tv } from 'lucide-react';
import { Channel } from '@/types/channel';

interface ChannelCardProps {
  channel: Channel;
  onSelect?: (channel: Channel) => void;
  isCurrent?: boolean;
}

export default function ChannelCard({ channel, onSelect, isCurrent }: ChannelCardProps) {
  const isLive = Boolean(channel.hlsUrl && channel.hlsUrl.trim().length > 0);
  const [imgError, setImgError] = useState(false);

  const logoSrc = imgError || !channel.logo ? '/logos/placeholder.svg' : channel.logo;
  const chNum = String(channel.chNumber || 1).padStart(2, '0');

  const handleClick = () => {
    if (onSelect) {
      onSelect(channel);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
        isCurrent
          ? 'border-yellow-400 bg-surface shadow-xl shadow-yellow-400/10 ring-2 ring-yellow-400/40 -translate-y-1'
          : isLive
          ? 'border-surface-border bg-surface hover:border-yellow-400/60 hover:shadow-xl hover:shadow-yellow-400/10 hover:-translate-y-1'
          : 'border-surface-border/60 bg-surface/50 opacity-70 hover:opacity-100 hover:border-surface-border'
      }`}
    >
      {/* Top Banner / Logo Area */}
      <div className="relative aspect-video w-full bg-slate-900/80 flex items-center justify-center p-4 overflow-hidden border-b border-surface-border/50">
        {/* Channel Number Badge - Top Left */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
          <div
            className={`flex flex-col items-center justify-center rounded-xl px-2 py-0.5 font-mono shadow-md ${
              isCurrent
                ? 'bg-yellow-400 text-black font-black'
                : 'bg-black/80 border border-white/20 text-yellow-400 font-black'
            }`}
          >
            <span className="text-[8px] uppercase -mb-0.5 opacity-80 leading-tight">
              CH
            </span>
            <span className="text-sm leading-tight">{chNum}</span>
          </div>

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
        </div>

        {/* Top Right: Language Chip */}
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <span className="inline-flex items-center rounded-lg bg-black/70 border border-white/10 px-2 py-0.5 text-[10px] font-bold text-slate-300 backdrop-blur-md">
            {channel.language}
          </span>
        </div>

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

        {/* Play Overlay (appears on hover) */}
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400 text-black shadow-xl shadow-yellow-400/50 transform group-hover:scale-110 transition-transform">
            <Play className="h-6 w-6 fill-black ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Info Area */}
      <div className="p-4 flex flex-col justify-between flex-1 gap-2.5">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`font-black text-base tracking-tight truncate ${
                isCurrent
                  ? 'text-yellow-400'
                  : 'text-white group-hover:text-yellow-400 transition-colors'
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
              {isLive ? 'Live 24x7 Television Feed' : 'Stream joining lineup soon'}
            </span>
          </div>
        </div>

        {/* Bottom meta / action */}
        <div className="pt-2 border-t border-surface-border/60 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono text-[10px] text-slate-400 truncate max-w-[140px]">
            EPG: {channel.epgId}
          </span>
          <span
            className={`font-bold transition-transform group-hover:translate-x-0.5 ${
              isCurrent ? 'text-yellow-400' : 'text-slate-200 group-hover:text-yellow-400'
            }`}
          >
            {isCurrent ? '● Now Playing' : 'Watch Channel →'}
          </span>
        </div>
      </div>
    </div>
  );
}
