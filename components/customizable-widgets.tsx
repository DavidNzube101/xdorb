"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, X, GripVertical } from "lucide-react"
import { NetworkHealthChart } from "@/components/charts/network-health-chart"
import { RewardDistribution } from "@/components/reward-distribution"
import { PerformanceMetrics } from "@/components/performance-metrics"
import { AIInsights } from "@/components/ai-insights"
import { StorageVisualization } from "@/components/storage-visualization"

interface Widget {
  id: string
  title: string
  component: React.ComponentType<any>
  visible: boolean
  order: number
}

const availableWidgets: Omit<Widget, 'visible' | 'order'>[] = [
  { id: 'network-health', title: 'Network Health', component: NetworkHealthChart },
  { id: 'reward-distribution', title: 'Reward Distribution', component: RewardDistribution },
  { id: 'performance-metrics', title: 'Performance Metrics', component: PerformanceMetrics },
  { id: 'ai-insights', title: 'AI Insights', component: AIInsights },
  { id: 'storage-viz', title: 'Storage Visualization', component: StorageVisualization },
]

export function CustomizableWidgets() {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dashboard-widgets')
      if (saved) {
        let parsed = JSON.parse(saved)
        // Add any new widgets that aren't in saved
        const currentIds = parsed.map((w: any) => w.id)
        availableWidgets.forEach(aw => {
          if (!currentIds.includes(aw.id)) {
            parsed.push({ id: aw.id, visible: true, order: parsed.length })
          }
        })
        return parsed.map((w: any) => ({
          ...w,
          component: availableWidgets.find(aw => aw.id === w.id)?.component || NetworkHealthChart,
          title: availableWidgets.find(aw => aw.id === w.id)?.title || w.id
        }))
      }
    }
    return availableWidgets.map((w, index) => ({ ...w, visible: true, order: index }))
  })

  const [isCustomizing, setIsCustomizing] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem('dashboard-widgets', JSON.stringify(
      widgets.map(w => ({ id: w.id, visible: w.visible, order: w.order }))
    ))
  }, [widgets])

  const toggleWidget = (id: string) => {
    setWidgets(prev => prev.map(w =>
      w.id === id ? { ...w, visible: !w.visible } : w
    ))
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedWidget(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedWidget || draggedWidget === targetId) return

    setWidgets(prev => {
      const draggedIndex = prev.findIndex(w => w.id === draggedWidget)
      const targetIndex = prev.findIndex(w => w.id === targetId)

      const newWidgets = [...prev]
      const [dragged] = newWidgets.splice(draggedIndex, 1)
      newWidgets.splice(targetIndex, 0, dragged)

      return newWidgets.map((w, index) => ({ ...w, order: index }))
    })

    setDraggedWidget(null)
  }

  const visibleWidgets = widgets.filter(w => w.visible).sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Dashboard Widgets</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCustomizing(!isCustomizing)}
          aria-label={isCustomizing ? "Exit customization mode" : "Customize dashboard"}
        >
          <Settings className="w-4 h-4 mr-2" />
          {isCustomizing ? 'Done' : 'Customize'}
        </Button>
      </div>

      {isCustomizing && (
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Customize Widgets</CardTitle>
            <CardDescription>Drag to reorder, toggle visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {widgets.map((widget) => (
                <div
                  key={widget.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, widget.id)}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg cursor-move"
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">{widget.title}</span>
                  <Badge variant={widget.visible ? "default" : "secondary"}>
                    {widget.visible ? "Visible" : "Hidden"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWidget(widget.id)}
                    aria-label={`Toggle ${widget.title} visibility`}
                  >
                    {widget.visible ? <X className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleWidgets.map((widget) => {
          const Component = widget.component
          return (
            <div
              key={widget.id}
              className={isCustomizing ? "relative" : ""}
              draggable={isCustomizing}
              onDragStart={isCustomizing ? (e) => handleDragStart(e, widget.id) : undefined}
              onDragOver={isCustomizing ? handleDragOver : undefined}
              onDrop={isCustomizing ? (e) => handleDrop(e, widget.id) : undefined}
            >
              {isCustomizing && (
                <div className="absolute -top-2 -right-2 z-10">
                  <Badge variant="outline" className="bg-background">
                    <GripVertical className="w-3 h-3" />
                  </Badge>
                </div>
              )}
              <Component />
            </div>
          )
        })}
      </div>
    </div>
  )
}