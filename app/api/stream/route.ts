import { NextRequest, NextResponse } from 'next/server';
import { getChannelById } from '@/lib/channels';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Standard CORS headers
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Range, User-Agent, X-Requested-With',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Content-Type',
};

// Check if a host is local/private to prevent SSRF
function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return true;
  }
  // Check private IPv4 ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16)
  const ipParts = host.split('.').map(Number);
  if (ipParts.length === 4 && ipParts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    if (ipParts[0] === 10) return true;
    if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) return true;
    if (ipParts[0] === 192 && ipParts[1] === 168) return true;
    if (ipParts[0] === 169 && ipParts[1] === 254) return true;
    if (ipParts[0] === 127) return true;
  }
  return false;
}

// Rewrite m3u8 playlist manifest to route sub-playlists and segments through this proxy
function rewriteM3U8(content: string, currentUrl: string, channelId: string): string {
  const lines = content.split(/\r?\n/);
  const rewrittenLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      rewrittenLines.push(line);
      continue;
    }

    // URI line (segments, variant streams, audio tracks)
    if (!trimmed.startsWith('#')) {
      try {
        const resolved = new URL(trimmed, currentUrl).href;
        rewrittenLines.push(
          `/api/stream?id=${encodeURIComponent(channelId)}&url=${encodeURIComponent(resolved)}`
        );
      } catch {
        rewrittenLines.push(line);
      }
      continue;
    }

    // Rewrite tags containing URI attributes: #EXT-X-MEDIA, #EXT-X-KEY, #EXT-X-MAP, #EXT-X-PRELOAD-HINT, etc.
    if (line.includes('URI=')) {
      line = line.replace(/URI=(["']?)([^"',\s]+)\1/g, (match, quote, uri) => {
        try {
          const resolved = new URL(uri, currentUrl).href;
          const proxyUrl = `/api/stream?id=${encodeURIComponent(
            channelId
          )}&url=${encodeURIComponent(resolved)}`;
          return `URI="${proxyUrl}"`;
        } catch {
          return match;
        }
      });
    }

    rewrittenLines.push(line);
  }

  return rewrittenLines.join('\n');
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS_HEADERS,
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('id');
  const targetUrlParam = searchParams.get('url');

  if (!channelId) {
    return NextResponse.json(
      { error: 'Missing channel "id" parameter' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const channel = getChannelById(channelId);
  if (!channel) {
    return NextResponse.json(
      { error: `Channel "${channelId}" not found in channels list` },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  // Determine target URL: either the sub-resource or the master HLS URL from channels.json
  const targetUrl = targetUrlParam || channel.hlsUrl;

  if (!targetUrl || !targetUrl.trim()) {
    return NextResponse.json(
      { error: `Channel "${channel.name}" has no stream URL configured (Coming Soon)` },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Unsupported protocol');
    }
    if (isPrivateHost(parsedUrl.hostname)) {
      return NextResponse.json(
        { error: 'Access to private network hostnames is forbidden' },
        { status: 403, headers: CORS_HEADERS }
      );
    }
  } catch {
    return NextResponse.json(
      { error: 'Invalid target stream URL' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // Assemble request headers to upstream
  const upstreamHeaders: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    Accept: '*/*',
    'Accept-Language': 'en-US,en;q=0.9',
    Referer: `${parsedUrl.origin}/`,
    Origin: parsedUrl.origin,
  };

  // Merge any custom channel headers configured in channels.json
  if (channel.headers && typeof channel.headers === 'object') {
    Object.assign(upstreamHeaders, channel.headers);
  }

  // Forward client range header if present (for seeking/partial segment downloads)
  const rangeHeader = request.headers.get('range');
  if (rangeHeader) {
    upstreamHeaders['Range'] = rangeHeader;
  }

  // Fetch with timeout protection
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: 'GET',
      headers: upstreamHeaders,
      signal: controller.signal,
      redirect: 'follow',
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!upstreamRes.ok) {
      console.warn(
        `[Proxy Upstream Error] ${channel.name} (${targetUrl}) => ${upstreamRes.status} ${upstreamRes.statusText}`
      );
      return NextResponse.json(
        {
          error: `Upstream stream server returned ${upstreamRes.status} ${upstreamRes.statusText}`,
          channel: channel.name,
          status: upstreamRes.status,
        },
        { status: upstreamRes.status, headers: CORS_HEADERS }
      );
    }

    const contentType = upstreamRes.headers.get('content-type') || '';
    const isM3U8 =
      targetUrl.includes('.m3u8') ||
      contentType.includes('application/vnd.apple.mpegurl') ||
      contentType.includes('application/x-mpegurl') ||
      contentType.includes('audio/x-mpegurl') ||
      contentType.includes('text/plain');

    if (isM3U8) {
      const rawText = await upstreamRes.text();
      const trimmed = rawText.trim();
      // Valid HLS playlists MUST start with #EXTM3U
      if (trimmed.startsWith('#EXTM3U')) {
        const rewrittenManifest = rewriteM3U8(rawText, targetUrl, channel.id);

        return new NextResponse(rewrittenManifest, {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            'Content-Type': 'application/vnd.apple.mpegurl',
            // Live playlists must not be cached long to ensure fresh chunks
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        });
      } else {
        // Upstream returned non-m3u8 payload (e.g. error message, token expired, HTML)
        console.warn(
          `[Proxy Upstream Non-M3U8] ${channel.name} (${targetUrl}) => ${trimmed.slice(0, 120)}`
        );
        return NextResponse.json(
          {
            error: `Upstream returned invalid HLS playlist: ${trimmed.slice(0, 100)}`,
            channel: channel.name,
          },
          { status: 502, headers: CORS_HEADERS }
        );
      }
    }

    // Binary segment (video/mp2t, audio, init fmp4, etc.)
    const responseHeaders: Record<string, string> = {
      ...CORS_HEADERS,
      'Content-Type': contentType || 'video/mp2t',
      // Media segments are immutable and can be safely cached for 5 minutes
      'Cache-Control': 'public, max-age=300, immutable',
    };

    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) {
      responseHeaders['Content-Length'] = contentLength;
    }

    const contentRange = upstreamRes.headers.get('content-range');
    if (contentRange) {
      responseHeaders['Content-Range'] = contentRange;
    }

    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const error = err as Error;
    const isTimeout = error.name === 'AbortError';

    console.error(`[Stream Proxy Error] ${channel.name} (${targetUrl}):`, error.message);

    return NextResponse.json(
      {
        error: isTimeout
          ? 'Stream request timed out after 12s'
          : `Failed to fetch stream: ${error.message}`,
        channel: channel.name,
      },
      {
        status: isTimeout ? 504 : 502,
        headers: CORS_HEADERS,
      }
    );
  }
}

