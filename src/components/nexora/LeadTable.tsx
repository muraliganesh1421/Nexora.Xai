import React from 'react';
import { Send, Phone, Mail, Globe, MapPin, ExternalLink, ShieldAlert, MessageSquare } from 'lucide-react';
import { LeadItem } from '@/types/nexora';
import LeadScore from './LeadScore';
import StatusBadge from './StatusBadge';

interface LeadTableProps {
  leads: LeadItem[];
  onPrepareOutreach: (lead: LeadItem) => void;
}

export default function LeadTable({ leads, onPrepareOutreach }: LeadTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#1e2334] bg-[#0e111a]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#1c2236] bg-[#0a0d15] text-[11px] uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-5 py-3.5 font-medium">Business / Category</th>
              <th className="px-4 py-3.5 font-medium">City</th>
              <th className="px-4 py-3.5 font-medium">AI Score</th>
              <th className="px-4 py-3.5 font-medium">Contact Channels</th>
              <th className="px-4 py-3.5 font-medium">CRM Status</th>
              <th className="px-4 py-3.5 font-medium">Outreach</th>
              <th className="px-5 py-3.5 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#181d2e] text-zinc-300">
            {leads.map((lead) => (
              <tr key={lead.id} className="transition hover:bg-[#121626]">
                {/* Business / Category */}
                <td className="px-5 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-xs sm:text-sm">
                        {lead.businessName}
                      </span>
                      {lead.doNotContact && (
                        <span className="rounded bg-rose-950/60 border border-rose-600/40 px-1.5 py-0.5 text-[9px] font-mono text-rose-300">
                          DO NOT CONTACT
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-400">
                      <span className="capitalize">{lead.category}</span>
                      {lead.website && (
                        <>
                          <span>•</span>
                          <a
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 text-cyan-400 hover:underline"
                          >
                            <span>website</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </td>

                {/* City */}
                <td className="px-4 py-4 whitespace-nowrap text-zinc-300">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-zinc-500" />
                    {lead.city}
                  </span>
                </td>

                {/* AI Score */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <LeadScore score={lead.score} size="sm" />
                </td>

                {/* Contact Channels Availability */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      title={lead.hasEmail ? 'Email available' : 'No email address'}
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${
                        lead.hasEmail
                          ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30'
                          : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                      }`}
                    >
                      <Mail className="h-3 w-3" />
                      <span>{lead.hasEmail ? 'Email' : 'No Email'}</span>
                    </span>

                    <span
                      title={
                        lead.hasPhone
                          ? lead.whatsappConsent
                            ? 'WhatsApp consented'
                            : 'WhatsApp phone available (no consent)'
                          : 'No phone'
                      }
                      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${
                        lead.hasPhone
                          ? lead.whatsappConsent
                            ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
                          : 'bg-zinc-900 text-zinc-600 border border-zinc-800'
                      }`}
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>{lead.hasPhone ? 'WhatsApp' : 'No WA'}</span>
                    </span>
                  </div>
                </td>

                {/* CRM Status */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <StatusBadge status={lead.status} type="lead" />
                </td>

                {/* Outreach Status */}
                <td className="px-4 py-4 whitespace-nowrap">
                  <StatusBadge status={lead.outreachStatus} type="outreach" />
                </td>

                {/* Action: Strict 1-to-1 Prepare Outreach */}
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  {lead.doNotContact ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-medium">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Blocked</span>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
