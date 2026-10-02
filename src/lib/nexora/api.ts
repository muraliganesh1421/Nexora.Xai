/**
 * Nexora.Xai Client API Library
 * ALL client requests route through Next.js server endpoints (/api/nexora/*).
 * The browser NEVER connects directly to n8n or any third-party webhooks.
 */

import {
  DiscoveryRequest,
  DiscoveryResponse,
  CRMLeadsResponse,
  RawCRMLead,
  LeadItem,
  PrepareOutreachResponse,
  SendEmailPayload,
  SendWhatsAppPayload,
  RecordWhatsAppConsentRequest,
  RecordWhatsAppConsentResponse,
  SendChannelResponse,
  SystemStatusState,
  ScoreTier,
} from '@/types/nexora';

/**
 * Execute lead discovery via Next.js server proxy (Workflow 01)
 */
export async function discoverLeads(
  payload: DiscoveryRequest
): Promise<DiscoveryResponse> {
  const res = await fetch('/api/nexora/discover', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg =
      data?.error ||
      data?.message ||
      `Server returned ${res.status}: Discovery could not be completed.`;
    throw new Error(errorMsg);
  }

  return data as DiscoveryResponse;
}

/**
 * Fetch real CRM leads from Google Sheets via Next.js server proxy (Workflow 03)
 */
export async function fetchCRMLeads(): Promise<CRMLeadsResponse> {
  const res = await fetch('/api/nexora/leads', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || 'Failed to retrieve CRM leads from server.');
  }

  return data as CRMLeadsResponse;
}

/**
 * Prepare outreach proposal (Workflow 02)
 * Sends ONLY leadId. Does not contact lead.
 */
export async function prepareOutreach(leadId: string): Promise<PrepareOutreachResponse> {
  const res = await fetch('/api/nexora/prepare-outreach', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ leadId }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || 'Failed to prepare outreach for lead.');
  }

  return data as PrepareOutreachResponse;
}

/**
 * Send Email (Workflow 02)
 * Requires confirm: "SEND" and human confirmation.
 * n8n resolves recipient from CRM using leadId.
 */
export async function sendEmail(payload: SendEmailPayload): Promise<SendChannelResponse> {
  const res = await fetch('/api/nexora/send-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || 'Failed to send email.');
  }

  return data as SendChannelResponse;
}

/**
 * Send WhatsApp (Workflow 02)
 * Requires confirm: "SEND" and human confirmation.
 * n8n resolves phone from CRM using leadId.
 */
export async function sendWhatsApp(payload: SendWhatsAppPayload): Promise<SendChannelResponse> {
  const res = await fetch('/api/nexora/send-whatsapp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || 'Failed to send WhatsApp message.');
  }

  return data as SendChannelResponse;
}

/**
 * Record WhatsApp Consent in Google Sheets CRM via Workflow
 * Requires explicit consent=true and evidence string.
 */
export async function recordWhatsAppConsent(
  payload: RecordWhatsAppConsentRequest
): Promise<RecordWhatsAppConsentResponse> {
  const res = await fetch('/api/nexora/record-whatsapp-consent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || 'Failed to record WhatsApp consent.');
  }

  return data as RecordWhatsAppConsentResponse;
}

/**
 * Query safe system health status (no credentials or private URLs exposed)
 */
export async function getSystemStatus(): Promise<SystemStatusState> {
  const res = await fetch('/api/nexora/status', {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to retrieve system status.');
  }

  return res.json();
}

/**
 * Normalizes a raw CRM lead record for UI components
 */
export function rawLeadToLeadItem(raw: RawCRMLead): LeadItem {
  const numScore = typeof raw.leadScore === 'number' ? raw.leadScore : parseInt(String(raw.leadScore), 10) || 0;

  let scoreTier: ScoreTier = 'Low';
  if (numScore >= 80) scoreTier = 'High';
  else if (numScore >= 55) scoreTier = 'Medium';

  const rawConsent = raw.whatsappConsent;
  const isWhatsAppConsent =
    rawConsent === true ||
    rawConsent === 'true' ||
    rawConsent === 'TRUE' ||
    rawConsent === 'Yes' ||
    rawConsent === 'yes';

  const rawDnc = raw.doNotContact;
  const isDoNotContact =
    rawDnc === true ||
    rawDnc === 'true' ||
    rawDnc === 'TRUE' ||
    rawDnc === 'Yes' ||
    rawDnc === 'yes';

  return {
    id: raw.leadId || '',
    businessName: raw.businessName || 'Unnamed Business',
    category: raw.category || 'General',
    city: raw.city || '',
    address: raw.address || '',
    phone: raw.phone || '',
    email: raw.email || '',
    website: raw.website || '',
    mapsUrl: raw.googleMapsUrl || '',
    rating: typeof raw.rating === 'number' ? raw.rating : raw.rating ? parseFloat(String(raw.rating)) : null,
    reviewCount: typeof raw.reviewCount === 'number' ? raw.reviewCount : raw.reviewCount ? parseInt(String(raw.reviewCount), 10) : null,
    score: numScore,
    scoreTier,
    scoreReason: raw.scoreReason || '',
    status: raw.leadStatus || 'New',
    outreachStatus: raw.outreachStatus || 'Ready for Review',
    approvalStatus: raw.approvalStatus || 'Pending',
    hasPhone: Boolean(raw.phone && String(raw.phone).trim() !== ''),
    hasEmail: Boolean(raw.email && String(raw.email).trim() !== ''),
    hasWebsite: Boolean(raw.website && String(raw.website).trim() !== ''),
    whatsappConsent: isWhatsAppConsent,
    doNotContact: isDoNotContact,
    proposedSubject: raw.proposedSubject || '',
    proposedMessage: raw.proposedMessage || '',
    lastContacted: raw.lastContacted || '',
    followUpDate: raw.followUpDate || '',
    interestLevel: raw.interestLevel || '',
    notes: raw.notes || '',
    createdAt: raw.createdAt || '',
    updatedAt: raw.updatedAt || '',
  };
}
