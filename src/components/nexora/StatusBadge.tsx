import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'lead' | 'outreach' | 'consent';
}

export default function StatusBadge({ status, type = 'lead' }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase().trim();

  let style = 'border-zinc-700 bg-zinc-800/40 text-zinc-300';

  if (normalized.includes('contacted') || normalized.includes('sent') || normalized === 'high') {
    style = 'border-emerald-500/30 bg-emerald-950/30 text-emerald-300';
  } else if (
    normalized.includes('ready') ||
    normalized.includes('review') ||
    normalized === 'medium' ||
    normalized.includes('interested')
  ) {
    style = 'border-indigo-500/30 bg-indigo-950/30 text-indigo-300';
  } else if (normalized.includes('pending') || normalized.includes('follow') || normalized === 'low') {
    style = 'border-amber-500/30 bg-amber-950/30 text-amber-300';
  } else if (normalized.includes('do not') || normalized.includes('failed') || normalized.includes('opted')) {
    style = 'border-rose-500/30 bg-rose-950/30 text-rose-300';
  } else if (normalized.includes('below') || normalized.includes('threshold') || normalized.includes('none')) {
    style = 'border-zinc-800 bg-zinc-900/60 text-zinc-400';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75" />
      {status || 'Unknown'}
    </span>
  );
}
