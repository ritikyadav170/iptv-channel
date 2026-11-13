# Dekho TV 📺

A modern, high-performance Live Cable TV streaming web platform built with **Next.js 14**, **Tailwind CSS**, and **hls.js**, featuring an automated **Server-Side HLS Stream Proxy** to defeat CORS and HTTPS mixed-content restrictions. Zero learning curve cable TV remote experience.

---

## 🌟 Key Features

1. **Category Navigation & Sidebar**:
   - Modern dark UI with categories: **News** (Active), **Sports**, **Movies**, **Entertainment**, **Kids**, **Music**, and **Documentary** (coming soon badges).
   - Extensible JSON-driven category structure (`data/categories.json`).

2. **Responsive Channel Grid**:
   - 32 news channels pre-configured with EPG IDs, logos, and languages.
   - Glowing red **"LIVE"** badge on active channels with hover playback triggers.
   - Muted **"Coming Soon"** badge on channels without streams (disabled & unclickable).
   - "Only Live Channels" toggle for quick filtering.

3. **Advanced HLS Player & Quick Channel Switcher**:
   - Custom modern player UI with Play/Pause, Live Edge sync indicator, Volume slider + Mute toggle, Fullscreen, and Picture-in-Picture.
   - **Quality Selector**: Auto-detects multi-bitrate HLS variants (1080p, 720p, 480p, 360p, etc.).
   - **Keyboard Shortcuts**: `Space` (Play/Pause), `M` (Mute/Unmute), `F` (Fullscreen).
   - **Loading & Error Recovery**: Automatic retry on network drops, clear error screens with a "Retry Connection" button.
   - **Quick Channel Drawer**: Switch between live channels seamlessly inside the player modal or dedicated watch page.
   - **Dual Routing**: Watch in an instant modal or on dedicated shareable URLs (`/watch/[channel-id]`).

4. **Instant Search & Language Filters**:
   - Real-time search by channel name or EPG ID.
   - Quick language filter chips with channel count badges: **Hindi, English, Bengali, Kannada, Telugu, Marathi, Urdu, and Malayalam**.

5. **Server-Side HLS Stream Proxy (`/api/stream`)**:
   - Fetches upstream `.m3u8` manifests and recursively rewrites variant playlists, audio tracks (`#EXT-X-MEDIA`), encryption keys (`#EXT-X-KEY`), and media segments (`.ts`, `.m4s`, `.mp4`) to route through `/api/stream`.
   - **Resolves CORS & Mixed-Content**: Client connects only via HTTPS to your domain; upstream HTTP or CORS-blocked feeds play without browser security errors.
   - Upstream header forwarding (`User-Agent`, `Referer`, custom headers) configurable per channel.
   - Caching: Zero-cache for live manifests, 5-minute caching for immutable media chunks.
   - SSRF Protection: Blocks private IP ranges and internal addresses.

6. **Automated Stream Health Checker**:
   - CLI script that tests every channel stream, reports latency, playlist type, and identifies dead or unassigned feeds.

7. **Phase 2 EPG Ready**:
   - Every channel record includes a standardized `epgId` (e.g. `NDTVIndia.in`, `AajTak.in`) ready for XMLTV guide ingestion.

---

## 📁 Project Structure

```
free-tv-website/
├── app/
│   ├── api/
│   │   ├── channels/route.ts      # REST endpoint for channels & categories
│   │   └── stream/route.ts        # Server-side HLS proxy & manifest rewriter
│   ├── watch/[id]/
│   │   ├── page.tsx               # Dedicated full-page player route (SSG)
│   │   └── WatchPageClient.tsx    # Interactive client player & channel switch
│   ├── globals.css                # Tailwind base & custom scrollbar styles
│   ├── HomeClient.tsx             # Main client page with filters & player modal
│   ├── layout.tsx                 # Root layout & SEO meta tags
│   └── page.tsx                   # Server-rendered home page
├── components/
│   ├── ChannelCard.tsx            # Live / Coming Soon channel cards
│   ├── ChannelGrid.tsx            # Grid with search bar & language chips
│   ├── HeroBanner.tsx             # Featured breaking news highlight banner
│   ├── Navbar.tsx                 # Top sticky navigation with category pills
│   ├── PlayerModal.tsx            # In-page cinema modal with quick switcher
│   ├── Sidebar.tsx                # Categories sidebar & platform statistics
│   └── VideoPlayer.tsx            # hls.js core video player with custom controls
├── data/
│   ├── categories.json            # Categories catalog (News, Sports, etc.)
│   └── channels.json              # Channels database (zero-code configuration)
├── lib/
│   ├── channels.ts                # Channel data loader & helper methods
│   └── constants.ts               # Preferred languages & constants
├── public/
│   └── logos/                     # Channel brand SVG logos & placeholder
├── scripts/
│   └── health-check.mjs           # Stream health check script
├── .env.example                   # Environment variable template
├── next.config.mjs                # Next.js configuration
├── package.json
├── tailwind.config.ts             # Dark theme design system
└── tsconfig.json
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18.17+ or 20+ (Node.js 22 LTS recommended)
- npm or pnpm

### 2. Installation
```bash
git clone <your-repo-url>
cd free-tv-website
npm install
```

### 3. Environment Setup
```bash
cp .env.example .env.local
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Stream Health Check
To test which streams in `data/channels.json` are currently active, dead, or coming soon:
```bash
npm run health-check
```

