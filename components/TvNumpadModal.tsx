'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Delete, Check, Hash, Tv } from 'lucide-react';
import { Channel } from '@/types/channel';

interface TvNumpadModalProps {
  isOpen: boolean;
  onClose: () => void;
  channels: Channel[];
  onSelectChannel: (channel: Channel) => void;
}

export default function TvNumpadModal({
  isOpen,
  onClose,
  channels,
  onSelectChannel,
}: TvNumpadModalProps) {
  const [digits, setDigits] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setDigits('');
    }
  }, [isOpen]);

  const handleDigit = (digit: string) => {
    if (digits.length >= 2) {
      setDigits(digit); // start new number on 3rd digit
    } else {
      const next = digits + digit;
      setDigits(next);

      // Auto-jump if 2 digits match a valid channel
      if (next.length === 2) {
        const num = parseInt(next, 10);
        const match = channels.find((c) => c.chNumber === num);
        if (match) {
          setTimeout(() => {
            onSelectChannel(match);
            onClose();
          }, 350);
        }
      }
    }
  };

  const handleBackspace = () => {
    setDigits((prev) => prev.slice(0, -1));
  };

  const currentNum = parseInt(digits, 10);
  const matchedChannel = !isNaN(currentNum)
    ? channels.find((c) => c.chNumber === currentNum)
    : null;

  const handleEnter = () => {
    if (matchedChannel) {
      onSelectChannel(matchedChannel);
      onClose();
    }
  };

  // Keyboard number listener when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleEnter();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-xs rounded-3xl bg-slate-950/95 border border-white/10 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col items-center ring-1 ring-white/10">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Tv className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-black tracking-wider uppercase text-white font-mono">
              Channel Remote Jump
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/[0.1] transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Display Window */}
        <div className="w-full my-4 rounded-2xl bg-black/90 border border-white/10 p-3 flex flex-col items-center justify-center min-h-[82px] shadow-inner">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            TUNE CHANNEL
          </div>
          <div className="flex items-center gap-1 my-1">
            <span className="text-2xl font-black text-amber-400 font-mono">
              CH {digits ? digits.padStart(2, '0') : '--'}
            </span>
          </div>
          {matchedChannel ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold truncate max-w-[200px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">{matchedChannel.name}</span>
            </div>
          ) : digits ? (
            <span className="text-[11px] text-slate-400">No channel #{digits}</span>
          ) : (
            <span className="text-[11px] text-slate-400">Type 01 to 47</span>
          )}
        </div>

        {/* Numpad Keypad (0-9) */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-12 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] active:scale-95 border border-white/[0.06] hover:border-amber-400/40 text-lg font-black text-white font-mono shadow-md transition-all flex items-center justify-center min-h-[44px]"
            >
              {digit}
            </button>
          ))}

          {/* Backspace */}
          <button
            onClick={handleBackspace}
            className="h-12 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] active:scale-95 border border-white/[0.06] text-slate-400 hover:text-white transition-all flex items-center justify-center min-h-[44px]"
            title="Backspace"
          >
            <Delete className="h-5 w-5" />
          </button>

          {/* 0 */}
          <button
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-white/[0.04] hover:bg-white/[0.1] active:scale-95 border border-white/[0.06] hover:border-amber-400/40 text-lg font-black text-white font-mono shadow-md transition-all flex items-center justify-center min-h-[44px]"
          >
            0
          </button>

          {/* Enter / Tune */}
          <button
            onClick={handleEnter}
            disabled={!matchedChannel}
            className={`h-12 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center min-h-[44px] ${
              matchedChannel
                ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-lg shadow-amber-400/30 active:scale-95'
                : 'bg-white/[0.02] border border-white/[0.04] text-slate-400 cursor-not-allowed'
            }`}
          >
            <Check className="h-5 w-5 stroke-[3]" />
          </button>
        </div>

        {/* Footer Hint */}
        <p className="mt-3 text-[10px] text-slate-400 text-center font-mono">
          Press 0-9 on keyboard or tap above to tune
        </p>
      </div>
    </div>
  );
}
