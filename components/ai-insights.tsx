"use client"

import { useState, useEffect } from "react"
import { Brain, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { aiClient, type AIInsight, type PNodeMetrics } from "@/lib/api"
import useSWR from "swr"
import { apiClient } from "@/lib/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AIInsights() {
  const [selectedId, setSelectedId] = useState<string>('')
  const [insight, setInsight] = useState<AIInsight | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: pnodes } = useSWR('/pnodes', () => apiClient.getPNodes().then(r => r.data || []))
  const { data: historyData } = useSWR(
    selectedId ? `/pnodes/${selectedId}/history?range=24h` : null,
    () => apiClient.getPNodeHistory(selectedId, '24h').then(r => r.data)
  )

  const selectedPnode = pnodes?.find(p => p.id === selectedId)

  const generateInsight = async () => {
    if (!selectedPnode) return
    setLoading(true)
    setError(null)
    try {
      const result = await aiClient.getPNodeInsight(
        selectedPnode,
        historyData?.map(h => ({ timestamp: h.timestamp, uptime: h.uptime }))
      )
      setInsight(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedPnode) {
      generateInsight()
    }
  }, [selectedPnode?.id, historyData])

  const getRiskColor = (score: number) => {
    if (score < 30) return "bg-green-500/20 text-green-600"
    if (score < 70) return "bg-yellow-500/20 text-yellow-600"
    return "bg-red-500/20 text-red-600"
  }

  const getRiskIcon = (score: number) => {
    if (score < 30) return <TrendingUp className="w-4 h-4" />
    if (score < 70) return <AlertTriangle className="w-4 h-4" />
    return <AlertTriangle className="w-4 h-4" />
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI-Powered Insights
        </CardTitle>
        <CardDescription>
          {selectedPnode ? `Predictive analysis and recommendations for ${selectedPnode.name}` : 'Select a pNode to analyze its performance'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a pNode" />
          </SelectTrigger>
          <SelectContent>
            {pnodes?.filter(p => p.id).slice(0, 10).map(p => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedPnode && loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Analyzing performance...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-red-500 mb-2">{error}</p>
            <Button onClick={generateInsight} variant="outline" size="sm">
              Retry Analysis
            </Button>
          </div>
        )}

        {insight && !loading && (
          <>
            {/* Risk Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Risk Score</span>
              <Badge className={getRiskColor(insight.riskScore)}>
                {getRiskIcon(insight.riskScore)}
                <span className="ml-1">{insight.riskScore.toFixed(1)}%</span>
              </Badge>
            </div>

            {/* Explanation */}
            <div>
              <h4 className="text-sm font-medium mb-2">Analysis</h4>
              <p className="text-sm text-muted-foreground">{insight.explanation}</p>
            </div>

            {/* Summary */}
            <div>
              <h4 className="text-sm font-medium mb-2">Summary</h4>
              <p className="text-sm">{insight.summary}</p>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                Recommendations
              </h4>
              <ul className="space-y-1">
                {insight.recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <Button onClick={generateInsight} variant="outline" size="sm" className="w-full">
              Refresh Analysis
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}