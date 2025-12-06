"use client"

import type React from "react"
import useSWR from "swr"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient, type DashboardStats, type PNodeMetrics } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Activity, Zap, Award, TrendingUp } from "lucide-react"
import { NetworkHealthChart } from "@/components/charts/network-health-chart"
import { ValidationRateChart } from "@/components/charts/validation-rate-chart"
import { RewardDistribution } from "@/components/reward-distribution"
import { PerformanceMetrics } from "@/components/performance-metrics"

import { CustomizableWidgets } from "@/components/customizable-widgets"
import { NotificationManager } from "@/components/notification-manager"
import { EmbeddableWidgets } from "@/components/embeddable-widgets"

const statsFetcher = async () => {
  const result = await apiClient.getDashboardStats()
  if (result.error) throw new Error(result.error)
  return result.data
}

const pnodesFetcher = async () => {
  const result = await apiClient.getPNodes()
  if (result.error) throw new Error(result.error)
  return result.data
}

export default function DashboardPage() {
  const { data: status } = useSWR("/api/status", async () => {
    const res = await fetch("/api/status")
    return res.json()
  })

  const { data: stats, isLoading: statsLoading } = useSWR<DashboardStats>(
    status?.maintenance ? null : "/dashboard/stats",
    statsFetcher,
    {
      refreshInterval: 30000,
    }
  )

  const { data: pnodes, isLoading: pnodesLoading } = useSWR<PNodeMetrics[]>(
    status?.maintenance ? null : "/pnodes",
    pnodesFetcher,
    {
      refreshInterval: 30000,
    }
  )

  if (status === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Loading...</h1>
        </div>
      </div>
    )
  }

  if (status?.maintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">XDOrb</h1>
          <p className="text-xl text-muted-foreground">Currently in maintenance</p>
          <p className="text-sm text-muted-foreground mt-2">Please check back later</p>
        </div>
      </div>
    )
  }

  const StatCard = ({
    icon: Icon,
    label,
    value,
    change,
    unit,
  }: {
    icon: React.ComponentType<{ className: string }>
    label: string
    value: number
    change?: number
    unit?: string
  }) => (
    <Card className="border-border bg-card hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-foreground mt-2">
              {(value || 0).toLocaleString()}
              {unit && <span className="text-lg ml-1">{unit}</span>}
            </p>
            {change !== undefined && (
              <div
                className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">XDOrb Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time pNode network monitoring</p>
        </div>

        {/* Stats Grid */}
        {statsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Activity} label="Total Nodes" value={stats.totalNodes} change={5.2} />
            <StatCard icon={Zap} label="Active Nodes" value={stats.activeNodes} change={2.1} />
            <StatCard icon={TrendingUp} label="Network Health" value={stats.networkHealth} unit="%" />
            <StatCard
              icon={Award}
              label="Total Rewards"
              value={Math.floor(stats.totalRewards)}
              unit="POL"
              change={12.5}
            />
          </div>
        ) : null}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NetworkHealthChart />
          <ValidationRateChart />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <RewardDistribution />
          </div>
          <div className="lg:col-span-2">
            <PerformanceMetrics />
          </div>
        </div>

         {/* Customizable Widgets */}
         <CustomizableWidgets />

         {/* Notifications */}
         <NotificationManager />

         {/* Embeddable Widgets */}
         <EmbeddableWidgets />

        {/* Recent Activity */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Top Performing Nodes</CardTitle>
            <CardDescription>Highest uptime and validation rates</CardDescription>
          </CardHeader>
          <CardContent>
            {pnodesLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : pnodes && pnodes.length > 0 ? (
              <div className="space-y-3">
                {pnodes.slice(0, 5).map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{node.name}</p>
                      <p className="text-xs text-muted-foreground">{node.location}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{node.uptime}%</p>
                        <p className="text-xs text-muted-foreground">Uptime</p>
                      </div>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          node.status === "active"
                            ? "bg-green-500"
                            : node.status === "warning"
                              ? "bg-primary"
                              : "bg-red-500"
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
