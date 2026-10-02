'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Sparkles,
  Clock,
  Send,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Database,
  Layers,
  Flame,
  Loader2,
} from 'lucide-react';
import Sidebar from '@/components/nexora/Sidebar';
import Topbar from '@/components/nexora/Topbar';
import StatCard from '@/components/nexora/StatCard';
import DiscoveryForm from '@/components/nexora/DiscoveryForm';
import { fetchCRMLeads, rawLeadToLeadItem } from '@/lib/nexora/api';
import { LeadItem } from '@/types/nexora';

export default function DashboardPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showQuickDiscovery, setShowQuickDiscovery] = useState(false);

  // Real CRM telemetry state
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  useEffect(() => {
    async function getStats() {
      try {
        const res = await fetchCRMLeads();
        if (res.ok && Array.isArray(res.leads)) {
          // Hide TEST-* rows in normal UI
          const liveLeads = res.leads
            .filter((raw) => !String(raw.leadId || '').startsWith('TEST-'))
            .map(rawLeadToLeadItem);

          setLeads(liveLeads);
        }
      } catch (err: unknown) {
        console.error('Failed to load CRM stats for dashboard:', err);
      } finally {
        setIsLoadingLeads(false);
      }
    }

    getStats();
  }, []);

  // Compute live metrics from real CRM data
  const totalLeads = leads.length;

  const newLeads = leads.filter(
    (l) =>
      l.outreachStatus.toLowerCase().includes('ready') ||
      l.status.toLowerCase().includes('new') ||
      l.outreachStatus.toLowerCase().includes('review')
  ).length;

  const contactedCount = leads.filter(
    (l) =>
      l.outreachStatus.toLowerCase().includes('contacted') ||
      l.outreachStatus.toLowerCase().includes('sent')
  ).length;

  const interestedCount = leads.filter(
    (l) =>
      l.status.toLowerCase().includes('interested') ||
      (l.interestLevel && l.interestLevel.toLowerCase().includes('high')) ||
      l.score >= 80
  ).length;

  const pipelineStages = [
    { name: 'Discovered', count: isLoadingLeads ? '...' : totalLeads, desc: 'Discovered by n8n OSM engine' },
    { name: 'Review', count: isLoadingLeads ? '...' : newLeads, desc: 'AI qualified & pending founder review' },
    { name: 'Contacted', count: isLoadingLeads ? '...' : contactedCount, desc: 'Explicit founder dispatches' },
    { name: 'Interested', count: isLoadingLeads ? '...' : interestedCount, desc: 'High potential / engaged prospects' },
    { name: 'Closed', count: '0', desc: 'Won agency retainer' },
  ];

  return (
    <div className="flex min-h-screen bg-[#08090d]">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        isLiveMode={true}
      />

      <div className="flex flex-1 flex-col overflow-y-auto min-w-0">
        <Topbar
          title="Nexora.Xai"
          description="AI Lead Intelligence & Outreach System"
          onOpenMobile={() => setMobileOpen(true)}
          isLiveMode={true}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Hero Greeting & Philosophy */}
          <div className="relative overflow-hidden rounded-2xl border border-[#1e2334] bg-gradient-to-r from-[#0c0f1d] via-[#101424] to-[#0c0f1d] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-indigo-600/10 blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-950/40 px-3 py-1 text-xs font-medium text-indigo-300 mb-3">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Find. Qualify. Connect.</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Good morning, Founder
                </h1>
                <p className="mt-1 text-sm text-zinc-300 font-medium">
                  Find and qualify your next customers.
                </p>
                <p className="mt-2 text-xs text-zinc-400 max-w-xl leading-relaxed">
                  Discover businesses, identify strong opportunities, and manage outreach from one focused workspace with human oversight on every communication.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/find"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:from-indigo-500 hover:to-cyan-500"
                >
                  <Search className="h-4 w-4" />
                  <span>Find New Leads</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                </Link>
                <button
                  onClick={() => setShowQuickDiscovery(!showQuickDiscovery)}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#23293e] bg-[#121626] px-4 py-3 text-xs font-medium text-zinc-300 transition hover:bg-[#1a1f33]"
                >
                  <span>{showQuickDiscovery ? 'Hide Search' : 'Quick Search'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Inline Discovery Form (Collapsible) */}
          {showQuickDiscovery && (
            <div>
              <DiscoveryForm />
            </div>
          )}

          {/* Key Metrics / Stats (Live from Workflow 03 CRM data) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                  Live Lead Metrics
                </h2>
                <p className="text-xs text-zinc-500">
                  Derived live from Google Sheets CRM via Workflow 03.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                  CRM Synced
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Leads"
                value={isLoadingLeads ? '...' : totalLeads}
                icon={Users}
                isNotConnected={false}
                subtext="Total qualified in CRM"
              />
              <StatCard
                label="New / Pending Review"
                value={isLoadingLeads ? '...' : newLeads}
                icon={Clock}
                isNotConnected={false}
                subtext="Awaiting outreach review"
              />
              <StatCard
                label="Contacted"
                value={isLoadingLeads ? '...' : contactedCount}
                icon={Send}
                isNotConnected={false}
                subtext="Explicit founder dispatches"
              />
              <StatCard
                label="High Potential / Interested"
                value={isLoadingLeads ? '...' : interestedCount}
                icon={Flame}
                isNotConnected={false}
                subtext="Score ≥ 80 or interested"
              />
            </div>
          </div>

          {/* Pipeline Visualization */}
          <div className="rounded-2xl border border-[#1e2334] bg-[#0e111a] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
                  Lead Pipeline Flow
                </h3>
                <p className="text-xs text-zinc-400">
                  Strict human-in-the-loop progression from discovery to contract.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Zero Automated Contact</span>
              </div>
            </div>

            {/* Pipeline Stage Blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {pipelineStages.map((stage, idx) => (
                <div
                  key={stage.name}
                  className="relative flex flex-col justify-between rounded-xl border border-[#1c2236] bg-[#121626] p-4 transition hover:border-[#2a324e]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-zinc-200">
                        {stage.name}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        0{idx + 1}
                      </span>
                    </div>
                    <div className="text-xl font-bold font-mono text-white">
                      {stage.count}
                    </div>
                  </div>
                  <p className="mt-3 text-[11px] text-zinc-500 leading-tight">
                    {stage.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#1c2236] pt-4 text-[11px] text-zinc-500">
              <span>Pipeline model: Discovered → Review → Contacted → Interested → Closed</span>
              <span className="font-mono text-emerald-400">Workflow 01 & 03 Active</span>
            </div>
          </div>

          {/* Quick Actions / Integration Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Find Leads Card */}
            <div className="rounded-xl border border-[#1e2334] bg-[#0e111a] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Search className="h-4 w-4" />
                  <span>Lead Discovery</span>
                </div>
                <h4 className="text-base font-semibold text-white">
                  Discover Targeted Businesses
                </h4>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Query businesses by industry and city. Nexora filters duplicates and scores prospect suitability using AI.
                </p>
              </div>
              <div className="mt-5">
                <Link
                  href="/find"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-500"
                >
                  <span>Open Discovery Engine</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* CRM Records Card */}
            <div className="rounded-xl border border-[#1e2334] bg-[#0e111a] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Database className="h-4 w-4" />
                  <span>CRM Storage</span>
                </div>
                <h4 className="text-base font-semibold text-white">
                  Inspect Live Leads ({isLoadingLeads ? '...' : totalLeads})
                </h4>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  View full details, AI scores, phone/email availability, and prepare 1-to-1 outreach for qualified prospects.
                </p>
              </div>
              <div className="mt-5 flex items-center gap-3">
                <Link
                  href="/leads"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#242b42] bg-[#121626] px-4 py-2 text-xs font-medium text-zinc-300 transition hover:bg-[#181d30]"
                >
                  <span>Open Leads CRM</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
