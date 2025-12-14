"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useEffect, useRef, useState } from "react"
import useSWR from "swr"
import { Share2, Download, Brain, ArrowRight, Zap, HelpCircle, Loader2 } from "lucide-react"
import { apiClient, PNodeMetrics } from "@/lib/api"
import { Button } from "@/components/ui/button"
import * as htmlToImage from 'html-to-image'
import { Typewriter } from "@/components/typewriter"
import { SearchableNodeSelect } from "@/components/SearchableNodeSelect"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import dynamic from 'next/dynamic'

const StorageVisualization = dynamic(
  () => import('@/components/storage-visualization').then(mod => mod.StorageVisualization),
  { 
    ssr: false,
    loading: () => (
      <Card className="border-border bg-card flex flex-col min-h-[500px]">
        <CardHeader>
          <CardTitle>Storage Visualization</CardTitle>
          <CardDescription>Loading visualization...</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }
)

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
	const res = await apiClient.getPNodes({ limit: 1000 }); // Fetch all nodes
	if (res.error) throw new Error(res.error);
	return res.data;
}


export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useSWR(`/api/analytics`, fetcher)
  const { data: allNodes, isLoading: isLoadingAllNodes } = useSWR('/api/pnodes/all', allNodesFetcher)

  // State management for AI Summary with localStorage caching
  const [aiSummary, setAiSummary] = useState<{ summary: string } | null>(null)
  const [isLoadingAiSummary, setIsLoadingAiSummary] = useState(true)

  useEffect(() => {
    const cachedSummary = localStorage.getItem('intelligentNetworkSummary');
    if (cachedSummary) {
      try {
        setAiSummary(JSON.parse(cachedSummary));
      } catch (e) {
        console.error("Failed to parse cached summary", e);
        localStorage.removeItem('intelligentNetworkSummary'); // Clear corrupted cache
      }
      setIsLoadingAiSummary(false);
    } else {
      aiSummaryFetcher().then(data => {
        if (data) {
          setAiSummary(data);
          localStorage.setItem('intelligentNetworkSummary', JSON.stringify(data));
        }
        setIsLoadingAiSummary(false);
      }).catch(err => {
        console.error("Failed to fetch AI summary", err);
        setIsLoadingAiSummary(false);
      });
    }
  }, []); // Empty dependency array ensures this runs only once on mount


  const summaryRef = useRef<HTMLDivElement>(null)
  const handleDownloadSummary = async () => {
    if (!summaryRef.current) return
    try {
      const dataUrl = await htmlToImage.toPng(summaryRef.current, {
        cacheBust: true,
        backgroundColor: '#1c1917', // Match dark theme card background
        skipAutoScale: true,
        fontEmbedCSS: '',
      })
      const link = document.createElement('a')
      link.download = 'xdorb-intelligent-summary.png'
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to export summary image', err)
    }
  }

  // State for comparison
  const [node1, setNode1] = useState<PNodeMetrics | null>(null)
  const [node2, setNode2] = useState<PNodeMetrics | null>(null)
  const [isFetchingDetails, setIsFetchingDetails] = useState<number | null>(null)
  const [step, setStep] = useState(0)
  const [compareModalOpen, setCompareModalOpen] = useState(false)
  const [intelligentComparison, setIntelligentComparison] = useState("")
  const [isComparing, setIsComparing] = useState(false)

  const handleSelectNode = async (node: PNodeMetrics, nodeNumber: 1 | 2) => {
    setIsFetchingDetails(nodeNumber);
    setIntelligentComparison("");
    const { data: detailedNode, error } = await apiClient.getPNodeById(node.id);
    if (detailedNode && !error) {
      if (nodeNumber === 1) {
        setNode1(detailedNode);
        setStep(1);
      } else {
        setNode2(detailedNode);
        setStep(2);
      }
    }
    setIsFetchingDetails(null);
  };


  const handleIntelligentCompare = async () => {
    if (!node1 || !node2) return
    setIsComparing(true)
    setIntelligentComparison("") // Clear previous comparison
    const result = await apiClient.compareNodes(node1, node2)
    if (result.data?.comparison) {
      setIntelligentComparison(result.data.comparison)
    } else {
      setIntelligentComparison("Error: Could not generate comparison.")
    }
    setIsComparing(false)
  }

  const getWinner = (key: keyof PNodeMetrics) => {
    if (!node1 || !node2 || node1[key] === node2[key]) return 'tie'
    
    const val1 = Number(node1[key] || 0);
    const val2 = Number(node2[key] || 0);

    if (key === 'latency') {
      return val1 < val2 ? 'node1' : 'node2'
    }
    return val1 > val2 ? 'node1' : 'node2'
  }

  const comparisonData: { metric: string; key: keyof PNodeMetrics; unit: string }[] = [
    { metric: 'Uptime', key: 'uptime', unit: '%' },
    { metric: 'Latency', key: 'latency', unit: 'ms' },
    { metric: 'XDN Score', key: 'xdnScore', unit: '' },
    { metric: 'CPU', key: 'cpuPercent', unit: '%' },
    { metric: 'Packets Out', key: 'packetsOut', unit: '' },
  ]

  return (
    <DashboardLayout>
      <TooltipProvider>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">XDOrb Analytics</h1>
              <p className="text-muted-foreground mt-1">Deep dive into network performance metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StorageVisualization 
              totalCapacity={analytics?.storage?.totalCapacity}
              usedCapacity={analytics?.storage?.usedCapacity}
            />
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
                  {/* Node 1 Selection */}
                  <div className="flex flex-col items-center gap-4">
                    <h3 className="font-semibold">Node One</h3>
                    {isFetchingDetails === 1 ? <Loader2 className="h-10 w-10 animate-spin" /> :
                      <SearchableNodeSelect
                        nodes={allNodes || []}
                        selectedNode={node1}
                        onSelect={(node) => handleSelectNode(node, 1)}
                        placeholder="Select Node 1"
                      />
                    }
                  </div>

                  <ArrowRight className={`w-8 h-8 transition-opacity rotate-90 md:rotate-0 ${step >= 1 ? 'opacity-100' : 'opacity-20'}`} />

                  {/* Node 2 Selection */}
                  <div className="flex flex-col items-center gap-4">
                    <h3 className="font-semibold">Node Two</h3>
                    {isFetchingDetails === 2 ? <Loader2 className="h-10 w-10 animate-spin" /> :
                      <SearchableNodeSelect
                        nodes={allNodes || []}
                        selectedNode={node2}
                        onSelect={(node) => handleSelectNode(node, 2)}
                        placeholder="Select Node 2"
                      />
                    }
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
                                const winner = getWinner(key);
                                const node1Value = node1[key] !== null && node1[key] !== undefined ? `${Number(node1[key]).toFixed(2)}${unit}` : '-';
                                const node2Value = node2[key] !== null && node2[key] !== undefined ? `${Number(node2[key]).toFixed(2)}${unit}` : '-';
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
                <Button variant="outline" size="icon" onClick={() => { /* Implement share logic */ }}>
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
       </TooltipProvider>
     </DashboardLayout>
   )
 }
