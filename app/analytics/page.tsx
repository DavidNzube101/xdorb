"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import useSWR from "swr"
import { Share2, Download, Brain, HelpCircle, Loader2, ArrowRight, Zap, Calculator, Sparkles } from "lucide-react"
import * as htmlToImage from 'html-to-image'
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { NotificationManager } from "@/components/notification-manager"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Typewriter } from "@/components/typewriter"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { apiClient, PNodeMetrics } from "@/lib/api"
import { PNodeWithCredits } from "@/app/pnodes/page" // Re-use type
import { StoragePieChart } from "@/components/analytics/storage-pie-chart"
import { GeoDistributionChart } from "@/components/analytics/geo-distribution-chart"
import { CpuAreaChart } from "@/components/analytics/cpu-area-chart"
import { RamStackedAreaChart } from "@/components/analytics/ram-stacked-area-chart"
import { PacketLineChart } from "@/components/analytics/packet-line-chart"
import { SearchableNodeSelect } from "@/components/SearchableNodeSelect"
import { CreditsLeaderboardChart } from "@/components/analytics/credits-leaderboard-chart"
import { CreditsCorrelationPlot } from "@/components/analytics/credits-correlation-plot"
import { VersionDistributionChart } from "@/components/analytics/version-distribution-chart"
import { STOINCCalculator } from "@/components/analytics/stoinc-calculator"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json.data
}

const creditsFetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch credits');
    const data = await response.json();
    return data.pods_credits as { pod_id: string; credits: number }[];
};

const aiSummaryFetcher = async () => {
  const res = await apiClient.getIntelligentNetworkSummary()
  if (res.error) throw new Error(res.error)
  return res.data
}

const allNodesFetcher = async () => {
  const res = await apiClient.getPNodes({ limit: 1000 })
  if (res.error) throw new Error(res.error)
  return res.data
}

