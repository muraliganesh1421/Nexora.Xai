/**
 * Nexora.Xai Configuration
 * Centralized settings and safety guardrails.
 * NOTE: Environment variables like N8N_*_WEBHOOK_URL are server-only.
 */

export const NEXORA_CONFIG = {
  appName: 'Nexora.Xai',
  tagline: 'AI Lead Intelligence',
  philosophy: 'FIND → AI SCORE → REVIEW → CONTACT',
  version: '1.0.0',

  // Validation limits
  limits: {
    maxResultsMin: 1,
    maxResultsMax: 20,
    maxResultsDefault: 5,
    minScoreMin: 0,
    minScoreMax: 100,
    minScoreDefault: 55,
    defaultCountry: 'India',
    serverTimeoutMs: 90000,
  },

  // Score tier thresholds
  scoreTiers: {
    high: 80,
    medium: 55,
  },

  // Workflow metadata
  workflows: {
    workflow01: {
      name: 'Nexora 01 - Lead Discovery and Qualification',
      status: 'Active (Production Webhook)',
    },
    workflow02: {
      name: 'Nexora 02 - Prepare and Send Outreach',
      status: 'Active (Production Webhooks)',
    },
    workflow03: {
      name: 'Nexora 03 - CRM Read',
      status: 'Active (Google Sheets CRM)',
    },
  },

  // CRM status
  crm: {
    sheetType: 'Google Sheets CRM',
    totalColumns: 34,
  },
} as const;

/**
 * Server-only helper accessors for webhook URLs
 */
export function getDiscoveryWebhookUrl(): string | null {
  return process.env.N8N_DISCOVERY_WEBHOOK_URL?.trim() || null;
}

export function isDiscoveryConfigured(): boolean {
  return Boolean(getDiscoveryWebhookUrl());
}

export function getLeadsWebhookUrl(): string | null {
  return process.env.N8N_LEADS_WEBHOOK_URL?.trim() || null;
}

export function getPrepareOutreachWebhookUrl(): string | null {
  return process.env.N8N_PREPARE_OUTREACH_WEBHOOK_URL?.trim() || null;
}

export function getSendEmailWebhookUrl(): string | null {
  return process.env.N8N_SEND_EMAIL_WEBHOOK_URL?.trim() || null;
}

export function getSendWhatsAppWebhookUrl(): string | null {
  return process.env.N8N_SEND_WHATSAPP_WEBHOOK_URL?.trim() || null;
}

export function getRecordWhatsAppConsentWebhookUrl(): string | null {
  return process.env.N8N_RECORD_WHATSAPP_CONSENT_WEBHOOK_URL?.trim() || null;
}

/**
 * Safe error message translator for known Workflow 02 error codes
 */
export function translateWorkflowError(errorCode: string): string {
  const normalized = errorCode.trim().toUpperCase();
  const errorMap: Record<string, string> = {
    LEAD_NOT_FOUND: 'This lead was not found in the CRM.',
    DO_NOT_CONTACT: 'This lead is marked Do Not Contact.',
    ALREADY_CONTACTED: 'This lead has already been contacted.',
    NO_EMAIL: 'No email address is available for this lead.',
    NO_WHATSAPP_CONTACT: 'No WhatsApp phone number is available for this lead.',
    WHATSAPP_NOT_ELIGIBLE: 'This lead is not eligible for WhatsApp outreach.',
    NOT_CONFIRMED: 'Send confirmation was not provided. Outreach aborted.',
    SEND_FAILED: 'Message dispatch failed. Please check provider status.',
  };

  return errorMap[normalized] || errorCode;
}
