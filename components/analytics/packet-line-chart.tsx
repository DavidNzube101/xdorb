"use client"

import * as React from "react"
import { TrendingUp, Expand, HelpCircle } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
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

export const description = "A multiple line chart"

interface PacketData {
    in: number;
    out: number;
}

interface PacketLineChartProps {
    data: PacketData;
    onFullScreen?: () => void;
}

const chartConfig = {
  in: {
    label: "Inbound",
    color: "#22c55e", // Green
  },
  out: {
    label: "Outbound",
    color: "#3b82f6", // Blue
  },
} satisfies ChartConfig

export function PacketLineChart({ data, onFullScreen }: PacketLineChartProps) {
    const [history, setHistory] = React.useState<any[]>([])

    React.useEffect(() => {
        if (!data) return;
        console.log("PacketLineChart Snapshot:", data);

        const now = new Date();
        const timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        const dataPoint = { time: timeLabel, in: data.in, out: data.out, rawTime: now.getTime() };

        setHistory(prev => {
            const newHistory = [...prev, dataPoint];
            if (newHistory.length > 20) {
                return newHistory.slice(newHistory.length - 20);
            }
            return newHistory;
        })
    }, [data])

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between">
         <div className="grid gap-1">
            <div className="flex items-center gap-2">
                <CardTitle>Global Packet Streams</CardTitle>
                <Tooltip>
                    <TooltipTrigger>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="max-w-xs">
                            Real-time aggregate of inbound and outbound network packets across all nodes.
                            Data is streamed from a consolidated network snapshot.
                        </p>
                    </TooltipContent>
                </Tooltip>
            </div>
            <CardDescription>Network Traffic (In/Out)</CardDescription>
        </div>
        {onFullScreen && (
            <Button variant="ghost" size="icon" onClick={onFullScreen}>
                <Expand className="h-4 w-4" />
            </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <div className="h-[250px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
                accessibilityLayer
                data={history}
                margin={{
                left: 12,
                right: 12,
                }}
            >
                <CartesianGrid vertical={false} />
                <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                />
                <YAxis domain={[0, 'auto']} hide />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Line
                dataKey="in"
                type="monotone"
                stroke={chartConfig.in.color}
                strokeWidth={2}
                dot={false}
                connectNulls
                />
                <Line
                dataKey="out"
                type="monotone"
                stroke={chartConfig.out.color}
                strokeWidth={2}
                dot={false}
                connectNulls
                />
            </LineChart>
            </ChartContainer>
        </div>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 border-t pt-4">
        <div className="flex w-full items-start gap-2 text-sm justify-between">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Real-time Traffic <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
                In: {data?.in?.toLocaleString() || 0} | Out: {data?.out?.toLocaleString() || 0}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
