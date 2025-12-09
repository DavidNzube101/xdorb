"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { NetworkHeatmap } from "@/components/network-heatmap"
import { apiClient, PNodeMetrics } from "@/lib/api"

export default function NetworkPage() {
  const [pnodes, setPnodes] = useState<PNodeMetrics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPnodes = async () => {
      try {
        const response = await apiClient.getPNodes()
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
                  <p className="text-2xl font-bold text-primary">{avgUptime.toFixed(1)}%</p>
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

        {/* pNode List */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>pNode List</CardTitle>
            <CardDescription>Real-time pNode information from Xandeum network</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pnodes.slice(0, 10).map((pnode) => (
                <div key={pnode.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      pnode.status === "active" ? "bg-green-500" :
                      pnode.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                    }`} />
                    <div>
                      <p className="font-medium">{pnode.name}</p>
                      <p className="text-sm text-muted-foreground">{pnode.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{pnode.uptime.toFixed(1)}% uptime</p>
                    <p className="text-sm text-muted-foreground">
                      {(pnode.storageUsed / (1024 * 1024 * 1024)).toFixed(1)} GB used
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
