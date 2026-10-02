import React from 'react';
import {
  Phone,
  Mail,
  Globe,
  Send,
  MapPin,
  Star,
  ExternalLink,
  ShieldAlert,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { LeadItem } from '@/types/nexora';
import LeadScore from './LeadScore';
import StatusBadge from './StatusBadge';

interface LeadCardProps {
  lead: LeadItem;
  onPrepareOutreach: (lead: LeadItem) => void;
}

export default function LeadCard({ lead, onPrepareOutreach }: LeadCardProps) {
  return (
    <div className="relative flex flex-col justify-between rounded-xl border border-[#1e2334] bg-[#0e111a] p-5 transition hover:border-[#2f3752]">
      {/* Top Details */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white text-sm sm:text-base leading-snug truncate" title={lead.businessName}>
                {lead.businessName}
              </h3>
              {lead.doNotContact && (
                <span className="shrink-0 rounded bg-rose-950/60 border border-rose-600/40 px-1.5 py-0.5 text-[9px] font-mono font-medium text-rose-300">
                  DO NOT CONTACT
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
              <span className="text-zinc-300 font-medium capitalize">{lead.category}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-zinc-400">
                <MapPin className="h-3 w-3 text-zinc-500" />
                {lead.city}
              </span>
              {lead.rating !== null && lead.rating !== undefined && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-amber-400 font-mono text-[11px]">
                    <Star className="h-3 w-3 fill-amber-400" />
                    {lead.rating} ({lead.reviewCount || 0})
                  </span>
                </>
              )}
            </div>
          </div>

          <StatusBadge status={lead.status} type="lead" />
        </div>

        {/* Score & Rationale */}
        <div className="mt-4 rounded-lg border border-[#1c2236] bg-[#121626] p-3">
          <div className="mb-2">
            <LeadScore score={lead.score} size="md" />
          </div>
          {lead.scoreReason && (
            <p className="text-xs leading-relaxed text-zinc-300 line-clamp-3">
              {lead.scoreReason}
            </p>
          )}
        </div>

        {/* Contact Availability Indicators */}
        <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
          {/* Email availability */}
          <div
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
              lead.hasEmail
                ? 'bg-indigo-950/30 text-indigo-300 border border-indigo-500/30'
                : 'bg-zinc-900/80 text-zinc-500 border border-zinc-800'
            }`}
          >
            <Mail className="h-3 w-3" />
            <span>{lead.hasEmail ? 'Email Available' : 'No Email'}</span>
          </div>

          {/* WhatsApp availability & consent */}
          <div
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
              lead.hasPhone
                ? lead.whatsappConsent
                  ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-950/20 text-amber-300 border border-amber-500/20'
                : 'bg-zinc-900/80 text-zinc-500 border border-zinc-800'
            }`}
          >
            <MessageSquare className="h-3 w-3" />
            <span>
              {lead.hasPhone
                ? lead.whatsappConsent
                  ? 'Consent Recorded'
                  : 'Consent Needed'
                : 'No Phone'}
            </span>
          </div>

          {/* Website Link */}
          {lead.hasWebsite && lead.website && (
            <a
              href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-[#141828] border border-[#23293e] px-2 py-1 text-[11px] text-cyan-300 hover:text-white transition"
            >
              <Globe className="h-3 w-3" />
              <span>Website</span>
              <ExternalLink className="h-2.5 w-2.5 ml-0.5 opacity-70" />
            </a>
          )}

          {/* Maps Link */}
          {lead.mapsUrl && (
            <a
              href={lead.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-[#141828] border border-[#23293e] px-2 py-1 text-[11px] text-zinc-400 hover:text-white transition"
            >
              <MapPin className="h-3 w-3" />
              <span>Map</span>
            </a>
          )}
        </div>

        {/* Last Contacted */}
        {lead.lastContacted && (
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Clock className="h-3 w-3" />
            <span>Last Contacted: {lead.lastContacted}</span>
          </div>
        )}
      </div>

      {/* Card Action */}
      <div className="mt-5 flex items-center justify-between border-t border-[#1c2236] pt-3.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono text-zinc-500">
            Outreach:
          </span>
          <StatusBadge status={lead.outreachStatus} type="outreach" />
        </div>

        {lead.doNotContact ? (
          <span className="inline-flex items-center gap-1 rounded-lg border border-rose-600/30 bg-rose-950/20 px-3 py-1.5 text-xs font-medium text-rose-300 cursor-not-allowed">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Do Not Contact</span>
          </span>
        ) : (
          <button
            onClick={() => onPrepareOutreach(lead)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-600/10 px-3 py-1.5 text-xs font-medium text-indigo-300 transition hover:bg-indigo-600 hover:text-white"
          >
            <Send className="h-3 w-3" />
            <span>Prepare Outreach</span>
          </button>
        )}
      </div>
    </div>
  );
}
