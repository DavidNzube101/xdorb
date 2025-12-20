"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy } from "lucide-react"
import useSWR from "swr"
import { apiClient } from "@/lib/api"

const leaderboardFetcher = async () => {
  const result = await apiClient.getLeaderboard("uptime", 5)
  if (result.error) throw new Error(result.error)
  return result.data
}

export default function TopNodesEmbed() {
  const { data: topNodes, isLoading } = useSWR("leaderboard/top", leaderboardFetcher, {
    refreshInterval: 30000,
  })

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-background text-foreground">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Top Performing Nodes</h2>
      </div>

      <div className="space-y-2">
        {topNodes?.map((node: any, index: number) => (
          <div
            key={node.id}
            className="flex items-center justify-between p-2 bg-muted/30 rounded"
          >
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                {index + 1}
              </Badge>
              <div>
                <div className="font-medium text-sm">{node.name}</div>
                <div className="text-xs text-muted-foreground">{node.location}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-sm">{node.uptime}%</div>
              <div className="text-xs text-muted-foreground">uptime</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}