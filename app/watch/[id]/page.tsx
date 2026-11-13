import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Radio,
  Tv,
  Share2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { getChannels, getChannelById, getCategories } from '@/lib/channels';
import Navbar from '@/components/Navbar';
import VideoPlayer from '@/components/VideoPlayer';
import WatchPageClient from './WatchPageClient';

interface WatchPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const channels = getChannels();
  return channels.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: WatchPageProps) {
  const channel = getChannelById(params.id);
  if (!channel) {
    return { title: 'Channel Not Found' };
  }
  return {
    title: `Watch ${channel.name} Live - 24/7 TV Streaming`,
    description: `Watch ${channel.name} live broadcast in ${channel.language} with high quality HLS streaming.`,
  };
}

export default function WatchPage({ params }: WatchPageProps) {
  const channel = getChannelById(params.id);
  if (!channel) {
    notFound();
  }

  const allChannels = getChannels();
  const categories = getCategories();
  const liveChannels = allChannels.filter((c) => c.hlsUrl && c.hlsUrl.trim().length > 0);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar categories={categories} liveCount={liveChannels.length} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to All News Channels</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              SERVER HLS STREAM
            </span>
          </div>
        </div>

        {/* Client Player Section with Channel Switcher */}
        <WatchPageClient
          initialChannel={channel}
          allChannels={allChannels}
        />
      </main>
    </div>
  );
}

