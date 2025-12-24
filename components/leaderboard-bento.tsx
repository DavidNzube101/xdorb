"use client"

import { useRouter } from "next/navigation"
import { PNodeMetrics } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, Clock, Crown } from "lucide-react"
import { NodeAvatar } from "@/components/node-avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface LeaderboardBentoProps {
  nodes: PNodeMetrics[];
  countdown: string;
}

export default function LeaderboardBento({ nodes, countdown }: LeaderboardBentoProps) {
  const router = useRouter()
  const top3 = nodes.slice(0, 3)
  const mover = nodes[3] // Mock "Mover" as the 4th node for now

  const NodePreviewTooltip = ({ node, children }: { node: PNodeMetrics, children: React.ReactNode }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent className="p-0 border-none bg-transparent shadow-none">
        <Card className="p-3 min-w-[200px] shadow-xl border-primary/20 bg-card/95 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm">{node.name}</h3>
                <Badge variant="outline" className="text-[10px]">{node.xdnScore.toFixed(0)} XDN</Badge>
            </div>
            <div className="space-y-1 text-xs">
                <p className="text-muted-foreground"><strong>Location:</strong> {node.location}</p>
                <p className="text-muted-foreground"><strong>Latency:</strong> {node.latency}ms</p>
                <p className="text-muted-foreground"><strong>Uptime:</strong> {node.uptime}s</p>
            </div>
        </Card>
      </TooltipContent>
    </Tooltip>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-full min-h-[500px]">
      {/* Large Tile: Podium */}
      <Card className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-card to-muted/20 border-border p-6 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy className="w-32 h-32" />
        </div>
        
        <div className="flex items-center gap-2 mb-6">
          <Crown className="w-5 h-5 text-yellow-500" />
          <h3 className="font-bold text-lg">Season Leaders</h3>
        </div>

        <div className="flex-1 flex items-end justify-center gap-4 sm:gap-8 pb-4">
          {/* Silver - Rank 2 */}
          {top3[1] && (
            <NodePreviewTooltip node={top3[1]}>
                <div 
                    className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                    onClick={() => router.push(`/pnodes/${top3[1].id}`)}
                >
                <div className="relative">
                    <NodeAvatar id={top3[1].id} name={top3[1].name} size="lg" />
                    <Badge className="absolute -bottom-2 -right-2 bg-slate-400 text-slate-900 border-none">#2</Badge>
                </div>
                <div className="text-center">
                    <p className="font-bold text-sm max-w-[100px] truncate">{top3[1].name}</p>
                    <p className="text-xs text-muted-foreground">{top3[1].xdnScore.toFixed(0)} XDN</p>
                </div>
                <div className="w-16 sm:w-20 h-24 bg-slate-400/20 rounded-t-lg border-t border-x border-slate-400/30" />
                </div>
            </NodePreviewTooltip>
          )}

          {/* Gold - Rank 1 */}
          {top3[0] && (
            <NodePreviewTooltip node={top3[0]}>
                <div 
                    className="flex flex-col items-center gap-2 z-10 cursor-pointer transition-transform hover:scale-105"
                    onClick={() => router.push(`/pnodes/${top3[0].id}`)}
                >
                <div className="relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                        <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500 animate-bounce" />
                    </div>
                    <NodeAvatar id={top3[0].id} name={top3[0].name} size="xl" />
                    <Badge className="absolute -bottom-3 -right-3 bg-yellow-500 text-yellow-950 border-none px-2 py-0.5 text-sm">#1</Badge>
                </div>
                <div className="text-center mt-2">
                    <p className="font-bold text-base max-w-[120px] truncate">{top3[0].name}</p>
                    <p className="text-xs text-yellow-500 font-mono">{top3[0].xdnScore.toFixed(0)} XDN</p>
                </div>
                <div className="w-20 sm:w-24 h-32 bg-yellow-500/20 rounded-t-lg border-t border-x border-yellow-500/30 shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)]" />
                </div>
            </NodePreviewTooltip>
          )}

          {/* Bronze - Rank 3 */}
          {top3[2] && (
            <NodePreviewTooltip node={top3[2]}>
                <div 
                    className="flex flex-col items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                    onClick={() => router.push(`/pnodes/${top3[2].id}`)}
                >
                <div className="relative">
                    <NodeAvatar id={top3[2].id} name={top3[2].name} size="lg" />
                    <Badge className="absolute -bottom-2 -right-2 bg-amber-700 text-amber-100 border-none">#3</Badge>
                </div>
                <div className="text-center">
                    <p className="font-bold text-sm max-w-[100px] truncate">{top3[2].name}</p>
                    <p className="text-xs text-muted-foreground">{top3[2].xdnScore.toFixed(0)} XDN</p>
                </div>
                <div className="w-16 sm:w-20 h-16 bg-amber-700/20 rounded-t-lg border-t border-x border-amber-700/30" />
                </div>
            </NodePreviewTooltip>
          )}
        </div>
      </Card>

      {/* Small Tile: Fastest Mover */}
      <Card 
        className="bg-card border-border p-4 flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => mover && router.push(`/pnodes/${mover.id}`)}
      >
        <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-16 h-16" />
        </div>
        <div className="flex items-center gap-2 text-primary mb-2">
          <TrendingUp className="w-4 h-4" />
          <h4 className="font-semibold text-sm">Rising Star</h4>
        </div>
        {mover ? (
            <NodePreviewTooltip node={mover}>
                <div className="flex items-center gap-3">
                    <NodeAvatar id={mover.id} name={mover.name} size="sm" />
                    <div>
                        <p className="font-bold truncate max-w-[120px]">{mover.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {mover.xdnScore.toFixed(0)} XDN Score
                        </p>
                    </div>
                </div>
            </NodePreviewTooltip>
        ) : (
            <div className="text-muted-foreground text-sm">No data</div>
        )}
      </Card>

      {/* Small Tile: Season Status */}
      <Card className="bg-card border-border p-4 flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-colors">
         <div className="absolute right-0 top-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="w-16 h-16" />
        </div>
        <div className="flex items-center gap-2 text-primary mb-2">
          <Clock className="w-4 h-4" />
          <h4 className="font-semibold text-sm">Season 1</h4>
        </div>
        <div>
            <p className="text-2xl font-bold font-mono">{countdown}</p>
            <p className="text-xs text-muted-foreground">Remaining until snapshots reset</p>
        </div>
        <div className="w-full bg-muted/50 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-primary h-full w-[65%]" />
        </div>
      </Card>

      {/* Wide Tile: Network Power */}
      {/* (Optional 4th tile if we change grid) - Keeping it to 3 main slots for now per request, 
          but grid layout leaves one empty slot if 3 cols x 2 rows and large takes 2x2.
          Wait, 3 cols x 2 rows = 6 cells.
          Large tile: col-span-2, row-span-2 (4 cells).
          Right column: 2 cells (Fastest Mover, Season Status).
          Perfect fit.
      */}
    </div>
  )
}
