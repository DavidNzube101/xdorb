"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Marker } from "react-leaflet"
import { apiClient } from "@/lib/api"
import "leaflet/dist/leaflet.css"

// Fix for default markers in react-leaflet
import L from "leaflet"
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
})

interface HeatmapData {
  lat: number
  lng: number
  intensity: number
  nodeCount: number
  region: string
  avgUptime: number
}

interface MapComponentProps {
  center?: [number, number]
  zoom?: number
  highlight?: {
    lat: number
    lng: number
    name: string
  }
}

function MapController({ center, zoom }: { center?: [number, number], zoom?: number }) {
  const map = useMap()
  
  useEffect(() => {
    map.invalidateSize()
    if (center) {
      map.setView(center, zoom || 10)
    }
  }, [map, center, zoom])
  
  return null
}

export default function MapComponent({ center, zoom, highlight }: MapComponentProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const result = await apiClient.getNetworkHeatmap()
        if (result.error) {
          console.error("Failed to fetch heatmap data:", result.error)
          setHeatmapData([])
          return
        }
        
        // Accommodate both direct array and object-wrapped data
        const data = Array.isArray(result) ? result : result.data
        
        if (!Array.isArray(data)) {
          console.error("Invalid heatmap data format:", data)
          setHeatmapData([])
        } else {
          setHeatmapData(data)
        }
      } catch (error) {
        console.error("Failed to fetch heatmap data:", error)
        setHeatmapData([])
      }
    }

    fetchHeatmapData()
  }, [])

  const getColor = (intensity: number) => {
    if (intensity >= 80) return "#22c55e" // green
    if (intensity >= 60) return "#eab308" // yellow
    if (intensity >= 40) return "#f97316" // orange
    return "#ef4444" // red
  }

  const getRadius = (nodeCount: number) => {
    return Math.max(10, Math.min(50, nodeCount * 3))
  }

  return (
    <div className="h-96 rounded-lg overflow-hidden border border-border bg-card">
      <MapContainer
        center={center || [20, 0]}
        zoom={zoom || 2}
        style={{ height: "100%", width: "100%" }}
        className="rounded-lg"
      >
        <MapController center={center} zoom={zoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Heatmap Layer */}
        {heatmapData.map((point, index) => (
          <CircleMarker
            key={index}
            center={[point.lat, point.lng]}
            pathOptions={{
              fillColor: getColor(point.intensity),
              fillOpacity: 0.5,
              color: getColor(point.intensity),
              weight: 1,
            }}
            radius={getRadius(point.nodeCount)}
          >
            <Popup>
              <div className="p-3 min-w-64">
                <h3 className="font-bold text-lg mb-2 text-gray-800">{point.region}</h3>
                <div className="space-y-2 text-sm">
                   {/* ... popup content ... */}
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Highlighted Node */}
        {highlight && (
          <Marker position={[highlight.lat, highlight.lng]}>
            <Popup>
              <div className="font-semibold text-gray-800">{highlight.name}</div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
