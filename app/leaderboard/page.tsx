"use client"

import { useState, useEffect, useMemo } from "react"
import useSWR from "swr"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient, PNodeMetrics } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Trophy, Award, Info, RefreshCw, Star } from "lucide-react"
import { NodeAvatar } from "@/components/node-avatar"
import LeaderboardBento from "@/components/leaderboard-bento"

// Extends PNodeMetrics to include optional credits
type PNodeWithCredits = PNodeMetrics & { credits?: number };

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

const creditsFetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch credits');
    const data = await response.json();
    return data.pods_credits as { pod_id: string; credits: number }[];
};

export default function LeaderboardPage() {
  const router = useRouter()
  const [refreshTimeLeft, setRefreshTimeLeft] = useState(30)
  const [countdown, setCountdown] = useState("")
  const [showFullCredits, setShowFullCredits] = useState(false)
  const [showFullGlobal, setShowFullGlobal] = useState(false)

  const { data: topNodes, isLoading, mutate } = useSWR("/leaderboard", fetcher, {
    refreshInterval: 30000,
    revalidateOnMount: true,
    dedupingInterval: 5000,
    onSuccess: () => setRefreshTimeLeft(30)
  })
  
  const { data: creditsData } = useSWR('/api/credits', creditsFetcher);

  const topNodesWithCredits = useMemo((): PNodeWithCredits[] => {
    if (!topNodes) return [];
    const creditsMap = new Map<string, number>();
    if (creditsData) {
        creditsData.forEach(item => creditsMap.set(item.pod_id, item.credits));
    }
    return topNodes.map(node => ({
        ...node,
        credits: creditsMap.get(node.id) ?? 0,
    }));
  }, [topNodes, creditsData]);

  const allCreditsLeaderboard = useMemo(() => {
      return [...topNodesWithCredits]
        .sort((a, b) => (b.credits ?? 0) - (a.credits ?? 0))
        .slice(0, 20);
  }, [topNodesWithCredits]);

  const creditsLeaderboard = useMemo(() => {
      return showFullCredits ? allCreditsLeaderboard : allCreditsLeaderboard.slice(0, 10);
  }, [allCreditsLeaderboard, showFullCredits]);

  useEffect(() => {
    const timer = setInterval(() => {
        setRefreshTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const targetDate = new Date("2025-12-31T23:59:59").getTime();

    const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            setCountdown("0d 0h 0m 0s");
            clearInterval(interval);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getMedalIcon = (position: number, isCredits: boolean = false) => {
    const color = isCredits ? "text-yellow-400" : "text-yellow-500";
    switch (position) {
      case 1:
        return <Trophy className={`w-5 h-5 ${color}`} />
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
                <p className="text-muted-foreground mt-1">Top performing pNodes ranked by XDN Score and Credits</p>
            </div>
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-none border border-border text-xs text-muted-foreground">
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refreshing in {refreshTimeLeft}s</span>
            </div>
          </div>

          {/* Bento Grid Summary */}
          {topNodesWithCredits.length > 0 ? (
             <LeaderboardBento nodes={topNodesWithCredits} countdown={countdown} />
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-[500px]">
                <div className="md:col-span-2 md:row-span-2 bg-muted rounded-xl animate-pulse" />
                <div className="bg-muted rounded-xl animate-pulse" />
                <div className="bg-muted rounded-xl animate-pulse" />
             </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Global Rankings List */}
            <Card className="border-border bg-card overflow-hidden flex flex-col">
                  <CardHeader>
                  <div className="flex items-center gap-2">
                      <CardTitle>Global Rankings (XDN)</CardTitle>
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
                  <CardDescription>Top 20 nodes by real-time performance</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                  {isLoading && !topNodesWithCredits ? (
                      <div className="space-y-3 p-6">
                      {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                      ))}
                      </div>
                  ) : (
                      <div className="divide-y divide-border">
                      {(showFullGlobal ? topNodesWithCredits : topNodesWithCredits.slice(0, 10))?.map((node, index) => (
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
                  <CardFooter className="border-t border-border p-2">
                    <Button 
                        variant="ghost" 
                        className="w-full text-muted-foreground hover:text-foreground"
                        onClick={() => setShowFullGlobal(!showFullGlobal)}
                    >
                        {showFullGlobal ? "Show Less" : "Show More"}
                    </Button>
                </CardFooter>
              </Card>

              {/* Credits Leaderboard List */}
            <Card className="border-border bg-card overflow-hidden flex flex-col">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Credits Leaderboard</CardTitle>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 animate-pulse flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            Live
                        </Badge>
                    </div>
                    <CardDescription>Top 20 nodes ranked by credits earned</CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                {isLoading && !creditsLeaderboard ? (
                    <div className="space-y-3 p-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                    {creditsLeaderboard.map((node, index) => (
                        <div
                        key={node.id}
                        className={`flex items-center gap-3 p-4 transition-colors hover:bg-muted/50 cursor-pointer ${
                            index < 3 ? "bg-yellow-400/5" : ""
                        }`}
                        onClick={() => router.push(`/pnodes/${node.id}`)}
                        >
                        <div className="flex items-center justify-center w-8 flex-shrink-0">{getMedalIcon(index + 1, true)}</div>
                        <div className="flex-shrink-0">
                            <NodeAvatar id={node.id} name={node.name} size="sm" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground truncate">{node.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="truncate">{node.location}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-yellow-400 flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                <span>{(node.credits ?? 0).toLocaleString()}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground">Credits</p>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </CardContent>
                <CardFooter className="border-t border-border p-2">
                    <Button 
                        variant="ghost" 
                        className="w-full text-muted-foreground hover:text-foreground"
                        onClick={() => setShowFullCredits(!showFullCredits)}
                    >
                        {showFullCredits ? "Show Less" : "Show More"}
                    </Button>
                </CardFooter>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  )
}
