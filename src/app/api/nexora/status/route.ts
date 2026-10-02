import { NextResponse } from 'next/server';
import {
  getDiscoveryWebhookUrl,
  getLeadsWebhookUrl,
  getPrepareOutreachWebhookUrl,
  getSendEmailWebhookUrl,
  getSendWhatsAppWebhookUrl,
  NEXORA_CONFIG,
} from '@/lib/nexora/config';
import { SystemStatusState } from '@/types/nexora';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/nexora/status
 * Safe system status inspection endpoint.
 * Exposes health indicators WITHOUT revealing URLs, credentials, or tokens.
 */
export async function GET() {
  const hasDiscovery = Boolean(getDiscoveryWebhookUrl());
  const hasLeads = Boolean(getLeadsWebhookUrl());
  const hasPrepare = Boolean(getPrepareOutreachWebhookUrl());
  const hasEmail = Boolean(getSendEmailWebhookUrl());
  const hasWhatsApp = Boolean(getSendWhatsAppWebhookUrl());

  const status: SystemStatusState = {
    discovery: {
      configured: hasDiscovery,
      label: hasDiscovery ? 'Connected' : 'Not Configured',
      workflow: NEXORA_CONFIG.workflows.workflow01.name,
    },
    crm: {
      configured: hasLeads,
      label: hasLeads ? 'Connected' : 'Not Configured',
      totalLeads: 0,
    },
    outreach: {
      configured: hasPrepare,
      label: hasPrepare ? 'Connected' : 'Not Configured',
      workflow: NEXORA_CONFIG.workflows.workflow02.name,
    },
    email: {
      configured: hasEmail,
      label: hasEmail ? 'Connected' : 'Not Configured',
    },
    whatsapp: {
      configured: hasWhatsApp,
      label: hasWhatsApp ? 'Connected' : 'Not Configured',
    },
  };

  return NextResponse.json(status);
}
