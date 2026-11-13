'use client';

import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Settings,
  AlertCircle,
  Radio,
  PictureInPicture,
} from 'lucide-react';
import { Channel } from '@/types/channel';

interface VideoPlayerProps {
  channel: Channel;
  autoPlay?: boolean;
  volume?: number;
  isMuted?: boolean;
  onVolumeChange?: (vol: number) => void;
  onMuteChange?: (muted: boolean) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchEnd?: (e: React.TouchEvent) => void;
}

interface QualityLevel {
  index: number;
  height: number;
  bitrate: number;
  label: string;
}

export default function VideoPlayer({
  channel,
  autoPlay = true,
  volume = 1,
  isMuted = false,
  onVolumeChange,
  onMuteChange,
  onTouchStart,
  onTouchEnd,
}: VideoPlayerProps) {
  const isYouTube = Boolean(
    channel.hlsUrl &&
      (channel.hlsUrl.includes('youtube.com') || channel.hlsUrl.includes('youtu.be'))
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState<number>(0);

  // YouTube state
  const [ytVideoId, setYtVideoId] = useState<string | null>(null);

  // Quality levels (for HLS)
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1);
  const [showQualityMenu, setShowQualityMenu] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Proxy URL
  const streamUrl = `/api/stream?id=${encodeURIComponent(channel.id)}`;

  // Sync external volume and mute to video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted]);

  // Handle YouTube stream resolution
  useEffect(() => {
    if (!isYouTube) {
      setYtVideoId(null);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    const directMatch = channel.hlsUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (directMatch) {
      setYtVideoId(directMatch[1]);
      setIsLoading(false);
      return;
    }

    fetch(`/api/youtube-resolve?id=${encodeURIComponent(channel.id)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.videoId) {
          setYtVideoId(data.videoId);
          setIsLoading(false);
        } else {
          throw new Error(data.error || 'No videoId returned');
        }
      })
      .catch((err) => {
        console.warn('Failed to resolve YouTube live video ID:', err.message);
        setErrorMsg('YouTube live broadcast currently offline or connecting...');
        setIsLoading(false);
      });
  }, [channel.id, channel.hlsUrl, isYouTube, retryCount]);

  // Controls visibility timeout
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowQualityMenu(false);
      }
    }, 3500);
  };

  const handleContainerMouseLeave = () => {
    if (isPlaying) {
      setShowControls(false);
      setShowQualityMenu(false);
    }
  };

  // Initialize HLS playback (when not YouTube)
  useEffect(() => {
    if (isYouTube) return;

    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    setErrorMsg(null);
    setLevels([]);
    setCurrentLevel(-1);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        manifestLoadingTimeOut: 12000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 10000,
      });

      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsLoading(false);
        const parsedLevels: QualityLevel[] = data.levels.map((lvl, index) => ({
          index,
          height: lvl.height,
          bitrate: lvl.bitrate,
          label: lvl.height ? `${lvl.height}p` : `${Math.round(lvl.bitrate / 1000)}k`,
        }));
        setLevels(parsedLevels);

        if (autoPlay) {
          video.play().catch((err) => {
            console.warn('Autoplay prevented, user interaction required:', err);
            setIsPlaying(false);
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.warn('HLS Error event:', data.type, data.details, data.fatal);

        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setErrorMsg('Stream is currently unavailable or offline. Click Retry to reconnect.');
              setIsLoading(false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS for Safari / iOS
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch((err) => {
            console.warn('Safari autoplay prevented:', err);
            setIsPlaying(false);
          });
        }
      });
      video.addEventListener('error', () => {
        setErrorMsg('Stream unavailable on Safari native player.');
        setIsLoading(false);
      });
    } else {
      setErrorMsg('Your browser does not support HLS video playback.');
      setIsLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel.id, streamUrl, retryCount, autoPlay, isYouTube]);

  // Video event listeners for HLS
  useEffect(() => {
    if (isYouTube) return;
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onVolumeUpdate = () => {
      if (onMuteChange) onMuteChange(video.muted);
      if (onVolumeChange) onVolumeChange(video.volume);
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('volumechange', onVolumeUpdate);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('volumechange', onVolumeUpdate);
    };
  }, [isYouTube, onMuteChange, onVolumeChange]);

  // Controls Handlers
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(console.error);
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !video.muted;
    video.muted = newMuted;
    if (onMuteChange) onMuteChange(newMuted);
  };

  const handleVolumeSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    video.muted = val === 0;
    if (onVolumeChange) onVolumeChange(val);
    if (onMuteChange) onMuteChange(val === 0);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not supported or failed:', err);
    }
  };

  const handleQualitySelect = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
      setShowQualityMenu(false);
    }
  };

  const jumpToLive = () => {
    const video = videoRef.current;
    if (!video || !video.seekable.length) return;
    video.currentTime = video.seekable.end(video.seekable.length - 1);
  };

  const retryPlayback = () => {
    setErrorMsg(null);
    setIsLoading(true);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleContainerMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      className="group relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl select-none border border-surface-border"
    >
      {/* If YouTube Live Channel */}
      {isYouTube ? (
        ytVideoId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${ytVideoId}?autoplay=${
              autoPlay ? 1 : 0
            }&mute=${isMuted ? 1 : 0}&playsinline=1&rel=0&modestbranding=1`}
            title={`${channel.name} Live Stream`}
            className="w-full h-full border-0 pointer-events-auto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="h-12 w-12 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
            <p className="mt-3 text-xs text-slate-300 font-mono">Tuning to live broadcast...</p>
          </div>
        )
      ) : (
        /* Native HLS / hls.js Video Player */
        <>
          <video
            ref={videoRef}
            className="h-full w-full object-contain cursor-pointer"
            playsInline
            onClick={togglePlay}
          />

          {/* Big Play/Pause Center Indicator */}
          {!isPlaying && !isLoading && !errorMsg && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 cursor-pointer"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-black shadow-2xl hover:scale-110 active:scale-95 transition-all font-black">
                <Play className="h-8 w-8 fill-black ml-1" />
              </div>
            </div>
          )}

          {/* Bottom Controls Bar (for HLS) */}
          <div
            className={`absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4 pt-10 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between gap-3 text-white">
              {/* Left Controls: Play/Pause, Live Edge, Volume */}
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5 fill-white" />
                  )}
                </button>

                {/* Jump to Live Button */}
                <button
                  onClick={jumpToLive}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-600/90 hover:bg-red-600 text-[11px] font-black text-white shadow-sm transition-all"
                  title="Jump to Live edge"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </button>

                {/* Volume & Slider */}
                <div className="flex items-center gap-1.5 group/vol">
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
                    title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5 text-red-400" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeSlider}
                    className="w-16 sm:w-20 h-1.5 bg-slate-600 rounded-lg cursor-pointer"
                    title={`Volume: ${Math.round(volume * 100)}%`}
                  />
                </div>
              </div>

              {/* Right Controls: Quality, PiP, Refresh, Fullscreen */}
              <div className="flex items-center gap-2 relative">
                {levels.length > 0 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowQualityMenu(!showQualityMenu)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-colors min-h-[36px]"
                      title="Stream Quality"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span>
                        {currentLevel === -1
                          ? 'Auto'
                          : levels[currentLevel]?.label || 'Quality'}
                      </span>
                    </button>

                    {showQualityMenu && (
                      <div className="absolute bottom-10 right-0 w-32 rounded-2xl bg-surface border border-surface-border p-1.5 shadow-2xl backdrop-blur-md z-50 animate-fade-in text-xs">
                        <div className="px-2 py-1 text-[10px] font-black uppercase text-slate-400">
                          Quality
                        </div>
                        <button
                          onClick={() => handleQualitySelect(-1)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-xl font-bold transition-colors ${
                            currentLevel === -1
                              ? 'bg-yellow-400 text-black'
                              : 'text-slate-200 hover:bg-surface-muted'
                          }`}
                        >
                          Auto
                        </button>
                        {levels.map((lvl) => (
                          <button
                            key={lvl.index}
                            onClick={() => handleQualitySelect(lvl.index)}
                            className={`w-full text-left px-2.5 py-1.5 rounded-xl font-bold transition-colors ${
                              currentLevel === lvl.index
                                ? 'bg-yellow-400 text-black'
                                : 'text-slate-200 hover:bg-surface-muted'
                            }`}
                          >
                            {lvl.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Reconnect */}
                <button
                  onClick={retryPlayback}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Reload Stream"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                {/* Picture in Picture */}
                <button
                  onClick={togglePiP}
                  className="hidden sm:inline-flex p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Picture in Picture"
                >
                  <PictureInPicture className="h-4 w-4" />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
                >
                  {isFullscreen ? (
                    <Minimize className="h-5 w-5" />
                  ) : (
                    <Maximize className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Loading Overlay */}
      {isLoading && !errorMsg && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
          <div className="relative flex items-center justify-center">
            <div className="h-14 w-14 rounded-full border-4 border-yellow-400/20 border-t-yellow-400 animate-spin" />
            <Radio className="absolute h-5 w-5 text-yellow-400 animate-pulse" />
          </div>
          <p className="mt-4 text-xs font-mono font-bold text-slate-200 tracking-wide">
            TUNING LIVE SIGNAL...
          </p>
        </div>
      )}

      {/* Error / Offline Screen */}
      {errorMsg && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-surface-muted/95 p-6 text-center backdrop-blur-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-4 shadow-lg shadow-red-500/10">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-white">Signal Temporarily Offline</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm">{errorMsg}</p>
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={retryPlayback}
              className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-black shadow-lg shadow-yellow-400/30 hover:bg-yellow-300 hover:scale-105 active:scale-95 transition-all min-h-[44px]"
            >
              <RotateCcw className="h-4 w-4" />
              Reconnect Signal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
