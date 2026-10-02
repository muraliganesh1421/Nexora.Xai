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
    <div className="relative overflow-hidden rounded-xl border border-[#1e2334] bg-[#0e111a] p-5 transition hover:border-[#2d344d]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">
          {label}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#22273d] bg-[#141824] text-zinc-400">
          <Icon className="h-4 w-4 text-indigo-400" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-white font-mono">
          {isNotConnected ? '—' : value}
        </span>
        {isNotConnected && (
          <span className="rounded bg-zinc-800/60 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
            Pending
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-zinc-500">
        <span>{subtext || (isNotConnected ? statusNote : 'Live count')}</span>
      </div>
    </div>
  );
}
