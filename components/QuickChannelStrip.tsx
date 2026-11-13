'use client';

import React from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Tv, VolumeX, Volume2, Radio, Sparkles } from 'lucide-react';
import { Channel } from '@/types/channel';

interface QuickChannelStripProps {
  currentChannel: Channel;
  prevChannel?: Channel;
  nextChannel?: Channel;
  onPrev: () => void;
  onNext: () => void;
  onOpenGuide: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function QuickChannelStrip({
  currentChannel,
  prevChannel,
  nextChannel,
  onPrev,
  onNext,
  onOpenGuide,
  isMuted,
  onToggleMute,
}: QuickChannelStripProps) {
  const currentChNum = String(currentChannel.chNumber || 1).padStart(2, '0');
  const prevChNum = prevChannel ? String(prevChannel.chNumber || 1).padStart(2, '0') : '--';
  const nextChNum = nextChannel ? String(nextChannel.chNumber || 1).padStart(2, '0') : '--';

  return (
    <div className="w-full rounded-2xl bg-slate-900/50 border border-white/[0.08] p-2.5 sm:p-3.5 backdrop-blur-xl shadow-lg">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left: Previous Channel Quick Flip Button */}
        {prevChannel && (
          <button
            onClick={onPrev}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] text-left transition-all group shrink-0 active:scale-95"
            title={`Tune to CH ${prevChNum} (${prevChannel.name})`}
          >
            <ChevronLeft className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
            <div className="hidden sm:block">
              <span className="text-[10px] font-mono font-bold text-amber-400/90 block">
                CH {prevChNum}
              </span>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white truncate max-w-[110px] block">
                {prevChannel.name}
              </span>
            </div>
            <span className="sm:hidden text-xs font-bold text-slate-300">
              CH {prevChNum} Prev
            </span>
          </button>
        )}

        {/* Center: Current Channel Info & Badges */}
        <div
          onClick={onOpenGuide}
          className="flex-1 flex items-center justify-center gap-2 sm:gap-3 px-3 py-1.5 cursor-pointer rounded-xl hover:bg-white/[0.03] transition-colors"
          title="Click to browse all channels in TV Guide"
        >
          {/* Channel Number Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 font-mono font-black text-xs sm:text-sm">
            <Tv className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>CH {currentChNum}</span>
          </div>

          {/* Name */}
          <div className="text-center truncate">
            <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
              {currentChannel.name}
            </h1>
          </div>

          {/* Tags */}
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600/90 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
            <span className="rounded-md bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[10px] font-semibold text-slate-300">
              {currentChannel.language}
            </span>
            <span className="rounded-md bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 text-[10px] font-semibold text-slate-300">
              {currentChannel.category}
            </span>
          </div>
        </div>

        {/* Right: Next Channel Quick Flip Button & Audio status */}
        <div className="flex items-center gap-2 justify-end shrink-0">
          {/* Mute indicator button */}
          <button
            onClick={onToggleMute}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-bold transition-all border ${
              isMuted
                ? 'bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30 animate-pulse'
                : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.08]'
            }`}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <>
                <VolumeX className="h-4 w-4 text-red-400" />
                <span className="text-[11px] hidden lg:inline">MUTED</span>
              </>
            ) : (
              <>
                <Volume2 className="h-4 w-4 text-emerald-400" />
                <span className="text-[11px] hidden lg:inline">AUDIO ON</span>
              </>
            )}
          </button>

          {nextChannel && (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/[0.15] text-right transition-all group shrink-0 active:scale-95"
              title={`Tune to CH ${nextChNum} (${nextChannel.name})`}
            >
              <div className="hidden sm:block">
                <span className="text-[10px] font-mono font-bold text-amber-400/90 block">
                  CH {nextChNum}
                </span>
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white truncate max-w-[110px] block">
                  {nextChannel.name}
                </span>
              </div>
              <span className="sm:hidden text-xs font-bold text-slate-300">
                Next CH {nextChNum}
              </span>
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-white transition-colors shrink-0" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

