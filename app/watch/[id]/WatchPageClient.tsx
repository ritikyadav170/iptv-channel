'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Radio,
  Tv,
  Share2,
  Check,
  ChevronRight,
  Search,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { Channel } from '@/types/channel';
import VideoPlayer from '@/components/VideoPlayer';

interface WatchPageClientProps {
  initialChannel: Channel;
  allChannels: Channel[];
}

export default function WatchPageClient({
  initialChannel,
  allChannels,
}: WatchPageClientProps) {
  const [currentChannel, setCurrentChannel] = useState<Channel>(initialChannel);
  const [searchFilter, setSearchFilter] = useState('');
  const [copied, setCopied] = useState(false);

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
      c.language.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Player Column */}
      <div className="lg:col-span-2 space-y-4">
        <VideoPlayer channel={currentChannel} autoPlay={true} />

        {/* Channel Details Header */}
        <div className="rounded-2xl bg-surface border border-surface-border p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-24 rounded-xl bg-slate-900 border border-surface-border overflow-hidden shrink-0 flex items-center justify-center p-1">
                <Image
                  src={currentChannel.logo || '/logos/placeholder.svg'}
                  alt={currentChannel.name}
                  fill
                  sizes="100px"
                  className="object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {currentChannel.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm shadow-red-600/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span className="text-slate-200 font-medium">{currentChannel.language}</span>
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
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surface-muted hover:bg-surface-border text-xs font-semibold text-slate-200 border border-surface-border transition-colors self-start sm:self-auto"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 text-slate-400" />
                  <span>Share Stream</span>
                </>
              )}
            </button>
          </div>

          {/* Program Information / EPG Block */}
          <div className="rounded-xl bg-surface-muted/60 border border-surface-border/80 p-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-red-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Live Broadcast Program
              </span>
              <span className="font-mono text-[11px] text-slate-400">Continuous 24/7 Feed</span>
            </div>
            <p className="text-sm font-medium text-slate-200">
              Live National & Regional Television Coverage
            </p>
            <p className="mt-1 text-xs text-slate-400">
              EPG Feed Tag: <code className="bg-black/40 px-1.5 py-0.5 rounded text-slate-300 font-mono">{currentChannel.epgId}</code>
            </p>
          </div>

          {/* Technical Info & Server Proxy Notice */}
          <div className="flex items-start gap-2.5 text-xs text-slate-400 bg-black/20 p-3 rounded-xl border border-surface-border/50">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-slate-300 font-medium">Server-Side Proxy Active</p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Stream data and video chunks are securely piped through the Next.js backend proxy at <code className="text-slate-300">/api/stream?id={currentChannel.id}</code> to prevent CORS errors and mixed-content issues.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Side Column: Quick Channel Switching Drawer */}
      <div className="rounded-2xl bg-surface border border-surface-border p-4 flex flex-col max-h-[750px]">
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Tv className="h-4 w-4 text-red-400" />
              Quick Channel Switch
            </h2>
            <span className="text-[11px] text-slate-400">
              {filteredChannels.length} Channels
            </span>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter channels..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-xl bg-surface-muted border border-surface-border pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filteredChannels.map((c) => {
            const isCurrent = c.id === currentChannel.id;
            const isLive = Boolean(c.hlsUrl && c.hlsUrl.trim().length > 0);

            return (
              <button
                key={c.id}
                disabled={!isLive}
                onClick={() => {
                  if (isLive && !isCurrent) {
                    setCurrentChannel(c);
                  }
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                  isCurrent
                    ? 'bg-red-600/20 border border-red-500/50 text-white shadow-sm'
                    : isLive
                    ? 'bg-surface-muted/60 hover:bg-surface-muted border border-transparent hover:border-surface-border text-slate-200'
                    : 'bg-surface-muted/30 opacity-50 cursor-not-allowed border border-transparent text-slate-400'
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
                    NOW PLAYING
                  </span>
                ) : isLive ? (
                  <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                ) : (
                  <span className="text-[9px] text-slate-400 px-1.5 py-0.5 rounded bg-surface">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

