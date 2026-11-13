'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Radio, Sparkles, Shield, Zap } from 'lucide-react';
import { Channel } from '@/types/channel';

interface HeroBannerProps {
  featuredChannel?: Channel;
  onWatch: (channel: Channel) => void;
  liveCount: number;
}

export default function HeroBanner({
  featuredChannel,
  onWatch,
  liveCount,
}: HeroBannerProps) {
  if (!featuredChannel) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-surface-border bg-gradient-to-r from-surface via-surface/90 to-surface-muted p-6 sm:p-8 lg:p-10 shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-4">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-bold text-white shadow-md shadow-red-600/30">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              FEATURED BROADCAST
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-border px-2.5 py-1 text-xs font-medium text-slate-300">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Ultra Low-Latency HLS
            </span>
            <span className="inline-flex items-center rounded-full bg-black/40 border border-white/10 px-2.5 py-1 text-xs font-medium text-slate-300">
              {featuredChannel.language}
            </span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {featuredChannel.name}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              Watch 24/7 continuous live television news stream with zero buffering, native quality selection, and server-side HTTPS proxying.
            </p>
          </div>

          {/* Action Button & Meta */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              onClick={() => onWatch(featuredChannel)}
              className="inline-flex items-center gap-2.5 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-red-600/40 hover:bg-red-500 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Watch Live Stream Now</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Radio className="h-4 w-4 text-emerald-400" />
              <span>{liveCount} channels streaming right now</span>
            </div>
          </div>
        </div>

        {/* Right Preview Card */}
        <div
          onClick={() => onWatch(featuredChannel)}
          className="w-full md:w-72 aspect-video md:aspect-[4/3] rounded-2xl bg-black/60 border border-surface-border p-4 flex flex-col items-center justify-center relative cursor-pointer group hover:border-red-500/50 transition-all shadow-xl"
        >
          <div className="relative h-20 w-36 mb-2 group-hover:scale-105 transition-transform">
            <Image
              src={featuredChannel.logo || '/logos/placeholder.svg'}
              alt={featuredChannel.name}
              fill
              sizes="150px"
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 mt-2">
            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            <span>Click to Stream Preview</span>
          </div>
        </div>
      </div>
    </div>
  );
}

