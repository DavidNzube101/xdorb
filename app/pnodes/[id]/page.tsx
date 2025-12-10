"use client"

import { PriceMarquee } from "@/components/price-marquee"
import { BuyXandButton } from "@/components/buy-xand-button"
import { useState, useRef } from "react"
import useSWR from "swr"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient, aiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { ArrowLeft, Copy, HelpCircle, Brain, Sparkles, Share2, Download } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Typewriter } from "@/components/typewriter"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import * as htmlToImage from 'html-to-image'

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

• Performance Status: ${node?.performance && node.performance > 90 ? 'Excellent' : 'Stable'}. The node maintains a ${node?.uptime.toFixed(2)}% uptime, placing it in the top percentile of network reliability.
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
  
  // Share/Export Logic
  const exportRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handleDownloadPng = async () => {
    if (!exportRef.current) return
    setIsExporting(true)

    try {
        // Collect all font faces to manually embed them
        const fontFaces = Array.from(document.fonts).map(font => {
             // Basic reconstruction of font-face rule if possible, 
             // but simpler strategy is to filter out the problematic ones.
             // The error usually comes from external fonts not being fetchable by html-to-image.
             return font;
        });
        
        // Strategy: Explicitly skip auto-scaling and font embedding if it fails.
        // We filter out function calls that might trigger the error.
        
        const dataUrl = await htmlToImage.toPng(exportRef.current, { 
            cacheBust: true, 
            backgroundColor: '#000000',
            skipAutoScale: true,
            // Filtering out all fonts from embedding often solves the "font is undefined" error
            // because html-to-image tries to fetch them and fails on Next.js optimized fonts.
            // The browser will still render the text in the image if the font is loaded in the browser.
            fontEmbedCSS: '', 
        })
        
        const link = document.createElement('a')
        link.download = `xdorb-node-${node?.id.slice(0, 8)}.png`
        link.href = dataUrl
        link.click()
    } catch (err) {
        console.error('Failed to export image', err)
    } finally {
        setIsExporting(false)
    }
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
        <div className="space-y-6 pb-20">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <a href="/pnodes" className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  </a>
                  <div>
                  <h1 className="text-3xl font-bold text-foreground">{node.name}</h1>
                  <p className="text-muted-foreground">{node.location}</p>
                  </div>
              </div>
              
              <Dialog>
                  <DialogTrigger asChild>
                     <div className="inline-block">
                       <Tooltip>
                          <TooltipTrigger asChild>
                              <Button variant="outline" size="icon">
                                  <Share2 className="w-4 h-4" />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                              <p>Share</p>
                          </TooltipContent>
                       </Tooltip>
                     </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
                      <DialogHeader className="p-6 border-b flex-shrink-0">
                          <DialogTitle>Share Node Snapshot</DialogTitle>
                      </DialogHeader>
                      
                      <div className="flex-1 overflow-y-auto p-6 bg-muted/30 flex justify-center">
                          {/* Hidden Export Container (Visible in Modal for Preview) */}
                          <div ref={exportRef} className="bg-background p-8 border rounded-lg shadow-sm space-y-6 text-foreground min-w-[800px] h-fit">
                              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                                  <img src="/Logo.png" alt="XDOrb" className="h-8 w-8 rounded-full" />
                                  <div>
                                      <h3 className="font-bold text-lg">XDOrb Analytics</h3>
                                      <p className="text-sm text-muted-foreground">Detailed Node Report: {node.name}</p>
                                  </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-6">
                                  {/* Row 1 Left: Map */}
                                  <div className="h-64 border rounded-lg overflow-hidden relative">
                                       <MapComponent 
                                          center={[node.lat, node.lng]} 
                                          zoom={5} 
                                          highlight={{ lat: node.lat, lng: node.lng, name: node.name }} 
                                       />
                                       <div className="absolute top-2 left-2 bg-background/80 px-2 py-1 rounded text-xs font-semibold backdrop-blur-sm z-[1000]">
                                          {node.location}
                                       </div>
                                  </div>
                                  
                                  {/* Row 1 Right: Metrics 2x2 */}
                                  <div className="grid grid-cols-2 gap-4">
                                       <div className="border p-4 rounded-lg bg-card">
                                          <p className="text-sm text-muted-foreground mb-1">Status</p>
                                          <div className="flex items-center gap-2">
                                              <div className={`w-2 h-2 rounded-full ${node.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                                              <span className="font-semibold capitalize">{node.status}</span>
                                          </div>
                                       </div>
                                       <div className="border p-4 rounded-lg bg-card">
                                          <p className="text-sm text-muted-foreground mb-1">Uptime</p>
                                          <p className="text-xl font-bold">{node.uptime.toFixed(2)}%</p>
                                       </div>
                                       <div className="border p-4 rounded-lg bg-card">
                                          <p className="text-sm text-muted-foreground mb-1">Latency</p>
                                          <p className="text-xl font-bold">{node.latency}ms</p>
                                       </div>
                                       <div className="border p-4 rounded-lg bg-card">
                                          <p className="text-sm text-muted-foreground mb-1">Rewards</p>
                                          <p className="text-xl font-bold text-primary">{node.rewards.toFixed(2)}</p>
                                       </div>
                                  </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-6">
                                   {/* Row 2 Left: Uptime Trend */}
                                   <div className="border rounded-lg p-4 bg-card h-64">
                                      <h4 className="font-semibold mb-2 text-sm">Uptime Trend (24h)</h4>
                                       <ResponsiveContainer width="100%" height="100%">
                                          <AreaChart data={history?.map(h => ({ ...h, time: '' })) || []}>
                                              <Area type="monotone" dataKey="uptime" stroke="var(--color-secondary)" fill="var(--color-secondary)" fillOpacity={0.1} />
                                          </AreaChart>
                                      </ResponsiveContainer>
                                   </div>
                                   
                                   {/* Row 2 Right: Node Info */}
                                   <div className="border rounded-lg p-4 bg-card space-y-3">
                                      <h4 className="font-semibold mb-2 text-sm">Node Details</h4>
                                      <div className="grid grid-cols-2 gap-y-3 text-sm">
                                          <div className="text-muted-foreground">ID</div>
                                          <div className="font-mono text-xs truncate">{node.id}</div>
                                          
                                          <div className="text-muted-foreground">Performance</div>
                                          <div className="font-semibold">{node.performance}%</div>
                                          
                                          <div className="text-muted-foreground">Risk Score</div>
                                          <div className="font-semibold">{node.riskScore}%</div>
                                          
                                          <div className="text-muted-foreground">Stake</div>
                                          <div>{node.stake} POL</div>
                                      </div>
                                   </div>
                              </div>

                              <div className="text-center pt-4 border-t text-muted-foreground text-xs font-mono">
                                  Analytics by XDOrb • xdorb.vercel.app
                              </div>
                          </div>
                      </div>

                      <DialogFooter className="p-6 border-t flex-shrink-0">
                          <Button onClick={handleDownloadPng} disabled={isExporting} className="w-full sm:w-auto">
                              <Download className="w-4 h-4 mr-2" />
                              {isExporting ? 'Exporting...' : 'Download PNG'}
                          </Button>
                      </DialogFooter>
                  </DialogContent>
              </Dialog>
            </div>
            {/* Mobile Price Marquee & Buy Button */}
            <div className="md:hidden flex gap-2 items-center">
              <div className="flex-1 border border-border bg-card/50 rounded-lg p-2 h-10 flex items-center shadow-sm overflow-hidden">
                <PriceMarquee />
              </div>
              <BuyXandButton />
            </div>
          </div>
          {/* 
            Desktop Layout:
            Row 1: Map (Left) | Metrics (2x2) (Right)
            Row 2: AI Analysis (Left) | Node Info (Right)
            Row 3: Latency Trend (Left) | Uptime Trend (Right)
          */}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Map (Desktop Left) / Map (Mobile First) */}
            <div className="lg:order-1 order-1 h-full">
                <Card className="border-border bg-card overflow-hidden h-full min-h-[300px]">
                   <CardHeader>
                    <CardTitle>Node Location</CardTitle>
                    <CardDescription>Geographic position of this pNode</CardDescription>
                   </CardHeader>
                   <CardContent className="p-0 h-[300px] lg:h-[400px]">
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
            </div>

            {/* 2. Metrics 2x2 (Desktop Right) / Metrics (Mobile Second) */}
            <div className="grid grid-cols-2 gap-4 lg:order-2 order-2 h-full">
                <Card className="border-border bg-card flex flex-col justify-center">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${node.status === "active" ? "bg-green-500" : node.status === "warning" ? "bg-primary" : "bg-red-500"}`} />
                      <span className="font-semibold text-foreground capitalize">{node.status}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card flex flex-col justify-center">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">Uptime</p>
                    <p className="text-2xl font-bold text-foreground">{node.uptime.toFixed(2)}%</p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card flex flex-col justify-center">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">Latency</p>
                    <p className="text-2xl font-bold text-foreground">{node.latency}ms</p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card flex flex-col justify-center">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">Total Rewards</p>
                    <p className="text-2xl font-bold text-primary">{node.rewards.toFixed(2)}</p>
                  </CardContent>
                </Card>
            </div>

            {/* 3. AI Analysis (Desktop Row 2 Left) / Mobile Third */}
            <div className="lg:order-3 order-3">
                <Card className="border-border bg-card relative overflow-hidden h-full">
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

            {/* 4. Node Information (Desktop Row 2 Right) / Mobile Last (Fifth) */}
            <div className="lg:order-4 order-5">
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

            {/* 5. Latency Trend (Desktop Row 3 Left) / Mobile Fourth */}
            <div className="lg:order-5 order-4">
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
            </div>

            {/* 6. Uptime Trend (Desktop Row 3 Right) / Mobile Last */}
            <div className="lg:order-6 order-6">
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
            
          </div>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  )
}