'use client';

import { useState } from 'react';
import Sidebar from '@/components/nexora/Sidebar';
import Topbar from '@/components/nexora/Topbar';
import DiscoveryForm from '@/components/nexora/DiscoveryForm';
import { ShieldCheck, Info, Sparkles } from 'lucide-react';

export default function FindLeadsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#030305]">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        isLiveMode={true}
      />

      <div className="flex flex-1 flex-col overflow-y-auto min-w-0">
        <Topbar
          title="Find Leads Engine"
          description="Discover local businesses, filter duplicates, and qualify high-value clients"
          onOpenMobile={() => setMobileOpen(true)}
          isLiveMode={true}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Safety & Philosophy Callout */}
          <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#07070b] p-4">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-zinc-300">
              <span className="font-semibold text-white">
                Human-in-the-Loop Discovery Engine:
              </span>{' '}
              Running a search discovers businesses, removes CRM duplicates, AI-scores digital presence, and writes qualified prospects to your CRM.
              <span className="font-medium text-emerald-300">
                {' '}Zero messages are sent during discovery.
              </span>
            </div>
          </div>

          {/* Main Discovery Panel */}
          <DiscoveryForm />

          {/* Architecture Context */}
          <div className="rounded-xl border border-white/[0.08] bg-[#07070b] p-5">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              Discovery Engine Architecture
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-zinc-400">
              <div className="rounded-lg border border-white/[0.08] bg-[#0b0b12] p-3.5">
                <span className="font-mono text-[10px] text-zinc-400 block mb-1">STAGE 1</span>
                <span className="font-medium text-white block">OSM / Nominatim</span>
                <span className="text-[11px] text-zinc-500 mt-1 block">Geo-located business search via OpenStreetMap nodes</span>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-[#0b0b12] p-3.5">
                <span className="font-mono text-[10px] text-zinc-400 block mb-1">STAGE 2</span>
                <span className="font-medium text-white block">CRM Deduplication</span>
                <span className="text-[11px] text-zinc-500 mt-1 block">Checks against existing Google Sheets entries</span>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-[#0b0b12] p-3.5">
                <span className="font-mono text-[10px] text-amber-400 block mb-1">STAGE 3</span>
                <span className="font-medium text-white block">AI Qualification</span>
                <span className="text-[11px] text-zinc-500 mt-1 block">Scores digital maturity & automation opportunity</span>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-[#0b0b12] p-3.5">
                <span className="font-mono text-[10px] text-emerald-400 block mb-1">STAGE 4</span>
                <span className="font-medium text-white block">Google Sheets CRM</span>
                <span className="text-[11px] text-zinc-500 mt-1 block">Appends records across 34 structured columns</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
