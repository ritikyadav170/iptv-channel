const list = [
  { name: 'Pogo Amagi', url: 'https://amg01448-samsungin-pogo-samsungin-dzccl.amagi.tv/playlist/amg01448-samsungin-pogo-samsungin/playlist.m3u8' },
  { name: 'Cartoon Network East', url: 'https://turnerlive.warnermediacdn.com/hls/live/2023160/tooneast/noslate/VIDEO_3_1928000.m3u8' },
  { name: 'Sony YAY YT', url: 'https://www.youtube.com/@SonyYAY/live' },
  { name: 'ChuChu TV YT', url: 'https://www.youtube.com/@ChuChuTV/live' },
  { name: 'Green Gold TV (Chhota Bheem)', url: 'https://www.youtube.com/@GreenGoldTV/live' },
  { name: 'Pogo Channel YT', url: 'https://www.youtube.com/@PogoChannel/live' },
  { name: 'Cocomelon YT', url: 'https://www.youtube.com/@Cocomelon/live' }
];

async function check() {
  for (const item of list) {
    try {
      const res = await fetch(item.url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const text = await res.text();
      let status = 'UNKNOWN';
      if (item.url.includes('youtube.com')) {
        const isLive = text.includes('"isLive":true') || text.includes('liveStreamabilityRenderer');
        status = isLive ? 'LIVE' : 'NOT LIVE';
      } else {
        const isM3U8 = text.trim().startsWith('#EXTM3U');
        status = isM3U8 ? 'ACTIVE M3U8' : `NON-M3U8 (${text.slice(0, 40).trim()})`;
      }
      console.log(`[${status}] ${item.name} (${res.status})`);
    } catch (e) {
      console.log(`[ERROR] ${item.name}: ${e.message}`);
    }
  }
}

check();

