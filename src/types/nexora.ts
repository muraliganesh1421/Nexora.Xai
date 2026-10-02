/**
 * Nexora.Xai Type Definitions
 * Strict typing for lead discovery, AI scoring, CRM schema (34 Google Sheets columns),
 * and human-in-the-loop outreach.
 */

// Simplified V1 sales status model
export type CRMLeadStatus =
  | 'New'
  | 'Contacted'
  | 'Interested'
  | 'Follow Up'
  | 'Closed'
  | 'Not Interested'
  | string;

// AI score tiers
export type ScoreTier = 'High' | 'Medium' | 'Low';

// Outreach channels
export type OutreachChannel = 'email' | 'whatsapp';

// Outreach status
export type OutreachStatus =
  | 'Pending Approval'
  | 'Ready for Review'
  | 'Draft'
  | 'Sent'
  | 'Contacted'
  | 'Below Threshold'
  | 'Failed'
  | 'Opted Out'
  | string;

/**
 * Raw lead returned by n8n Workflow 03 (CRM Read)
 */
export interface RawCRMLead {
  leadId: string;
  businessName: string;
  category: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  googleMapsUrl: string;
  rating: number | string | null;
  reviewCount: number | string | null;
  leadScore: number | string;
  leadStatus: string;
  scoreReason: string;
  contactMethod: string;
  outreachStatus: string;
  approvalStatus: string;
  proposedSubject: string;
  proposedMessage: string;
  lastContacted: string;
  followUpDate: string;
  interestLevel: string;
  response: string;
  notes: string;
  whatsappConsent: boolean | string;
  doNotContact: boolean | string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response structure from GET /api/nexora/leads (Workflow 03)
 */
export interface CRMLeadsResponse {
  ok: boolean;
  count: number;
  leads: RawCRMLead[];
  error?: string;
}

/**
 * Normalized lead structure for UI components
 */
export interface LeadItem {
  id: string;
  businessName: string;
  category: string;
  city: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  mapsUrl?: string;
  rating?: number | null;
  reviewCount?: number | null;
  score: number;
  scoreTier: ScoreTier;
  scoreReason: string;
  status: CRMLeadStatus;
  outreachStatus: OutreachStatus;
  approvalStatus: string;
  hasPhone: boolean;
  hasEmail: boolean;
  hasWebsite: boolean;
  whatsappConsent: boolean;
  doNotContact: boolean;
  proposedSubject?: string;
  proposedMessage?: string;
  lastContacted?: string;
  followUpDate?: string;
  interestLevel?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Discovery Request Payload (Workflow 01)
 */
export interface DiscoveryRequest {
  category: string;
  city: string;
  country: string;
  maxResults: number;
  minScore: number;
}

/**
 * Real n8n Workflow 01 Response
 */
export interface DiscoveryResponse {
  ok: boolean;
  processed: number;
  message: string;
  error?: string;
  details?: string;
  isDemo?: boolean;
}

/**
 * Workflow 02 - Prepare Outreach
 */
export interface PrepareOutreachRequest {
  leadId: string;
}

export interface PrepareOutreachResponse {
  ok: boolean;
  lead_id?: string;
  leadId?: string;
  business_name?: string;
  businessName?: string;
  email_draft?: {
    to: string | null;
    subject: string;
    body: string;
  };
  whatsapp_draft?: {
    to: string | null;
    body: string;
  };
  note?: string;
  message?: string;
  error?: string;
}

/**
 * Workflow 02 - Channel Send Payloads
 * Note: Recipient addresses are resolved by n8n using leadId.
 * The browser NEVER sends arbitrary recipient email or phone.
 */
export interface SendEmailPayload {
  leadId: string;
  confirm: 'SEND';
  subject?: string;
  message?: string;
}

export interface SendWhatsAppPayload {
  leadId: string;
  confirm: 'SEND';
  message?: string;
}

export interface SendChannelResponse {
  ok: boolean;
  sent?: boolean;
  message?: string;
  statusMessage?: string;
  error?: string;
}

/**
 * System Status State
 */
export interface SystemStatusState {
  discovery: {
    configured: boolean;
    label: string;
    workflow: string;
  };
  crm: {
    configured: boolean;
    label: string;
    totalLeads: number;
  };
  outreach: {
    configured: boolean;
    label: string;
    workflow: string;
  };
  email: {
    configured: boolean;
    label: string;
  };
  whatsapp: {
    configured: boolean;
    label: string;
  };
}
