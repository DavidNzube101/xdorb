"use client"

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { PNodeMetrics } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

interface BubbleMapProps {
  nodes: PNodeMetrics[]
}

export default function BubbleMap({ nodes }: BubbleMapProps) {
  const getRadius = (rank: number) => {
    // Rank 0 (1st) -> 25px
    // Rank 19 (20th) -> 10px
    return Math.max(8, 25 - (rank * 0.8))
  }

  const getColor = (rank: number) => {
    if (rank === 0) return "#eab308" // Gold
    if (rank === 1) return "#94a3b8" // Silver
    if (rank === 2) return "#ca8a04" // Bronze
    return "#3b82f6" // Blue
  }

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border border-border bg-card">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {nodes.map((node, index) => {
            // Add slight jitter to prevent perfect overlap
            const lat = node.lat + (Math.sin(index) * 0.05);
            const lng = node.lng + (Math.cos(index) * 0.05);

            return (
                <CircleMarker
                    key={node.id}
                    center={[lat, lng]}
                    pathOptions={{
                    fillColor: getColor(index),
                    fillOpacity: 0.8,
                    color: "#ffffff",
                    weight: 1,
                    }}
                    radius={getRadius(index)}
                >
                    <Popup>
                    <div className="p-2 min-w-[200px]">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-foreground">#{index + 1} {node.name}</h3>
                            <Badge variant="outline">{node.xdnScore.toFixed(0)} XDN</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            <p><strong>Location:</strong> {node.location}</p>
                            <p><strong>Latency:</strong> {node.latency}ms</p>
                            <p><strong>Version:</strong> v{node.version || '0.0.0'}</p>
                            <p className="text-xs font-mono text-muted-foreground mt-2 truncate">{node.id}</p>
                        </div>
                    </div>
                    </Popup>
                </CircleMarker>
            )
        })}
      </MapContainer>
    </div>
  )
}