---

## 🛠️ Adding or Editing Channels (Zero Code Changes)

All channel data is isolated in `data/channels.json`. To add a new channel or update an existing stream URL, simply edit `data/channels.json`:

```json
{
  "id": "aaj-tak",
  "name": "Aaj Tak",
  "category": "News",
  "language": "Hindi",
  "epgId": "AajTak.in",
  "logo": "/logos/aaj-tak.svg",
  "hlsUrl": "https://example-cdn.com/aajtak/live.m3u8",
  "headers": {
    "User-Agent": "Mozilla/5.0",
    "Referer": "https://example-cdn.com/"
  }
}
```

### Configuration Fields:
| Field | Type | Description |
|---|---|---|
| `id` | string (required) | Unique URL-safe slug (e.g. `ndtv-india`) |
| `name` | string (required) | Channel display name |
| `category` | string (required) | E.g. `News`, `Sports`, `Movies` |
| `language` | string (required) | Language chip (e.g. `Hindi`, `Bengali`) |
| `epgId` | string (required) | XMLTV EPG program guide identifier |
| `logo` | string (required) | Logo path in `/public/logos/` or external URL |
| `hlsUrl` | string (optional) | Stream URL. If `""` (empty), card shows as "Coming Soon" and is disabled |
| `headers` | object (optional) | Custom upstream headers forwarded by the proxy (e.g. `Referer`, `User-Agent`) |

---

## 🌐 Production Deployment Guide (Ubuntu VPS + Nginx + SSL)

Follow this step-by-step guide to deploy the platform on an Ubuntu VPS (DigitalOcean, Hetzner, AWS EC2, Linode, or Vultr).

### Step 1: VPS Setup & Node.js Installation
SSH into your server:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx

# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 Process Manager globally
sudo npm install -g pm2
```

### Step 2: Clone & Build the Application
```bash
cd /var/www
sudo git clone <your-repo-url> live-tv
cd live-tv
sudo chown -R $USER:$USER /var/www/live-tv

npm install
npm run build
```

### Step 3: Run with PM2
Start the Next.js production server with PM2 in cluster mode:
```bash
pm2 start npm --name "streampulse" -- start -- -p 3000
pm2 save
pm2 startup
```

### Step 4: Configure Nginx Reverse Proxy & HLS Caching
Create an Nginx configuration file:
```bash
sudo nano /etc/nginx/sites-available/streampulse
```

Paste the following configuration (replace `yourdomain.com` with your actual domain):

```nginx
# Cache zone for HLS video segments (.ts, .m4s)
proxy_cache_path /var/cache/nginx/hls_cache levels=1:2 keys_zone=HLS_CACHE:100m max_size=2g inactive=10m use_temp_path=off;

server {
    server_name yourdomain.com www.yourdomain.com;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript application/vnd.apple.mpegurl;

    # Standard Next.js pages and API
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Enhanced caching for HLS Stream Proxy segments
    location /api/stream {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Disable response buffering for live streaming
        proxy_buffering off;
        proxy_read_timeout 30s;
        proxy_connect_timeout 10s;

        # CORS Headers fallback
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, HEAD, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Range, Content-Type, User-Agent' always;
    }

    # Static assets cache
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/streampulse /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Secure with Let's Encrypt SSL (HTTPS)
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot will automatically install the certificate, configure HTTP-to-HTTPS redirect, and setup auto-renewal cron!

### Step 6: Firewall Setup
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 📡 Stream Proxy Architecture

```
[ Browser / hls.js ]
        │
        ▼ (HTTPS)
[ Next.js /api/stream?id=ndtv-india ]
        │
        ├─ 1. Lookup channel in data/channels.json
        ├─ 2. Fetch upstream master.m3u8 with channel.headers
        ├─ 3. Rewrite variant URLs -> /api/stream?id=ndtv-india&url=ENCODED_VARIANT
        ├─ 4. Sub-playlist requested -> Rewrite segment URLs -> /api/stream?id=ndtv-india&url=ENCODED_TS
        └─ 5. Binary segment requested -> Stream .ts data directly with CORS headers
        │
        ▼
[ Upstream CDN / Broadcaster Edge ] (Akamai, CloudFront, Jio CDN)
```

---

## 📺 EPG Integration (Phase 2 Guide)

Every channel is mapped to its official `epgId` (e.g. `NDTVIndia.in`, `ABP News`, `AsianetNews.com`).
To connect an XMLTV EPG provider:
1. Schedule a cron job to fetch your XMLTV guide (e.g. `https://example.com/epg.xml`).
2. Map `<programme channel="CHANNEL_EPG_ID">` to the `epgId` field in `data/channels.json`.
3. Display current show title and start/end times inside `components/ChannelCard.tsx` and `components/VideoPlayer.tsx`.

---

## 📄 License
MIT License. Built for seamless live broadcast streaming.

