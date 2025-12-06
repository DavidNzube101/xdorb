import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  return proxyRequest(request, slug)
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  return proxyRequest(request, slug)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  return proxyRequest(request, slug)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  return proxyRequest(request, slug)
}

async function proxyRequest(request: NextRequest, slug: string[]) {
  const apiBase = process.env.API_BASE
  const apiKey = process.env.API_KEY

  if (!apiBase || !apiKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const path = slug.join('/')
  const { searchParams } = new URL(request.url)
  const query = searchParams.toString()
  const url = `${apiBase}/${path}${query ? '?' + query : ''}`

  try {
    const body = request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined

    const response = await fetch(url, {
      method: request.method,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...Object.fromEntries(request.headers.entries()),
      },
      body,
    })

    const data = await response.text()
    const headers = new Headers(response.headers)
    // Remove hop-by-hop headers
    headers.delete('connection')
    headers.delete('keep-alive')
    headers.delete('proxy-authenticate')
    headers.delete('proxy-authorization')
    headers.delete('te')
    headers.delete('trailers')
    headers.delete('transfer-encoding')
    headers.delete('upgrade')
    headers.delete('content-encoding')
    headers.delete('content-length')

    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}