"use client"

import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Dynamically import the map component to avoid SSR issues
const DynamicMap = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center bg-muted rounded-lg">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
})

export function NetworkHeatmap() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>Network Heatmap</CardTitle>
        <CardDescription>pNode density by region (hover for details)</CardDescription>
      </CardHeader>
      <CardContent>
        <DynamicMap />
        <div className="flex justify-center gap-4 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            High Performance
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            Moderate
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            Warning
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            Critical
          </div>
        </div>
      </CardContent>
    </Card>
  )
}