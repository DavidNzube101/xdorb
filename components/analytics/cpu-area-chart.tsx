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

interface CpuData {
    node: string;
    cpu: number;
    color: string;
}

interface CpuAreaChartProps {
    data: CpuData[]; // Current snapshot
    onFullScreen?: () => void;
}

export function CpuAreaChart({ data, onFullScreen }: CpuAreaChartProps) {
    const averageCpu = React.useMemo(() => {
        if (!data || data.length === 0) return 0;
        const total = data.reduce((acc, curr) => acc + curr.cpu, 0);
        return total / data.length;
    }, [data]);

    const chartData = [
        { name: "Used", value: averageCpu, fill: "var(--color-used)" },
        { name: "Free", value: Math.max(0, 100 - averageCpu), fill: "var(--color-free)" },
    ]

    const chartConfig = {
        used: {
            label: "Used",
            color: "hsl(var(--chart-1))",
        },
        free: {
            label: "Free",
            color: "hsl(var(--muted))", // Muted color for empty space
        },
    } satisfies ChartConfig

    return (
        <Card className="flex flex-col h-full">
             <CardHeader className="flex flex-row items-center justify-between items-start pb-0">
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <CardTitle>Average CPU Utilization</CardTitle>
                        <Tooltip>
                            <TooltipTrigger>
                                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs">
                                    The average CPU usage percentage across all active pNodes in the network.
                                    Data is aggregated from the latest network snapshot.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                    <CardDescription>Network-wide Average</CardDescription>
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
                            <Cell key="cell-used" fill="#f97316" /> {/* Orange for CPU */}
                            <Cell key="cell-free" fill="#f4f4f5" /> {/* Light Gray for Free */}
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
                                                    className="fill-foreground text-3xl font-bold"
                                                >
                                                    {averageCpu.toFixed(1)}%
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 24}
                                                    className="fill-muted-foreground"
                                                >
                                                    Avg Load
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
                        Network Load <TrendingUp className="h-4 w-4" />
                    </div>
                </div>
            </CardFooter>
        </Card>
    )
}