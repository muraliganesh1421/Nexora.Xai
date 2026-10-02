'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Mail,
  MessageSquare,
  AlertCircle,
  Sparkles,
  Send,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { LeadItem, OutreachChannel } from '@/types/nexora';
import { prepareOutreach, sendEmail, sendWhatsApp } from '@/lib/nexora/api';
import LeadScore from './LeadScore';

interface OutreachModalProps {
  lead: LeadItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccessRefresh?: () => void;
}

// Utility to mask recipient info for privacy
function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return 'No email on file';
  const [user, domain] = email.split('@');
  const visible = user.length > 2 ? user.slice(0, 2) : user.slice(0, 1);
  return `${visible}••••@${domain}`;
}

function maskPhone(phone?: string): string {
  if (!phone) return 'No phone on file';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 6) return '••••••';
  return `••••••${clean.slice(-4)}`;
}

export default function OutreachModal({
  lead,
  isOpen,
  onClose,
  onSuccessRefresh,
}: OutreachModalProps) {
  const [activeTab, setActiveTab] = useState<OutreachChannel>('email');

  // Loading draft from Workflow 02
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  // Draft contents
  const [subject, setSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [whatsappBody, setWhatsappBody] = useState('');
  const [destEmailMasked, setDestEmailMasked] = useState('');
  const [destPhoneMasked, setDestPhoneMasked] = useState('');

  // Confirmation modals
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const [showConfirmWhatsApp, setShowConfirmWhatsApp] = useState(false);

  // Sending state
  const [isSending, setIsSending] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Fetch prepared draft when lead changes or modal opens
  useEffect(() => {
    if (!isOpen || !lead) {
      setDraftLoaded(false);
      setStatusFeedback(null);
      setShowConfirmEmail(false);
      setShowConfirmWhatsApp(false);
      return;
    }

    // Default drafts from lead if available
    setSubject(lead.proposedSubject || `Inquiry regarding ${lead.businessName}`);
    setEmailBody(lead.proposedMessage || '');
    setWhatsappBody(lead.proposedMessage || '');
    setDestEmailMasked(maskEmail(lead.email));
    setDestPhoneMasked(maskPhone(lead.phone));

    // Choose default active tab based on availability
    if (!lead.hasEmail && lead.hasPhone && lead.whatsappConsent) {
      setActiveTab('whatsapp');
    } else {
      setActiveTab('email');
    }

    // Call Workflow 02 Prepare Outreach (Sends NOTHING)
    async function loadWorkflow02Draft() {
      if (!lead) return;
      setIsLoadingDraft(true);
      try {
        const res = await prepareOutreach(lead.id);
        if (res.ok) {
          if (res.email_draft?.subject) setSubject(res.email_draft.subject);
          if (res.email_draft?.body) setEmailBody(res.email_draft.body);
          if (res.whatsapp_draft?.body) setWhatsappBody(res.whatsapp_draft.body);
          if (res.email_draft?.to) setDestEmailMasked(maskEmail(res.email_draft.to));
          if (res.whatsapp_draft?.to) setDestPhoneMasked(maskPhone(res.whatsapp_draft.to));
        }
        setDraftLoaded(true);
      } catch (err: unknown) {
        // Fallback to existing proposed drafts from CRM record
        setDraftLoaded(true);
      } finally {
        setIsLoadingDraft(false);
      }
    }

    loadWorkflow02Draft();
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  // Handle Send Email
  const executeSendEmail = async () => {
    setShowConfirmEmail(false);
    setIsSending(true);
    setStatusFeedback(null);

    try {
      const res = await sendEmail({
        leadId: lead.id,
        confirm: 'SEND',
        subject,
        message: emailBody,
      });

      if (res.ok) {
        setStatusFeedback({
          type: 'success',
          message: 'Email sent successfully via Workflow 02.',
        });
        if (onSuccessRefresh) onSuccessRefresh();
      } else {
        setStatusFeedback({
          type: 'error',
          message: res.error || 'Failed to dispatch email.',
        });
      }
    } catch (err: unknown) {
      setStatusFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to dispatch email.',
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle Send WhatsApp
  const executeSendWhatsApp = async () => {
    setShowConfirmWhatsApp(false);
    setIsSending(true);
    setStatusFeedback(null);

    try {
      const res = await sendWhatsApp({
        leadId: lead.id,
        confirm: 'SEND',
        message: whatsappBody,
      });

      if (res.ok) {
        setStatusFeedback({
          type: 'success',
          message: 'WhatsApp message sent successfully via Workflow 02.',
        });
        if (onSuccessRefresh) onSuccessRefresh();
      } else {
        setStatusFeedback({
          type: 'error',
          message: res.error || 'Failed to dispatch WhatsApp message.',
        });
      }
    } catch (err: unknown) {
      setStatusFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to dispatch WhatsApp message.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isSending) onClose();
        }}
      />

      {/* Main Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-[#22273d] bg-[#0c0f1a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1c2236] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Prepare Outreach</h2>
              <p className="text-xs text-zinc-400">
                Review and customize draft before explicit 1-to-1 dispatch.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSending}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Lead Context Panel */}
        <div className="border-b border-[#1c2236] bg-[#0f1322] px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-base">{lead.businessName}</span>
                <span className="text-xs text-zinc-400">({lead.category} • {lead.city})</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                <span>Phone: {lead.phone ? destPhoneMasked : 'No phone'}</span>
                <span>•</span>
                <span>Email: {lead.email ? destEmailMasked : 'No email'}</span>
              </div>
            </div>
            <div className="w-44">
              <LeadScore score={lead.score} size="sm" />
            </div>
          </div>

          {lead.scoreReason && (
            <div className="mt-3 rounded-lg border border-[#242b45] bg-[#141829] p-3 text-xs text-zinc-300">
              <span className="font-semibold text-indigo-300">AI Scoring Rationale: </span>
              <span>{lead.scoreReason}</span>
            </div>
          )}

          {/* Do Not Contact Warning */}
          {lead.doNotContact && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-rose-600/40 bg-rose-950/40 p-2.5 text-xs text-rose-300 font-medium">
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
              <span>This lead is marked Do Not Contact. All outreach actions are blocked.</span>
            </div>
          )}
        </div>

        {/* Channel Selection Tabs */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-2 border-b border-[#1c2236] pb-3">
            {/* Email Tab */}
            <button
              onClick={() => {
                setActiveTab('email');
                setStatusFeedback(null);
              }}
              disabled={isSending}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition ${
                activeTab === 'email'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-zinc-400 hover:bg-[#141828] hover:text-zinc-200'
              }`}
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email Channel</span>
              {!lead.hasEmail && (
                <span className="rounded bg-zinc-800 px-1 py-0.2 text-[9px] text-zinc-500">Unavailable</span>
              )}
            </button>

            {/* WhatsApp Tab */}
            <button
              onClick={() => {
                setActiveTab('whatsapp');
                setStatusFeedback(null);
              }}
              disabled={isSending}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-zinc-400 hover:bg-[#141828] hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>WhatsApp Channel</span>
              {!lead.whatsappConsent && (
                <span className="rounded bg-amber-950/40 border border-amber-600/30 px-1 py-0.2 text-[9px] text-amber-300">
                  Consent Needed
                </span>
              )}
            </button>

            {isLoadingDraft && (
              <span className="ml-auto flex items-center gap-1.5 text-xs text-indigo-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Loading draft...</span>
              </span>
            )}
          </div>

          {/* Form Content */}
          <div className="mt-4 space-y-4">
            {activeTab === 'email' ? (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-zinc-400">
                      Subject Line
                    </label>
                    <span className="text-[11px] text-zinc-500">
                      Recipient: {destEmailMasked}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={subject}
                    disabled={isSending || lead.doNotContact || !lead.hasEmail}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject..."
                    className="w-full rounded-lg border border-[#22273d] bg-[#121626] px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Email Message Body
                  </label>
                  <textarea
                    rows={6}
                    value={emailBody}
                    disabled={isSending || lead.doNotContact || !lead.hasEmail}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Personalized email copy..."
                    className="w-full rounded-lg border border-[#22273d] bg-[#121626] p-3 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none leading-relaxed disabled:opacity-50"
                  />
                </div>
                {!lead.hasEmail && (
                  <p className="text-[11px] text-amber-400">
                    No verified email address exists in CRM for this lead. Email dispatch is disabled.
                  </p>
                )}
              </>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-zinc-400">
                    WhatsApp Direct Message
                  </label>
                  <span className="text-[11px] text-zinc-500">
                    Recipient: {destPhoneMasked}
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={whatsappBody}
                  disabled={isSending || lead.doNotContact || !lead.hasPhone || !lead.whatsappConsent}
                  onChange={(e) => setWhatsappBody(e.target.value)}
                  placeholder="Personalized WhatsApp message..."
                  className="w-full rounded-lg border border-[#22273d] bg-[#121626] p-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none leading-relaxed disabled:opacity-50"
                />
                {!lead.whatsappConsent && (
                  <p className="mt-1 text-[11px] text-amber-400">
                    WhatsApp outreach requires recorded recipient consent. WhatsApp dispatch is disabled until consent is verified.
                  </p>
                )}
                {!lead.hasPhone && (
                  <p className="mt-1 text-[11px] text-zinc-500">
                    No phone number exists in CRM for this lead.
                  </p>
                )}
              </div>
            )}

            {/* Status Feedback Message */}
            {statusFeedback && (
              <div
                className={`flex items-start gap-2 rounded-lg p-3 text-xs ${
                  statusFeedback.type === 'success'
                    ? 'border border-emerald-500/30 bg-emerald-950/30 text-emerald-300'
                    : 'border border-rose-500/30 bg-rose-950/30 text-rose-300'
                }`}
              >
                {statusFeedback.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                )}
                <span>{statusFeedback.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#1c2236] bg-[#090b14] px-6 py-4">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
            <span>Strict 1-to-1 dispatch. Bulk send is architecturally blocked.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSending}
              className="rounded-lg border border-[#22273d] bg-transparent px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition disabled:opacity-50"
            >
              Close
            </button>

            {activeTab === 'email' ? (
              <button
                onClick={() => setShowConfirmEmail(true)}
                disabled={isSending || lead.doNotContact || !lead.hasEmail}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Mail className="h-3.5 w-3.5" />
                )}
                <span>Send Email</span>
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmWhatsApp(true)}
                disabled={isSending || lead.doNotContact || !lead.hasPhone || !lead.whatsappConsent}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5" />
                )}
                <span>Send WhatsApp</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CONFIRMATION DIALOG: Send Email */}
      {showConfirmEmail && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirmEmail(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-[#262c45] bg-[#0e111d] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-white">Send this email now?</h3>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              This will dispatch a personalized cold outreach email to <strong>{lead.businessName}</strong> ({destEmailMasked}) and update the CRM status to Contacted.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmEmail(false)}
                className="rounded-lg border border-zinc-700 bg-transparent px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={executeSendEmail}
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION DIALOG: Send WhatsApp */}
      {showConfirmWhatsApp && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirmWhatsApp(false)}
          />
          <div className="relative z-10 w-full max-w-sm rounded-xl border border-[#262c45] bg-[#0e111d] p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-white">Send this WhatsApp message now?</h3>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              This will dispatch a 1-to-1 WhatsApp message to <strong>{lead.businessName}</strong> ({destPhoneMasked}) and update the CRM status to Contacted.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowConfirmWhatsApp(false)}
                className="rounded-lg border border-zinc-700 bg-transparent px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={executeSendWhatsApp}
                className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-emerald-500"
              >
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
