"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trophy, Award, Info, RefreshCw } from "lucide-react"
import { NodeAvatar } from "@/components/node-avatar"
import LeaderboardBento from "@/components/leaderboard-bento"

const fetcher = async () => {
  const result = await apiClient.getLeaderboard("xdn", 20)
  if (result.error) {
    console.error("Failed to fetch leaderboard:", result.error)
    throw new Error(result.error)
  }
  if (!Array.isArray(result.data)) {
    console.error("Invalid leaderboard data format:", result.data)
    throw new Error("Invalid data format")
  }
  return result.data
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState(30)

  const { data: topNodes, isLoading, mutate } = useSWR("/leaderboard", fetcher, {
    refreshInterval: 30000,
    revalidateOnMount: true,
    dedupingInterval: 5000,
    onSuccess: () => setTimeLeft(30)
  })

  useEffect(() => {
    const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleRefresh = () => {
      mutate()
      setTimeLeft(30)
  }

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Award className="w-5 h-5 text-slate-400" />
      case 3:
        return <Award className="w-5 h-5 text-orange-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-muted-foreground font-mono">{position}</span>
    }
  }

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-foreground">XDOrb Leaderboard</h1>
                <p className="text-muted-foreground mt-1">Top performing pNodes ranked by XDN Score</p>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-none border border-border text-xs text-muted-foreground">
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refreshing in {timeLeft}s</span>
            </div>
          </div>

          {/* Bento Grid Summary */}
          {topNodes ? (
             <LeaderboardBento nodes={topNodes} />
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-[500px]">
                <div className="md:col-span-2 md:row-span-2 bg-muted rounded-xl animate-pulse" />
                <div className="bg-muted rounded-xl animate-pulse" />
                <div className="bg-muted rounded-xl animate-pulse" />
             </div>
          )}

          {/* List Section */}
          <Card className="border-border bg-card overflow-hidden">
                <CardHeader>
                <div className="flex items-center gap-2">
                    <CardTitle>Global Rankings</CardTitle>
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
                        </div>
                    </TooltipContent>
                    </Tooltip>
                </div>
                <CardDescription>Real-time performance metrics for top 20 nodes</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                {isLoading && !topNodes ? (
                    <div className="space-y-3 p-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                    {topNodes?.map((node, index) => (
                        <div
                        key={node.id}
                        className={`flex items-center gap-3 p-4 transition-colors hover:bg-muted/50 cursor-pointer ${
                            index < 3 ? "bg-primary/5" : ""
                        }`}
                        onClick={() => router.push(`/pnodes/${node.id}`)}
                        >
                        <div className="flex items-center justify-center w-8 flex-shrink-0">{getMedalIcon(index + 1)}</div>
                        
                        <div className="flex-shrink-0">
                            <NodeAvatar id={node.id} name={node.name} size="sm" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="font-semibold text-foreground truncate">{node.name}</p>
                                {node.version && <Badge variant="outline" className="text-[10px] h-4 px-1 hidden sm:flex">v{node.version}</Badge>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="truncate">{node.location}</span>
                                <span>•</span>
                                <span>{node.latency}ms</span>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="font-bold text-primary">{node.xdnScore.toFixed(0)}</p>
                            <p className="text-[10px] text-muted-foreground">XDN</p>
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
