import { NextRequest, NextResponse } from 'next/server';
import { getPrepareOutreachWebhookUrl, translateWorkflowError } from '@/lib/nexora/config';
import { PrepareOutreachResponse } from '@/types/nexora';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/nexora/prepare-outreach
 * Proxies request to n8n Workflow 02 (Prepare Outreach).
 * Generates personalized email and WhatsApp drafts without contacting the lead.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object' || !body.leadId) {
      return NextResponse.json(
        { ok: false, error: 'Valid leadId is required.' },
        { status: 400 }
      );
    }

    const { leadId } = body;
    const webhookUrl = getPrepareOutreachWebhookUrl();

    if (!webhookUrl) {
      return NextResponse.json(
        { ok: false, error: 'N8N_PREPARE_OUTREACH_WEBHOOK_URL is not configured.' },
        { status: 503 }
      );
    }

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Nexora.Xai-Backend/1.0',
      },
      body: JSON.stringify({ leadId: String(leadId).trim() }),
    });

    if (!n8nResponse.ok) {
      const errText = await n8nResponse.text().catch(() => '');
      let parsedMsg = '';
      try {
        const parsed = JSON.parse(errText);
        parsedMsg = parsed.message || parsed.error || '';
      } catch {
        parsedMsg = errText;
      }

      const translated = translateWorkflowError(parsedMsg || 'Failed to prepare outreach');

      return NextResponse.json(
        {
          ok: false,
          error: translated,
        },
        { status: n8nResponse.status === 404 ? 404 : 502 }
      );
    }

    const rawData = await n8nResponse.json().catch(() => null);
    const resolvedData = Array.isArray(rawData) ? rawData[0] : rawData;

    if (!resolvedData || typeof resolvedData !== 'object') {
      return NextResponse.json(
        { ok: false, error: 'Malformed response from outreach preparation workflow.' },
        { status: 502 }
      );
    }

    const responsePayload: PrepareOutreachResponse = {
      ok: Boolean(resolvedData.ok ?? true),
      leadId: resolvedData.lead_id || resolvedData.leadId || leadId,
      businessName: resolvedData.business_name || resolvedData.businessName || '',
      email_draft: resolvedData.email_draft,
      whatsapp_draft: resolvedData.whatsapp_draft,
      note: resolvedData.note || 'Draft prepared. No message has been sent.',
    };

    return NextResponse.json(responsePayload);
  } catch (err: unknown) {
    console.error('[Nexora Prepare Outreach Error]:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { ok: false, error: 'An unexpected error occurred while preparing outreach.' },
      { status: 500 }
    );
  }
}
