"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface StorageVisualizationProps {
  totalCapacity?: number // in bytes
  usedCapacity?: number // in bytes
}

function StorageBars3D({ usedPercent = 0, freePercent = 0 }: { usedPercent: number, freePercent: number }) {
  const data = [
    { label: "Used", value: Math.round(usedPercent), color: "#f9961e" },
    { label: "Free", value: Math.round(freePercent), color: "#116b61" },
  ]

  return (
    <>
      {data.map((item, index) => (
        <group key={item.label} position={[index * 2 - 1, 0, 0]}>
          <mesh position={[0, (item.value / 20), 0]}>
            <boxGeometry args={[1, item.value / 10, 1]} />
            <meshStandardMaterial color={item.color} />
          </mesh>
          <Text position={[0, -1, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
            {item.label}
          </Text>
          <Text position={[0, (item.value / 10) + 1, 0]} fontSize={0.4} color="white" anchorX="center" anchorY="middle">
            {item.value}%
          </Text>
        </group>
      ))}
    </>
  )
}

const convertBytes = (bytes: number, unit: 'TB' | 'GB' | 'MB') => {
  if (bytes === 0) return 0;
  const k = 1024;
  const units = {
    'MB': k * k,
    'GB': k * k * k,
    'TB': k * k * k * k,
  };
  return parseFloat((bytes / units[unit]).toFixed(2));
};

export function StorageVisualization({ totalCapacity = 0, usedCapacity = 0 }: StorageVisualizationProps) {
  const [view, setView] = useState<'3d' | '2d'>('3d')
  const [unit, setUnit] = useState<'TB' | 'GB' | 'MB'>('TB')

  let usedPercent = 0
  if (totalCapacity > 0) {
    usedPercent = (usedCapacity / totalCapacity) * 100
  }
  const freePercent = 100 - usedPercent

  const convertedTotal = convertBytes(totalCapacity, unit)
  const convertedUsed = convertBytes(usedCapacity, unit)

  const chartData = [
    { name: 'Storage', Used: convertedUsed, Free: convertedTotal - convertedUsed }
  ]

  return (
    <Card className="border-border bg-card flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Storage Visualization</CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>A visual representation of the network's total vs. used storage.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor="view-toggle" className="text-sm">2D</Label>
            <Switch
              id="view-toggle"
              checked={view === '3d'}
              onCheckedChange={(checked) => setView(checked ? '3d' : '2d')}
            />
            <Label htmlFor="view-toggle" className="text-sm">3D</Label>
          </div>
        </div>
        <CardDescription>
          {totalCapacity > 0
            ? `Usage: ${convertedUsed.toFixed(2)} ${unit} / ${convertedTotal.toFixed(2)} ${unit}`
            : "No storage data available"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="h-96 w-full">
          {view === '3d' ? (
            <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <StorageBars3D usedPercent={usedPercent} freePercent={freePercent} />
              <OrbitControls enablePan={false} enableZoom={true} />
              <gridHelper args={[20, 20, "#444444", "#222222"]} />
            </Canvas>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" stackOffset="expand">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" hide />
                <RechartsTooltip
                  formatter={(value, name) => [`${Number(value).toFixed(2)} ${unit}`, name]}
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                  }}
                />
                <Bar dataKey="Used" stackId="a" fill="#f9961e" />
                <Bar dataKey="Free" stackId="a" fill="#116b61" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Select onValueChange={(value: 'TB' | 'GB' | 'MB') => setUnit(value)} defaultValue={unit}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MB">MB</SelectItem>
            <SelectItem value="GB">GB</SelectItem>
            <SelectItem value="TB">TB</SelectItem>
          </SelectContent>
        </Select>
      </CardFooter>
    </Card>
  )
}
