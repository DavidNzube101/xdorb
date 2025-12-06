import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY

  if (!geminiKey) {
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }

  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(geminiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const { pnodeData, history } = await request.json()

    const prompt = `
Analyze this pNode's performance data and provide insights:

pNode ID: ${pnodeData.id}
Current Uptime: ${pnodeData.uptime}%
Status: ${pnodeData.status}
Rewards: ${pnodeData.rewards}
Location: ${pnodeData.location}
Risk Score: ${pnodeData.riskScore}

${history ? `Historical data (last 24h): ${history.map((h: any) => `Time: ${new Date(h.timestamp).toLocaleTimeString()}, Uptime: ${h.uptime}%`).join('; ')}` : ''}

Provide a JSON response with:
- riskScore: number (0-100, higher = higher risk)
- explanation: string (why this risk score)
- summary: string (natural language summary of performance)
- recommendations: array of strings (actionable advice)
`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const insight = JSON.parse(jsonMatch[0])
      return NextResponse.json(insight)
    }

    // Fallback
    return NextResponse.json({
      riskScore: Math.random() * 100,
      explanation: "AI analysis temporarily unavailable",
      summary: "Performance data analyzed",
      recommendations: ["Monitor uptime closely"]
    })
  } catch (error) {
    console.error('AI Insight generation failed:', error)
    return NextResponse.json({
      riskScore: 50,
      explanation: "Unable to generate AI insights at this time",
      summary: "Basic performance monitoring active",
      recommendations: ["Check system logs", "Verify network connectivity"]
    }, { status: 500 })
  }
}