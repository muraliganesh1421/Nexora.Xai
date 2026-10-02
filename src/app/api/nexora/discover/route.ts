import { NextRequest, NextResponse } from 'next/server';
import { NEXORA_CONFIG, getDiscoveryWebhookUrl, isDiscoveryConfigured } from '@/lib/nexora/config';
import { DiscoveryRequest, DiscoveryResponse } from '@/types/nexora';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { ok: false, processed: 0, error: 'Invalid request body. Expected JSON.' },
        { status: 400 }
      );
    }

    const { category, city, country, maxResults, minScore } = body as Partial<DiscoveryRequest>;

    // Strict Server-Side Validation
    if (!category || typeof category !== 'string' || category.trim().length === 0) {
      return NextResponse.json(
        { ok: false, processed: 0, error: 'Business category / industry is required.' },
        { status: 400 }
      );
    }

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      return NextResponse.json(
        { ok: false, processed: 0, error: 'City is required.' },
        { status: 400 }
      );
    }

    if (!country || typeof country !== 'string' || country.trim().length === 0) {
      return NextResponse.json(
        { ok: false, processed: 0, error: 'Country is required.' },
        { status: 400 }
      );
    }

    const parsedMaxResults = Number(maxResults);
    if (
      !Number.isInteger(parsedMaxResults) ||
      parsedMaxResults < NEXORA_CONFIG.limits.maxResultsMin ||
      parsedMaxResults > NEXORA_CONFIG.limits.maxResultsMax
    ) {
      return NextResponse.json(
        {
          ok: false,
          processed: 0,
          error: `Number of leads must be an integer between ${NEXORA_CONFIG.limits.maxResultsMin} and ${NEXORA_CONFIG.limits.maxResultsMax}.`,
        },
        { status: 400 }
      );
    }

    const parsedMinScore = Number(minScore);
    if (
      !Number.isInteger(parsedMinScore) ||
      parsedMinScore < NEXORA_CONFIG.limits.minScoreMin ||
      parsedMinScore > NEXORA_CONFIG.limits.minScoreMax
    ) {
      return NextResponse.json(
        {
          ok: false,
          processed: 0,
          error: `Minimum AI Score must be an integer between ${NEXORA_CONFIG.limits.minScoreMin} and ${NEXORA_CONFIG.limits.minScoreMax}.`,
        },
        { status: 400 }
      );
    }

    const sanitizedPayload: DiscoveryRequest = {
      category: category.trim(),
      city: city.trim(),
      country: country.trim(),
      maxResults: parsedMaxResults,
      minScore: parsedMinScore,
    };

    // Forward both camelCase and snake_case to support n8n workflow variable mappings
    const n8nPayload = {
      ...sanitizedPayload,
      max_results: parsedMaxResults,
      min_score: parsedMinScore,
    };

    const webhookUrl = getDiscoveryWebhookUrl();

    // LIVE MODE: Webhook is configured
    if (webhookUrl) {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        NEXORA_CONFIG.limits.serverTimeoutMs
      );

      try {
        const n8nResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Nexora.Xai-Backend/1.0',
          },
          body: JSON.stringify(n8nPayload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!n8nResponse.ok) {
          const errBody = await n8nResponse.text().catch(() => '');
          console.error('[n8n Webhook Error Body]:', errBody);

          // Handle zero-result case in n8n where empty item queue results in 500
          if (errBody.includes('No item to return was found')) {
            const zeroResponse: DiscoveryResponse = {
              ok: true,
              processed: 0,
              message: 'Discovery completed. No new leads were added. Some businesses may already exist in your CRM or may not have met the discovery conditions.',
              isDemo: false,
            };
            return NextResponse.json(zeroResponse);
          }

          const statusText = n8nResponse.statusText || 'n8n webhook execution failed';
          return NextResponse.json(
            {
              ok: false,
              processed: 0,
              error: `Discovery workflow returned status ${n8nResponse.status}: ${statusText}.`,
            },
            { status: 502 }
          );
        }

        const rawData = await n8nResponse.json().catch(() => null);

        // Normalize response whether n8n returns an object or an array of objects
        const resolvedData = Array.isArray(rawData) ? rawData[0] : rawData;

        if (!resolvedData || typeof resolvedData !== 'object') {
          return NextResponse.json(
            {
              ok: false,
              processed: 0,
              error: 'Malformed response received from discovery backend.',
            },
            { status: 502 }
          );
        }

        const processed =
          typeof resolvedData.processed === 'number'
            ? resolvedData.processed
            : Number(resolvedData.processed) || 0;

        const responsePayload: DiscoveryResponse = {
          ok: Boolean(resolvedData.ok ?? true),
          processed,
          message:
            resolvedData.message ||
            (processed > 0
              ? 'Lead discovery completed; qualified records are pending manual approval.'
              : 'Discovery completed. No new leads were added.'),
          isDemo: false,
        };

        return NextResponse.json(responsePayload);
      } catch (fetchErr: unknown) {
        clearTimeout(timeoutId);
        const isAbort = (fetchErr as { name?: string })?.name === 'AbortError';

        console.error('[Nexora Discovery Proxy Error]:', isAbort ? 'Timed out' : 'Fetch failed');

        return NextResponse.json(
          {
            ok: false,
            processed: 0,
            error: isAbort
              ? 'Discovery operation timed out after 90 seconds. The search and qualification process may still be running in the background.'
              : 'Failed to communicate with discovery automation service. Please check connection and try again.',
          },
          { status: 504 }
        );
      }
    }

    // DEMO MODE: ONLY if webhook is not configured at all
    // Provide explicit demo status and never mix with live
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const demoResponse: DiscoveryResponse = {
      ok: true,
      processed: Math.min(sanitizedPayload.maxResults, 3),
      message:
        'Lead discovery completed (Demo Mode); qualified records are pending manual approval.',
      isDemo: true,
    };

    return NextResponse.json(demoResponse);
  } catch (err: unknown) {
    console.error('[Nexora Discovery Handler Error]:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      {
        ok: false,
        processed: 0,
        error: 'An internal server error occurred while processing discovery request.',
      },
      { status: 500 }
    );
  }
}
