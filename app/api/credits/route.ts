// /app/api/credits/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://podcredits.xandeum.network/api/pods-credits', {
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
