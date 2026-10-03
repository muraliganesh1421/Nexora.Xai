'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Users,
  Send,
  Settings,
  Sparkles,
  ShieldCheck,
  X,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  isLiveMode?: boolean;
}

export default function Sidebar({
  mobileOpen = false,
  onCloseMobile,
  isLiveMode = true,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Find Leads', href: '/find', icon: Search },
    { label: 'Leads', href: '/leads', icon: Users },
    { label: 'Outreach', href: '/outreach', icon: Send },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-white/[0.08] bg-[#07070a] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-white/[0.08] bg-[#07070a]">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Space Brand Mark */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-white/15 p-0.5 shadow-sm group-hover:border-white/30 transition">
              <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#030305]">
                <Sparkles className="h-4 w-4 text-zinc-200 group-hover:text-indigo-300 transition" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold tracking-tight text-white text-base">Nexora</span>
                <span className="text-[11px] font-mono font-medium text-zinc-300 bg-white/[0.06] px-1.5 py-0.5 rounded border border-white/10">
                  .Xai
                </span>
              </div>
              <span className="text-[9px] text-zinc-500 font-mono tracking-wider uppercase">
                AI Lead Intelligence
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-md p-1.5 text-zinc-400 hover:bg-white/[0.06] hover:text-white lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
            Control Center
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-white/[0.08] text-white border border-white/15 shadow-sm'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-indigo-300' : 'text-zinc-400'
                  }`}
                />
                <span>{item.label}</span>
                {item.label === 'Find Leads' && (
                  <span className="ml-auto text-[9px] font-mono font-medium bg-indigo-500/15 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">
                    Search
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Philosophy & Workflow Pill */}
        <div className="mx-3 mb-3 rounded-xl border border-white/[0.08] bg-[#0c0c12] p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-200 mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Human-in-the-Loop</span>
          </div>
          <div className="text-[10px] text-zinc-400 leading-relaxed font-mono">
            FIND → AI SCORE → REVIEW → CONTACT
          </div>
          <p className="mt-1 text-[10px] text-zinc-500 leading-relaxed">
            Zero automated messaging. Founder approval required for outreach.
          </p>
        </div>

        {/* Bottom Area: System Status & Founder Profile */}
        <div className="border-t border-white/[0.08] p-3 space-y-2.5 bg-[#060609]">
          {/* Status Indicator */}
          <Link
            href="/settings"
            className="flex items-center justify-between rounded-lg bg-[#0c0c12] px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-[#12121c] border border-white/[0.06] transition"
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isLiveMode
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
              <span className="font-medium text-[11px] text-zinc-300">
                {isLiveMode ? 'n8n Cloud Engine' : 'Demo Mode'}
              </span>
            </div>
            <span className="text-[9px] text-emerald-400 font-mono">
              {isLiveMode ? 'LIVE' : 'DEMO'}
            </span>
          </Link>

          {/* Founder Profile - V.MURALI GANESH */}
          <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-[#0c0c12] px-2.5 py-2">
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-white/10 text-xs font-bold text-white shadow-inner font-mono">
              <span>MG</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-black" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-white tracking-tight truncate">
                  V.MURALI GANESH
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-mono font-medium text-indigo-300 bg-indigo-950/60 px-1 py-0.2 rounded border border-indigo-500/30">
                  Founder
                </span>
                <span className="text-[10px] text-zinc-500 truncate">
                  Nexora.Xai
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
