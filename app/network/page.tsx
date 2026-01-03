"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { NetworkHeatmap } from "@/components/network-heatmap"
import { apiClient, PNodeMetrics } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Link from "next/link"

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

export default function NetworkPage() {
  const [pnodes, setPnodes] = useState<PNodeMetrics[]>([])
  const [operators, setOperators] = useState<Array<{ manager: string; owned: number; registered: number; pnodes: string[] }>>([])
  const [loading, setLoading] = useState(true)
  const [showAllRegions, setShowAllRegions] = useState(false)
  const [operatorsPage, setOperatorsPage] = useState(1)
  const OPERATORS_PER_PAGE = 15

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pnodesRes, operatorsRes] = await Promise.all([
            apiClient.getPNodes({ limit: 1000 }),
            apiClient.getOperators()
        ])

        if (pnodesRes.error) {
          console.error("Failed to fetch pNodes:", pnodesRes.error)
        } else {
          setPnodes(pnodesRes.data)
        }

        if (operatorsRes.error) {
            console.error("Failed to fetch operators:", operatorsRes.error)
        } else {
            setOperators(operatorsRes.data)
        }
      } catch (error) {
        console.error("Error fetching network data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate stats from real data
  const totalNodes = pnodes.length
  const activeNodes = pnodes.filter(p => p.status === "active").length
  const avgUptime = pnodes.length > 0 ? pnodes.reduce((sum, p) => sum + p.uptime, 0) / pnodes.length : 0

  // Group by region
  const regionCounts: Record<string, number> = {}
  pnodes.forEach(p => {
    regionCounts[p.region] = (regionCounts[p.region] || 0) + 1
  })

  const regionEntries = Object.entries(regionCounts).sort((a, b) => b[1] - a[1]);
  const visibleRegions = showAllRegions ? regionEntries : regionEntries.slice(0, 4);

  const totalOperatorPages = Math.ceil(operators.length / OPERATORS_PER_PAGE)
  const paginatedOperators = operators.slice(
    (operatorsPage - 1) * OPERATORS_PER_PAGE,
    operatorsPage * OPERATORS_PER_PAGE
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">XDOrb Network</h1>
            <p className="text-muted-foreground mt-1">Loading pNode data...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">XDOrb Network</h1>
          <p className="text-muted-foreground mt-1">Global pNode distribution and network health</p>
        </div>

        <NetworkHeatmap />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">Nodes by Region</p>
              <div className="space-y-2">
                {visibleRegions.map(([region, count]) => (
                  <div key={region} className="flex justify-between items-center group">
                    <div className="flex-1">
                        <span className="text-foreground">{region || "Unknown"}</span>
                        <span className="font-bold text-primary ml-2">{count}</span>
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-3 text-[10px] uppercase font-bold border-primary/20 text-primary hover:bg-primary/10 rounded-none transition-colors"
                        onClick={() => window.location.href = `/network/${encodeURIComponent(region || "Unknown")}`}
                    >
                        Inspect
                    </Button>
                  </div>
                ))}
                {!showAllRegions && regionEntries.length > 4 && (
                  <button 
                    onClick={() => setShowAllRegions(true)}
                    className="text-xs text-primary hover:underline mt-2 w-full text-left"
                  >
                    Load more...
                  </button>
                )}
                {showAllRegions && regionEntries.length > 4 && (
                  <button 
                    onClick={() => setShowAllRegions(false)}
                    className="text-xs text-muted-foreground hover:underline mt-2 w-full text-left"
                  >
                    Show less
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">Network Stats</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Total Nodes</p>
                  <p className="text-2xl font-bold text-foreground">{totalNodes}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg Uptime</p>
                  <p className="text-2xl font-bold text-primary">{formatUptime(avgUptime)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-2">Connectivity</p>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Active Nodes</p>
                  <p className="text-2xl font-bold text-secondary">{activeNodes}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Inactive Nodes</p>
                  <p className="text-2xl font-bold text-foreground">{totalNodes - activeNodes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card id="operators" className="border-border bg-card">
            <CardHeader>
                <CardTitle>Network Operators</CardTitle>
                <CardDescription>Managers and their pNode fleets</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border text-left">
                                <th className="p-3 font-semibold">Manager</th>
                                <th className="p-3 font-semibold text-center">pNodes Owned</th>
                                <th className="p-3 font-semibold text-center">Registered</th>
                                <th className="p-3 font-semibold text-right">Fleet Share</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOperators?.map((op) => (
                                <tr key={op.manager} className="border-b border-border hover:bg-muted/30 transition-colors">
                                    <td className="p-3 font-mono text-xs truncate max-w-[200px]" title={op.manager}>
                                        {op.manager}
                                    </td>
                                    <td className="p-3 text-center font-bold">
                                        <div className="flex items-center justify-center gap-2">
                                            {op.owned}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:text-primary/80">
                                                        <ExternalLink className="h-3 w-3" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
                                                    <DialogHeader>
                                                        <DialogTitle>Operator pNodes</DialogTitle>
                                                        <DialogDescription className="font-mono text-[10px] break-all">
                                                            Manager: {op.manager}
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className="flex-1 overflow-auto py-4">
                                                        <div className="space-y-2">
                                                            {op.pnodes?.map((nodeId) => (
                                                                <Link 
                                                                    key={nodeId} 
                                                                    href={`/pnodes/${nodeId}`}
                                                                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors border border-border"
                                                                >
                                                                    <span className="font-mono text-xs truncate flex-1">{nodeId}</span>
                                                                    <ExternalLink className="h-3 w-3 ml-2 text-muted-foreground" />
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className={op.registered === op.owned ? "text-green-500" : "text-yellow-500"}>
                                            {op.registered} / {op.owned}
                                        </span>
                                    </td>
                                    <td className="p-3 text-right text-muted-foreground text-sm">
                                        {((op.owned / totalNodes) * 100).toFixed(1)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalOperatorPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-muted-foreground">
                            Page {operatorsPage} of {totalOperatorPages}
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setOperatorsPage(p => Math.max(1, p - 1))}
                                disabled={operatorsPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setOperatorsPage(p => Math.min(totalOperatorPages, p + 1))}
                                disabled={operatorsPage === totalOperatorPages}
                            >
                                Next <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
