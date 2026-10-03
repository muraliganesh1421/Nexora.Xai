'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Send,
  Mail,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Search,
  Loader2,
  AlertCircle,
  Database,
} from 'lucide-react';
import Sidebar from '@/components/nexora/Sidebar';
import Topbar from '@/components/nexora/Topbar';
import OutreachModal from '@/components/nexora/OutreachModal';
import StatusBadge from '@/components/nexora/StatusBadge';
import LeadScore from '@/components/nexora/LeadScore';
import { fetchCRMLeads, rawLeadToLeadItem } from '@/lib/nexora/api';
import { LeadItem } from '@/types/nexora';

function OutreachContent() {
  const searchParams = useSearchParams();
  const queryLeadId = searchParams.get('leadId');

  const [mobileOpen, setMobileOpen] = useState(false);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);

  const loadLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchCRMLeads();
      if (res.ok && Array.isArray(res.leads)) {
        const liveLeads = res.leads
          .filter((raw) => !String(raw.leadId || '').startsWith('TEST-'))
          .map(rawLeadToLeadItem);

        setLeads(liveLeads);

        // If queryLeadId was provided in URL, auto-select it
        if (queryLeadId) {
          const matched = liveLeads.find((l) => l.id === queryLeadId);
          if (matched) setSelectedLead(matched);
        }
      } else {
        setError(res.error || 'Failed to load leads from CRM.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error connecting to CRM.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [queryLeadId]);

  const readyForReviewLeads = leads.filter(
    (l) => !l.doNotContact && l.outreachStatus.toLowerCase().includes('review')
  );

  const contactedLeads = leads.filter((l) =>
    l.outreachStatus.toLowerCase().includes('contacted')
  );

  return (
    <div className="flex min-h-screen bg-[#030305]">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        isLiveMode={true}
      />

      <div className="flex flex-1 flex-col overflow-y-auto min-w-0">
        <Topbar
          title="Outreach Command"
          description="Human-in-the-loop review and 1-to-1 dispatch workspace"
          onOpenMobile={() => setMobileOpen(true)}
          isLiveMode={true}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Philosophy Banner */}
          <div className="rounded-xl border border-white/[0.08] bg-[#07070b] p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                Mandatory Founder Review Guardrail
              </span>
            </div>
            <h2 className="text-base font-bold text-white font-mono">
              FIND → AI SCORE → REVIEW → CONTACT
            </h2>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              Every draft is personalized by AI and stored in your CRM. Dispatching an Email or WhatsApp message requires explicit human confirmation (confirm=&ldquo;SEND&rdquo;). Bulk sending and automated outreach are strictly prevented.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="rounded-xl border border-white/[0.08] bg-[#07070b] p-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1 font-mono">
                <span>Pending Review</span>
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {isLoading ? '...' : readyForReviewLeads.length}
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">Awaiting founder dispatch</span>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#07070b] p-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1 font-mono">
                <span>Contacted</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {isLoading ? '...' : contactedLeads.length}
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">Live CRM contacted status</span>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#07070b] p-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1 font-mono">
                <span>Total Live CRM Leads</span>
                <Database className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {isLoading ? '...' : leads.length}
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">Syncs via Workflow 03</span>
            </div>
          </div>

          {/* Leads Ready for Review */}
          <div className="rounded-xl border border-white/[0.08] bg-[#07070b] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                  Leads Ready For Outreach Review
                </h3>
                <p className="text-xs text-zinc-400">
                  Select a lead to inspect the AI-generated draft and initiate 1-to-1 outreach.
                </p>
              </div>
              <Link
                href="/leads"
                className="text-xs text-zinc-300 hover:text-white font-medium"
              >
                View all in Leads →
              </Link>
            </div>

            {isLoading && (
              <div className="flex py-12 items-center justify-center gap-2 text-xs text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Loading leads from CRM...</span>
              </div>
            )}

            {!isLoading && error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-4 text-xs text-rose-300">
                {error}
              </div>
            )}

            {!isLoading && !error && readyForReviewLeads.length === 0 && (
              <div className="rounded-lg border border-dashed border-white/[0.08] bg-[#0c0c12] p-6 text-center text-xs text-zinc-400">
                No leads currently pending review. Run a search in{' '}
                <Link href="/find" className="text-white underline">
                  Find Leads
                </Link>{' '}
                to discover fresh opportunities.
              </div>
            )}

            {!isLoading && !error && readyForReviewLeads.length > 0 && (
              <div className="divide-y divide-white/[0.06]">
                {readyForReviewLeads.slice(0, 10).map((lead) => (
                  <div
                    key={lead.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 transition hover:bg-white/[0.03] rounded-lg px-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          {lead.businessName}
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">
                          ({lead.category} • {lead.city})
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                        <span>Email: {lead.hasEmail ? 'Available' : 'Unavailable'}</span>
                        <span>•</span>
                        <span>
                          WhatsApp:{' '}
                          {lead.hasPhone
                            ? lead.whatsappConsent
                              ? 'Consented'
                              : 'No Consent'
                            : 'No Phone'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <LeadScore score={lead.score} size="sm" />
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-white hover:bg-white/15 transition shadow-sm"
                      >
                        <Send className="h-3 w-3" />
                        <span>Prepare Outreach</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outreach Modal */}
          <OutreachModal
            lead={selectedLead}
            isOpen={Boolean(selectedLead)}
            onClose={() => setSelectedLead(null)}
            onSuccessRefresh={loadLeads}
          />
        </main>
      </div>
    </div>
  );
}

export default function OutreachPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#08090d] text-xs text-zinc-500">
          Loading workspace...
        </div>
      }
    >
      <OutreachContent />
    </Suspense>
  );
}
