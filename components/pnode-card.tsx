"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PNodeMetrics } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PNodeCardProps {
  node: PNodeMetrics
}

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

const convertBytes = (bytes: number, unit: 'TB' | 'GB' | 'MB') => {
    if (bytes === 0) return '0.00';
    const k = 1024;
    const units = {
      'MB': k * k,
      'GB': k * k * k,
      'TB': k * k * k * k,
    };
    return (bytes / units[unit]).toFixed(2);
};

export function PNodeCard({ node }: PNodeCardProps) {
  const [storageUnit, setStorageUnit] = useState<'TB' | 'GB' | 'MB'>('TB');

  return (
    <Card 
      className="border-border bg-card hover:border-primary/50 transition-colors duration-300 cursor-pointer flex flex-col"
      onClick={() => window.location.href = `/pnodes/${node.id}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg truncate">{node.name}</CardTitle>
          <Badge className={cn("text-xs", statusBadgeVariant(node.status))}>
            {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
          </Badge>
        </div>
        <CardDescription className="truncate">{node.location}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Uptime</p>
            <p className="font-semibold">{node.uptime.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Latency</p>
            <p className="font-semibold">{node.latency}ms</p>
          </div>
          <div>
            <p className="text-muted-foreground">XDN Score</p>
            <p className="font-semibold">{node.xdnScore ? node.xdnScore.toFixed(0) : 'N/A'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">CPU</p>
            <p className="font-semibold">{node.cpuPercent?.toFixed(1) ?? '-'}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Memory</p>
            <p className="font-semibold">
              {node.memoryUsed && node.memoryTotal ? 
                `${(100 * node.memoryUsed / node.memoryTotal).toFixed(0)}%` 
                : '-'}
            </p>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <p className="text-muted-foreground">Storage</p>
            <div className="flex items-center gap-1">
                <p className="font-semibold">
                {convertBytes(node.storageUsed, storageUnit)}
                </p>
                <Select onValueChange={(value: 'TB' | 'GB' | 'MB') => setStorageUnit(value)} defaultValue={storageUnit}>
                    <SelectTrigger className="w-fit h-6 text-xs border-none bg-transparent focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="MB">MB</SelectItem>
                        <SelectItem value="GB">GB</SelectItem>
                        <SelectItem value="TB">TB</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
        </div>
        {node.registered && (
            <Badge variant="default" className="mt-4 text-[10px] px-1 h-5 bg-green-600 hover:bg-green-700 w-fit">
                Registered
            </Badge>
        )}
      </CardContent>
    </Card>
  )
}