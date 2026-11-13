'use client';

import React, { useState, useEffect } from 'react';
import { X, Delete, Check, Hash } from 'lucide-react';
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

  const handleDigit = (digit: string) => {
    if (digits.length >= 2) {
      setDigits(digit); // reset on 3rd digit
    } else {
      setDigits((prev) => prev + digit);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-xs rounded-3xl bg-surface border-2 border-surface-border p-5 shadow-2xl flex flex-col items-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-yellow-400" />
            <span className="text-sm font-bold tracking-wider uppercase text-white font-mono">
              Direct Channel Jump
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-surface-muted"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Display Window */}
        <div className="w-full my-4 rounded-2xl bg-black/80 border border-white/10 p-3.5 flex flex-col items-center justify-center min-h-[76px]">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">
            Type Channel Number
          </div>
          <div className="text-3xl font-black font-mono text-yellow-400 tracking-wider">
            CH {digits ? digits.padStart(2, '0') : '__'}
          </div>
          {matchedChannel ? (
            <div className="text-xs font-semibold text-emerald-400 truncate max-w-full mt-1">
              {matchedChannel.name} ({matchedChannel.language})
            </div>
          ) : digits ? (
            <div className="text-xs text-red-400 mt-1">Channel not found</div>
          ) : (
            <div className="text-[11px] text-slate-500 mt-1">e.g. 01 for NDTV, 02 for ABP</div>
          )}
        </div>

        {/* Number Pad Grid (3 x 4) */}
        <div className="grid grid-cols-3 gap-2.5 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              className="h-14 rounded-2xl bg-surface-muted hover:bg-surface-border active:scale-95 text-xl font-bold font-mono text-white transition-all shadow-md border border-surface-border flex items-center justify-center min-w-[48px]"
            >
              {d}
            </button>
          ))}

          {/* Bottom row: Clear, 0, Enter */}
          <button
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 transition-all border border-surface-border flex items-center justify-center min-w-[48px]"
            title="Backspace"
          >
            <Delete className="h-5 w-5" />
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-surface-muted hover:bg-surface-border active:scale-95 text-xl font-bold font-mono text-white transition-all shadow-md border border-surface-border flex items-center justify-center min-w-[48px]"
          >
            0
          </button>

          <button
            disabled={!matchedChannel}
            onClick={handleEnter}
            className={`h-14 rounded-2xl active:scale-95 font-bold transition-all flex items-center justify-center min-w-[48px] ${
              matchedChannel
                ? 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg shadow-yellow-400/30 font-black'
                : 'bg-surface-muted/50 text-slate-600 cursor-not-allowed border border-surface-border/50'
            }`}
            title="Tune Channel"
          >
            <Check className="h-6 w-6 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}

