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
  const pointerInteracting = useRef<{ x: number, y: number } | null>(null)
  const pointerInteractionMovement = useRef({ x: 0, y: 0 })
  const phi = useRef(0)
  const theta = useRef(0.3)
  const zoom = useRef(1) // 1 is default, smaller is zoomed out

  useEffect(() => {
    let width = 0
    
    const onResize = () => canvasRef.current && (width = canvasRef.current.offsetWidth)
    window.addEventListener('resize', onResize)
    onResize()

    if (!canvasRef.current) return

    // Use colored markers as on 2D map
    const markers = data.map(d => ({
        location: [d.lat, d.lng] as [number, number],
        size: 0.03 + (d.intensity / 500)
    }))

    if (highlight) {
        markers.push({
            location: [highlight.lat, highlight.lng],
            size: 0.08
        })
    }

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.15],
      markerColor: [1, 0.8, 0.4], // Gold
      glowColor: [0.1, 0.1, 0.2],
      opacity: 0.8,
      markers: markers,
      onRender: (state) => {
        // Handle autorotation and interaction
        if (!pointerInteracting.current) {
            phi.current += 0.003
        }
        
        state.phi = phi.current + pointerInteractionMovement.current.x
        state.theta = theta.current + pointerInteractionMovement.current.y
        state.width = width * 2 * zoom.current
        state.height = width * 2 * zoom.current
      },
    })

    return () => {
      globe.destroy()
      window.removeEventListener('resize', onResize)
    }
  }, [data, highlight])

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden cursor-grab active:cursor-grabbing"
         onPointerDown={(e) => {
            pointerInteracting.current = { 
                x: e.clientX - pointerInteractionMovement.current.x,
                y: e.clientY - pointerInteractionMovement.current.y,
            }
            if(canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
         }}
         onPointerUp={() => {
            pointerInteracting.current = null;
            if(canvasRef.current) canvasRef.current.style.cursor = 'grab';
         }}
         onPointerOut={() => {
            pointerInteracting.current = null;
            if(canvasRef.current) canvasRef.current.style.cursor = 'grab';
         }}
         onMouseMove={(e) => {
            if (pointerInteracting.current !== null) {
                const delta = { 
                    x: e.clientX - pointerInteracting.current.x, 
                    y: e.clientY - pointerInteracting.current.y 
                }
                pointerInteractionMovement.current = {
                    x: delta.x * 0.005,
                    y: delta.y * 0.005,
                }
            }
         }}
         onWheel={(e) => {
            // Adjust zoom based on wheel delta
            const newZoom = zoom.current - e.deltaY * 0.001
            zoom.current = Math.max(0.5, Math.min(2.5, newZoom)) // Clamp zoom
         }}
    >
        <canvas
            ref={canvasRef}
            style={{ width: '100%', height: '100%', maxWidth: '600px', maxHeight: '600px', aspectRatio: '1', transition: 'opacity 1s ease-in' }}
        />
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground pointer-events-none">
            {data.length} active regions
        </div>
    </div>
  )
}

export default function MapComponent({ center, zoom, highlight }: MapComponentProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d")

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
      {/* View Toggle - Always visible and high z-index */}
      <div className="absolute top-3 right-3 z-[1001] flex bg-card/90 backdrop-blur-sm border border-border rounded-lg p-1 shadow-sm">
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
