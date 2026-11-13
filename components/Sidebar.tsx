'use client';

import React from 'react';
import Link from 'next/link';
import {
  Radio,
  Trophy,
  Film,
  Tv,
  Smile,
  Music,
  Compass,
  ShieldCheck,
  Server,
  Info,
} from 'lucide-react';
import { Category } from '@/types/channel';

interface SidebarProps {
  categories: Category[];
  activeCategory?: string;
  totalChannels: number;
  liveCount: number;
}

const iconMap: Record<string, React.ElementType> = {
  Radio,
  Trophy,
  Film,
  Tv,
  Smile,
  Music,
  Compass,
};

export default function Sidebar({
  categories,
  activeCategory = 'news',
  totalChannels,
  liveCount,
}: SidebarProps) {
  return (
    <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-surface-border bg-surface/50 p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Categories
          </div>
          <nav className="space-y-1">
            {categories.map((category) => {
              const Icon = iconMap[category.icon] || Tv;
              const isActive = category.id === activeCategory;

              return (
                <div key={category.id}>
                  {category.active ? (
                    <Link
                      href={`/?category=${category.id}`}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                        isActive
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : 'text-slate-300 hover:bg-surface-muted hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 transition-colors ${
                            isActive ? 'text-red-400' : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span>{category.name}</span>
                      </div>
                      {isActive && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-red-400">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                          LIVE
                        </span>
                      )}
                    </Link>
                  ) : (
                    <div
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed opacity-60"
                      title="Category coming in Phase 2"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-slate-600" />
                        <span>{category.name}</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-muted border border-surface-border text-slate-400">
                        {category.badge || 'Soon'}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Stream Stats Box */}
        <div className="rounded-2xl border border-surface-border bg-surface-muted/60 p-3.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-2">
            <Server className="h-4 w-4 text-red-400" />
            <span>Platform Status</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Total Channels</span>
              <span className="font-semibold text-slate-200">{totalChannels}</span>
            </div>
            <div className="flex justify-between">
              <span>Live Streams</span>
              <span className="font-semibold text-emerald-400">{liveCount} Online</span>
            </div>
            <div className="flex justify-between">
              <span>Coming Soon</span>
              <span className="font-semibold text-amber-400">{totalChannels - liveCount}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-surface-border">
              <span>Reverse Proxy</span>
              <span className="text-[11px] font-mono text-emerald-400">CORS/HTTPS OK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-surface-border/80 text-[11px] text-slate-400 space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Server-Side HLS Engine</span>
        </div>
        <p className="leading-relaxed">
          Streams are proxied server-side to resolve CORS and mixed-content issues seamlessly.
        </p>
      </div>
    </aside>
  );
}

