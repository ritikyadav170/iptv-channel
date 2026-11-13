import { NextResponse } from 'next/server';
import { getChannels, getCategories } from '@/lib/channels';

export const dynamic = 'force-dynamic';

export async function GET() {
  const channels = getChannels();
  const categories = getCategories();

  return NextResponse.json(
    {
      channels,
      categories,
      totalChannels: channels.length,
      liveChannels: channels.filter((c) => c.hlsUrl && c.hlsUrl.trim().length > 0).length,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      },
    }
  );
}

