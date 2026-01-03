// /app/api/credits/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const network = searchParams.get('network') || 'devnet';

  const API_URLS = {
    devnet: 'https://podcredits.xandeum.network/api/pods-credits',
    mainnet: 'https://podcredits.xandeum.network/api/mainnet-pod-credits',
  };

  const apiUrl = API_URLS[network as keyof typeof API_URLS] || API_URLS.devnet;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch credits: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Credits API Proxy] Error:', error);
    return NextResponse.json(
      { message: 'Error fetching credits data' },
      { status: 500 }
    );
  }
}