export default function AnalyticsPage() {
  // Fetch all analytics data from single endpoint
  const { data: analytics, isLoading } = useSWR(`/api/analytics`, fetcher, { 
      refreshInterval: 1500,
      revalidateOnFocus: false 
  })
  
  const { data: allNodes, isLoading: isLoadingAllNodes } = useSWR('/api/pnodes/all', allNodesFetcher)
  const { data: creditsData } = useSWR('/api/credits', creditsFetcher);

  // State management
  const [aiSummary, setAiSummary] = useState<{ summary: string } | null>(null)
  const [isLoadingAiSummary, setIsLoadingAiSummary] = useState(true)
  const [mobileSection, setMobileSection] = useState("storage")
  const [isMounted, setIsMounted] = useState(false)
  
  // Comparison State
  const [selectedNodes, setSelectedNodes] = useState<PNodeMetrics[]>([])
  const [compareModalOpen, setCompareModalOpen] = useState(false)
  const [intelligentComparison, setIntelligentComparison] = useState("")
  const [isComparing, setIsComparing] = useState(false)
  
  // Fullscreen Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<React.ReactNode>(null)
  const [modalTitle, setModalTitle] = useState("")
  const [stoincCalcOpen, setStoincCalcOpen] = useState(false)

  const summaryRef = useRef<HTMLDivElement>(null)

  const nodesWithAnalytics = useMemo((): PNodeWithCredits[] => {
    if (!allNodes) return [];
    const creditsMap = new Map<string, number>();
    if (creditsData) {
        creditsData.forEach(item => {
            creditsMap.set(item.pod_id.trim().toLowerCase(), item.credits);
        });
    }
    return allNodes.map(node => ({
        ...node,
        credits: creditsMap.get(node.id.trim().toLowerCase()) ?? 0,
    }));
  }, [allNodes, creditsData]);

  useEffect(() => {
    setIsMounted(true)
    if (window.location.hash === '#stoinc') {
      setStoincCalcOpen(true)
      // Optional: scroll to it
      document.getElementById('stoinc')?.scrollIntoView({ behavior: 'smooth' })
    } else if (window.location.hash === '#compare') {
      document.getElementById('compare')?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  // AI Summary
  useEffect(() => {
    const cachedSummary = localStorage.getItem('intelligentNetworkSummary')
    if (cachedSummary) {
      try {
        setAiSummary(JSON.parse(cachedSummary))
        setIsLoadingAiSummary(false)
      } catch (e) {
        localStorage.removeItem('intelligentNetworkSummary')
      }
    } else {
      aiSummaryFetcher().then(data => {
        if (data) {
          setAiSummary(data)
          localStorage.setItem('intelligentNetworkSummary', JSON.stringify(data))
        }
        setIsLoadingAiSummary(false)
      }).catch(err => {
        console.error("Failed to fetch AI summary", err)
        setIsLoadingAiSummary(false)
      })
    }
  }, [])

  const handleDownloadSummary = async () => {
    if (!summaryRef.current) return
    try {
      const dataUrl = await htmlToImage.toPng(summaryRef.current, {
        cacheBust: true,
        backgroundColor: '#1c1917',
      })
      const link = document.createElement('a')
      link.download = 'xdorb-intelligent-summary.png'
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to export summary image', err)
    }
  }

  const openModal = (title: string, content: React.ReactNode) => {
      setModalTitle(title);
      setModalContent(content);
      setModalOpen(true);
  }

  // Comparison Logic
  const handleAddNode = (node: PNodeMetrics | undefined) => {
    if (!node) return
    if (selectedNodes.length >= 10) return
    if (selectedNodes.some(n => n.id === node.id)) return
    setSelectedNodes(prev => [...prev, node])
  }

  const handleRemoveNode = (id: string) => {
    setSelectedNodes(prev => prev.filter(n => n.id !== id))
  }

  const handleIntelligentCompare = async () => {
    if (selectedNodes.length < 2) return
    setIsComparing(true)
    try {
        const res = await apiClient.compareNodes(selectedNodes)
        if (res.data?.comparison) {
            setIntelligentComparison(res.data.comparison)
        }
    } catch (error) {
        console.error("Comparison failed", error)
    } finally {
        setIsComparing(false)
    }
  }

  const comparisonData = [
    { metric: 'Uptime', key: 'uptime' as keyof PNodeMetrics, unit: '%' },
    { metric: 'Latency', key: 'latency' as keyof PNodeMetrics, unit: 'ms' },
    { metric: 'CPU', key: 'cpuPercent' as keyof PNodeMetrics, unit: '%' },
    { metric: 'Packets Out', key: 'packetsOut' as keyof PNodeMetrics, unit: '' },
  ]

  const getBestValue = (key: keyof PNodeMetrics) => {
    if (selectedNodes.length < 2) return null
    const values = selectedNodes.map(n => n[key] as number)
    if (key === 'latency') {
      return Math.min(...values)
    }
    return Math.max(...values)
  }

  // Scroll to section for mobile
  useEffect(() => {
      if (mobileSection) {
          const el = document.getElementById(mobileSection);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
  }, [mobileSection])

  if (!isMounted) return null;

  const storageData = analytics?.storage || { totalCapacity: 0, usedCapacity: 0 };
  const geoData = analytics?.geoDistribution || [];
  const cpuData = analytics?.cpuUsage || [];
  const ramData = analytics?.ramUsage || [];
  const packetData = analytics?.packetStreams || { in: 0, out: 0 };

  return (
    <DashboardLayout>
      <TooltipProvider>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{modalTitle}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto p-4">
                    {modalContent}
                </div>
            </DialogContent>
        </Dialog>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">XDOrb Analytics</h1>
              <p className="text-muted-foreground mt-1">Deep dive into network performance metrics</p>
              
              <div className="md:hidden mt-4">
                <Select value={mobileSection} onValueChange={setMobileSection}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Navigate to..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="storage">Storage</SelectItem>
                    <SelectItem value="stoinc">STOINC</SelectItem>
                    <SelectItem value="distribution">Distribution</SelectItem>
                    <SelectItem value="credits">Credits Analysis</SelectItem>
                    <SelectItem value="compare">Node Comparison</SelectItem>
                    <SelectItem value="ins">Network Summary</SelectItem>
                    <SelectItem value="cpu">CPU & RAM</SelectItem>
                    <SelectItem value="packets">Packet Streams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Row 1: STOINC Information */}
          <div id="stoinc">
            <Card className="border-border bg-card overflow-hidden relative rounded-none">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Zap size={120} />
              </div>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  Unlocking STOINC
                </CardTitle>
                <CardDescription>The incentive heart of Xandeum storage</CardDescription>
              </CardHeader>
              <CardContent className="prose dark:prose-invert max-w-none pb-12">
                <p className="text-foreground leading-relaxed">
                  Storage Income (STOINC) is the primary economic driver for the Xandeum network, built to incentivize pNode operators who provide the backbone of our scalable storage layer.
                </p>
                <h4 className="text-lg font-semibold mt-4 mb-2">How STOINC Works:</h4>
                <p className="text-muted-foreground">
                  Operators earn credits by successfully handling data traffic and ensuring maximum availability. These credits directly translate into a share of the network's generated storage fees.
                </p>
                <p className="text-muted-foreground mt-4 italic text-sm">
                  This interface provides a real-time window into the activity and reward distribution across the global pNode network.
                </p>
                
                <div className="absolute bottom-4 left-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="rounded-none border-primary/20 hover:border-primary/50 text-primary"
                        onClick={() => setStoincCalcOpen(true)}
                      >
                        <Calculator className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open STOINC Calculator</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
            <STOINCCalculator isOpen={stoincCalcOpen} onClose={() => setStoincCalcOpen(false)} />
          </div>

          {/* Row 2: Storage & Geo */}
          <div id="storage" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StoragePieChart 
                totalCapacity={storageData.totalCapacity} 
                usedCapacity={storageData.usedCapacity}
                onFullScreen={() => openModal("Storage Utilization", <StoragePieChart totalCapacity={storageData.totalCapacity} usedCapacity={storageData.usedCapacity} />)}
            />
            <GeoDistributionChart 
                data={geoData}
                onFullScreen={() => openModal("Geographical Distribution", <GeoDistributionChart data={geoData} />)}
            />
          </div>

          {/* Row 2: Distribution */}
          <div id="distribution" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VersionDistributionChart nodes={nodesWithAnalytics} />
            <CreditsLeaderboardChart nodes={nodesWithAnalytics} />
          </div>

          {/* Row 3: Credits Correlation */}
          <div id="credits" className="grid grid-cols-1 gap-6">
            <CreditsCorrelationPlot nodes={nodesWithAnalytics} />
          </div>

          {/* Row 4: Comparison */}
          <div id="compare">
            <Card className="border-border bg-card rounded-none">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Fleet Comparison</CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add up to 10 nodes to compare performance across your fleet.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription>Select nodes to compare performance metrics side-by-side</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block">Add Node to Comparison</Label>
                    <SearchableNodeSelect
                      nodes={allNodes || []}
                      selectedNode={undefined}
                      onSelect={handleAddNode}
                      placeholder="Search and add node..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Dialog open={compareModalOpen} onOpenChange={setCompareModalOpen}>
                      <DialogTrigger asChild>
                        <Button disabled={selectedNodes.length < 2}>Compare Fleet</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-5xl overflow-hidden flex flex-col h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Fleet Comparison ({selectedNodes.length} Nodes)</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-auto mt-4 border border-border">
                          <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-background z-10">
                              <tr className="border-b border-border">
                                <th className="text-left p-4 font-bold uppercase tracking-wider bg-muted/50 w-32">Metric</th>
                                {selectedNodes.map(node => (
                                  <th key={node.id} className="text-center p-4 font-bold border-l border-border min-w-[150px]">
                                    <div className="flex flex-col items-center gap-1">
                                      <span className="truncate w-32">{node.name}</span>
                                      <span className="text-[10px] font-mono text-muted-foreground">{node.id.slice(0, 8)}...</span>
                                    </div>
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {comparisonData.map(({ metric, key, unit }) => {
                                const bestVal = getBestValue(key)
                                return (
                                  <tr key={metric} className="border-b border-border hover:bg-muted/20">
                                    <td className="p-4 font-medium bg-muted/30">{metric}</td>
                                    {selectedNodes.map(node => {
                                      const val = node[key] as number
                                      const isBest = val === bestVal
                                      return (
                                        <td key={node.id} className={cn(
                                          "p-4 text-center border-l border-border font-mono",
                                          isBest ? "text-green-500 font-bold bg-green-500/5" : "text-foreground"
                                        )}>
                                          {val?.toFixed(2)}{unit}
                                        </td>
                                      )
                                    })}
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={handleIntelligentCompare} disabled={isComparing || selectedNodes.length < 2}>
                      <Zap className="w-4 h-4 mr-2" />
                      AI Compare
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {selectedNodes.map(node => (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Badge variant="secondary" className="pl-2 pr-1 py-1 rounded-none flex items-center gap-2 border border-border">
                          <span className="truncate max-w-[100px]">{node.name}</span>
                          <button 
                            onClick={() => handleRemoveNode(node.id)}
                            className="hover:bg-muted p-0.5"
                          >
                            <ArrowRight className="w-3 h-3 rotate-45" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {selectedNodes.length === 0 && (
                    <p className="text-xs text-muted-foreground italic py-2">No nodes selected for comparison.</p>
                  )}
                </div>

                {intelligentComparison && (
                  <div className="mt-6 p-4 bg-muted/30 border border-border rounded-none">
                    <div className="flex items-center gap-2 mb-2 text-primary font-bold text-xs uppercase tracking-widest">
                      <Sparkles className="w-3 h-3" /> AI Analysis
                    </div>
                    <Typewriter text={intelligentComparison} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Row 5: INS */}
          <div id="ins">
             <Card className="border-border bg-card rounded-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle>Intelligent Network Summary</CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>An AI-generated summary of the entire network's health and performance.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription>AI-generated network analysis</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={handleDownloadSummary}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent ref={summaryRef} className="bg-card p-6">
              {isLoadingAiSummary ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Brain className="w-5 h-5 animate-pulse" />
                    <span>Generating insights...</span>
                  </div>
                </div>
              ) : aiSummary ? (
                <div>
                  <Typewriter text={aiSummary.summary} delay={10} />
                </div>
              ) : (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <p>Could not generate AI summary.</p>
                </div>
              )}
            </CardContent>
          </Card>
          </div>

          {/* Row 6: CPU & RAM */}
          <div id="cpu" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <CpuAreaChart 
                data={cpuData}
                onFullScreen={() => openModal("Cumulative CPU Utilized", <CpuAreaChart data={cpuData} />)}
             />
             <RamStackedAreaChart 
                data={ramData}
                onFullScreen={() => openModal("Cumulative RAM Utilized", <RamStackedAreaChart data={ramData} />)}
             />
          </div>

          {/* Row 7: Packets */}
          <div id="packets">
              <PacketLineChart 
                data={packetData}
                onFullScreen={() => openModal("Global Packet Streams", <PacketLineChart data={packetData} />)}
              />
          </div>
        </div>
      </TooltipProvider>
    </DashboardLayout>
  )
}