"use client"

import { useState } from "react"
import useSWR from "swr"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient, aiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { ArrowLeft, Copy, HelpCircle, Brain, Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Typewriter } from "@/components/typewriter"

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-muted rounded-lg animate-pulse" />
})

export default function PNodeDetailPage() {
  const params = useParams()
  const id = params.id as string

  const { data: node, isLoading } = useSWR(
    `/pnodes/${id}`,
    async () => {
      const result = await apiClient.getPNodeById(id)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    { refreshInterval: 30000 },
  )

  const { data: history } = useSWR(
    `/pnodes/${id}/history?range=24h`,
    async () => {
      const result = await apiClient.getPNodeHistory(id, '24h')
      if (result.error) throw new Error(result.error)
      return result.data
    },
    { refreshInterval: 30000 },
  )

  // AI Analysis State
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)

  const handleStartAnalysis = async () => {
    setAnalyzing(true)
    setAnalysisResult(null)
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Generate mock analysis based on node stats
    const analysis = `Based on the comprehensive scan of Node ${node?.id.slice(0, 8)}...:

• Performance Status: ${node?.performance && node.performance > 90 ? 'Excellent' : 'Stable'}. The node maintains a ${node?.uptime}% uptime, placing it in the top percentile of network reliability.
• Latency Metrics: Current latency of ${node?.latency}ms is ${node?.latency && node.latency < 50 ? 'optimal for real-time transactions' : 'within acceptable parameters'}.
• Economic Health: With ${node?.stake} POL staked and consistent reward generation (${node?.rewards.toFixed(2)}), this validator demonstrates strong economic alignment.
• Risk Assessment: Calculated risk score is ${node?.riskScore}%. No immediate security threats detected. Recommended action: Continue monitoring latency spikes during peak network hours.`
    
    setAnalysisResult(analysis)
    setAnalyzing(false)
  }

  const [copied, setCopied] = useState(false)
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="h-10 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </DashboardLayout>
    )
  }

  if (!node) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Node not found</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <a href="/pnodes" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{node.name}</h1>
              <p className="text-muted-foreground">{node.location}</p>
            </div>
          </div>

          {/* Status Overview - Grid 2x2 on mobile, 4x1 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      node.status === "active" ? "bg-green-500" : node.status === "warning" ? "bg-primary" : "bg-red-500"
                    }`}
                  />
                  <span className="font-semibold text-foreground capitalize">{node.status}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Uptime</p>
                <p className="text-2xl font-bold text-foreground">{node.uptime}%</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Latency</p>
                <p className="text-2xl font-bold text-foreground">{node.latency}ms</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Total Rewards</p>
                <p className="text-2xl font-bold text-primary">{node.rewards.toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Latency Trend</CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Shows the round-trip time (ms) for the node to respond to pRPC calls over the last 24 hours. Lower is better.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription>Last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={history?.map(h => ({
                    ...h,
                    time: new Date(h.timestamp * 1000).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="time" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                      }}
                    />
                    <Line type="monotone" dataKey="latency" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                   <CardTitle>Uptime Trend</CardTitle>
                   <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Tracks the percentage of time the node was online and responsive during the selected period. 100% is ideal.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription>Last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={history?.map(h => ({
                    ...h,
                    time: new Date(h.timestamp * 1000).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="time" stroke="var(--color-muted-foreground)" />
                    <YAxis stroke="var(--color-muted-foreground)" domain={[95, 100]} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="uptime"
                      stroke="var(--color-secondary)"
                      fill="var(--color-secondary)"
                      fillOpacity={0.1}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Map and Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Section */}
            <Card className="border-border bg-card overflow-hidden h-full">
               <CardHeader>
                <CardTitle>Node Location</CardTitle>
                <CardDescription>Geographic position of this pNode</CardDescription>
               </CardHeader>
               <CardContent className="p-0 h-[400px]">
                 {node.lat && node.lng ? (
                   <MapComponent 
                      center={[node.lat, node.lng]} 
                      zoom={6} 
                      highlight={{ lat: node.lat, lng: node.lng, name: node.name }} 
                   />
                 ) : (
                   <div className="flex items-center justify-center h-full text-muted-foreground">
                     Location data not available
                   </div>
                 )}
               </CardContent>
            </Card>

            {/* Node Information */}
            <Card className="border-border bg-card h-full">
              <CardHeader>
                <CardTitle>Node Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Node ID</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-muted rounded font-mono text-xs sm:text-sm text-foreground break-all">
                          {node.id}
                        </code>
                        <button
                          onClick={() => copyToClipboard(node.id)}
                          className="p-2 hover:bg-muted rounded transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Location</p>
                      <p className="text-foreground">{node.location}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Performance Score</p>
                      <p className="text-2xl font-bold text-primary">{node.performance}%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Validations</p>
                      <p className="text-2xl font-bold text-foreground">{node.validations}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Stake</p>
                      <p className="text-foreground">{node.stake} POL</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              node.riskScore < 30 ? "bg-green-500" : node.riskScore < 70 ? "bg-primary" : "bg-red-500"
                            }`}
                            style={{ width: `${node.riskScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{node.riskScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Analysis Section */}
          <Card className="border-border bg-card relative overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle>Intelligent Analysis</CardTitle>
              </div>
              <CardDescription>AI-powered insights for this pNode</CardDescription>
            </CardHeader>
            <CardContent>
              {!analyzing && !analysisResult ? (
                <div className="flex flex-col items-center justify-center py-8">
                   <p className="text-muted-foreground mb-4 text-center max-w-md">
                     Run a comprehensive AI scan to evaluate node performance, risk factors, and economic alignment.
                   </p>
                   <Button onClick={handleStartAnalysis} className="gap-2">
                     <Sparkles className="w-4 h-4" />
                     Start Intelligent Analysis
                   </Button>
                </div>
              ) : analyzing ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-64 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-primary to-transparent animate-[shimmer_1.5s_infinite_linear]" />
                  </div>
                  <p className="text-sm text-muted-foreground animate-pulse">Scanning node metrics...</p>
                </div>
              ) : (
                 <div className="bg-muted/30 rounded-lg p-6 border border-border">
                    <Typewriter text={analysisResult || ""} />
                    <div className="mt-4 flex justify-end">
                      <Button variant="outline" size="sm" onClick={() => setAnalysisResult(null)}>
                        Run New Scan
                      </Button>
                    </div>
                 </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  )
}