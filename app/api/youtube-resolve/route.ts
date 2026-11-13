import { NextRequest, NextResponse } from 'next/server';
import { getChannelById } from '@/lib/channels';

export const dynamic = 'force-dynamic';

// In-memory cache for resolved live video IDs (15 minute TTL)
const ytCache = new Map<string, { videoId: string; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('id');
  const targetUrlParam = searchParams.get('url');

  let targetUrl = targetUrlParam;
  if (!targetUrl && channelId) {
    const channel = getChannelById(channelId);
    if (channel) {
      targetUrl = channel.hlsUrl;
    }
  }

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url or id parameter' }, { status: 400 });
  }

  // 1. Check if direct video ID exists in URL (e.g. watch?v=... or youtu.be/...)
  const directMatch = targetUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (directMatch) {
    const videoId = directMatch[1];
    return NextResponse.json({
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&playsinline=1&rel=0`,
      cached: false,
    });
  }

  // 2. Check cache for @Channel/live URLs
  const cached = ytCache.get(targetUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      videoId: cached.videoId,
      embedUrl: `https://www.youtube.com/embed/${cached.videoId}?autoplay=1&mute=0&playsinline=1&rel=0`,
      cached: true,
    });
  }

  // 3. Resolve live video ID from YouTube live page
  try {
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`YouTube returned status ${res.status}`);
    }

    const html = await res.text();
    const idMatch = html.match(/"videoId":"([^"]+)"/);

    if (idMatch && idMatch[1]) {
      const videoId = idMatch[1];
      ytCache.set(targetUrl, { videoId, timestamp: Date.now() });

      return NextResponse.json({
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&playsinline=1&rel=0`,
        cached: false,
      });
    }

    return NextResponse.json(
      { error: 'Could not extract videoId from YouTube live stream' },
      { status: 404 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: `Failed to resolve YouTube live stream: ${error.message}` },
      { status: 502 }
    );
  }
}

