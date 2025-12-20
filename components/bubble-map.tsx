"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { PNodeMetrics } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface BubbleMapProps {
  nodes: PNodeMetrics[]
}

export default function BubbleMap({ nodes }: BubbleMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })

  React.useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight,
      })
    }
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Project Lat/Lng to X/Y
  // Longitude: -180 to 180 -> 0 to Width
  // Latitude: 90 to -90 -> 0 to Height
  const project = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * dimensions.width
    const y = ((90 - lat) / 180) * dimensions.height
    return { x, y }
  }

  const getRadius = (xdn: number, rank: number) => {
    // Proportional to score, but also biased by rank for visibility
    const base = Math.max(10, (xdn / 100) * 15)
    const rankBonus = Math.max(0, (20 - rank) / 2)
    return base + rankBonus
  }

  const getColor = (rank: number) => {
    if (rank === 0) return "rgba(234, 179, 8, 0.8)" // Gold
    if (rank === 1) return "rgba(148, 163, 184, 0.8)" // Silver
    if (rank === 2) return "rgba(202, 138, 4, 0.8)" // Bronze
    return "rgba(59, 130, 246, 0.6)" // Blue
  }

  return (
    <div 
        ref={containerRef} 
        className="w-full h-full bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center border border-border"
        style={{ minHeight: '600px' }}
    >
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" 
           style={{ 
               backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
           }} 
      />

      <svg width={dimensions.width} height={dimensions.height} className="relative z-10">
        <TooltipProvider>
          {nodes.map((node, index) => {
            const { x, y } = project(node.lat, node.lng)
            const radius = getRadius(node.xdnScore, index)
            const color = getColor(index)

            return (
              <Tooltip key={node.id}>
                <TooltipTrigger asChild>
                  <motion.circle
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                    cx={x}
                    cy={y}
                    r={radius}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth={index < 3 ? 2 : 0.5}
                    style={{ cursor: 'pointer' }}
                    whileHover={{ scale: 1.2, fillOpacity: 1 }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="p-0 border-none bg-transparent shadow-none">
                    <Card className="p-3 min-w-[220px] shadow-xl border-primary/20 bg-card/95 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-sm">#{index + 1} {node.name}</h3>
                            <Badge variant="outline" className="text-[10px]">{node.xdnScore.toFixed(0)} XDN</Badge>
                        </div>
                        <div className="space-y-1 text-xs">
                            <p className="text-muted-foreground"><strong>Location:</strong> {node.location}</p>
                            <p className="text-muted-foreground"><strong>Latency:</strong> {node.latency}ms</p>
                            <p className="text-muted-foreground"><strong>Version:</strong> v{node.version || '0.0.0'}</p>
                            <div className="pt-2 flex items-center justify-between border-t mt-2">
                                <span className="text-[10px] font-mono text-primary/70">{node.id.slice(0, 12)}...</span>
                                <Badge className="h-4 text-[9px] bg-primary/10 text-primary border-none">Top Node</Badge>
                            </div>
                        </div>
                    </Card>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-2 pointer-events-none">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-black/40 backdrop-blur-sm p-2 border border-white/5">
              <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
              <span>Rank #1 (Gold)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-black/40 backdrop-blur-sm p-2 border border-white/5">
              <div className="w-3 h-3 rounded-full bg-blue-500 opacity-60" />
              <span>Network Node</span>
          </div>
      </div>

      <div className="absolute top-4 right-4 z-20 pointer-events-none opacity-40">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Proportional Symbol Viz</span>
      </div>
    </div>
  )
}

function Card({ children, className, style }: { children: React.ReactNode, className?: string, style?: React.CSSProperties }) {
    return (
        <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} style={style}>
            {children}
        </div>
    )
}