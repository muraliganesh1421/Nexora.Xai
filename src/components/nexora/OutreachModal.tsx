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
  FileCheck,
  ExternalLink,
} from 'lucide-react';
import { LeadItem, OutreachChannel } from '@/types/nexora';
import {
  prepareOutreach,
  sendEmail,
  sendWhatsApp,
  recordWhatsAppConsent,
  fetchCRMLeads,
  rawLeadToLeadItem,
} from '@/lib/nexora/api';
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

/**
 * Safely normalize Indian and international phone numbers for WhatsApp click-to-chat.
 * Strips spaces, dashes, parentheses, plus signs.
 * Prepend 91 only for 10-digit Indian mobile numbers starting with 6-9,
 * or 11 digits starting with 0. Keeps 12-digit Indian numbers (91...) and
 * preserves international numbers without blindly adding 91.
 */
export function normalizeWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // 10 digits starting with 6-9 (Standard Indian mobile format)
  if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
    return `91${digits}`;
  }

  // 11 digits starting with 0 followed by 10-digit Indian mobile
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]\d{9}$/.test(digits.slice(1))) {
    return `91${digits.slice(1)}`;
  }

  // 12 digits starting with 91 (already formatted Indian number)
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits;
  }

  // Other country codes / international numbers
  return digits;
}

