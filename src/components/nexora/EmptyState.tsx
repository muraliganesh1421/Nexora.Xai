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
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-[#22273d] bg-[#0c0e18] p-8 text-center">
      <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#262c45] bg-[#121626] text-indigo-400">
        <Icon className="h-6 w-6" />
      </div>

      {badge && (
        <div className="mb-2">
          <span className="rounded-full border border-indigo-500/30 bg-indigo-950/30 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-indigo-300">
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
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[#2a314d] bg-[#161a2c] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#1f253e]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
