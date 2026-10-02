import React from 'react';
import { Sparkles } from 'lucide-react';

interface LeadScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export default function LeadScore({
  score,
  size = 'md',
  showLabel = true,
}: LeadScoreProps) {
  // 80–100 High, 55–79 Medium, 0–54 Low
  let tier: 'High' | 'Medium' | 'Low' = 'Low';
  let badgeColor = 'text-zinc-400 bg-zinc-800/40 border-zinc-700/60';
  let progressColor = 'bg-zinc-500';

  if (score >= 80) {
    tier = 'High';
    badgeColor = 'text-emerald-300 bg-emerald-950/40 border-emerald-500/30';
    progressColor = 'bg-emerald-400';
  } else if (score >= 55) {
    tier = 'Medium';
    badgeColor = 'text-amber-300 bg-amber-950/40 border-amber-500/30';
    progressColor = 'bg-amber-400';
  } else {
    tier = 'Low';
    badgeColor = 'text-zinc-400 bg-zinc-900 border-zinc-800';
    progressColor = 'bg-zinc-600';
  }

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-mono font-medium ${badgeColor}`}>
        <Sparkles className="h-3 w-3" />
        <span>{score}</span>
        {showLabel && <span className="text-[10px] opacity-80">({tier})</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <div className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-xs font-medium ${badgeColor}`}>
          <Sparkles className="h-3 w-3" />
          <span>{score} / 100</span>
        </div>
        {showLabel && (
          <span className="text-[11px] font-medium text-zinc-400">
            {tier} Potential
          </span>
        )}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
          style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}
