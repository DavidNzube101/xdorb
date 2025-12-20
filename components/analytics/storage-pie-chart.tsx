"use client"

import { TrendingUp, Expand } from "lucide-react"
import { Pie, PieChart, Cell } from "recharts"
import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface StoragePieChartProps {
    totalCapacity: number;
    usedCapacity: number;
    onFullScreen?: () => void;
}

export function StoragePieChart({ totalCapacity, usedCapacity, onFullScreen }: StoragePieChartProps) {
  const free = totalCapacity - usedCapacity;
  const usedPercent = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;

  const chartData = [
    { name: "Used", value: usedCapacity, fill: "#f97316" },
    { name: "Free", value: free, fill: "#22c55e" },
  ]

  const chartConfig = {
    value: {
      label: "Storage",
    },
  } satisfies ChartConfig

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0 relative">
        <CardTitle>Storage Utilization</CardTitle>
        <CardDescription>Network Capacity</CardDescription>
         {onFullScreen && (
            <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={onFullScreen}>
              <Expand className="h-4 w-4" />
            </Button>
          )}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] pb-0"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie 
              data={chartData} 
              dataKey="value" 
              nameKey="name"
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
            >
               {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {usedPercent.toFixed(1)}% Used <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Total Capacity: {(totalCapacity / 1e12).toFixed(2)} TB
        </div>
      </CardFooter>
    </Card>
  )
}
