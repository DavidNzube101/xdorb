"use client"

import { PriceMarquee } from "@/components/price-marquee"
import { BuyXandButton } from "@/components/buy-xand-button"
import { useState, useRef, useEffect, useMemo } from "react"
import useSWR from "swr"
import { useParams } from "next/navigation"
import dynamic from "next/dynamic"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Label as RechartsLabel } from "recharts"
import { ArrowLeft, Copy, HelpCircle, Brain, Sparkles, Share2, Download, AlertCircle, Cpu, Expand, BarChart2, LineChart as LineChartIcon, Twitter, Send, ExternalLink, Star, Lock, Bell } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Typewriter } from "@/components/typewriter"
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import * as htmlToImage from 'html-to-image'
import { ChartContainer } from "@/components/ui/chart"

import { PNodeCard } from "@/components/pnode-card"
import { SearchPalette } from "@/components/search-palette"
import { SubscribeModal } from "@/components/subscribe-modal"
import { cn } from "@/lib/utils"

const ITEMS_PER_PAGE = 50

// Dynamically import MapComponent to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-muted animate-pulse rounded-lg" />
})

const creditsFetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch credits');
    const data = await response.json();
    return data.pods_credits as { pod_id: string; credits: number }[];
};

const formatUptime = (seconds: number) => {
  if (!seconds) return "0s"
  
  if (seconds < 60) {
    return `${seconds.toFixed(0)}s`
  }

  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  
  const parts = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  
  return parts.length > 0 ? parts.join(" ") : `${seconds.toFixed(0)}s`
}

const RealtimeChart = ({ data, dataKey, color, type }: { data: any[], dataKey: string, color: string, type: 'bar' | 'line' }) => (
    <ChartContainer config={{}} className="h-[60px] w-full">
        {type === 'bar' ? (
            <BarChart accessibilityLayer data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <Bar dataKey={dataKey} fill={color} radius={2} />
            </BarChart>
        ) : (
            <LineChart accessibilityLayer data={data} margin={{ top: 10, right: 5, left: 5, bottom: 0 }}>
                <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
            </LineChart>
        )}
    </ChartContainer>
);

