"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import * as THREE from "three"

interface StorageVisualizationProps {
  totalCapacity?: number // in bytes
  usedCapacity?: number // in bytes
  simulated?: boolean
}

function StorageBars({ usedPercent = 0, freePercent = 0 }: { usedPercent: number, freePercent: number }) {
  const data = [
    { label: "Used", value: Math.round(usedPercent), color: "#f9961e" },
    { label: "Free", value: Math.round(freePercent), color: "#116b61" },
  ]

  return (
    <>
      {data.map((item, index) => (
        <group key={item.label} position={[index * 2 - 1, 0, 0]}>
          {/* Bar - Scale height based on value, max height e.g. 5 units for 100% */}
          <mesh position={[0, (item.value / 20), 0]}>
            <boxGeometry args={[1, item.value / 10, 1]} />
            <meshStandardMaterial color={item.color} />
          </mesh>
          {/* Label */}
          <Text
            position={[0, -1, 0]}
            fontSize={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {item.label}
          </Text>
          {/* Value */}
          <Text
            position={[0, (item.value / 10) + 1, 0]}
            fontSize={0.4}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {item.value}%
          </Text>
        </group>
      ))}
    </>
  )
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function StorageVisualization({ totalCapacity = 0, usedCapacity = 0, simulated = false }: StorageVisualizationProps) {
  // Calculate percentages based on real data
  let usedPercent = 0
  let freePercent = 0
  
  if (totalCapacity > 0) {
    usedPercent = (usedCapacity / totalCapacity) * 100
    freePercent = 100 - usedPercent
  } else if (simulated) {
     // Only if explicitly simulated AND no data (though we prefer real 0s now)
     usedPercent = 75
     freePercent = 25
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>3D Storage Visualization</CardTitle>
        <CardDescription>
            {totalCapacity >= 0 
                ? `Usage: ${formatBytes(usedCapacity)} / ${formatBytes(totalCapacity)}`
                : "No storage data available"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-96 w-full">
          <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <StorageBars usedPercent={usedPercent} freePercent={freePercent} />
            <OrbitControls enablePan={false} enableZoom={true} />
            <gridHelper args={[20, 20, "#444444", "#222222"]} />
          </Canvas>
        </div>
      </CardContent>
    </Card>
  )
}