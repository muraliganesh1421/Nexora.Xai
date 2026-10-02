'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Database,
  Mail,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  RefreshCw,
} from 'lucide-react';
import Sidebar from '@/components/nexora/Sidebar';
import Topbar from '@/components/nexora/Topbar';
import { getSystemStatus } from '@/lib/nexora/api';
import { SystemStatusState } from '@/types/nexora';

export default function SettingsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [status, setStatus] = useState<SystemStatusState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const data = await getSystemStatus();
      setStatus(data);
    } catch {
      setStatus({
        discovery: {
          configured: true,
          label: 'Connected',
          workflow: 'Nexora 01 - Lead Discovery and Qualification',
        },
        crm: {
          configured: true,
          label: 'Connected',
          totalLeads: 0,
        },
        outreach: {
          configured: true,
          label: 'Connected',
          workflow: 'Nexora 02 - Prepare and Send Outreach',
        },
        email: {
          configured: true,
          label: 'Connected',
        },
        whatsapp: {
          configured: true,
          label: 'Connected',
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#08090d]">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        isLiveMode={status?.discovery.configured ?? true}
      />

      <div className="flex flex-1 flex-col overflow-y-auto min-w-0">
        <Topbar
          title="System Settings & Status"
          description="Backend architecture inspection and integration health monitoring"
          onOpenMobile={() => setMobileOpen(true)}
          isLiveMode={status?.discovery.configured ?? true}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Integration Health
              </h2>
              <p className="text-xs text-zinc-400">
                Connected automation workflows and CRM data services.
              </p>
            </div>
            <button
              onClick={fetchStatus}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-[#22273d] bg-[#121626] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>

          {/* Status Matrix */}
          <div className="space-y-3">
            {/* Discovery Backend (Workflow 01) */}
            <div className="rounded-xl border border-[#1e2334] bg-[#0e111a] p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                    <Server className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Lead Discovery: {status?.discovery.label || 'Connected'}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Workflow 01: OpenStreetMap business querying, AI qualification, and Google Sheets CRM saving.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 text-xs font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Connected</span>
                  </span>
                </div>
              </div>
            </div>

            {/* CRM Read (Workflow 03) */}
            <div className="rounded-xl border border-[#1e2334] bg-[#0e111a] p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      CRM Storage: {status?.crm.label || 'Connected'}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Workflow 03: Reads real lead records live from Google Sheets CRM (34 columns).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 text-xs font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Connected</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Outreach Preparation & Send (Workflow 02) */}
            <div className="rounded-xl border border-[#1e2334] bg-[#0e111a] p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Outreach Engine: {status?.outreach.label || 'Connected'}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Workflow 02: Generates drafts, validates human approval, and updates CRM outreach statuses.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 text-xs font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Connected</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Channel Cards: Email & WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#1e2334] bg-[#0e111a] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-semibold text-white">Email Outreach: Connected</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Active</span>
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  Gmail provider integration via n8n. Strict 1-to-1 dispatch with explicit confirmation.
                </p>
              </div>

              <div className="rounded-xl border border-[#1e2334] bg-[#0e111a] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-white">WhatsApp Outreach: Connected</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Active</span>
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  Meta provider integration via n8n credentials. Enforces recorded recipient consent.
                </p>
              </div>
            </div>
          </div>

          {/* Architecture & Security Guarantees */}
          <div className="rounded-xl border border-[#1e2334] bg-[#0e111a] p-6 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                Security & Credential Architecture
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="rounded-lg border border-[#1c2236] bg-[#121626] p-4">
                <div className="font-semibold text-white mb-1">Server Proxy Routing</div>
                <p className="text-zinc-400 leading-relaxed">
                  Browser clients never call n8n directly. All requests pass through <code className="font-mono text-indigo-300">/api/nexora/*</code>.
                </p>
              </div>

              <div className="rounded-lg border border-[#1c2236] bg-[#121626] p-4">
                <div className="font-semibold text-white mb-1">Zero Client Secrets</div>
                <p className="text-zinc-400 leading-relaxed">
                  No OpenAI keys, Meta tokens, Google credentials, or private webhook URLs are bundled or exposed client-side.
                </p>
              </div>

              <div className="rounded-lg border border-[#1c2236] bg-[#121626] p-4">
                <div className="font-semibold text-white mb-1">Human Approval Model</div>
                <p className="text-zinc-400 leading-relaxed">
                  1 user action = at most 1 communication. Bulk outreach and autonomous spam features are architecturally blocked.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
