import { NextResponse } from 'next/server';
import { getLeadsWebhookUrl } from '@/lib/nexora/config';
import { CRMLeadsResponse, RawCRMLead } from '@/types/nexora';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/nexora/leads
 * Proxies request to n8n Workflow 03 (CRM Read).
 * Fetches real CRM leads from Google Sheets.
 */
export async function GET() {
  const webhookUrl = getLeadsWebhookUrl();

  if (!webhookUrl) {
    return NextResponse.json(
      {
        ok: false,
        count: 0,
        leads: [],
        error: 'N8N_LEADS_WEBHOOK_URL is not configured on the server.',
      },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Nexora.Xai-Backend/1.0',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const statusText = res.statusText || 'n8n CRM leads fetch failed';
      return NextResponse.json(
        {
          ok: false,
          count: 0,
          leads: [],
          error: `CRM Read workflow returned status ${res.status}: ${statusText}.`,
        },
        { status: 502 }
      );
    }

    const data = await res.json().catch(() => null);

    if (!data || typeof data !== 'object') {
      return NextResponse.json(
        {
          ok: false,
          count: 0,
          leads: [],
          error: 'Malformed response received from CRM read workflow.',
        },
        { status: 502 }
      );
    }

    const leads: RawCRMLead[] = Array.isArray(data.leads)
      ? data.leads
      : Array.isArray(data)
      ? data
      : [];

    const responsePayload: CRMLeadsResponse = {
      ok: Boolean(data.ok ?? true),
      count: typeof data.count === 'number' ? data.count : leads.length,
      leads,
    };

    return NextResponse.json(responsePayload, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: unknown) {
    console.error('[Nexora Leads Proxy Error]:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      {
        ok: false,
        count: 0,
        leads: [],
        error: 'Failed to retrieve CRM leads from automation service.',
      },
      { status: 500 }
    );
  }
}
