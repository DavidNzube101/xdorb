"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import useSWR from "swr"
import { apiClient } from "@/lib/api"
import { AlertTriangle } from "lucide-react"

const historyFetcher = (timeRange: string) => async () => {
  const result = await apiClient.getNetworkHistory(timeRange as any)
  if (result.error) throw new Error(result.error)
  return result.data
}

export function NetworkHealthChart() {
  const { data: history, isLoading } = useSWR("network-history-24h", historyFetcher("24h"), {
    refreshInterval: 300000, // 5 minutes
  })

  // Transform historical data for the chart
  const chartData = history && history.length > 0
    ? history.map((point: any) => ({
        time: new Date(point.timestamp * 1000).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
        }),
        health: point.uptime.toFixed(2),
      }))
    : []

  const currentHealth = chartData.length > 0 ? chartData[chartData.length - 1].health : 0

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Network Health</CardTitle>
        <CardDescription>
          Average pNode uptime over the last 24 hours. Current: {currentHealth}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="h-32 w-full bg-muted rounded-lg animate-pulse" />
          </div>
        )}
        {!isLoading && chartData.length === 0 && (
          <div className="h-[300px] w-full flex flex-col items-center justify-center text-muted-foreground">
            <AlertTriangle className="w-10 h-10 mb-4" />
            <p>Not enough historical data to display chart.</p>
            <p className="text-xs">Check back later.</p>
          </div>
        )}
        {!isLoading && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="time" stroke="var(--color-muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} domain={[90, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                }}
                cursor={{ stroke: "var(--color-primary)" }}
                formatter={(value: number) => [`${value}%`, "Health"]}
              />
              <Line
                type="monotone"
                dataKey="health"
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={false}
                name="Network Health"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
