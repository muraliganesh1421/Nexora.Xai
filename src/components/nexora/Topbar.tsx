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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#1a1f2e] bg-[#08090d]/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        {onOpenMobile && (
          <button
            onClick={onOpenMobile}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1e2438] bg-[#0f1320] text-zinc-400 hover:text-white lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold tracking-tight text-white sm:text-lg">
              {title}
            </h1>
          </div>
          <p className="hidden text-xs text-zinc-400 sm:block">
            {description}
          </p>
        </div>
      </div>

      {/* Backend & Security Status Indicator */}
      <div className="flex items-center gap-2.5">
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-zinc-800 bg-[#0e111a] px-2.5 py-1 text-[11px] text-zinc-400">
          <Shield className="h-3 w-3 text-indigo-400" />
          <span>Manual Approval Required</span>
        </div>

        <div
          className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
            isLiveMode
              ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
              : 'border-amber-500/30 bg-amber-950/20 text-amber-300'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isLiveMode ? 'bg-emerald-400' : 'bg-amber-400'
            }`}
          />
          <span className="text-[11px]">
            {isLiveMode ? 'n8n Connected' : 'Demo Mode'}
          </span>
        </div>
      </div>
    </header>
  );
}
