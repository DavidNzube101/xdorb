"use client"

import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text } from "@react-three/drei"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie, Label as RechartsLabel } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HelpCircle, Expand } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

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
  const [unit, setUnit] = useState<'TB' | 'GB' | 'MB'>('TB')

  const convertedTotal = convertBytes(totalCapacity, unit)
  const convertedUsed = convertBytes(usedCapacity, unit)
  const convertedFree = convertedTotal - convertedUsed

  const pieData = [
    { name: 'Used', value: convertedUsed, fill: '#f9961e' },
    { name: 'Free', value: convertedFree, fill: '#116b61' },
  ]

  const totalStorage = pieData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className="border-border bg-card flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Storage Visualization</CardTitle>
          <Tooltip>
            <TooltipTrigger>
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              <p>A pie chart showing the network's total vs. used storage capacity.</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <CardDescription>
          {totalCapacity > 0
            ? `Usage: ${convertedUsed.toFixed(2)} ${unit} / ${convertedTotal.toFixed(2)} ${unit}`
            : "No storage data available"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <RechartsTooltip
                formatter={(value, name) => [`${Number(value).toFixed(2)} ${unit}`, name]}
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                }}
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
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
        <Button variant="ghost" size="icon">
          <Expand className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