export default function OutreachModal({
  lead: initialLead,
  isOpen,
  onClose,
  onSuccessRefresh,
}: OutreachModalProps) {
  // Current lead tracking to handle real-time CRM updates after consent recording
  const [currentLead, setCurrentLead] = useState<LeadItem | null>(initialLead);

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

  // Confirmation dialogs for Send
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const [showConfirmWhatsApp, setShowConfirmWhatsApp] = useState(false);

  // Record Consent dialog state
  const [showRecordConsentModal, setShowRecordConsentModal] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [consentEvidence, setConsentEvidence] = useState('');
  const [isRecordingConsent, setIsRecordingConsent] = useState(false);
  const [consentDialogError, setConsentDialogError] = useState<string | null>(null);

  // Sending state
  const [isSending, setIsSending] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Sync state when initialLead changes or modal opens
  useEffect(() => {
    if (!isOpen || !initialLead) {
      setCurrentLead(null);
      setDraftLoaded(false);
      setStatusFeedback(null);
      setShowConfirmEmail(false);
      setShowConfirmWhatsApp(false);
      setShowRecordConsentModal(false);
      setConsentAgreed(false);
      setConsentEvidence('');
      return;
    }

    setCurrentLead(initialLead);

    // Default drafts from lead if available
    setSubject(initialLead.proposedSubject || `Inquiry regarding ${initialLead.businessName}`);
    setEmailBody(initialLead.proposedMessage || '');
    setWhatsappBody(initialLead.proposedMessage || '');
    setDestEmailMasked(maskEmail(initialLead.email));
    setDestPhoneMasked(maskPhone(initialLead.phone));

    // Choose default active tab based on availability
    if (!initialLead.hasEmail && initialLead.hasPhone && initialLead.whatsappConsent) {
      setActiveTab('whatsapp');
    } else {
      setActiveTab('email');
    }

    // Call Workflow 02 Prepare Outreach (Sends NOTHING)
    async function loadWorkflow02Draft() {
      if (!initialLead) return;
      setIsLoadingDraft(true);
      try {
        const res = await prepareOutreach(initialLead.id);
        if (res.ok) {
          if (res.email_draft?.subject) setSubject(res.email_draft.subject);
          if (res.email_draft?.body) setEmailBody(res.email_draft.body);
          if (res.whatsapp_draft?.body) setWhatsappBody(res.whatsapp_draft.body);
          if (res.email_draft?.to) setDestEmailMasked(maskEmail(res.email_draft.to));
          if (res.whatsapp_draft?.to) setDestPhoneMasked(maskPhone(res.whatsapp_draft.to));
        }
        setDraftLoaded(true);
      } catch (err: unknown) {
        setDraftLoaded(true);
      } finally {
        setIsLoadingDraft(false);
      }
    }

    loadWorkflow02Draft();
  }, [isOpen, initialLead]);

  if (!isOpen || !currentLead) return null;

  // Handle Record WhatsApp Consent
  const handleRecordConsent = async () => {
    if (!consentAgreed) {
      setConsentDialogError('You must confirm that the business explicitly agreed.');
      return;
    }
    if (!consentEvidence.trim() || consentEvidence.trim().length < 5) {
      setConsentDialogError('Please provide meaningful consent evidence (at least 5 characters).');
      return;
    }

    setIsRecordingConsent(true);
    setConsentDialogError(null);

    try {
      const res = await recordWhatsAppConsent({
        leadId: currentLead.id,
        consent: true,
        evidence: consentEvidence.trim(),
      });

      if (res.ok) {
        setShowRecordConsentModal(false);
        setConsentAgreed(false);
        setConsentEvidence('');
        setStatusFeedback({
          type: 'success',
          message: 'WhatsApp consent recorded.',
        });

        // Refetch CRM leads to obtain the real updated value from Google Sheets
        try {
          const freshData = await fetchCRMLeads();
          if (freshData.ok && Array.isArray(freshData.leads)) {
            const updated = freshData.leads.find(
              (l) => l.leadId === currentLead.id || l.leadId === initialLead?.id
            );
            if (updated) {
              const normalized = rawLeadToLeadItem(updated);
              setCurrentLead(normalized);
            }
          }
        } catch {
          // If refetch fails, do not fake consent locally
        }

        if (onSuccessRefresh) onSuccessRefresh();
      } else {
        setConsentDialogError(res.error || 'Failed to record WhatsApp consent.');
      }
    } catch (err: unknown) {
      setConsentDialogError(
        err instanceof Error ? err.message : 'Failed to record WhatsApp consent.'
      );
    } finally {
      setIsRecordingConsent(false);
    }
  };

  // Handle Send Email
  const executeSendEmail = async () => {
    setShowConfirmEmail(false);
    setIsSending(true);
    setStatusFeedback(null);

    try {
      const res = await sendEmail({
        leadId: currentLead.id,
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
        leadId: currentLead.id,
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

  // Handle Manual Open in WhatsApp (Temporary client-side manual click-to-chat)
  // Does NOT automatically mark lead as Contacted because Nexora cannot verify manual send.
  const handleOpenWhatsApp = () => {
    if (!currentLead || currentLead.doNotContact) return;
    if (!currentLead.phone || !currentLead.phone.trim()) return;
    if (!whatsappBody || !whatsappBody.trim()) return;

    const normalizedNumber = normalizeWhatsAppNumber(currentLead.phone);
    if (!normalizedNumber) return;

    const encodedText = encodeURIComponent(whatsappBody.trim());
    const waUrl = `https://wa.me/${normalizedNumber}?text=${encodedText}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const isWhatsAppEligible =
    Boolean(currentLead.hasPhone) &&
    Boolean(currentLead.whatsappConsent) &&
    !currentLead.doNotContact;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isSending && !isRecordingConsent) onClose();
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
            disabled={isSending || isRecordingConsent}
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
                <span className="font-semibold text-white text-base">{currentLead.businessName}</span>
                <span className="text-xs text-zinc-400">({currentLead.category} • {currentLead.city})</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
                <span>Phone: {currentLead.phone ? destPhoneMasked : 'No phone'}</span>
                <span>•</span>
                <span>Email: {currentLead.email ? destEmailMasked : 'No email'}</span>
              </div>
            </div>
            <div className="w-44">
              <LeadScore score={currentLead.score} size="sm" />
            </div>
          </div>

          {currentLead.scoreReason && (
            <div className="mt-3 rounded-lg border border-[#242b45] bg-[#141829] p-3 text-xs text-zinc-300">
              <span className="font-semibold text-indigo-300">AI Scoring Rationale: </span>
              <span>{currentLead.scoreReason}</span>
            </div>
          )}

          {/* Do Not Contact Warning */}
          {currentLead.doNotContact && (
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
              {!currentLead.hasEmail && (
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
              {currentLead.whatsappConsent ? (
                <span className="rounded bg-emerald-950/40 border border-emerald-600/30 px-1 py-0.2 text-[9px] text-emerald-300 font-medium">
                  Consent Recorded
                </span>
              ) : (
                <span className="rounded bg-amber-950/40 border border-amber-600/30 px-1 py-0.2 text-[9px] text-amber-300 font-medium">
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
                    disabled={isSending || currentLead.doNotContact || !currentLead.hasEmail}
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
                    disabled={isSending || currentLead.doNotContact || !currentLead.hasEmail}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Personalized email copy..."
                    className="w-full rounded-lg border border-[#22273d] bg-[#121626] p-3 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none leading-relaxed disabled:opacity-50"
                  />
                </div>
                {!currentLead.hasEmail && (
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
                  disabled={isSending || currentLead.doNotContact || !currentLead.phone}
                  onChange={(e) => setWhatsappBody(e.target.value)}
                  placeholder="Personalized WhatsApp message..."
                  className="w-full rounded-lg border border-[#22273d] bg-[#121626] p-3 text-xs text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none leading-relaxed disabled:opacity-50"
                />

                {/* Consent State Banner */}
                {currentLead.whatsappConsent ? (
                  <div className="mt-2.5 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>WhatsApp Consent Recorded in CRM. You can review the draft and send below.</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-xs text-amber-200">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>
                        WhatsApp outreach requires recorded recipient consent for automated API sending.
                      </span>
                    </div>
                    {currentLead.hasPhone && !currentLead.doNotContact && (
                      <button
                        type="button"
                        onClick={() => {
                          setConsentAgreed(false);
                          setConsentEvidence('');
                          setConsentDialogError(null);
                          setShowRecordConsentModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-900/40 px-2.5 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-800/60 transition shrink-0"
                      >
                        <FileCheck className="h-3.5 w-3.5 text-amber-300" />
                        <span>Record Consent</span>
                      </button>
                    )}
                  </div>
                )}

                <p className="mt-2 text-[11px] text-zinc-400">
                  Opens WhatsApp with your message prepared. You still control the final Send.
                </p>

                {!currentLead.hasPhone && (
                  <p className="mt-1 text-[11px] text-rose-400">
                    No phone number exists in CRM for this lead. WhatsApp dispatch is unavailable.
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
        <div className="flex flex-col gap-2 border-t border-[#1c2236] bg-[#090b14] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
              <span>Strict 1-to-1 dispatch. Bulk send is architecturally blocked.</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                disabled={isSending || isRecordingConsent}
                className="rounded-lg border border-[#22273d] bg-transparent px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition disabled:opacity-50"
              >
                Close
              </button>

              {activeTab === 'email' ? (
                <button
                  onClick={() => setShowConfirmEmail(true)}
                  disabled={isSending || currentLead.doNotContact || !currentLead.hasEmail}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
                >
                  {isSending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Mail className="h-3.5 w-3.5" />
                  )}
                  <span>Send Email</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {/* If consent is needed, show small Record Consent button */}
                  {!currentLead.whatsappConsent && currentLead.hasPhone && !currentLead.doNotContact && (
                    <button
                      type="button"
                      onClick={() => {
                        setConsentAgreed(false);
                        setConsentEvidence('');
                        setConsentDialogError(null);
                        setShowRecordConsentModal(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-2 text-xs font-medium text-amber-200 hover:bg-amber-900/50 transition"
                    >
                      <FileCheck className="h-3.5 w-3.5 text-amber-300" />
                      <span>Record Consent</span>
                    </button>
                  )}

                  {/* Send via API (Automated Meta Cloud API / n8n Workflow 02) */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmWhatsApp(true)}
                    disabled={isSending || currentLead.doNotContact || !isWhatsAppEligible}
                    className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-transparent px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                    title={
                      !currentLead.whatsappConsent
                        ? 'Requires recorded WhatsApp consent'
                        : 'Send automated message via Meta Cloud API'
                    }
                  >
                    {isSending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <MessageSquare className="h-3.5 w-3.5" />
                    )}
                    <span>Send via API</span>
                  </button>

                  {/* Open in WhatsApp (Temporary manual option) */}
                  <button
                    type="button"
                    onClick={handleOpenWhatsApp}
                    disabled={
                      isSending ||
                      currentLead.doNotContact ||
                      !currentLead.phone ||
                      !whatsappBody.trim()
                    }
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Open in WhatsApp</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {activeTab === 'whatsapp' && (
            <div className="flex items-center justify-end">
              <p className="text-[11px] text-zinc-400">
                Opens WhatsApp with your message prepared. You still control the final Send.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RECORD WHATSAPP CONSENT DIALOG */}
      {showRecordConsentModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              if (!isRecordingConsent) setShowRecordConsentModal(false);
            }}
          />
          <div className="relative z-10 w-full max-w-md rounded-xl border border-[#2d344d] bg-[#0e111d] p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <FileCheck className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold text-white">Record WhatsApp Consent</h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Only record consent if this business explicitly agreed to receive WhatsApp messages.
            </p>

            <div className="mt-4 space-y-3.5">
              {/* Checkbox: Not pre-checked */}
              <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-[#23293e] bg-[#121626] p-3 transition hover:border-[#2e3552]">
                <input
                  type="checkbox"
                  checked={consentAgreed}
                  disabled={isRecordingConsent}
                  onChange={(e) => {
                    setConsentAgreed(e.target.checked);
                    if (consentDialogError) setConsentDialogError(null);
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-600 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-zinc-200 leading-snug">
                  The business explicitly agreed to receive WhatsApp messages.
                </span>
              </label>

              {/* Consent Evidence: Textarea */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Consent Evidence <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={consentEvidence}
                  disabled={isRecordingConsent}
                  onChange={(e) => {
                    setConsentEvidence(e.target.value);
                    if (consentDialogError) setConsentDialogError(null);
                  }}
                  placeholder="Customer agreed during phone call on 2 Oct 2026"
                  className="w-full rounded-lg border border-[#22273d] bg-[#121626] p-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-500 focus:outline-none leading-relaxed"
                />
                <span className="text-[10px] text-zinc-500">
                  Document when, where, and how consent was granted. Never automatically generated.
                </span>
              </div>

              {consentDialogError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{consentDialogError}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[#1c2236] pt-4">
              <button
                type="button"
                onClick={() => setShowRecordConsentModal(false)}
                disabled={isRecordingConsent}
                className="rounded-lg border border-zinc-700 bg-transparent px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRecordConsent}
                disabled={isRecordingConsent || !consentAgreed || !consentEvidence.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 transition disabled:cursor-not-allowed disabled:opacity-40 shadow-sm"
              >
                {isRecordingConsent ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Recording...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="h-3.5 w-3.5" />
                    <span>Record WhatsApp Consent</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
              This will dispatch a personalized cold outreach email to <strong>{currentLead.businessName}</strong> ({destEmailMasked}) and update the CRM status to Contacted.
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
            <h3 className="text-sm font-semibold text-white">Send this WhatsApp message via API now?</h3>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              This will dispatch an automated 1-to-1 WhatsApp message via Meta Cloud API to <strong>{currentLead.businessName}</strong> ({destPhoneMasked}) and update the CRM status to Contacted.
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
                Confirm & Send via API
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
