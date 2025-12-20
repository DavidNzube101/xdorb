import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const queryString = searchParams.toString();
  const backendUrl = `https://xdorb-backend.onrender.com/api/jupiter/quote?${queryString}`;

  try {
    const response = await fetch(backendUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Jupiter API error: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error proxying Jupiter quote:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote', details: error.message },
      { status: 500 }
    );
  }
}
