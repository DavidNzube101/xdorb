"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Zap } from "lucide-react"
import useSWR from "swr"
import { apiClient } from "@/lib/api"

const statsFetcher = async () => {
  const result = await apiClient.getDashboardStats()
  if (result.error) throw new Error(result.error)
  return result.data
}

export default function NetworkStatusEmbed() {
  const { data: stats, isLoading } = useSWR("dashboard/stats", statsFetcher, {
    refreshInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-16 bg-muted rounded animate-pulse" />
          <div className="h-16 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-background text-foreground">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Xandeum Network Status</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{stats?.activeNodes || 0}</div>
          <div className="text-sm text-muted-foreground">Active Nodes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-secondary">{stats?.networkHealth || 0}%</div>
          <div className="text-sm text-muted-foreground">Network Health</div>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <Badge variant="outline" className="text-xs">
          <Zap className="w-3 h-3 mr-1" />
          Live Data
        </Badge>
      </div>
    </div>
  )
}