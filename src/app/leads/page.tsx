'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Database,
  Search,
  RefreshCw,
  Table as TableIcon,
  LayoutGrid,
  AlertCircle,
  Loader2,
  Filter,
} from 'lucide-react';
import Sidebar from '@/components/nexora/Sidebar';
import Topbar from '@/components/nexora/Topbar';
import EmptyState from '@/components/nexora/EmptyState';
import LeadTable from '@/components/nexora/LeadTable';
import LeadCard from '@/components/nexora/LeadCard';
import OutreachModal from '@/components/nexora/OutreachModal';
import { fetchCRMLeads, rawLeadToLeadItem } from '@/lib/nexora/api';
import { LeadItem } from '@/types/nexora';

export default function LeadsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeadForOutreach, setSelectedLeadForOutreach] = useState<LeadItem | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchCRMLeads();
      if (res.ok && Array.isArray(res.leads)) {
        // Filter out TEST-* leads for normal production UI
        const productionLeads = res.leads
          .filter((raw) => !String(raw.leadId || '').startsWith('TEST-'))
          .map(rawLeadToLeadItem);

        setLeads(productionLeads);
      } else {
        setError(res.error || 'Failed to load leads from CRM.');
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not connect to CRM read service. Please verify your connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Filtered leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchQuery === '' ||
      lead.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      lead.status.toLowerCase() === statusFilter.toLowerCase() ||
      lead.outreachStatus.toLowerCase().includes(statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-[#08090d]">
      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        isLiveMode={true}
      />

      <div className="flex flex-1 flex-col overflow-y-auto min-w-0">
        <Topbar
          title="Leads Intelligence"
          description="Live prospective businesses scored and managed in your Google Sheets CRM"
          onOpenMobile={() => setMobileOpen(true)}
          isLiveMode={true}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white">
                  CRM Lead Records
                </h2>
                {!isLoading && (
                  <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-xs font-mono text-indigo-300">
                    {leads.length} live
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400">
                Connected directly to Google Sheets CRM via n8n Workflow 03.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Refresh Action */}
              <button
                onClick={loadLeads}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#22273d] bg-[#121626] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh CRM</span>
              </button>

              {/* View Switcher */}
              <div className="flex items-center rounded-lg border border-[#22273d] bg-[#121626] p-0.5">
                <button
                  onClick={() => setViewMode('table')}
                  className={`rounded-md p-1.5 text-xs transition ${
                    viewMode === 'table'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Table View"
                >
                  <TableIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`rounded-md p-1.5 text-xs transition ${
                    viewMode === 'cards'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Card Grid View"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>

              {/* Find Leads Action */}
              <Link
                href="/find"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition shadow-sm"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Find More Leads</span>
              </Link>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-[#1e2334] bg-[#0c0e18] p-3">
            <div className="relative w-full sm:w-80">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                <Search className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search business, category, or city..."
                className="w-full rounded-lg border border-[#22273d] bg-[#121626] py-1.5 pl-8 pr-3 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[11px] text-zinc-500 hidden sm:inline">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto rounded-lg border border-[#22273d] bg-[#121626] px-3 py-1.5 text-xs text-zinc-300 focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="ready for review">Ready for Review</option>
                <option value="contacted">Contacted</option>
                <option value="high">High Potential</option>
                <option value="medium">Medium Potential</option>
                <option value="low">Low Potential</option>
              </select>
            </div>
          </div>

          {/* LOADING STATE */}
          {isLoading && (
            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-[#1e2334] bg-[#0c0e18] p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400 mb-3" />
              <h3 className="text-sm font-semibold text-white">Loading Real CRM Leads</h3>
              <p className="mt-1 text-xs text-zinc-400">
                Fetching records live from Google Sheets CRM via Workflow 03...
              </p>
            </div>
          )}

          {/* ERROR STATE */}
          {!isLoading && error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-rose-900/40 text-rose-400 border border-rose-500/30">
                <AlertCircle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-rose-200">Unable to load CRM leads</h3>
              <p className="mt-1 text-xs text-rose-300/80 max-w-md mx-auto">{error}</p>
              <div className="mt-4">
                <button
                  onClick={loadLeads}
                  className="rounded-lg bg-rose-600/30 border border-rose-500/40 px-3.5 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-600/50 transition"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {!isLoading && !error && filteredLeads.length === 0 && (
            <EmptyState
              icon={Database}
              badge="CRM EMPTY"
              title={searchQuery ? 'No matching leads found' : 'No leads discovered yet'}
              description={
                searchQuery
                  ? 'Try adjusting your search query or status filter.'
                  : 'Start by running a lead discovery search. Qualified businesses will be scored and saved directly into your CRM.'
              }
              actionText={searchQuery ? 'Clear Search' : 'Run Lead Discovery'}
              onAction={() => {
                if (searchQuery) {
                  setSearchQuery('');
                  setStatusFilter('all');
                } else {
                  window.location.href = '/find';
                }
              }}
            />
          )}

          {/* LEADS LIST (TABLE OR CARD VIEW) */}
          {!isLoading && !error && filteredLeads.length > 0 && (
            <>
              {viewMode === 'table' ? (
                <LeadTable
                  leads={filteredLeads}
                  onPrepareOutreach={(lead) => setSelectedLeadForOutreach(lead)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onPrepareOutreach={(l) => setSelectedLeadForOutreach(l)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Outreach Modal */}
          <OutreachModal
            lead={selectedLeadForOutreach}
            isOpen={Boolean(selectedLeadForOutreach)}
            onClose={() => setSelectedLeadForOutreach(null)}
            onSuccessRefresh={loadLeads}
          />
        </main>
      </div>
    </div>
  );
}
