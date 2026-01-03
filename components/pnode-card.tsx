"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PNodeMetrics, apiClient } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"

// The parent page now provides the node with more data
type PNodeWithData = PNodeMetrics & { 
    credits?: number;
    rank?: number;
    isPrivate?: boolean;
    isDevnet?: boolean;
    isMainnet?: boolean;
};

interface PNodeCardProps {
  node: PNodeWithData
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
    if (!bytes || bytes === 0) return '0.00';
    const k = 1024;
    const units = {
      'MB': k * k,
      'GB': k * k * k,
      'TB': k * k * k * k,
    };
    return (bytes / units[unit]).toFixed(2);
};

const formatUptime = (seconds: number) => {
  if (!seconds) return "0s"
  
  if (seconds < 60) {
    return `${seconds.toFixed(0)}s`
  }

  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  
  const parts = []
  if (d > 0) parts.push(`${d}d`)
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  
  return parts.length > 0 ? parts.join(" ") : `${seconds.toFixed(0)}s`
}

export function PNodeCard({ node }: PNodeCardProps) {
  const [storageUnit, setStorageUnit] = useState<'TB' | 'GB' | 'MB'>('GB');
  const [registrationInfo, setRegistrationInfo] = useState<{ date: string; time: string } | null>(null);

  const fetchRegistrationInfo = async () => {
    try {
      const result = await apiClient.getPNodeRegistrationInfo(node.id);
      if (result.error) {
        setRegistrationInfo({ date: 'N/A', time: 'N/A' });
      } else {
        setRegistrationInfo({ date: result.data.registrationDate, time: result.data.registrationTime });
      }
    } catch (error) {
      setRegistrationInfo({ date: 'N/A', time: 'N/A' });
    }
  };

  return (
    <Card 
      className="border-border bg-card hover:border-primary/50 transition-colors duration-300 cursor-pointer flex flex-col rounded-none"
      onClick={() => window.location.href = `/pnodes/${node.id}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg truncate">{node.name}</CardTitle>
          <Badge className={cn("text-xs rounded-none", statusBadgeVariant(node.status))}>
            {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
          </Badge>
        </div>
        <CardDescription className="truncate">{node.location}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Uptime</p>
            <p className="font-semibold">{formatUptime(node.uptime)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Latency</p>
            <p className="font-semibold">{node.latency}ms</p>
          </div>
          <div>
            <p className="text-muted-foreground">XDN Score</p>
            <p className="font-semibold">{node.xdnScore ? node.xdnScore.toFixed(0) : 'N/A'}</p>
          </div>
          {node.isPrivate ? (
            <div>
                <p className="text-muted-foreground">Type</p>
                <Badge variant="outline" className="font-semibold rounded-none">
                    <Lock className="w-3 h-3 mr-1" />
                    Private
                </Badge>
            </div>
          ) : (
            <div>
                <p className="text-muted-foreground">CPU</p>
                <p className="font-semibold">{node.cpuPercent?.toFixed(1) ?? '-'}%</p>
            </div>
          )}
          <div onClick={(e) => e.stopPropagation()}>
            <p className="text-muted-foreground">Storage</p>
            <div className="flex items-center gap-1">
                <p className="font-semibold">
                {convertBytes(node.storageUsed, storageUnit)}
                </p>
                <Select onValueChange={(value: 'TB' | 'GB' | 'MB') => setStorageUnit(value)} defaultValue={storageUnit}>
                    <SelectTrigger className="w-fit h-6 text-xs border-none bg-transparent focus:ring-0 rounded-none">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                        <SelectItem value="MB">MB</SelectItem>
                        <SelectItem value="GB">GB</SelectItem>
                        <SelectItem value="TB">TB</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground">Rank</p>
            <p className="font-semibold">#{node.rank ?? 'N/A'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
            {node.registered && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Badge variant="default" className="text-[10px] px-1 h-5 bg-green-600 hover:bg-green-700 w-fit cursor-pointer rounded-none" onClick={(e) => { e.stopPropagation(); fetchRegistrationInfo() }}>
                            Registered
                        </Badge>
                    </DialogTrigger>
                    <DialogContent className="rounded-none">
                        <DialogHeader>
                            <DialogTitle>Registered Node</DialogTitle>
                            <DialogDescription>This node is officially registered on the Xandeum network.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <p>Registration Date: {registrationInfo?.date || 'Loading...'}</p>
                            <p>Registration Time: {registrationInfo?.time || 'Loading...'}</p>
                        </div>
                        <DialogFooter>
                            <a href="https://seenodes.xandeum.network/" target="_blank" rel="noopener noreferrer">
                                <Button variant="link">See Xandeum's Publication</Button>
                            </a>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
            {node.isMainnet && (
                <Badge variant="outline" className="text-[10px] px-1 h-5 bg-purple-500/10 text-purple-500 border-purple-500/20 rounded-none">
                    Mainnet
                </Badge>
            )}
            {node.isDevnet && (
                <Badge variant="outline" className="text-[10px] px-1 h-5 bg-blue-500/10 text-blue-500 border-blue-500/20 rounded-none">
                    Devnet
                </Badge>
            )}
        </div>
      </CardContent>
    </Card>
  )
}