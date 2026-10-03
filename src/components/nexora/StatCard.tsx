import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value?: string | number;
  subtext?: string;
  icon: LucideIcon;
  isNotConnected?: boolean;
  statusNote?: string;
}

export default function StatCard({
  label,
  value = '—',
  subtext,
  icon: Icon,
  isNotConnected = true,
  statusNote = 'CRM read endpoint pending',
}: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#07070b] p-5 transition hover:border-white/20">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
          {label}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-[#0d0d14] text-zinc-400">
          <Icon className="h-4 w-4 text-zinc-200" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-white font-mono">
          {isNotConnected ? '—' : value}
        </span>
        {isNotConnected && (
          <span className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
            Pending
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <span>{subtext || (isNotConnected ? statusNote : 'Live count')}</span>
      </div>
    </div>
  );
}
