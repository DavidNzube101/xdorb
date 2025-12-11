"use client"

import useSWR from "swr"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { NodeAvatar } from "@/components/node-avatar"
import { ArrowLeft, Skull } from "lucide-react"

const fetcher = async () => {
  const result = await apiClient.getHistoricalPNodes()
  if (result.error) throw new Error(result.error)
  return result.data
}

export default function CatacombsPage() {
  const { data: pnodes, isLoading } = useSWR("/pnodes/historical", fetcher, {
    refreshInterval: 60000,
    revalidateOnMount: true,
    dedupingInterval: 5000
  })

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-600 dark:text-green-400"
      case "warning":
        return "bg-primary/20 text-primary"
      case "inactive":
        return "bg-red-500/20 text-red-600 dark:text-red-400"
      default:
        return ""
    }
  }

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-4">
              <a href="/pnodes" className="p-2 hover:bg-muted rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </a>
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Skull className="w-8 h-8 text-muted-foreground" />
                  XDOrb Catacombs
                </h1>
                <p className="text-muted-foreground mt-1">Historical pNodes - resting in peace</p>
              </div>
            </div>
          </div>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Historical pNodes</CardTitle>
              <CardDescription>All pNodes ever discovered, including offline ones</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {pnodes?.map((node) => (
                     <div
                       key={node.id}
                       className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
                       onClick={() => window.location.href = `/pnodes/${node.id}`}
                     >
                       <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <div className="flex-shrink-0">
                               <NodeAvatar id={node.id} name={node.name} size="md" />
                             </div>
                           </TooltipTrigger>
                         <TooltipContent>
                           <div className="space-y-1">
                             <p className="font-semibold">{node.name}</p>
                             <p className="text-sm">Status: {node.status}</p>
                             <p className="text-sm">Uptime: {node.uptime}s</p>
                             <p className="text-sm">Latency: {node.latency}ms</p>
                             <p className="text-sm">Last Seen: {new Date(Number(node.lastSeen) * 1000).toLocaleString()}</p>
                           </div>
                         </TooltipContent>
                         </Tooltip>

                         <div className="flex-1 min-w-0">
                           <p className="font-semibold text-foreground truncate">{node.name}</p>
                           <p className="text-sm text-muted-foreground truncate">{node.location}</p>
                         </div>
                       </div>

                       {/* Mobile: Badges in a scrollable row */}
                       <div className="flex gap-2 overflow-x-auto pb-1 sm:hidden">
                         <Badge variant="outline" className="text-xs flex-shrink-0">
                           {node.uptime}s uptime
                         </Badge>
                         <Badge variant="outline" className="text-xs flex-shrink-0">
                           {node.latency}ms latency
                         </Badge>
                         <Badge variant="outline" className="text-xs flex-shrink-0">
                           Last seen: {new Date(Number(node.lastSeen) * 1000).toLocaleDateString()}
                         </Badge>
                       </div>

                       {/* Desktop: Badges in normal layout */}
                       <div className="hidden sm:flex gap-2 mt-1">
                         <Badge variant="outline" className="text-xs">
                           {node.uptime}s uptime
                         </Badge>
                         <Badge variant="outline" className="text-xs">
                           {node.latency}ms latency
                         </Badge>
                         <Badge variant="outline" className="text-xs">
                           Last seen: {new Date(Number(node.lastSeen) * 1000).toLocaleDateString()}
                         </Badge>
                       </div>

                       <div className="flex justify-end sm:justify-start">
                         <Badge className={statusBadgeVariant(node.status)}>
                           {node.status}
                         </Badge>
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