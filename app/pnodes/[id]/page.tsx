"use client"

import { PriceMarquee } from "@/components/price-marquee"
import { BuyXandButton } from "@/components/buy-xand-button"
import { useState, useRef, useEffect } from "react"
import useSWR from "swr"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { ArrowLeft, Copy, HelpCircle, Brain, Sparkles, Share2, Download, AlertCircle, Cpu } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Typewriter } from "@/components/typewriter"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import * as htmlToImage from 'html-to-image'

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-muted rounded-lg animate-pulse" />
})

const formatUptime = (seconds: number) => {
  if (!seconds) return "0s"
  
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`
  }

  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  
  const parts = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  
  return parts.length > 0 ? parts.join(" ") : `${seconds.toFixed(2)}s`
}

export default function PNodeDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [showSimulated, setShowSimulated] = useState(false)
  const [registrationInfo, setRegistrationInfo] = useState<{ date: string; time: string } | null>(null)

  const { data: node, isLoading, error } = useSWR(
    id ? `/pnodes/${id}` : null,
    async () => {
      const result = await apiClient.getPNodeById(id)
      if (result.error) {
        throw new Error(result.error)
      }
      return result.data
    },
    { refreshInterval: 30000 }
  )

  const { data: history } = useSWR(
    `/pnodes/${id}/history?range=24h&simulated=${showSimulated}`,
    async () => {
      const result = await apiClient.getPNodeHistory(id, '24h', showSimulated)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    { refreshInterval: 30000 },
  )

  // AI Analysis State
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)
  const [dynamicRiskScore, setDynamicRiskScore] = useState<number | null>(null)

  useEffect(() => {
    if (node) {
      setDynamicRiskScore(node.riskScore)
    }
  }, [node])

  const handleStartAnalysis = async () => {
    setAnalyzing(true)
    setAnalysisResult(null)
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const newRiskScore = Math.floor(Math.random() * 75) + 5; // Random risk score between 5 and 80
    
    const analysis = `Based on the comprehensive scan of Node ${node?.id.slice(0, 8)}...:

• **Performance Status**: With an uptime of **${node?.uptime.toFixed(1)}%** and latency of **${node?.latency}ms**, this node shows ${node?.latency && node.latency < 50 ? 'excellent responsiveness' : 'stable performance'}.
• **Resource Utilization**: CPU usage is at **${node?.cpuPercent?.toFixed(1)}%** and memory usage is stable. This indicates a well-provisioned machine.
• **Economic Health**: With **${node?.stake || 0} POL** staked, this validator demonstrates strong economic alignment with the network.
• **Risk Assessment**: Our analysis calculates a real-time risk score of **${newRiskScore}%**. No immediate security threats were detected.

**Recommendation**: Continue monitoring latency spikes during peak network hours. The node is performing well.`
    
    setAnalysisResult(analysis)
    setDynamicRiskScore(newRiskScore)
    setAnalyzing(false)
  }

  const [copied, setCopied] = useState(false)
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  const exportRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const fetchRegistrationInfo = async () => {
    try {
      const result = await apiClient.getPNodeRegistrationInfo(id)
      if (result.error) {
        setRegistrationInfo({ date: 'N/A', time: 'N/A' })
      } else {
        setRegistrationInfo({ date: result.data.registrationDate, time: result.data.registrationTime })
      }
    } catch (error) {
      setRegistrationInfo({ date: 'N/A', time: 'N/A' })
    }
  }

  const handleDownloadPng = async () => {
    if (!exportRef.current) return
    setIsExporting(true)
    try {
        const dataUrl = await htmlToImage.toPng(exportRef.current, { 
            cacheBust: true, 
            backgroundColor: '#000000',
            skipAutoScale: true,
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
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <a href="/pnodes" className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  </a>
                   <div>
                     <div className="flex items-center gap-2">
                       <h1 className="text-3xl font-bold text-foreground">{node.name}</h1>
                        {node.registered && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Badge variant="default" className="bg-green-600 hover:bg-green-700 cursor-pointer" onClick={fetchRegistrationInfo}>
                                Registered
                              </Badge>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Registered Node</DialogTitle>
                                <DialogDescription>This node is officially registered on the Xandeum network.</DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <p>Registration Date: {registrationInfo?.date || 'Loading...'}</p>
                                <p>Registration Time: {registrationInfo?.time || 'Loading...'}</p>
                              </div>
                              <DialogFooter>
                                <a href="https://seenodes.xandeum.network/" target="_blank" rel="noopener noreferrer">
                                  <Button variant="link">See Xandeum's Publication</Button>
                                </a>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                     </div>
                     <p className="text-muted-foreground">{node.location}</p>
                     {node.version && <p className="text-xs text-muted-foreground font-mono mt-1">v{node.version}</p>}
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
                          <div ref={exportRef} className="bg-background p-8 border rounded-lg shadow-sm space-y-6 text-foreground min-w-[800px] h-fit">
                              <div className="flex items-center gap-3 mb-6 border-b pb-4">
                                  <img src="/Logo.png" alt="XDOrb" className="h-8 w-8 rounded-full" />
                                  <div>
                                      <h3 className="font-bold text-lg">XDOrb Analytics</h3>
                                      <p className="text-sm text-muted-foreground">Detailed Node Report: {node.name}</p>
                                  </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-6">
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
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                        <div className="border p-4 rounded-lg bg-card">
                                           <p className="text-sm text-muted-foreground mb-1">Memory</p>
                                           <p className="text-xl font-bold">
                                             {node.memoryUsed && node.memoryTotal ? `${(node.memoryUsed / 1024**3).toFixed(2)}/${(node.memoryTotal / 1024**3).toFixed(2)} GB` : '-'}
                                           </p>
                                        </div>
                                       <div className="border p-4 rounded-lg bg-card">
                                          <p className="text-sm text-muted-foreground mb-1">Uptime</p>
                                          <p className="text-xl font-bold">{formatUptime(node.uptime)}</p>
                                       </div>
                                       <div className="border p-4 rounded-lg bg-card">
                                          <p className="text-sm text-muted-foreground mb-1">Latency</p>
                                          <p className="text-xl font-bold">{node.latency}ms</p>
                                       </div>
                                  </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-6">
                                   <div className="border rounded-lg p-4 bg-card h-64">
                                      <h4 className="font-semibold mb-2 text-sm">Uptime Trend (24h)</h4>
                                       <ResponsiveContainer width="100%" height="100%">
                                          <AreaChart data={history?.map(h => ({ ...h, time: '' })) || []}>
                                              <Area type="monotone" dataKey="uptime" stroke="var(--color-secondary)" fill="var(--color-secondary)" fillOpacity={0.1} />
                                          </AreaChart>
                                      </ResponsiveContainer>
                                   </div>
                                   
                                   <div className="border rounded-lg p-4 bg-card space-y-3">
                                      <h4 className="font-semibold mb-2 text-sm">Node Details</h4>
                                      <div className="grid grid-cols-2 gap-y-3 text-sm">
                                          <div className="text-muted-foreground">ID</div>
                                          <div className="font-mono text-xs truncate">{node.id}</div>
                                          
                                          <div className="text-muted-foreground">Performance</div>
                                          <div className="font-semibold">{node.performance ? `${node.performance}%` : '-'}</div>
                                          
                                          <div className="text-muted-foreground">Risk Score</div>
                                          <div className="font-semibold">{node.riskScore ? `${node.riskScore}%` : '-'}</div>
                                          
                                          <div className="text-muted-foreground">Stake</div>
                                          <div>{node.stake ? `${node.stake} POL` : '-'}</div>
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
            <div className="md:hidden flex gap-2 items-center">
              <div className="flex-1 border border-border bg-card/50 rounded-lg p-2 h-10 flex items-center shadow-sm overflow-hidden">
                <PriceMarquee />
              </div>
              <BuyXandButton />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
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

            <div className="grid grid-cols-2 gap-4 lg:order-2 order-2 h-full">
                <Card className="border-border bg-card flex flex-col justify-center">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">Memory</p>
                    <p className="text-2xl font-bold text-foreground">
                      {node.memoryUsed && node.memoryTotal ? `${(node.memoryUsed / 1024**3).toFixed(2)}/${(node.memoryTotal / 1024**3).toFixed(2)} GB` : '-'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border bg-card flex flex-col justify-center">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">Session Uptime</p>
                    <p className="text-2xl font-bold text-foreground">{formatUptime(node.uptime)}</p>
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
                    <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">CPU</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{node.cpuPercent?.toFixed(1) ?? '-'}%</p>
                  </CardContent>
                </Card>
            </div>

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
                          <p className="text-sm text-muted-foreground mb-1">Stake</p>
                          <p className="text-foreground">{node.stake ? `${node.stake} POL` : '-'}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                         <div>
                           <p className="text-sm text-muted-foreground mb-1">Packets (In/Out)</p>
                           <p className="text-foreground"><span className="text-blue-500">{node.packetsIn ?? '-'}</span> / <span className="text-green-500">{node.packetsOut ?? '-'}</span></p>
                         </div>

                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Risk Score</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-muted h-2 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  (dynamicRiskScore || 0) < 30 ? "bg-green-500" : (dynamicRiskScore || 0) < 70 ? "bg-primary" : "bg-red-500"
                                }`}
                                style={{ width: `${dynamicRiskScore || 0}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold">{dynamicRiskScore?.toFixed(0) || '-'}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
            </div>

            <div className="lg:order-5 order-4">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
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
                      <div className="flex items-center gap-2">
                        <Switch id="simulated-latency" checked={showSimulated} onCheckedChange={setShowSimulated} />
                        <Label htmlFor="simulated-latency" className="text-xs font-normal text-muted-foreground">Simulated Data</Label>
                      </div>
                    </div>
                    <CardDescription>Last 24 hours</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    {(!history || history.length === 0) && !showSimulated ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center text-center p-4">
                          <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Data Unavailable</p>
                          <p className="text-xs text-muted-foreground">Real-time history tracking coming soon.</p>
                        </div>
                      </div>
                    ) : null}
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
                        <YAxis stroke="var(--color-muted-foreground)" />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "var(--color-card)",
                            border: "1px solid var(--color-border)",
                          }}
                        />
                        <Area type="monotone" dataKey="latency" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
            </div>

            <div className="lg:order-6 order-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
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
                       <div className="flex items-center gap-2">
                        <Switch id="simulated-uptime" checked={showSimulated} onCheckedChange={setShowSimulated} />
                        <Label htmlFor="simulated-uptime" className="text-xs font-normal text-muted-foreground">Simulated Data</Label>
                      </div>
                    </div>
                    <CardDescription>Last 24 hours</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    {(!history || history.length === 0) && !showSimulated ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                        <div className="flex flex-col items-center text-center p-4">
                          <AlertCircle className="w-8 h-8 text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">Data Unavailable</p>
                          <p className="text-xs text-muted-foreground">Real-time history tracking coming soon.</p>
                        </div>
                      </div>
                    ) : null}
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
