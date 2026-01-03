"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient, PNodeMetrics } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Globe, Zap, Activity, Clock, Shield, Search, Brain, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Typewriter } from "@/components/typewriter"

const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="h-96 w-full bg-muted animate-pulse" />
})

const fetcher = () => apiClient.getPNodes({ limit: 1000 })
const summaryFetcher = (r: string) => apiClient.getRegionSummary(r)

export default function RegionPage() {
  const params = useParams()
  const router = useRouter()
  const region = decodeURIComponent(params.region as string)
  const [search, setSearch] = useState("")

  const { data: result, isLoading } = useSWR("/api/pnodes/all", fetcher)
  const { data: summaryResult, isLoading: summaryLoading } = useSWR(region ? `/network/region/${region}/summary` : null, () => summaryFetcher(region))
  
  const regionNodes = useMemo(() => {
    if (!result?.data) return []
    return result.data.filter(node => node.region === region)
  }, [result, region])

  const filteredNodes = useMemo(() => {
    // Deduplicate nodes by ID
    const uniqueNodesMap = new Map<string, PNodeMetrics>();
    regionNodes.forEach(node => {
      if (!uniqueNodesMap.has(node.id)) {
        uniqueNodesMap.set(node.id, node);
      }
    });

    return Array.from(uniqueNodesMap.values())
      .filter(node => 
        node.name.toLowerCase().includes(search.toLowerCase()) || 
        node.id.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (a.status !== 'active' && b.status === 'active') return 1;
        return 0;
      });
  }, [regionNodes, search])

  // Get approximate coordinates for the region to center the map
  const regionCoords = useMemo(() => {
    if (regionNodes.length > 0) {
      // Average coordinates of nodes in region
      const validNodes = regionNodes.filter(n => n.lat !== 0 || n.lng !== 0)
      if (validNodes.length > 0) {
        const lat = validNodes.reduce((sum, n) => sum + n.lat, 0) / validNodes.length
        const lng = validNodes.reduce((sum, n) => sum + n.lng, 0) / validNodes.length
        return [lat, lng] as [number, number]
      }
    }
    return [20, 0] as [number, number] // Fallback
  }, [regionNodes])

  const stats = useMemo(() => {
    const total = regionNodes.length
    const active = regionNodes.filter(n => n.status === "active").length
    const avgLatency = total > 0 ? regionNodes.reduce((sum, n) => sum + n.latency, 0) / total : 0
    return { total, active, avgLatency }
  }, [regionNodes])

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-none">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                {region} <span className="text-muted-foreground font-light text-xl">Region</span>
              </h1>
              <p className="text-muted-foreground mt-1">Detailed view of pNodes in this geographical sector</p>
            </div>
          </div>
          <Badge variant="secondary" className="rounded-none bg-primary/10 text-primary border-primary/20 px-3 py-1">
            {stats.active} / {stats.total} Nodes Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-none border-border bg-card overflow-hidden">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" /> Region Heatmap
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px]">
                  <MapComponent center={regionCoords} zoom={5} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-border bg-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider">Node Directory</CardTitle>
                  <CardDescription>All nodes registered in {region}</CardDescription>
                </div>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Filter nodes..." 
                    className="pl-8 rounded-none h-9 text-xs"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="p-4 text-left font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Name</th>
                        <th className="p-4 text-left font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Status</th>
                        <th className="p-4 text-left font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Latency</th>
                        <th className="p-4 text-right font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredNodes.map((node) => (
                        <tr key={node.id} className="hover:bg-muted/20 transition-colors group">
                          <td className="p-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground">{node.name}</span>
                              <span className="font-mono text-[10px] text-muted-foreground">{node.id.slice(0, 16)}...</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={cn(
                              "rounded-none text-[10px] uppercase font-bold",
                              node.status === 'active' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                            )}>
                              {node.status}
                            </Badge>
                          </td>
                          <td className="p-4 font-mono text-xs">{node.latency}ms</td>
                          <td className="p-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="rounded-none h-8 text-[10px] uppercase font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => router.push(`/pnodes/${node.id}`)}
                            >
                              View Detail
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {filteredNodes.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-muted-foreground italic">
                            No nodes found matching your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-none border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> Sector Integrity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end border-b border-border pb-4">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Region Health</p>
                  <p className="text-2xl font-black text-foreground">{((stats.active / Math.max(stats.total, 1)) * 100).toFixed(1)}%</p>
                </div>
                <div className="flex justify-between items-end border-b border-border pb-4">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Avg Latency</p>
                  <p className="text-2xl font-black text-primary">{stats.avgLatency.toFixed(0)}ms</p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Node Count</p>
                  <p className="text-2xl font-black text-foreground">{stats.total}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-none border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 text-primary">
                  <Brain className="w-4 h-4" /> AI Sector Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground text-xs animate-pulse py-2">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analyzing regional performance...
                  </div>
                ) : summaryResult?.data?.summary ? (
                  <div className="text-xs leading-relaxed text-muted-foreground">
                    <Typewriter text={summaryResult.data.summary} delay={10} />
                  </div>
                ) : (
                  <p className="text-xs leading-relaxed text-muted-foreground italic">
                    AI analysis currently unavailable for this sector.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
