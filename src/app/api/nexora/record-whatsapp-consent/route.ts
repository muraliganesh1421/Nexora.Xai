import { NextRequest, NextResponse } from 'next/server';
import { getRecordWhatsAppConsentWebhookUrl } from '@/lib/nexora/config';
import { RecordWhatsAppConsentResponse } from '@/types/nexora';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/nexora/record-whatsapp-consent
 * Secure server proxy to n8n record-whatsapp-consent webhook.
 * Converts frontend `{ leadId, consent: true, evidence }`
 * to n8n contract `{ lead_id, consent: true, evidence }`.
 * Never allows consent=false through this endpoint.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { ok: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { leadId, consent, evidence } = body;

    // Validation 1: valid leadId
    if (!leadId || typeof leadId !== 'string' || leadId.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Valid leadId is required.' },
        { status: 400 }
      );
    }

    // Validation 2: consent must be strictly true (never allow false or falsy)
    if (consent !== true) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Explicit consent confirmation (consent=true) is mandatory to record WhatsApp consent.',
        },
        { status: 400 }
      );
    }

    // Validation 3: meaningful non-empty evidence
    if (
      !evidence ||
      typeof evidence !== 'string' ||
      evidence.trim().length < 5
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Meaningful consent evidence is required (minimum 5 characters, e.g. "Customer agreed during phone call on 2 Oct 2026").',
        },
        { status: 400 }
      );
    }

    const webhookUrl = getRecordWhatsAppConsentWebhookUrl();

    if (!webhookUrl) {
      return NextResponse.json(
        {
          ok: false,
          error: 'N8N_RECORD_WHATSAPP_CONSENT_WEBHOOK_URL is not configured on the server.',
        },
        { status: 503 }
      );
    }

    // Convert to n8n contract: lead_id, consent, evidence, and consent_evidence
    const n8nPayload = {
      lead_id: leadId.trim(),
      leadId: leadId.trim(),
      consent: true,
      evidence: evidence.trim(),
      consent_evidence: evidence.trim(),
    };

    const n8nResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Nexora.Xai-Backend/1.0',
      },
      body: JSON.stringify(n8nPayload),
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

      console.error('[Nexora Record Consent n8n Error]:', n8nResponse.status, parsedMsg || errText);

      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to record WhatsApp consent in CRM. Please verify the lead exists and try again.',
        },
        { status: n8nResponse.status === 404 ? 404 : 502 }
      );
    }

    const rawData = await n8nResponse.json().catch(() => null);
    const resolvedData = Array.isArray(rawData) ? rawData[0] : rawData;

    const responsePayload: RecordWhatsAppConsentResponse = {
      ok: Boolean(resolvedData?.ok ?? true),
      message: resolvedData?.message || 'WhatsApp consent recorded successfully.',
    };

    return NextResponse.json(responsePayload);
  } catch (err: unknown) {
    console.error('[Nexora Record Consent Proxy Error]:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      {
        ok: false,
        error: 'An internal server error occurred while processing WhatsApp consent.',
      },
      { status: 500 }
    );
  }
}
