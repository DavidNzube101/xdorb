"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Marker } from "react-leaflet"
import createGlobe from "cobe"
import { apiClient } from "@/lib/api"
import { Globe, Map as MapIcon } from "lucide-react"
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

function GlobeView({ data, highlight }: { data: HeatmapData[], highlight?: { lat: number, lng: number } }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let phi = 0
    let width = 0
    
    const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth)
    window.addEventListener('resize', onResize)
    onResize()

    if (!canvasRef.current) return

    // Convert data to markers
    const markers = data.map(d => ({
        location: [d.lat, d.lng] as [number, number],
        size: Math.max(0.05, d.intensity / 200) // Scale size
    }))

    // Add highlight marker if exists
    if (highlight) {
        markers.push({
            location: [highlight.lat, highlight.lng],
            size: 0.1
        })
        // Set initial rotation to face highlight
        // phi = highlight.lng * (Math.PI / 180) // Simple approx
    }

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.15], // Dark blueish
      markerColor: [0.9, 0.7, 0.2], // Gold
      glowColor: [0.2, 0.2, 0.3],
      opacity: 0.8,
      markers: markers,
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi
        phi += 0.003 // Rotation speed
        state.width = width * 2
        state.height = width * 2
      },
    })

    return () => {
      globe.destroy()
      window.removeEventListener('resize', onResize)
    }
  }, [data, highlight])

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', maxWidth: '600px', maxHeight: '600px', aspectRatio: '1' }}
        />
        {/* Simple Legend for Globe */}
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground pointer-events-none">
            {data.length} active regions
        </div>
    </div>
  )
}

export default function MapComponent({ center, zoom, highlight }: MapComponentProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d")

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const result = await apiClient.getNetworkHeatmap()
        if (result.error) {
          console.error("Failed to fetch heatmap data:", result.error)
          setHeatmapData([])
          return
        }
        
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
    <div className="h-96 rounded-lg overflow-hidden border border-border bg-card relative group">
      {/* View Toggle */}
      <div className="absolute top-3 right-3 z-[400] flex bg-card/90 backdrop-blur-sm border border-border rounded-lg p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={() => setViewMode("3d")} 
            className={`p-1.5 rounded-md transition-colors ${viewMode === "3d" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            title="3D Globe View"
          >
            <Globe className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode("2d")} 
            className={`p-1.5 rounded-md transition-colors ${viewMode === "2d" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            title="2D Map View"
          >
            <MapIcon className="w-4 h-4" />
          </button>
      </div>

      {viewMode === "3d" ? (
        <GlobeView data={heatmapData} highlight={highlight} />
      ) : (
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
      )}
    </div>
  )
}
