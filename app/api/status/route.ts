import { NextResponse } from 'next/server'

export async function GET() {
  const apiBase = process.env.API_BASE
  const apiKey = process.env.API_KEY

  if (!apiBase || !apiKey) {
    return NextResponse.json({ maintenance: true })
  }

  return NextResponse.json({ ok: true })
}