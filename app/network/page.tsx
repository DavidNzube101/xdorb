"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { NetworkHeatmap } from "@/components/network-heatmap"
import { apiClient, PNodeMetrics } from "@/lib/api"

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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPnodes = async () => {
      try {
        const response = await apiClient.getPNodes({ limit: 1000 })
        if (response.error) {
          console.error("Failed to fetch pNodes:", response.error)
        } else {
          setPnodes(response.data)
        }
      } catch (error) {
        console.error("Error fetching pNodes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPnodes()
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
                {Object.entries(regionCounts).map(([region, count]) => (
                  <div key={region} className="flex justify-between">
                    <span className="text-foreground">{region || "Unknown"}</span>
                    <span className="font-bold text-primary">{count}</span>
                  </div>
                ))}
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
      </div>
    </DashboardLayout>
  )
}
