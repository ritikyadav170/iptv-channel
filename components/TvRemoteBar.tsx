'use client';

import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Volume2,
  VolumeX,
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
      <div className="max-w-4xl mx-auto pointer-events-auto">
        {/* Floating Remote Glass Pill */}
        <div className="rounded-3xl bg-slate-950/90 border border-white/10 shadow-[0_12px_45px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-2.5 sm:p-3 flex items-center justify-between gap-2 sm:gap-4 ring-1 ring-white/5">
          {/* Channel Controls (CH - / CH +) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-2xl bg-white/[0.04] border border-white/[0.08] p-1 shadow-inner">
              <button
                onClick={onChannelDown}
                className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-white transition-all shadow-md min-w-[44px]"
                title="Channel Down (Arrow Down or PageDown)"
              >
                <div className="flex flex-col items-center">
                  <ChevronDown className="h-5 w-5 stroke-[2.5]" />
                  <span className="text-[8px] font-black tracking-tighter uppercase text-slate-400">
                    CH -
                  </span>
                </div>
              </button>

              <button
                onClick={onChannelUp}
                className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 active:scale-95 text-white transition-all shadow-lg shadow-red-600/30 min-w-[44px] ml-1"
                title="Channel Up (Arrow Up or PageUp)"
              >
                <div className="flex flex-col items-center">
                  <ChevronUp className="h-5 w-5 stroke-[2.5]" />
                  <span className="text-[8px] font-black tracking-tighter uppercase text-white">
                    CH +
                  </span>
                </div>
              </button>
            </div>

            {/* Current Channel Display (Click to open Guide) */}
            <div
              onClick={onOpenGuide}
              className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-amber-400/40 cursor-pointer transition-all group"
              title="Click to open TV Guide"
            >
              <div className="rounded-xl bg-amber-400 px-2 py-0.5 text-black font-mono font-black text-sm leading-tight shrink-0 shadow-md">
                CH {chNum}
              </div>
              <div className="min-w-0 max-w-[170px]">
                <p className="text-xs font-black text-white truncate group-hover:text-amber-400 transition-colors leading-tight">
                  {currentChannel.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span>{currentChannel.category}</span>
                  <span>•</span>
                  <span>{currentChannel.language}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Center / Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Guide Button */}
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-amber-400/40 text-white font-bold text-xs transition-all active:scale-95 min-h-[44px]"
              title="Open Cable TV Guide (Press 'G')"
            >
              <Tv className="h-4 w-4 text-amber-400" />
              <span className="hidden md:inline">GUIDE</span>
            </button>

            {/* Jump Numpad (123) Button */}
            <button
              onClick={onOpenNumpad}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.2] text-white font-bold text-xs transition-all active:scale-95 min-h-[44px]"
              title="Direct Channel Number Jump (Press 0-9)"
            >
              <Hash className="h-4 w-4 text-cyan-400" />
              <span className="hidden md:inline">123</span>
            </button>

            {/* Recall (Last Channel) Button */}
            <button
              onClick={onRecall}
              disabled={!hasLastChannel}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 min-h-[44px] ${
                hasLastChannel
                  ? 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08] text-white cursor-pointer'
                  : 'bg-white/[0.01] border-white/[0.04] text-slate-400 opacity-40 cursor-not-allowed'
              }`}
              title={
                hasLastChannel
                  ? `Return to previous channel: ${lastChannelName || ''}`
                  : 'No previous channel watched yet'
              }
            >
              <RotateCcw className="h-4 w-4 text-purple-400" />
              <span className="hidden lg:inline">LAST</span>
            </button>

            {/* Volume & Mute Cluster */}
            <div className="flex items-center rounded-2xl bg-white/[0.04] border border-white/[0.08] p-1">
              <button
                onClick={onToggleMute}
                className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl transition-all min-w-[36px] ${
                  isMuted
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30 animate-pulse'
                    : 'bg-slate-900/90 text-slate-200 hover:bg-slate-800'
                }`}
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4 text-emerald-400" />
                )}
              </button>

              <div className="hidden sm:flex items-center ml-1">
                <button
                  onClick={onVolumeDown}
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/[0.08] text-slate-300 transition-colors"
                  title="Volume Down"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold text-slate-400 px-1 w-6 text-center">
                  {isMuted ? '0' : Math.round(volume * 100)}
                </span>
                <button
                  onClick={onVolumeUp}
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/[0.08] text-slate-300 transition-colors"
                  title="Volume Up"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
