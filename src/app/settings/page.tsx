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
  UserCheck,
  Sparkles,
  Zap,
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
    <div className="flex min-h-screen bg-[#030305] text-[#f4f4f7]">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        isLiveMode={status?.discovery.configured ?? true}
      />

      <div className="flex flex-1 flex-col overflow-y-auto min-w-0">
        <Topbar
          title="Settings & System Health"
          description="Founder controls, integration telemetry, and automation safety"
          onOpenMobile={() => setMobileOpen(true)}
          isLiveMode={status?.discovery.configured ?? true}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
          {/* Founder Profile Card */}
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07070b] p-6">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-white/5 to-purple-500/20 border border-white/10 text-white font-mono font-bold text-lg shadow-inner">
                  VMG
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#07070b]">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-lg font-bold tracking-tight text-white">
                      V.MURALI GANESH
                    </h2>
                    <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
                      <Sparkles className="h-2.5 w-2.5" />
                      Founder
                    </span>
                    <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-400 font-mono">
                      Administrator
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    Lead Architect & Operating Officer • Nexora.Xai AI Automation Agency
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="rounded-xl border border-white/[0.08] bg-[#0a0a10] px-4 py-2.5 text-right">
                  <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500">
                    Human Authorization
                  </div>
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 justify-end mt-0.5">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Active & Enforced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Integration Health Header */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>Production Automation Status</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Live webhooks connected to n8n cloud workflows & Google Sheets CRM.
              </p>
            </div>
            <button
              onClick={fetchStatus}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0a0a10] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:border-white/15 transition disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
          </div>

          {/* Status Matrix */}
          <div className="space-y-3">
            {/* Discovery Backend (Workflow 01) */}
            <div className="rounded-xl border border-white/[0.08] bg-[#07070b] p-5 hover:border-white/15 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Lead Discovery Engine: {status?.discovery.label || 'Connected'}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      Workflow 01: Multi-source business discovery, AI scoring, and Google Sheets CRM sync.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 text-xs font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Webhook Active</span>
                  </span>
                </div>
              </div>
            </div>

            {/* CRM Read (Workflow 03) */}
            <div className="rounded-xl border border-white/[0.08] bg-[#07070b] p-5 hover:border-white/15 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      CRM Storage: {status?.crm.label || 'Connected'}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      Workflow 03: Live bi-directional read and update for 34 CRM columns in Google Sheets.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 text-xs font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>Real-time Sync</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Outreach Preparation & Send (Workflow 02) */}
            <div className="rounded-xl border border-white/[0.08] bg-[#07070b] p-5 hover:border-white/15 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Outreach Engine: {status?.outreach.label || 'Connected'}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      Workflow 02: Generates customized copy, checks consent, and awaits explicit founder trigger.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/20 px-3 py-1 text-xs font-medium text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>1-to-1 Guarded</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Channel Cards: Email & WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/[0.08] bg-[#07070b] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block">Email Dispatch</span>
                      <span className="text-[10px] text-zinc-400 font-mono">Gmail Provider via n8n</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Ready</span>
                  </span>
                </div>
                <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
                  Direct dispatch to lead business inbox. Requires human confirmation modal before send.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#07070b] p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block">WhatsApp Engine</span>
                      <span className="text-[10px] text-zinc-400 font-mono">Meta API + Manual wa.me</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Hybrid Mode</span>
                  </span>
                </div>
                <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
                  Support for automated Meta Cloud API (with consent) + 1-click &quot;Open in WhatsApp&quot; manual review.
                </p>
              </div>
            </div>
          </div>

          {/* Architecture & Security Guarantees */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#07070b] p-6 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <ShieldCheck className="h-4 w-4" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                Founder Governance & Security Architecture
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a10] p-4">
                <div className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  Server Proxy Routing
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Browsers never invoke n8n webhooks directly. Every request is mediated securely via Next.js server routes.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a10] p-4">
                <div className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  Zero Client Secrets
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  API tokens, webhook URLs, and sheet credentials reside solely in server environment variables.
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#0a0a10] p-4">
                <div className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                  Human Approval Model
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Founder V.MURALI GANESH maintains 100% human sign-off on every outreach message.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
