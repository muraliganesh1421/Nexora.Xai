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
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-[#1a1f2e] bg-[#0b0e17] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-[#1a1f2e]">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Custom geometric brand mark */}
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 p-0.5 shadow-sm group-hover:shadow-indigo-500/20 transition">
              <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#0b0e17]">
                <Sparkles className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold tracking-tight text-white text-base">Nexora</span>
                <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                  .Xai
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium tracking-wide">
                AI LEAD INTELLIGENCE
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            Workspace
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
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/15 text-white border border-indigo-500/30'
                    : 'text-zinc-400 hover:bg-[#121624] hover:text-zinc-200'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? 'text-indigo-400' : 'text-zinc-400'
                  }`}
                />
                <span>{item.label}</span>
                {item.label === 'Find Leads' && (
                  <span className="ml-auto text-[10px] font-medium bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                    Core
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Philosophy & Workflow Pill */}
        <div className="mx-3 mb-3 rounded-lg border border-[#1e2438] bg-[#0f1320] p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300 mb-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Human-in-the-Loop</span>
          </div>
          <div className="text-[10px] text-zinc-400 leading-relaxed font-mono">
            FIND → AI SCORE → REVIEW → CONTACT
          </div>
          <p className="mt-1 text-[10px] text-zinc-500">
            Zero autonomous messaging. Founder approval required for outreach.
          </p>
        </div>

        {/* Bottom Area: System Status & Founder Profile */}
        <div className="border-t border-[#1a1f2e] p-3.5 space-y-3">
          {/* Status Indicator */}
          <Link
            href="/settings"
            className="flex items-center justify-between rounded-md bg-[#121624] px-2.5 py-1.5 text-xs text-zinc-300 hover:bg-[#181d30] border border-[#1e2438] transition"
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  isLiveMode
                    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse'
                    : 'bg-amber-400'
                }`}
              />
              <span className="font-medium text-[11px]">
                {isLiveMode ? 'n8n Workflow 01' : 'Demo Mode'}
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              {isLiveMode ? 'LIVE' : 'DEMO'}
            </span>
          </Link>

          {/* Founder Profile Placeholder */}
          <div className="flex items-center gap-2.5 px-1 py-0.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 text-xs font-semibold text-white">
              FA
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-zinc-200 truncate">
                Agency Founder
              </span>
              <span className="text-[10px] text-zinc-500 truncate">
                Nexora AI Studio
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
