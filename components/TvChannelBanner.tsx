'use client';

import React from 'react';
import Image from 'next/image';
import { Radio, Tv } from 'lucide-react';
import { Channel } from '@/types/channel';

interface TvChannelBannerProps {
  channel: Channel;
  visible: boolean;
}

export default function TvChannelBanner({ channel, visible }: TvChannelBannerProps) {
  if (!visible) return null;

  const chNumberFormatted = String(channel.chNumber || 1).padStart(2, '0');
  const isLive = Boolean(channel.hlsUrl && channel.hlsUrl.trim().length > 0);

  return (
    <div className="absolute top-4 left-4 right-4 sm:left-6 sm:right-auto z-40 pointer-events-none animate-fade-in transition-all duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-black/85 border border-white/20 p-3 sm:p-4 shadow-2xl backdrop-blur-2xl max-w-md ring-1 ring-white/10">
        <div className="flex items-center gap-3.5">
          {/* Channel Number Box (Like real TV OSD) */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 px-3 py-1.5 shadow-md shadow-amber-500/20 shrink-0">
            <span className="text-[9px] font-black uppercase tracking-wider text-black/80 -mb-0.5">
              CH
            </span>
            <span className="text-xl sm:text-2xl font-black text-black font-mono leading-tight">
              {chNumberFormatted}
            </span>
          </div>

          {/* Channel Logo */}
          <div className="relative h-11 w-16 sm:h-12 sm:w-20 rounded-lg bg-slate-900/90 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center p-1">
            <Image
              src={channel.logo || '/logos/placeholder.svg'}
              alt={channel.name}
              fill
              sizes="80px"
              className="object-contain"
            />
          </div>

          {/* Channel Name & Meta */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                {channel.name}
              </h2>
              {isLive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black text-white shadow-sm shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
              ) : (
                <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 shrink-0">
                  COMING SOON
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-300">
              <span className="font-semibold text-amber-300">{channel.language}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 truncate">{channel.category}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 font-mono text-[10px] truncate">
                {channel.epgId}
              </span>
            </div>
          </div>
        </div>

        {/* Animated Countdown Timer Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div className="h-full bg-gradient-to-r from-amber-400 to-red-500 animate-osd-progress" />
        </div>
      </div>
    </div>
  );
}