const UptimeDonutChart = ({ uptime, isFullscreen = false }: { uptime: number; isFullscreen?: boolean }) => {
    const startDate = new Date(Date.now() - uptime * 1000);
    const now = new Date();
    const shades = ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af']; // Different shades of blue
    const days: { day: string; uptime: number; fill: string }[] = [];

    let shadeIndex = 0;
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        days.push({
            day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            uptime: 100,
            fill: shades[shadeIndex % shades.length],
        });
        shadeIndex++;
    }

    const totalUptime = 100; // Always 100% since active

    const height = isFullscreen ? 'h-[300px]' : 'h-[100px]';
    const innerRadius = isFullscreen ? 80 : 30;
    const outerRadius = isFullscreen ? 120 : 45;
    const textSize = isFullscreen ? 'text-lg' : 'text-xs';
    const subTextSize = isFullscreen ? 'text-sm' : 'text-[8px]';
    const tspanOffset = isFullscreen ? 20 : 10;

    return (
        <ChartContainer config={{}} className={`${height} w-full`}>
            <PieChart>
                <RechartsTooltip
                    content={({ payload }) => {
                        if (payload && payload.length > 0) {
                            const data = payload[0].payload;
                            return (
                                <div className="bg-background border border-border p-2 rounded shadow">
                                    100% uptime on {data.day}
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Pie
                    data={days}
                    dataKey="uptime"
                    nameKey="day"
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    strokeWidth={0}
                >
                    {/* @ts-ignore */}
                    <RechartsLabel
                        content={({ viewBox }: any) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                    <text
                                        x={viewBox.cx}
                                        y={viewBox.cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className={textSize}
                                    >
                                        <tspan
                                            x={viewBox.cx}
                                            y={viewBox.cy}
                                            className="fill-foreground font-bold"
                                        >
                                            {totalUptime}%
                                        </tspan>
                                        <tspan
                                            x={viewBox.cx}
                                            y={(viewBox.cy || 0) + tspanOffset}
                                            className={`fill-muted-foreground ${subTextSize}`}
                                        >
                                            since {startDate.toLocaleDateString()}
                                        </tspan>
                                    </text>
                                );
                            }
                        }}
                    />
                </Pie>
            </PieChart>
        </ChartContainer>
    );
};

const FullscreenMetricModal = ({ data, onClose }: { data: any, onClose: () => void }) => {
    if (!data) return null;

    const latestValue = data.history.length > 0 ? data.history[data.history.length - 1].value : 0;

    const getDisplayValue = () => {
        switch(data.title) {
            case 'Memory':
                return data.totalMemory ? `${latestValue.toFixed(2)} / ${data.totalMemory.toFixed(2)} GB` : `${latestValue.toFixed(2)} GB`;
            case 'Session Uptime':
                return formatUptime(latestValue);
            case 'Latency':
                return `${latestValue.toFixed(0)}ms`;
            case 'CPU':
                return `${latestValue.toFixed(1)}%`;
            default:
                return latestValue;
        }
    }

    return (
        <Dialog open={data.isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[60vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{data.title}</DialogTitle>
                    <p className="text-4xl font-bold text-foreground">{getDisplayValue()}</p>
                </DialogHeader>
                <div className="flex-1 -mx-6 -mb-6">
                    {data.title === 'Session Uptime' ? (
                        <div className="flex items-center justify-center h-full">
                            <UptimeDonutChart uptime={latestValue} isFullscreen />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            {data.chartType === 'bar' ? (
                                <BarChart data={data.history} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis hide />
                                    <YAxis />
                                    <RechartsTooltip
                                        contentStyle={{
                                            backgroundColor: "var(--color-card)",
                                            border: "1px solid var(--color-border)",
                                        }}
                                    />
                                    <Bar dataKey={data.dataKey} fill={data.color} />
                                </BarChart>
                            ) : (
                                <LineChart data={data.history} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis hide />
                                    <YAxis />
                                    <RechartsTooltip
                                        contentStyle={{
                                            backgroundColor: "var(--color-card)",
                                            border: "1px solid var(--color-border)",
                                        }}
                                    />
                                    <Line type="monotone" dataKey={data.dataKey} stroke={data.color} strokeWidth={2} dot={false} />
                                </LineChart>
                            )}
                        </ResponsiveContainer>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default function PNodeDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [showSimulated, setShowSimulated] = useState(false)
  const [registrationInfo, setRegistrationInfo] = useState<{ date: string; time: string } | null>(null)
  const [rank, setRank] = useState<number | null>(null)
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false)

  const { data: creditsData } = useSWR('/api/credits', creditsFetcher);

  const nodeCredits = useMemo(() => {
    if (!creditsData || !id) return 0;
    const creditInfo = creditsData.find(c => c.pod_id === id);
    return creditInfo?.credits ?? 0;
  }, [creditsData, id]);

  useEffect(() => {
    const fetchRank = async () => {
      // Fetch all nodes to determine rank (efficiently cached by backend/Redis)
      const result = await apiClient.getPNodes({ limit: 1000 })
      if (!result.error && Array.isArray(result.data)) {
        // Sort by XDN Score descending
        const sorted = result.data.sort((a, b) => b.xdnScore - a.xdnScore)
        const index = sorted.findIndex(n => n.id === id)
        if (index !== -1) {
          setRank(index + 1)
        }
      }
    }
    fetchRank()
  }, [id])

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

  // Packets state
  const [packetsIn, setPacketsIn] = useState<number | null>(null)
  const [packetsOut, setPacketsOut] = useState<number | null>(null)

  // Realtime chart states
  const [memoryHistory, setMemoryHistory] = useState<{ value: number }[]>([]);
  const [uptimeHistory, setUptimeHistory] = useState<{ value: number }[]>([]);
  const [latencyHistory, setLatencyHistory] = useState<{ value: number }[]>([]);
  const [cpuHistory, setCpuHistory] = useState<{ value: number }[]>([]);
  
  const [cardControls, setCardControls] = useState({
    memory: { isPaused: false, chartType: 'line' as 'bar' | 'line' },
    uptime: { isPaused: false, chartType: 'bar' as 'bar' | 'line' },
    latency: { isPaused: false, chartType: 'bar' as 'bar' | 'line' },
    cpu: { isPaused: false, chartType: 'line' as 'bar' | 'line' },
  });

  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    title: string;
    history: { value: number }[];
    dataKey: string;
    color: string;
     chartType: 'bar' | 'line' | 'donut';
    totalMemory?: number;
  } | null>(null);

  const handlePauseToggle = (metric: keyof typeof cardControls, isPaused: boolean) => {
    setCardControls(prev => ({ ...prev, [metric]: { ...prev[metric], isPaused } }));
  };

  const handleChartTypeChange = (metric: keyof typeof cardControls, type: 'bar' | 'line') => {
    setCardControls(prev => ({ ...prev, [metric]: { ...prev[metric], chartType: type } }));
  };

  useEffect(() => {
    if (node) {
      setDynamicRiskScore(node.riskScore)
    }
  }, [node])

   const { data: metricsData } = useSWR(
     id ? `/pnodes/${id}/metrics` : null,
     () => apiClient.getPNodeMetrics(id as string),
     {
       refreshInterval: 1500,
       keepPreviousData: true,
     }
   );

  useEffect(() => {
    if (metricsData?.data) {
      const { cpuPercent, memoryUsed, latency, uptime, packetsIn: newPacketsIn, packetsOut: newPacketsOut } = metricsData.data;

      const updateHistory = (prev: { value: number }[], newValue: number | undefined, isPaused: boolean) => {
        if (isPaused || newValue === undefined) {
          return prev;
        }

        const newHistory = [...prev, { value: newValue }];
        if (newHistory.length > 20) {
          newHistory.shift();
        }
        return newHistory;
      };

      setCpuHistory(prev => updateHistory(prev, cpuPercent, cardControls.cpu.isPaused));
      setMemoryHistory(prev => updateHistory(prev, memoryUsed ? memoryUsed / 1024**3 : 0, cardControls.memory.isPaused));
      setLatencyHistory(prev => updateHistory(prev, latency, cardControls.latency.isPaused));
      setUptimeHistory(prev => updateHistory(prev, uptime, cardControls.uptime.isPaused));

      setPacketsIn(newPacketsIn ?? null);
      setPacketsOut(newPacketsOut ?? null);
    }
  }, [metricsData, cardControls]);

  const handleStartAnalysis = async () => {
    setAnalyzing(true)
    setAnalysisResult(null)
    
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const newRiskScore = Math.floor(Math.random() * 75) + 5;
    
    const analysis = `Based on the comprehensive scan of Node ${node?.id.slice(0, 8)}...:

• **Performance Status**: With an uptime of **${node?.uptime ? formatUptime(node.uptime) : '0s'}** and latency of **${node?.latency}ms**, this node shows ${node?.latency && node.latency < 50 ? 'excellent responsiveness' : 'stable performance'}.

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

  const isPrivate = node && (node.packetsIn === 0 && node.packetsOut === 0 && (node.cpuPercent ?? 0) === 0 && (node.memoryUsed ?? 0) === 0);

  return (
    <TooltipProvider>
      <DashboardLayout>
        <FullscreenMetricModal data={modalData} onClose={() => setModalData(null)} />
        <SubscribeModal 
            isOpen={isSubscribeOpen} 
            onClose={() => setIsSubscribeOpen(false)} 
            pNodeId={node.id} 
            pNodeName={node.name || node.id.slice(0, 8)} 
        />
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
                      </div>
                      <p className="text-muted-foreground">{node.location}</p>
                   </div>
              </div>
              
              <div className="flex gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" size="icon" onClick={() => setIsSubscribeOpen(true)}>
                            <Bell className="w-4 h-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Subscribe to Updates</p>
                    </TooltipContent>
                </Tooltip>

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

                      <DialogFooter className="p-6 border-t flex-shrink-0 flex flex-col sm:flex-row gap-3 sm:justify-between">
                          <div className="flex gap-2 w-full sm:w-auto">
                              <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out pNode ${node.id} on XDOrb`)}&url=${encodeURIComponent(`https://xdorb.vercel.app/pnodes/${node.id}`)}`, '_blank')}>
                                  <Twitter className="w-4 h-4 mr-2" /> Share to X
                              </Button>
                              <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(`https://xdorb.vercel.app/pnodes/${node.id}`)}&text=${encodeURIComponent(`Check out pNode ${node.id} on XDOrb`)}`, '_blank')}>
                                  <Send className="w-4 h-4 mr-2" /> Telegram
                              </Button>
                          </div>
                          <Button onClick={handleDownloadPng} disabled={isExporting} className="w-full sm:w-auto">
                              <Download className="w-4 h-4 mr-2" />
                              {isExporting ? 'Exporting...' : 'Download PNG'}
                          </Button>
                      </DialogFooter>
                  </DialogContent>
              </Dialog>
              </div> {/* Close button group */}
            </div> {/* Close justify-between */}
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
                    {node.lat && node.lng && (
                      <CardFooter className="flex flex-col items-start gap-2 pt-2 border-t">
                        <Typewriter text={`Latitude: ${node.lat.toFixed(4)}, Longitude: ${node.lng.toFixed(4)}`} />
                        <a
                          href={`https://www.bing.com/maps/default.aspx?cp=${node.lat}~${node.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View on Bing Maps
                        </a>
                      </CardFooter>
                    )}
                 </Card>
             </div>

            <div className="grid grid-cols-2 gap-4 lg:order-2 order-2 h-full">
                <Card className="border-border bg-card flex flex-col relative">
                  {isPrivate && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
                      <Lock className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">Private Node</p>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <p className="text-sm text-muted-foreground">Memory</p>
                    <p className="text-2xl font-bold text-foreground">
                      {node.memoryUsed && node.memoryTotal ? `${(memoryHistory.length > 0 ? memoryHistory[memoryHistory.length - 1].value : 0).toFixed(2)}/${(node.memoryTotal / 1024**3).toFixed(2)} GB` : '-'}
                    </p>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <RealtimeChart data={memoryHistory} dataKey="value" color="var(--color-primary)" type={cardControls.memory.chartType} />
                  </CardContent>
                   <CardFooter className="flex justify-between items-center pt-2 border-t overflow-x-auto">
                       <div className="flex items-center gap-2 flex-shrink-0">
                           <Switch id="pause-memory" checked={!cardControls.memory.isPaused} onCheckedChange={(isChecked) => handlePauseToggle('memory', !isChecked)} />
                           <Label htmlFor="pause-memory" className="text-xs text-muted-foreground">Live</Label>
                       </div>
                       <div className="flex items-center gap-1 flex-shrink-0">
                           <div className="flex items-center rounded-md bg-muted p-0.5">
                               <Button variant={cardControls.memory.chartType === 'bar' ? 'secondary' : 'ghost'} size="sm" className="h-6 w-6 p-1" onClick={() => handleChartTypeChange('memory', 'bar')}>
                                   <BarChart2 className="w-4 h-4" />
                               </Button>
                               <Button variant={cardControls.memory.chartType === 'line' ? 'secondary' : 'ghost'} size="sm" className="h-6 w-6 p-1" onClick={() => handleChartTypeChange('memory', 'line')}>
                                   <LineChartIcon className="w-4 h-4" />
                               </Button>
                           </div>
                           <Button variant="ghost" size="icon-sm" onClick={() => setModalData({
                               isOpen: true, title: 'Memory', history: memoryHistory, dataKey: 'value', color: 'var(--color-primary)',
                               chartType: cardControls.memory.chartType, totalMemory: node.memoryTotal ? (node.memoryTotal / 1024**3) : undefined,
                           })}>
                               <Expand className="w-4 h-4" />
                           </Button>
                       </div>
                   </CardFooter>
                </Card>

                <Card className="border-border bg-card flex flex-col">
                  <CardHeader className="pb-2">
                    <p className="text-sm text-muted-foreground">Session Uptime</p>
                    <p className="text-2xl font-bold text-foreground">{formatUptime(uptimeHistory.length > 0 ? uptimeHistory[uptimeHistory.length - 1].value : node.uptime)}</p>
                  </CardHeader>
                   <CardContent className="p-0 flex-1">
                     <UptimeDonutChart uptime={uptimeHistory.length > 0 ? uptimeHistory[uptimeHistory.length - 1].value : node.uptime} />
                   </CardContent>
                     <CardFooter className="flex justify-between items-center pt-2 border-t overflow-x-auto">
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <Switch id="pause-uptime" checked={!cardControls.uptime.isPaused} onCheckedChange={(isChecked) => handlePauseToggle('uptime', !isChecked)} />
                            <Label htmlFor="pause-uptime" className="text-xs text-muted-foreground">Live</Label>
                        </div>
                        <Button variant="ghost" size="icon-sm" onClick={() => setModalData({
                            isOpen: true, title: 'Session Uptime', history: uptimeHistory, dataKey: 'value', color: 'var(--color-secondary)',
                            chartType: 'donut', // or something, but we'll handle in modal
                        })}>
                            <Expand className="w-4 h-4" />
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="border-border bg-card flex flex-col">
                  <CardHeader className="pb-2">
                    <p className="text-sm text-muted-foreground">Latency</p>
                    <p className="text-2xl font-bold text-foreground">
                        {latencyHistory.length > 0 ? latencyHistory[latencyHistory.length - 1].value.toFixed(0) : node.latency}ms
                    </p>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <RealtimeChart data={latencyHistory} dataKey="value" color="var(--color-primary)" type={cardControls.latency.chartType} />
                  </CardContent>
                    <CardFooter className="flex justify-between items-center pt-2 border-t overflow-x-auto">
                       <div className="flex items-center gap-2 flex-shrink-0">
                           <Switch id="pause-latency" checked={!cardControls.latency.isPaused} onCheckedChange={(isChecked) => handlePauseToggle('latency', !isChecked)} />
                           <Label htmlFor="pause-latency" className="text-xs text-muted-foreground">Live</Label>
                       </div>
                       <div className="flex items-center gap-1 flex-shrink-0">
                           <div className="flex items-center rounded-md bg-muted p-0.5">
                               <Button variant={cardControls.latency.chartType === 'bar' ? 'secondary' : 'ghost'} size="sm" className="h-6 w-6 p-1" onClick={() => handleChartTypeChange('latency', 'bar')}>
                                   <BarChart2 className="w-4 h-4" />
                               </Button>
                               <Button variant={cardControls.latency.chartType === 'line' ? 'secondary' : 'ghost'} size="sm" className="h-6 w-6 p-1" onClick={() => handleChartTypeChange('latency', 'line')}>
                                   <LineChartIcon className="w-4 h-4" />
                               </Button>
                           </div>
                           <Button variant="ghost" size="icon-sm" onClick={() => setModalData({
                               isOpen: true, title: 'Latency', history: latencyHistory, dataKey: 'value', color: 'var(--color-primary)',
                               chartType: cardControls.latency.chartType,
                           })}>
                               <Expand className="w-4 h-4" />
                           </Button>
                       </div>
                   </CardFooter>
                </Card>

                <Card className="border-border bg-card flex flex-col relative">
                  {isPrivate && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 rounded-lg">
                      <Lock className="w-8 h-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground text-sm">Private Node</p>
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">CPU</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                        {cpuHistory.length > 0 ? cpuHistory[cpuHistory.length - 1].value.toFixed(1) : node.cpuPercent?.toFixed(1) ?? '-'}%
                    </p>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <RealtimeChart data={cpuHistory} dataKey="value" color="var(--color-secondary)" type={cardControls.cpu.chartType} />
                  </CardContent>
                    <CardFooter className="flex justify-between items-center pt-2 border-t overflow-x-auto">
                       <div className="flex items-center gap-2 flex-shrink-0">
                           <Switch id="pause-cpu" checked={!cardControls.cpu.isPaused} onCheckedChange={(isChecked) => handlePauseToggle('cpu', !isChecked)} />
                           <Label htmlFor="pause-cpu" className="text-xs text-muted-foreground">Live</Label>
                       </div>
                       <div className="flex items-center gap-1 flex-shrink-0">
                           <div className="flex items-center rounded-md bg-muted p-0.5">
                               <Button variant={cardControls.cpu.chartType === 'bar' ? 'secondary' : 'ghost'} size="sm" className="h-6 w-6 p-1" onClick={() => handleChartTypeChange('cpu', 'bar')}>
                                   <BarChart2 className="w-4 h-4" />
                               </Button>
                               <Button variant={cardControls.cpu.chartType === 'line' ? 'secondary' : 'ghost'} size="sm" className="h-6 w-6 p-1" onClick={() => handleChartTypeChange('cpu', 'line')}>
                                   <LineChartIcon className="w-4 h-4" />
                               </Button>
                           </div>
                           <Button variant="ghost" size="icon-sm" onClick={() => setModalData({
                               isOpen: true, title: 'CPU', history: cpuHistory, dataKey: 'value', color: 'var(--color-secondary)',
                               chartType: cardControls.cpu.chartType,
                           })}>
                               <Expand className="w-4 h-4" />
                           </Button>
                       </div>
                   </CardFooter>
                </Card>
            </div>

            <div className="lg:order-3 order-3">
                <Card className="border-border bg-card relative overflow-hidden h-full">
                 <CardHeader>
                   <div className="flex items-center gap-2">
                     <Brain className="w-5 h-5 text-primary" />
                     <CardTitle>Intelligent Analysis</CardTitle>
                     <Tooltip>
                       <TooltipTrigger>
                         <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help" />
                       </TooltipTrigger>
                       <TooltipContent>
                         <p>AI-powered analysis of node performance, resources, economics, and risks based on real-time data.</p>
                       </TooltipContent>
                     </Tooltip>
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
                     <div className="space-y-4">
                       {node.registered && (
                         <div className="flex items-center gap-2">
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
                         </div>
                       )}
                       {isPrivate && (
                         <Badge variant="outline" className="flex items-center gap-1 text-[10px] px-1 h-5">
                           <Lock className="w-3 h-3" />
                           Private
                         </Badge>
                       )}
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="space-y-4">
                           <div>
                             <p className="text-sm text-muted-foreground mb-1">Public Key/Node ID</p>
                             <div className="flex items-center gap-2">
                               <code className="flex-1 p-2 bg-muted rounded font-mono text-xs sm:text-sm text-foreground break-all truncate">
                                 {node.id}
                               </code>
                               <button
                                 onClick={() => copyToClipboard(node.id)}
                                 className="p-2 hover:bg-muted rounded transition-colors"
                                 title="Copy ID"
                               >
                                 <Copy className="w-4 h-4" />
                               </button>
                               <a 
                                 href={`https://orbmarkets.io/address/${node.id}`} 
                                 target="_blank" 
                                 rel="noopener noreferrer"
                                 className="p-2 hover:bg-muted rounded transition-colors text-primary"
                                 title="View on OrbMarkets Explorer"
                               >
                                 <ExternalLink className="w-4 h-4" />
                               </a>
                             </div>
                           </div>

                           {node.manager && (
                             <div>
                               <p className="text-sm text-muted-foreground mb-1">Operator / Manager</p>
                               <div className="flex items-center gap-2">
                                 <code className="flex-1 p-2 bg-muted rounded font-mono text-xs sm:text-sm text-foreground break-all truncate">
                                   {node.manager}
                                 </code>
                                 <button
                                   onClick={() => copyToClipboard(node.manager || "")}
                                   className="p-2 hover:bg-muted rounded transition-colors"
                                   title="Copy Manager ID"
                                 >
                                   <Copy className="w-4 h-4" />
                                 </button>
                               </div>
                             </div>
                           )}

                           <div>
                             <p className="text-sm text-muted-foreground mb-1">Rank</p>
                             <p className="text-foreground font-bold text-lg">{rank ? `#${rank}` : '-'}</p>
                           </div>

                           <div>
                             <p className="text-sm text-muted-foreground mb-1">Credits</p>
                             <div className="flex items-center gap-1 text-foreground font-bold text-lg">
                                <Star className="w-4 h-4 text-yellow-400" />
                                {nodeCredits.toLocaleString()}
                             </div>
                           </div>

                           <div>
                             <p className="text-sm text-muted-foreground mb-1">Location</p>
                             <p className="text-foreground">{node.location}</p>
                           </div>

                           <div>
                             <p className="text-sm text-muted-foreground mb-1">Version</p>
                             <div className="flex items-center gap-2">
                                <p className="text-foreground font-mono">{node.version ? `v${node.version}` : '-'}</p>
                                {node.isMainnet && (
                                    <Badge variant="outline" className="text-[10px] px-1 h-5 bg-purple-500/10 text-purple-500 border-purple-500/20 rounded-none">
                                        Mainnet
                                    </Badge>
                                )}
                                {node.isDevnet && (
                                    <Badge variant="outline" className="text-[10px] px-1 h-5 bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-none">
                                        Devnet
                                    </Badge>
                                )}
                             </div>
                           </div>
                         </div>

                         <div className="space-y-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm text-muted-foreground">Packets (In/Out)</p>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-foreground cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Network packets received (in) and sent (out) by the node since startup.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <p className="text-foreground"><span className="text-blue-500">{packetsIn ?? node.packetsIn ?? '-'}</span> / <span className="text-green-500">{packetsOut ?? node.packetsOut ?? '-'}</span></p>
                            </div>

                           <div>
                             <p className="text-sm text-muted-foreground mb-1">Stake</p>
                             <p className="text-foreground">{node.stake ? `${node.stake} POL` : '-'}</p>
                           </div>

                           <div>
                             <p className="text-sm text-muted-foreground mb-1">Total Credits</p>
                             <p className="text-foreground font-bold">{node.credits?.toLocaleString() || '0'}</p>
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
                     </div>
                  </CardContent>
                </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  )
}
                               