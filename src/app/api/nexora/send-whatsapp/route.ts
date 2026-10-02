import { NextRequest, NextResponse } from 'next/server';
import { getSendWhatsAppWebhookUrl, translateWorkflowError } from '@/lib/nexora/config';
import { SendChannelResponse } from '@/types/nexora';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/nexora/send-whatsapp
 * Proxies request to n8n Workflow 02 (Send WhatsApp).
 * Mandatory Safety:
 * - Requires confirm: "SEND"
 * - Recipient phone is resolved by n8n from CRM using leadId.
 * - Browser NEVER sends arbitrary recipient phone numbers.
 * - Zero Meta credentials exist in web application.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { ok: false, sent: false, error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { leadId, confirm, message } = body;

    if (!leadId || typeof leadId !== 'string' || leadId.trim().length === 0) {
      return NextResponse.json(
        { ok: false, sent: false, error: 'Valid leadId is required.' },
        { status: 400 }
      );
    }

    // Strict safety check for explicit human confirmation
    if (confirm !== 'SEND') {
      return NextResponse.json(
        {
          ok: false,
          sent: false,
          error: 'Outreach rejected: Explicit confirmation confirm="SEND" is required.',
        },
        { status: 403 }
      );
    }

    const webhookUrl = getSendWhatsAppWebhookUrl();

    if (!webhookUrl) {
      return NextResponse.json(
        { ok: false, sent: false, error: 'N8N_SEND_WHATSAPP_WEBHOOK_URL is not configured.' },
        { status: 503 }
      );
    }

    // Payload sent to n8n: ONLY leadId, confirm: "SEND", and optional edited message
    // NEVER arbitrary recipient phone number!
    const n8nPayload = {
      leadId: leadId.trim(),
      confirm: 'SEND',
      ...(message ? { message: String(message).trim() } : {}),
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
      let parsedCode = '';
      try {
        const parsed = JSON.parse(errText);
        parsedCode = parsed.code || parsed.error || parsed.message || '';
      } catch {
        parsedCode = errText;
      }

      const translated = translateWorkflowError(parsedCode || 'WhatsApp dispatch failed.');

      return NextResponse.json(
        {
          ok: false,
          sent: false,
          error: translated,
        },
        { status: n8nResponse.status === 400 || n8nResponse.status === 404 ? n8nResponse.status : 502 }
      );
    }

    const rawData = await n8nResponse.json().catch(() => null);
    const resolvedData = Array.isArray(rawData) ? rawData[0] : rawData;

    const responsePayload: SendChannelResponse = {
      ok: Boolean(resolvedData?.ok ?? true),
      sent: true,
      statusMessage: resolvedData?.message || 'WhatsApp message sent successfully via Workflow 02.',
    };

    return NextResponse.json(responsePayload);
  } catch (err: unknown) {
    console.error('[Nexora Send WhatsApp Proxy Error]:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { ok: false, sent: false, error: 'Server error processing WhatsApp outreach.' },
      { status: 500 }
    );
  }
}
