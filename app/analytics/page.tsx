"use client"

import { useEffect, useState, useRef } from "react"
import useSWR from "swr"
import { Share2, Download, Brain, HelpCircle, Loader2, ArrowRight, Zap } from "lucide-react"
import * as htmlToImage from 'html-to-image'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Typewriter } from "@/components/typewriter"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { apiClient, PNodeMetrics } from "@/lib/api"
import { StoragePieChart } from "@/components/analytics/storage-pie-chart"
import { GeoDistributionChart } from "@/components/analytics/geo-distribution-chart"
import { CpuAreaChart } from "@/components/analytics/cpu-area-chart"
import { RamStackedAreaChart } from "@/components/analytics/ram-stacked-area-chart"
import { PacketLineChart } from "@/components/analytics/packet-line-chart"
import { SearchableNodeSelect } from "@/components/SearchableNodeSelect"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json.data
}

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

  // State management
  const [aiSummary, setAiSummary] = useState<{ summary: string } | null>(null)
  const [isLoadingAiSummary, setIsLoadingAiSummary] = useState(true)
  const [mobileSection, setMobileSection] = useState("storage")
  const [isMounted, setIsMounted] = useState(false)
  
  // Comparison State
  const [node1, setNode1] = useState<PNodeMetrics | undefined>(undefined)
  const [node2, setNode2] = useState<PNodeMetrics | undefined>(undefined)
  const [step, setStep] = useState(0)
  const [compareModalOpen, setCompareModalOpen] = useState(false)
  const [intelligentComparison, setIntelligentComparison] = useState("")
  const [isComparing, setIsComparing] = useState(false)
  
  // Fullscreen Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<React.ReactNode>(null)
  const [modalTitle, setModalTitle] = useState("")

  const summaryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
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
  const handleSelectNode = (node: PNodeMetrics | undefined, position: number) => {
    if (!node) return
    if (position === 1) {
      setNode1(node)
      setStep(1)
    } else {
      setNode2(node)
      setStep(2)
    }
  }

  const handleIntelligentCompare = async () => {
    if (!node1 || !node2) return
    setIsComparing(true)
    try {
        const res = await apiClient.compareNodes(node1, node2)
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

  const getWinner = (key: keyof PNodeMetrics) => {
    if (!node1 || !node2) return null
    const val1 = node1[key] as number
    const val2 = node2[key] as number
    if (key === 'latency') {
      return val1 < val2 ? 'node1' : val2 < val1 ? 'node2' : null
    }
    return val1 > val2 ? 'node1' : val2 > val1 ? 'node2' : null
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
                    <SelectItem value="storage">Storage & Geo</SelectItem>
                    <SelectItem value="ins">Network Summary</SelectItem>
                    <SelectItem value="cpu">CPU & RAM</SelectItem>
                    <SelectItem value="packets">Packet Streams</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Row 1: Storage & Geo */}
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

          {/* Row 1.5: Comparison */}
          <div id="compare">
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Performance Comparison</CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select any two nodes to compare their key performance metrics side-by-side.</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <CardDescription>Select two nodes to compare their performance</CardDescription>
              </CardHeader>
              <CardContent className="relative min-h-[300px] flex flex-col items-center justify-center">
                <div className="flex flex-col md:flex-row items-center justify-around w-full max-w-4xl gap-4 md:gap-0">
                  <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
                    <h3 className="font-semibold">Node One</h3>
                      <SearchableNodeSelect
                        nodes={allNodes || []}
                        selectedNode={node1}
                        onSelect={(node) => handleSelectNode(node, 1)}
                        placeholder="Select Node 1"
                      />
                  </div>

                  <ArrowRight className={`w-8 h-8 transition-opacity rotate-90 md:rotate-0 ${step >= 1 ? 'opacity-100' : 'opacity-20'}`} />

                  <div className="flex flex-col items-center gap-4 w-full md:w-1/3">
                    <h3 className="font-semibold">Node Two</h3>
                      <SearchableNodeSelect
                        nodes={allNodes || []}
                        selectedNode={node2}
                        onSelect={(node) => handleSelectNode(node, 2)}
                        placeholder="Select Node 2"
                      />
                  </div>
                </div>

                {step === 2 && node1 && node2 && (
                  <div className="mt-8 flex gap-4">
                    <Dialog open={compareModalOpen} onOpenChange={setCompareModalOpen}>
                      <DialogTrigger asChild>
                        <Button>Compare</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Comparison: {node1.name} vs {node2.name}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2 font-semibold">Metric</th>
                                <th className="text-center p-2 font-semibold">{node1.name}</th>
                                <th className="text-center p-2 font-semibold">{node2.name}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {comparisonData.map(({ metric, key, unit }) => {
                                const winner = getWinner(key)
                                const node1Value = node1[key] !== null && node1[key] !== undefined ? `${Number(node1[key]).toFixed(2)}${unit}` : '-'
                                const node2Value = node2[key] !== null && node2[key] !== undefined ? `${Number(node2[key]).toFixed(2)}${unit}` : '-'
                                return (
                                  <tr key={metric} className="border-b">
                                    <td className="p-2">{metric}</td>
                                    <td className={`p-2 text-center font-medium ${winner === 'node1' ? 'text-green-500' : winner === 'node2' ? 'text-red-500' : ''}`}>
                                      {node1Value}
                                    </td>
                                    <td className={`p-2 text-center font-medium ${winner === 'node2' ? 'text-green-500' : winner === 'node1' ? 'text-red-500' : ''}`}>
                                      {node2Value}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" onClick={handleIntelligentCompare} disabled={isComparing}>
                      <Zap className="w-4 h-4 mr-2" />
                      {isComparing ? 'Analyzing...' : 'Intelligent Compare'}
                    </Button>
                  </div>
                )}
                {intelligentComparison && (
                  <div className="mt-6 p-4 bg-muted rounded-lg w-full max-w-4xl">
                    <Typewriter text={intelligentComparison} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Row 2: INS */}
          <div id="ins">
             <Card className="border-border bg-card">
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

          {/* Row 3: CPU & RAM */}
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

          {/* Row 4: Packets */}
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