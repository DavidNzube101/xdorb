"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, Code } from "lucide-react"
import { toast } from "sonner"

interface EmbedWidget {
  id: string
  name: string
  description: string
  embedCode: string
  preview: string
}

const embedWidgets: EmbedWidget[] = [
  {
    id: 'network-status',
    name: 'Network Status',
    description: 'Real-time network health and active nodes count',
    embedCode: `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed/network-status" width="400" height="200" frameborder="0" style="border-radius: 8px;"></iframe>`,
    preview: 'Shows current network status with active/inactive node counts'
  },
  {
    id: 'top-nodes',
    name: 'Top Performing Nodes',
    description: 'Leaderboard of highest uptime nodes',
    embedCode: `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed/top-nodes" width="400" height="300" frameborder="0" style="border-radius: 8px;"></iframe>`,
    preview: 'Displays top 5 nodes by uptime with basic metrics'
  },
]

export function EmbeddableWidgets() {
  const [selectedWidget, setSelectedWidget] = useState<EmbedWidget | null>(null)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Embed code copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          Embeddable Widgets
        </CardTitle>
        <CardDescription>Share dashboard data on external websites</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {embedWidgets.map((widget) => (
            <div
              key={widget.id}
              className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setSelectedWidget(widget)}
            >
              <h3 className="font-semibold mb-2">{widget.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{widget.description}</p>
              <Badge variant="outline" className="text-xs">Click to embed</Badge>
            </div>
          ))}
        </div>

        {selectedWidget && (
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {selectedWidget.name}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedWidget(null)}
                  aria-label="Close embed dialog"
                >
                  ×
                </Button>
              </CardTitle>
              <CardDescription>{selectedWidget.preview}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Embed Code</label>
                <div className="flex gap-2">
                  <Input
                    value={selectedWidget.embedCode}
                    readOnly
                    className="font-mono text-xs"
                  />
                  <Button
                    onClick={() => copyToClipboard(selectedWidget.embedCode)}
                    variant="outline"
                    size="sm"
                    aria-label="Copy embed code"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Preview</h4>
                <div
                  className="border border-border rounded-lg p-4 bg-background"
                  dangerouslySetInnerHTML={{ __html: selectedWidget.embedCode }}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => window.open(`/embed/${selectedWidget.id}`, '_blank')}
                  variant="outline"
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview in New Tab
                </Button>
                {copied && <Badge variant="default">Copied!</Badge>}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-sm text-muted-foreground">
          <p><strong>Note:</strong> Embedded widgets will display real-time data from your dashboard. Make sure your site allows iframe embedding.</p>
        </div>
      </CardContent>
    </Card>
  )
}