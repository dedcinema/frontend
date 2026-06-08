import { NextRequest, NextResponse } from 'next/server'

// Allowlist: only the configured S3 host is permitted.
// Prevents SSRF — arbitrary URLs (localhost, 169.254.169.254, RFC1918) are rejected.
function getAllowedHost(): string {
  const s3Url = process.env.NEXT_PUBLIC_S3_URL
  if (!s3Url) throw new Error('NEXT_PUBLIC_S3_URL is not set')
  return new URL(s3Url).hostname.replace(/\.$/, '').toLowerCase()
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const raw = req.nextUrl.searchParams.get('url')
  if (!raw) return new NextResponse('Missing url param', { status: 400 })

  let target: URL
  try {
    target = new URL(raw)
  } catch {
    return new NextResponse('Invalid URL', { status: 400 })
  }

  // Only https allowed — http could leak to mixed-content or internal services
  if (target.protocol !== 'https:') {
    return new NextResponse('Only https URLs are allowed', { status: 400 })
  }

  // Strict hostname allowlist — no private IPs, no metadata endpoints, no redirects to them
  let allowedHost: string
  try {
    allowedHost = getAllowedHost()
  } catch {
    return new NextResponse('Proxy not configured', { status: 500 })
  }

  const requestedHost = target.hostname.replace(/\.$/, '').toLowerCase()
  if (requestedHost !== allowedHost) {
    return new NextResponse('Host not allowed', { status: 403 })
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: { 'User-Agent': 'DedCinema-Proxy/1.0' },
      // 'manual' prevents the Node fetch from silently following redirects to
      // a different host that wasn't validated (redirect-based SSRF)
      redirect: 'manual',
    })

    // Block redirects — re-validating Location on every hop is complex;
    // S3 pre-signed URLs don't redirect, so this is safe to reject
    if (upstream.status >= 300 && upstream.status < 400) {
      return new NextResponse('Redirects not allowed', { status: 422 })
    }

    if (!upstream.ok) {
      return new NextResponse('Upstream error', { status: upstream.status })
    }

    const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'

    // Only proxy image content — reject unexpected content types
    if (!contentType.startsWith('image/')) {
      return new NextResponse('Non-image content rejected', { status: 422 })
    }

    const body = await upstream.arrayBuffer()

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error('[api/media] fetch failed:', raw, err)
    return new NextResponse('Failed to fetch upstream', { status: 502 })
  }
}
