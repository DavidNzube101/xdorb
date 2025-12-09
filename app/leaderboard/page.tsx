"use client"

import useSWR from "swr"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trophy, Award, Info } from "lucide-react"
import { NodeAvatar } from "@/components/node-avatar"

const fetcher = async () => {
  const result = await apiClient.getLeaderboard("xdn", 20)
  if (result.error || !Array.isArray(result.data)) {
    console.log("API result:", result) // Debug log
    // Return mock data if API fails or returns wrong format
    return [
      {
        id: "top-pnode-1",
        name: "Top Node 1",
        status: "active",
        uptime: 99.5,
        latency: 12,
        validations: 10000,
        rewards: 1000.0,
        location: "New York",
        region: "North America",
        storageUsed: 800 * 1024 * 1024 * 1024,
        storageCapacity: 1000 * 1024 * 1024 * 1024,
        lastSeen: new Date(),
        performance: 0.95,
        stake: 10000.0,
        riskScore: 5.0,
        xdnScore: 4250.0,
      },
      {
        id: "top-pnode-2",
        name: "Top Node 2",
        status: "active",
        uptime: 99.0,
        latency: 14,
        validations: 9900,
        rewards: 950.0,
        location: "London",
        region: "Europe",
        storageUsed: 790 * 1024 * 1024 * 1024,
        storageCapacity: 1000 * 1024 * 1024 * 1024,
        lastSeen: new Date(),
        performance: 0.94,
        stake: 9500.0,
        riskScore: 10.0,
        xdnScore: 4025.0,
      },
      {
        id: "top-pnode-3",
        name: "Top Node 3",
        status: "active",
        uptime: 98.5,
        latency: 16,
        validations: 9800,
        rewards: 900.0,
        location: "Tokyo",
        region: "Asia",
        storageUsed: 780 * 1024 * 1024 * 1024,
        storageCapacity: 1000 * 1024 * 1024 * 1024,
        lastSeen: new Date(),
        performance: 0.93,
        stake: 9000.0,
        riskScore: 15.0,
        xdnScore: 3780.0,
      },
    ]
  }
  console.log("Leaderboard data:", result.data) // Debug log
  return result.data
}

export default function LeaderboardPage() {
  const router = useRouter()
  const { data: topNodes, isLoading } = useSWR("/leaderboard", fetcher, {
    refreshInterval: 60000,
    revalidateOnMount: true,
    dedupingInterval: 0
  })

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Award className="w-5 h-5 text-slate-400" />
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-muted-foreground">{position}</span>
    }
  }

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">XDOrb Leaderboard</h1>
            <p className="text-muted-foreground mt-1">Top performing pNodes ranked by XDN Score</p>
          </div>

          <Card className="border-border bg-card overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Top 20 Nodes</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <div className="space-y-2">
                      <p className="font-semibold">XDN Score Formula</p>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>Stake (40%):</strong> Economic commitment</li>
                        <li>• <strong>Uptime (30%):</strong> Reliability</li>
                        <li>• <strong>Latency (20%):</strong> Performance (lower = better)</li>
                        <li>• <strong>Risk Score (10%):</strong> Stability (lower = better)</li>
                      </ul>
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground">
                          Example: Node with 10,000 stake, 99% uptime, 15ms latency, 5 risk score<br/>
                          XDN Score = (10,000 × 0.4) + (99 × 0.3) + ((100-15) × 0.2) + ((100-5) × 0.1) = <strong>4,250</strong>
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>Ranked by XDN Score (Xandeum Node Score)</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {isLoading ? (
                <div className="space-y-3 p-4 sm:p-0">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 p-2 sm:p-0">
                  {topNodes?.map((node, index) => (
                    <div
                      key={node.id}
                      className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border transition-all cursor-pointer ${
                        index < 3
                          ? "bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/30"
                          : "bg-muted/30 border-border hover:border-primary/50"
                      }`}
                      onClick={() => router.push(`/pnodes/${node.id}`)}
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center justify-center w-8 sm:w-10 min-w-8">{getMedalIcon(index + 1)}</div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <NodeAvatar id={node.id} name={node.name} size="md" variant="server" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p className="font-semibold">{node.name}</p>
                              <p className="text-sm">Status: {node.status}</p>
                              <p className="text-sm">Uptime: {node.uptime}%</p>
                              <p className="text-sm">Latency: {node.latency}ms</p>
                              <p className="text-sm">Stake: {node.stake.toLocaleString()}</p>
                              <p className="text-sm">Risk Score: {node.riskScore}</p>
                              <p className="text-sm text-primary font-medium">XDN Score: {node.xdnScore.toFixed(1)}</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                        
                        {/* Mobile: Name and Badges grouped */}
                        <div className="flex-1 sm:hidden">
                           <p className="font-semibold text-foreground truncate">{node.name}</p>
                           <p className="text-xs text-muted-foreground truncate">{node.location}</p>
                        </div>
                      </div>

                      <div className="flex-1 hidden sm:block">
                        <p className="font-semibold text-foreground">{node.name}</p>
                        <p className="text-sm text-muted-foreground">{node.location}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {node.uptime}% uptime
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {node.latency}ms latency
                          </Badge>
                        </div>
                      </div>

                      {/* Mobile Stats Row */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
                        <div className="sm:hidden flex gap-2">
                             <Badge variant="outline" className="text-xs h-6">
                                {node.uptime}%
                              </Badge>
                              <Badge variant="outline" className="text-xs h-6">
                                {node.latency}ms
                              </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 ml-auto">
                            <div className="text-right">
                              <p className="font-bold text-primary text-lg">{node.xdnScore.toFixed(1)}</p>
                              <p className="text-xs text-muted-foreground">XDN Score</p>
                            </div>
                            <Badge
                              variant="outline"
                              className={`${
                                node.status === "active"
                                  ? "bg-green-500/20 text-green-600 dark:text-green-400"
                                  : node.status === "warning"
                                    ? "bg-yellow-500/20 text-yellow-600"
                                    : "bg-red-500/20 text-red-600"
                              }`}
                            >
                              {node.status}
                            </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  )
}