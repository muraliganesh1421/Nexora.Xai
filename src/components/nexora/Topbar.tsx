'use client';

import { Menu, Activity, Shield } from 'lucide-react';

interface TopbarProps {
  title: string;
  description: string;
  onOpenMobile?: () => void;
  isLiveMode?: boolean;
}

export default function Topbar({
  title,
  description,
  onOpenMobile,
  isLiveMode = true,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-white/[0.08] bg-[#030305]/85 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0c0c12] text-zinc-400 hover:text-white lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold tracking-tight text-white sm:text-base">
              {title}
            </h1>
          </div>
          <p className="hidden text-xs text-zinc-400 sm:block">
            {description}
          </p>
        </div>
      </div>

      {/* Backend Status & Founder Tag */}
      <div className="flex items-center gap-2.5">
        {/* Founder Pill */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#0a0a0f] px-3 py-1 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          <span className="text-zinc-200 font-medium tracking-tight">V.MURALI GANESH</span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase">Founder</span>
        </div>

        {/* Human approval safety indicator */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-[#0a0a0f] px-2.5 py-1 text-[11px] text-zinc-400">
          <Shield className="h-3 w-3 text-indigo-400" />
          <span>Manual Approval</span>
        </div>

        {/* Live n8n status */}
        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
            isLiveMode
              ? 'border-emerald-500/25 bg-emerald-950/20 text-emerald-300'
              : 'border-amber-500/25 bg-amber-950/20 text-amber-300'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isLiveMode ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-[11px] font-mono">
            {isLiveMode ? 'n8n Live' : 'Demo Mode'}
          </span>
        </div>
      </div>
    </header>
  );
}
