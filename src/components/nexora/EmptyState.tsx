import React from 'react';
import { LucideIcon, Database } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  badge?: string;
}

export default function EmptyState({
  icon: Icon = Database,
  title,
  description,
  actionText,
  onAction,
  badge,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#07070b] p-8 text-center">
      <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#0c0c14] text-zinc-300">
        <Icon className="h-6 w-6" />
      </div>

      {badge && (
        <div className="mb-2">
          <span className="rounded-full border border-indigo-500/30 bg-indigo-950/30 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-indigo-300 font-mono">
            {badge}
          </span>
        </div>
      )}

      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-zinc-400">
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 hover:border-white/25"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
