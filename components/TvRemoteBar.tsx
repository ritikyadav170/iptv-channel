'use client';

import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Volume2,
  VolumeX,
  Volume1,
  Tv,
  Hash,
  Plus,
  Minus,
} from 'lucide-react';
import { Channel } from '@/types/channel';

interface TvRemoteBarProps {
  currentChannel: Channel;
  onChannelUp: () => void;
  onChannelDown: () => void;
  onRecall: () => void;
  hasLastChannel: boolean;
  lastChannelName?: string;
  onOpenNumpad: () => void;
  onOpenGuide: () => void;
  volume: number;
  isMuted: boolean;
  onVolumeUp: () => void;
  onVolumeDown: () => void;
  onToggleMute: () => void;
}

export default function TvRemoteBar({
  currentChannel,
  onChannelUp,
  onChannelDown,
  onRecall,
  hasLastChannel,
  lastChannelName,
  onOpenNumpad,
  onOpenGuide,
  volume,
  isMuted,
  onVolumeUp,
  onVolumeDown,
  onToggleMute,
}: TvRemoteBarProps) {
  const chNum = String(currentChannel.chNumber || 1).padStart(2, '0');

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-2 sm:p-4 bg-gradient-to-t from-black via-black/95 to-transparent select-none pointer-events-none">
      <div className="max-w-5xl mx-auto pointer-events-auto">
        {/* Main Remote Bar Card */}
        <div className="rounded-3xl bg-surface/95 border-2 border-surface-border shadow-2xl backdrop-blur-2xl p-2.5 sm:p-3.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Block: Channel Controls (CH UP / CH DOWN + Display) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* CH UP & DOWN cluster */}
            <div className="flex items-center rounded-2xl bg-surface-muted border border-surface-border p-1 shadow-inner">
              <button
                onClick={onChannelDown}
                className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white transition-all shadow-md min-w-[44px]"
                title="Channel Down (Arrow Down)"
              >
                <div className="flex flex-col items-center">
                  <ChevronDown className="h-6 w-6 stroke-[3]" />
                  <span className="text-[9px] font-black tracking-tighter uppercase -mt-1 text-slate-400">
                    CH -
                  </span>
                </div>
              </button>

              <button
                onClick={onChannelUp}
                className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white transition-all shadow-lg shadow-red-600/30 min-w-[44px] ml-1"
                title="Channel Up (Arrow Up)"
              >
                <div className="flex flex-col items-center">
                  <ChevronUp className="h-6 w-6 stroke-[3]" />
                  <span className="text-[9px] font-black tracking-tighter uppercase -mt-1 text-white">
                    CH +
                  </span>
                </div>
              </button>
            </div>

            {/* Current Channel Display */}
            <div
              onClick={onOpenGuide}
              className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-black/60 border border-white/10 cursor-pointer hover:border-yellow-400/50 transition-colors group"
              title="Click to open TV Guide"
            >
              <div className="rounded-xl bg-yellow-400 px-2.5 py-1 text-black font-mono font-black text-lg leading-tight shrink-0 shadow-md">
                CH {chNum}
              </div>
              <div className="min-w-0 max-w-[200px]">
                <p className="text-sm font-black text-white truncate group-hover:text-yellow-400 transition-colors leading-tight">
                  {currentChannel.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentChannel.language} • {currentChannel.category}
                </p>
              </div>
            </div>
          </div>

          {/* Center Mobile Display (compact) */}
          <div
            onClick={onOpenGuide}
            className="flex md:hidden items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 cursor-pointer text-left min-w-0 flex-1"
          >
            <span className="rounded-lg bg-yellow-400 px-2 py-0.5 text-black font-mono font-black text-xs shrink-0">
              {chNum}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {currentChannel.name}
              </p>
            </div>
          </div>

          {/* Right Block: Remote Tools (Recall, Numpad, Volume, Guide) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Last Channel / Recall Button */}
            <button
              onClick={onRecall}
              disabled={!hasLastChannel}
              className={`flex h-12 px-3 sm:px-4 sm:h-14 items-center justify-center gap-1.5 rounded-2xl border text-xs font-bold transition-all min-w-[44px] ${
                hasLastChannel
                  ? 'bg-surface-muted hover:bg-surface-border text-yellow-400 border-surface-border active:scale-95 shadow-md'
                  : 'bg-surface/50 text-slate-600 border-transparent cursor-not-allowed opacity-40'
              }`}
              title={
                hasLastChannel
                  ? `Return to previous channel: ${lastChannelName}`
                  : 'No previous channel watched'
              }
            >
              <RotateCcw className="h-4 w-4 stroke-[2.5]" />
              <span className="hidden sm:inline font-mono">RECALL</span>
            </button>

            {/* Direct Number Pad Jump Button */}
            <button
              onClick={onOpenNumpad}
              className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-surface-muted hover:bg-surface-border active:scale-95 text-slate-200 border border-surface-border shadow-md transition-all min-w-[44px]"
              title="Type Channel Number (1-9)"
            >
              <div className="flex flex-col items-center">
                <Hash className="h-5 w-5 text-yellow-400" />
                <span className="text-[9px] font-bold font-mono text-slate-400 -mt-0.5">
                  123
                </span>
              </div>
            </button>

            {/* Volume Control Cluster */}
            <div className="hidden sm:flex items-center rounded-2xl bg-surface-muted border border-surface-border p-1">
              <button
                onClick={onVolumeDown}
                className="flex h-12 w-10 sm:h-12 sm:w-10 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Volume Down"
              >
                <Minus className="h-4 w-4" />
              </button>

              <button
                onClick={onToggleMute}
                className={`flex h-12 px-2.5 items-center justify-center gap-1 rounded-xl transition-colors ${
                  isMuted ? 'text-red-400 bg-red-500/20' : 'text-slate-200 hover:bg-slate-800'
                }`}
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                <span className="text-[11px] font-mono font-bold">
                  {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
                </span>
              </button>

              <button
                onClick={onVolumeUp}
                className="flex h-12 w-10 sm:h-12 sm:w-10 items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Volume Up"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile Mute button */}
            <button
              onClick={onToggleMute}
              className={`sm:hidden flex h-12 w-12 items-center justify-center rounded-2xl border min-w-[44px] ${
                isMuted
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-surface-muted border-surface-border text-slate-300'
              }`}
              title="Mute"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>

            {/* TV Guide Button (Large Accent) */}
            <button
              onClick={onOpenGuide}
              className="flex h-12 px-3.5 sm:h-14 sm:px-5 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black active:scale-95 shadow-lg shadow-yellow-400/25 transition-all font-black text-xs sm:text-sm tracking-wide min-w-[44px]"
              title="Open TV Guide (G)"
            >
              <Tv className="h-5 w-5 stroke-[2.5]" />
              <span className="hidden sm:inline">GUIDE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

