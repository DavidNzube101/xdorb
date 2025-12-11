"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StorageVisualization } from "@/components/storage-visualization"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import useSWR from "swr"
import { AlertCircle } from "lucide-react"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json.data
}

export default function AnalyticsPage() {
  const [showSimulated, setShowSimulated] = useState(true)
  const { data: analytics, isLoading } = useSWR(`/api/analytics?simulated=${showSimulated}`, fetcher)

  const performanceData = analytics?.performance || []
  const hasData = performanceData.length > 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">XDOrb Analytics</h1>
            <p className="text-muted-foreground mt-1">Deep dive into network performance metrics</p>
          </div>
          <div className="flex items-center gap-2 bg-card p-2 rounded-lg border border-border">
            <Switch id="simulated-global" checked={showSimulated} onCheckedChange={setShowSimulated} />
            <Label htmlFor="simulated-global" className="text-sm font-medium cursor-pointer">Simulated Data</Label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Monthly Validation Trend</CardTitle>
              <CardDescription>Transaction validation volume</CardDescription>
            </CardHeader>
            <CardContent className="relative min-h-[300px]">
              {!hasData && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-lg">
                  <div className="flex flex-col items-center text-center p-4">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Data Unavailable</p>
                    <p className="text-xs text-muted-foreground">Network history is currently being aggregated.</p>
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hasData ? performanceData : []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                  <Line type="monotone" dataKey="validation" stroke="var(--color-primary)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Performance Comparison</CardTitle>
              <CardDescription>Rewards vs Latency over time</CardDescription>
            </CardHeader>
            <CardContent className="relative min-h-[300px]">
              {!hasData && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-lg">
                  <div className="flex flex-col items-center text-center p-4">
                    <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium">Data Unavailable</p>
                    <p className="text-xs text-muted-foreground">Performance metrics coming soon.</p>
                  </div>
                </div>
              )}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hasData ? performanceData : []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                  <YAxis stroke="var(--color-muted-foreground)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="rewards" fill="var(--color-primary)" />
                  <Bar dataKey="latency" fill="var(--color-secondary)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <StorageVisualization 
          totalCapacity={analytics?.storage?.totalCapacity}
          usedCapacity={analytics?.storage?.usedCapacity}
        />

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>AI-generated network analysis</CardDescription>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <p className="font-semibold text-foreground mb-1">Peak Performance</p>
                  <p className="text-sm text-foreground">
                    Network validated {showSimulated ? "12,500" : "-"} transactions in March with 23% higher throughput than average.
                  </p>
                </div>
                <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/30">
                  <p className="font-semibold text-foreground mb-1">Optimization Opportunity</p>
                  <p className="text-sm text-foreground">
                    Average latency {showSimulated ? "increased 15%" : "stable"} in June. Consider geographic node rebalancing.
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <p className="font-semibold text-foreground mb-1">Growth Trend</p>
                  <p className="text-sm text-foreground">
                    Consistent {showSimulated ? "8%" : "-"} month-over-month growth in rewards indicates healthy network expansion.
                  </p>
                </div>
              </div>
            ) : (
               <div className="flex items-center justify-center py-8 text-muted-foreground">
                 <p>Insufficient data to generate insights.</p>
               </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
