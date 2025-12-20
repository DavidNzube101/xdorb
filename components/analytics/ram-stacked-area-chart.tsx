"use client"

import * as React from "react"
import { TrendingUp, HelpCircle } from "lucide-react"
import { Label, Pie, PieChart, Cell } from "recharts"
import { Expand } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

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

interface RamData {
    node: string;
    ram: number; // in MB
    total?: number; // in MB (optional for backward compatibility)
    color: string;
}

interface RamStackedAreaChartProps {
    data: RamData[];
    onFullScreen?: () => void;
}

export function RamStackedAreaChart({ data, onFullScreen }: RamStackedAreaChartProps) {
    const { totalUsed, totalCapacity, percentUsed } = React.useMemo(() => {
        if (!data || data.length === 0) return { totalUsed: 0, totalCapacity: 0, percentUsed: 0 };
        
        let totalRamUsedMB = 0;
        let totalRamCapacityMB = 0;

        data.forEach(curr => {
            totalRamUsedMB += curr.ram;
            totalRamCapacityMB += (curr.total && curr.total > 0) ? curr.total : 16384;
        });

        const pct = totalRamCapacityMB > 0 ? (totalRamUsedMB / totalRamCapacityMB) * 100 : 0;
        
        return { 
            totalUsed: totalRamUsedMB / 1024, // to GB
            totalCapacity: totalRamCapacityMB / 1024, // to GB
            percentUsed: pct 
        };
    }, [data]);

    const chartData = [
        { name: "Used", value: percentUsed, fill: "var(--color-used)" },
        { name: "Free", value: Math.max(0, 100 - percentUsed), fill: "var(--color-free)" },
    ]

    const chartConfig = {
        used: {
            label: "Used",
            color: "hsl(var(--chart-2))",
        },
        free: {
            label: "Free",
            color: "hsl(var(--muted))",
        },
    } satisfies ChartConfig

    const formatRamValue = (gb: number) => {
        if (gb >= 1024) return `${(gb / 1024).toFixed(2)} TB`;
        return `${gb.toFixed(1)} GB`;
    }

    return (
        <Card className="flex flex-col h-full">
             <CardHeader className="flex flex-row items-center justify-between items-start pb-0">
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <CardTitle>Network RAM Utilization</CardTitle>
                        <Tooltip>
                            <TooltipTrigger>
                                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">
                                    Total memory utilization across the entire network. 
                                    Calculated based on the actual RAM capacity and usage reported by all active pNodes.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <CardDescription>Cumulative Usage</CardDescription>
                </div>
                 {onFullScreen && (
                    <Button variant="ghost" size="icon" onClick={onFullScreen}>
                        <Expand className="h-4 w-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Cell key="cell-used" fill="#8b5cf6" /> {/* Violet for RAM */}
                            <Cell key="cell-free" fill="#f4f4f5" />
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    className="fill-foreground text-2xl font-bold"
                                                >
                                                    {formatRamValue(totalUsed)}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Total Utilized
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm border-t pt-4">
                <div className="flex w-full items-center justify-between">
                     <div className="flex items-center gap-2 leading-none font-medium">
                        {percentUsed.toFixed(1)}% Network Load <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="text-muted-foreground text-xs">
                        Max: {formatRamValue(totalCapacity)}
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}