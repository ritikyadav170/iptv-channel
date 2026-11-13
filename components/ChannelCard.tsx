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
      className={`group relative flex flex-col justify-between rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer select-none ${
        isCurrent
          ? 'border-amber-400/90 bg-slate-900/90 shadow-[0_0_25px_rgba(251,191,36,0.2)] ring-2 ring-amber-400/50 -translate-y-1'
          : isLive
          ? 'border-white/[0.08] bg-slate-900/50 hover:border-amber-400/60 hover:bg-slate-900/80 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1'
          : 'border-white/[0.04] bg-slate-950/40 opacity-60 hover:opacity-90 hover:border-white/[0.1]'
      }`}
    >
      {/* Top Media / Logo Area (16:9) */}
      <div className="relative aspect-video w-full bg-gradient-to-b from-slate-900/60 to-black/80 flex items-center justify-center p-4 overflow-hidden border-b border-white/[0.06]">
        {/* Channel Number Badge - Top Left */}
        <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 pointer-events-none">
          <div
            className={`flex items-center justify-center rounded-lg px-2 py-0.5 font-mono shadow-md ${
              isCurrent
                ? 'bg-amber-400 text-black font-black text-xs'
                : 'bg-black/80 border border-white/20 text-amber-400 font-bold text-xs'
            }`}
          >
            CH {chNum}
          </div>

          {/* Status Badge */}
          {isLive ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-black text-white shadow-md shadow-red-900/40">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/90 border border-white/10 px-2 py-0.5 text-[9px] font-semibold text-slate-400">
              <Clock className="h-2.5 w-2.5 text-amber-400" />
              Soon
            </span>
          )}
        </div>

        {/* Top Right: Language Chip */}
        <div className="absolute top-2.5 right-2.5 z-20 pointer-events-none">
          <span className="inline-flex items-center rounded-md bg-black/70 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-slate-300 backdrop-blur-md">
            {channel.language}
          </span>
        </div>

        {/* Channel Logo */}
        <div className="relative h-16 w-32 sm:h-20 sm:w-36 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
          <Image
            src={logoSrc}
            alt={`${channel.name} Logo`}
            fill
            sizes="160px"
            className="object-contain drop-shadow-md"
            onError={() => setImgError(true)}
            priority={isLive && Number(channel.chNumber || 0) <= 8}
          />
        </div>

        {/* Play Overlay (hover or current) */}
        <div
          className={`absolute inset-0 z-20 flex items-center justify-center bg-black/40 transition-opacity duration-200 ${
            isCurrent ? 'opacity-0 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400 text-black shadow-xl shadow-amber-400/50 transform group-hover:scale-110 transition-transform">
            <Play className="h-5 w-5 fill-black ml-0.5" />
          </div>
        </div>

        {/* Current Watching Ribbon */}
        {isCurrent && (
          <div className="absolute bottom-1.5 right-2 z-20">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-[10px] font-bold text-amber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
              PLAYING NOW
            </span>
          </div>
        )}
      </div>

      {/* Card Info Area */}
      <div className="p-3.5 flex flex-col justify-between flex-1 gap-2 bg-slate-900/30">
        <div>
          <h3 className="font-bold text-white text-sm tracking-tight truncate group-hover:text-amber-300 transition-colors">
            {channel.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
            <span className="text-slate-400 font-medium">{channel.category}</span>
            <span>•</span>
            <span className="text-slate-400 font-mono text-[10px] truncate">
              {channel.epgId}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold text-slate-400">
            {isCurrent ? 'Tuned In' : isLive ? 'Click to watch' : 'Offline'}
          </span>
          <span
            className={`text-xs font-bold transition-colors ${
              isCurrent
                ? 'text-amber-400 font-black'
                : isLive
                ? 'text-slate-300 group-hover:text-amber-400'
                : 'text-slate-400'
            }`}
          >
            {isCurrent ? 'ON AIR' : isLive ? 'Watch →' : 'Standby'}
          </span>
        </div>
      </div>
    </div>
  );
}
