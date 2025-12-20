import { NextRequest, NextResponse } from 'next/server';

// This dynamic route acts as a proxy for all API calls to the real backend.
// It catches all requests to /api/* and forwards them.
async function handler(request: NextRequest, context: { params: { slug?: string[] } }) {
  const requestUrl = new URL(request.url);

  // Bypassing the unreliable context.params by deriving the path from the request URL.
  // request.url.pathname will be something like "/api/dashboard/stats"
  const slugPath = requestUrl.pathname.startsWith('/api/')
    ? requestUrl.pathname.substring(5)
    : requestUrl.pathname;

  const backendUrl = process.env.API_BASE;
  const apiKey = process.env.API_KEY;

  if (!backendUrl || !apiKey) {
    console.error("! ERROR: API_BASE or API_KEY not set in environment variables");
    return NextResponse.json(
      { error: 'Server configuration error: Backend URL or API key not configured' },
      { status: 500 }
    );
  }

  // Reconstruct the final backend URL
  const finalUrl = `${backendUrl}/${slugPath}${requestUrl.search}`;
  console.log(`--> API Proxy: Forwarding ${request.method} ${requestUrl.pathname} to ${finalUrl}`);

  try {
    const backendResponse = await fetch(finalUrl, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      // Forward the body only for relevant methods
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      // Use a short timeout and revalidate frequently for live data
      next: { revalidate: 5 },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error(`! ERROR: Backend API error on /${slugPath}: ${backendResponse.status} ${backendResponse.statusText}`, errorText);
      return NextResponse.json(
        { error: `Backend API error: ${backendResponse.statusText}` },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    if (error instanceof Error) {
      console.error(`! CATCH ERROR on /${slugPath}:`, error.message);
    } else {
      console.error(`! CATCH UNKNOWN ERROR on /${slugPath}:`, error);
    }
    return NextResponse.json(
      { error: 'Failed to fetch data from backend service' },
      { status: 503 } // Service Unavailable
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };