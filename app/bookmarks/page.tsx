"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient, PNodeMetrics } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { NodeAvatar } from "@/components/node-avatar"
import { BookmarkX, ExternalLink, Lock } from "lucide-react" // Import Lock icon

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

// Define a type for bookmarked nodes including isPrivate
type BookmarkedPNode = PNodeMetrics & { isPrivate?: boolean };

export default function BookmarksPage() {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [bookmarkedNodes, setBookmarkedNodes] = useState<BookmarkedPNode[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('bookmarked-pnodes')
    if (saved) {
      const ids = new Set(JSON.parse(saved) as string[])
      setBookmarkedIds(ids)
    }
  }, [])

  useEffect(() => {
    const fetchBookmarkedNodes = async () => {
      if (bookmarkedIds.size === 0) {
        setBookmarkedNodes([]); // Clear nodes if no bookmarks
        return;
      }

      try {
        const result = await apiClient.getPNodes()
        if (result.error) return

        const bookmarked = result.data
          .filter((node: PNodeMetrics) => bookmarkedIds.has(node.id))
          .map((node: PNodeMetrics): BookmarkedPNode => {
            const isPrivate = (node.packetsIn === 0 && node.packetsOut === 0 && (node.cpuPercent ?? 0) === 0 && (node.memoryUsed ?? 0) === 0);
            return {
              ...node,
              isPrivate: isPrivate,
            };
          });
        setBookmarkedNodes(bookmarked)
      } catch (error) {
        console.error('Failed to fetch bookmarked nodes:', error)
      }
    }

    fetchBookmarkedNodes()
  }, [bookmarkedIds])

  const removeBookmark = (nodeId: string) => {
    const newIds = new Set(bookmarkedIds)
    newIds.delete(nodeId)
    setBookmarkedIds(newIds)
    localStorage.setItem('bookmarked-pnodes', JSON.stringify([...newIds]))
    setBookmarkedNodes(prev => prev.filter(node => node.id !== nodeId))
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookmarked pNodes</h1>
          <p className="text-muted-foreground mt-1">Your saved pNode favorites</p>
        </div>

        {bookmarkedNodes.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BookmarkX className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No bookmarked pNodes yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Visit the pNodes page to bookmark your favorites
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedNodes.map((node) => (
              <Card key={node.id} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <NodeAvatar id={node.id} name={node.name} size="md" />
                      <div>
                        <CardTitle className="text-lg">{node.name}</CardTitle>
                        <CardDescription>{node.location}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBookmark(node.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <BookmarkX className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <Badge className={statusBadgeVariant(node.status)}>
                        {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">XDN Score</span>
                      <span className="font-semibold">{node.xdnScore ? node.xdnScore.toFixed(0) : 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Uptime</span>
                      <span className="font-semibold">{formatUptime(node.uptime)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {node.registered && (
                            <Badge variant="default" className="bg-green-600 text-[10px] px-1 h-5">Registered</Badge>
                        )}
                        {node.isPrivate && (
                            <Badge variant="outline" className="flex items-center gap-1 text-[10px] px-1 h-5">
                                <Lock className="w-3 h-3" />
                                Private
                            </Badge>
                        )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.location.href = `/pnodes/${node.id}`}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}