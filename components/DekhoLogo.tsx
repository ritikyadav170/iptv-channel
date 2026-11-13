'use client';

import React from 'react';
import Image from 'next/image';

interface DekhoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export default function DekhoLogo({
  className = '',
  size = 'md',
  showSubtitle = true,
}: DekhoLogoProps) {
  const heights = {
    sm: 'h-8',
    md: 'h-10 sm:h-11',
    lg: 'h-12 sm:h-14',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon Mark SVG */}
      <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center shrink-0">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(255,46,85,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="dekhoGrad1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#FF2E55" />
              <stop offset="50%" stop-color="#FF5B22" />
              <stop offset="100%" stop-color="#FFA800" />
            </linearGradient>
            <linearGradient id="dekhoScreen" x1="0" y1="20" x2="0" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#182033" />
              <stop offset="100%" stop-color="#0a0e1a" />
            </linearGradient>
          </defs>

          {/* TV Outer Monitor Box */}
          <rect
            x="8"
            y="18"
            width="84"
            height="62"
            rx="18"
            fill="url(#dekhoScreen)"
            stroke="url(#dekhoGrad1)"
            strokeWidth="3.5"
          />

          {/* Modern Antenna horns */}
          <path
            d="M34 8 L50 18 L66 8"
            stroke="url(#dekhoGrad1)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="18" r="3" fill="#FF5B22" />

          {/* Glowing Play Triangle */}
          <path
            d="M44 37 C44 35 46.5 33.8 48.2 34.9 L61 43.5 C62.5 44.5 62.5 46.8 61 47.8 L48.2 56.4 C46.5 57.5 44 56.3 44 54.3 Z"
            fill="url(#dekhoGrad1)"
          />

          {/* TV Stand */}
          <path d="M38 88 L62 88" stroke="url(#dekhoGrad1)" strokeWidth="3" strokeLinecap="round" />
          <path d="M44 80 L40 88 M56 80 L60 88" stroke="url(#dekhoGrad1)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Live pulsing dot */}
          <circle cx="82" cy="28" r="3.5" fill="#00E676" />
          <circle cx="82" cy="28" r="6" stroke="#00E676" strokeWidth="1.5" opacity="0.5" className="animate-ping" />
        </svg>
      </div>

      {/* Typography: Dekho TV */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
            Dekho
          </span>
          <span className="rounded-lg bg-gradient-to-r from-[#FF2E55] via-[#FF5B22] to-[#FFA800] px-2 py-0.5 text-xs sm:text-sm font-black text-white shadow-md shadow-red-500/25 tracking-wider">
            TV
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">
            Free Live Cable TV
          </span>
        )}
      </div>
    </div>
  );
}
