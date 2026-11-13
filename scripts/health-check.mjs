import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const channelsPath = path.join(__dirname, '..', 'data', 'channels.json');

async function checkChannel(channel) {
  if (!channel.hlsUrl || !channel.hlsUrl.trim()) {
    return {
      status: 'COMING_SOON',
      message: 'No stream URL configured',
      latencyMs: null,
    };
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  const isYouTube =
    channel.hlsUrl.includes('youtube.com') || channel.hlsUrl.includes('youtu.be');

  try {
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      Accept: '*/*',
      ...(channel.headers || {}),
    };

    const res = await fetch(channel.hlsUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      return {
        status: 'DEAD',
        message: `HTTP ${res.status} ${res.statusText}`,
        latencyMs,
      };
    }

    if (isYouTube) {
      const html = await res.text();
      const idMatch = html.match(/"videoId":"([^"]+)"/);
      if (idMatch || channel.hlsUrl.includes('watch?v=')) {
        const vid = idMatch ? idMatch[1] : 'Direct ID';
        return {
          status: 'ACTIVE',
          message: `Active YouTube Live Stream (ID: ${vid})`,
          latencyMs,
        };
      }
      return {
        status: 'ACTIVE',
        message: 'Active YouTube Broadcast Page',
        latencyMs,
      };
    }

    // Standard HLS check
    const text = await res.text();
    if (text.includes('#EXTM3U')) {
      const isMaster = text.includes('#EXT-X-STREAM-INF');
      return {
        status: 'ACTIVE',
        message: isMaster ? 'Active HLS Master Playlist' : 'Active HLS Media Playlist',
        latencyMs,
      };
    } else {
      return {
        status: 'WARNING',
        message: 'Responded 200 but missing #EXTM3U tag',
        latencyMs,
      };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err.name === 'AbortError';
    return {
      status: 'DEAD',
      message: isTimeout ? 'Connection timed out (>8s)' : err.message,
      latencyMs: Date.now() - startTime,
    };
  }
}

async function runHealthCheck() {
  console.log('\n======================================================');
  console.log('       LIVE TV STREAM HEALTH CHECK MONITOR');
  console.log('======================================================\n');

  if (!fs.existsSync(channelsPath)) {
    console.error('Error: data/channels.json not found!');
    process.exit(1);
  }

  const raw = fs.readFileSync(channelsPath, 'utf8');
  const channels = JSON.parse(raw);

  console.log(`Checking ${channels.length} channels from data/channels.json...\n`);

  const results = [];
  let activeCount = 0;
  let comingSoonCount = 0;
  let deadCount = 0;

  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i];
    const indexStr = String(i + 1).padStart(2, ' ');
    process.stdout.write(`[${indexStr}/${channels.length}] ${channel.name.padEnd(24)} `);

    const result = await checkChannel(channel);
    results.push({ channel, ...result });

    if (result.status === 'ACTIVE') {
      activeCount++;
      console.log(`\x1b[32m✔ ACTIVE\x1b[0m (${result.latencyMs}ms) - ${result.message}`);
    } else if (result.status === 'COMING_SOON') {
      comingSoonCount++;
      console.log(`\x1b[33m⏳ COMING SOON\x1b[0m (Unassigned)`);
    } else {
      deadCount++;
      console.log(`\x1b[31m✖ DEAD / ERROR\x1b[0m - ${result.message}`);
    }
  }

  console.log('\n======================================================');
  console.log('                   SUMMARY REPORT');
  console.log('======================================================');
  console.log(`Total Channels     : ${channels.length}`);
  console.log(`🟢 Active Streams  : ${activeCount}`);
  console.log(`🟡 Coming Soon     : ${comingSoonCount}`);
  console.log(`🔴 Dead / Error    : ${deadCount}`);
  console.log('======================================================\n');
}

runHealthCheck();
